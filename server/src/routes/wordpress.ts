import { timingSafeEqual } from "node:crypto";
import { Router } from "express";
import type { Request, RequestHandler, Response } from "express";
import { supabase } from "../lib/supabase.ts";
import {
  createOAuthState,
  getWordPressConfig,
  readWordPressToken,
  saveWordPressToken,
} from "../lib/wordpress.ts";

const router = Router();
const frontendUrl = "http://localhost:5173";
const stateCookieName = "nexusseo_wp_oauth_state";
const pendingStates = new Map<string, number>();

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;
  const cookie = cookieHeader.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : undefined;
}

function clearStateCookie(response: Response): void {
  response.setHeader("Set-Cookie", `${stateCookieName}=; HttpOnly; SameSite=Lax; Path=/api/wordpress/callback; Max-Age=0`);
}

function hasMatchingState(received: string | undefined, cookieState: string | undefined): received is string {
  if (!received || !cookieState || received !== cookieState || !/^[a-f0-9]{64}$/.test(received)) return false;
  const savedUntil = pendingStates.get(received);
  if (!savedUntil || savedUntil < Date.now()) {
    pendingStates.delete(received);
    return false;
  }
  const receivedBuffer = Buffer.from(received);
  const cookieBuffer = Buffer.from(cookieState);
  if (receivedBuffer.length !== cookieBuffer.length || !timingSafeEqual(receivedBuffer, cookieBuffer)) return false;
  pendingStates.delete(received);
  return true;
}

function sendConfigurationError(response: Response, error: unknown): void {
  console.error("Configuration WordPress invalide.", error instanceof Error ? error.message : "Erreur inconnue.");
  response.status(500).json({ error: error instanceof Error ? error.message : "Configuration WordPress invalide." });
}

router.get("/connect", (request, response) => {
  try {
    const config = getWordPressConfig();
    const state = createOAuthState();
    const now = Date.now();
    for (const [existingState, expiresAt] of pendingStates) {
      if (expiresAt < now) pendingStates.delete(existingState);
    }
    pendingStates.set(state, now + 10 * 60 * 1000);
    response.setHeader("Set-Cookie", `${stateCookieName}=${state}; HttpOnly; SameSite=Lax; Path=/api/wordpress/callback; Max-Age=600`);

    const authorizationUrl = new URL("https://public-api.wordpress.com/oauth2/authorize");
    authorizationUrl.searchParams.set("client_id", config.clientId);
    authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
    authorizationUrl.searchParams.set("response_type", "code");
    authorizationUrl.searchParams.set("blog", config.siteId);
    authorizationUrl.searchParams.set("scope", "posts");
    authorizationUrl.searchParams.set("state", state);
    return response.json({ url: authorizationUrl.toString() });
  } catch (error) {
    return sendConfigurationError(response, error);
  }
});

router.get("/callback", asyncRoute(async (request, response) => {
  const oauthError = typeof request.query.error === "string" ? request.query.error : undefined;
  clearStateCookie(response);
  if (oauthError) return response.redirect(`${frontendUrl}?wordpress=error`);

  const code = typeof request.query.code === "string" ? request.query.code : undefined;
  const state = typeof request.query.state === "string" ? request.query.state : undefined;
  const cookieState = getCookie(request, stateCookieName);
  if (!code || !hasMatchingState(state, cookieState)) {
    return response.status(400).send("Connexion WordPress invalide ou expirée. Relancez la connexion depuis NexusSEO.");
  }

  let config;
  try {
    config = getWordPressConfig();
  } catch (error) {
    return sendConfigurationError(response, error);
  }

  let tokenResponse: globalThis.Response;
  try {
    tokenResponse = await fetch("https://public-api.wordpress.com/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: config.redirectUri,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    console.error("Échec de l'échange du code OAuth WordPress (requête réseau).");
    return response.status(502).send("WordPress.com n'a pas pu terminer la connexion. Réessayez depuis NexusSEO.");
  }

  const tokenBody: unknown = await tokenResponse.json().catch(() => null);
  const accessToken = typeof tokenBody === "object" && tokenBody !== null && "access_token" in tokenBody
    && typeof tokenBody.access_token === "string" ? tokenBody.access_token : null;
  if (!tokenResponse.ok || !accessToken) {
    console.error("Échec de l'échange du code OAuth WordPress.", { httpStatus: tokenResponse.status });
    return response.status(502).send("WordPress.com a refusé la connexion. Vérifiez la configuration OAuth et réessayez.");
  }

  try {
    await saveWordPressToken(accessToken);
  } catch {
    console.error("Impossible d'enregistrer le jeton OAuth WordPress côté serveur.");
    return response.status(500).send("La connexion WordPress a réussi, mais le jeton n'a pas pu être stocké sur le serveur.");
  }

  return response.redirect(`${frontendUrl}?wordpress=connected`);
}));

router.get("/status", asyncRoute(async (_request, response) => {
  try {
    const token = await readWordPressToken();
    if (!token) return response.json({ connected: false });
    const config = getWordPressConfig();
    return response.json({ connected: true, siteUrl: config.siteUrl });
  } catch (error) {
    console.error("Impossible de vérifier le statut WordPress.", error instanceof Error ? error.message : "Erreur inconnue.");
    return response.status(500).json({ error: "Impossible de vérifier la connexion WordPress." });
  }
}));

router.post("/publish/:articleId", asyncRoute(async (request, response) => {
  const { articleId } = request.params;
  if (typeof articleId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleId)) {
    return response.status(400).json({ error: "L'identifiant de l'article doit être un UUID valide." });
  }

  const selectedStatus = request.body?.status;
  if (selectedStatus !== "publish") {
    return response.status(400).json({ error: "Cette route sert uniquement à publier un article sur WordPress (status publish)." });
  }

  let token;
  let config;
  try {
    [token, config] = await Promise.all([readWordPressToken(), Promise.resolve(getWordPressConfig())]);
  } catch (error) {
    console.error("Configuration ou stockage WordPress indisponible.", error instanceof Error ? error.message : "Erreur inconnue.");
    return response.status(500).json({ error: "La configuration WordPress n'est pas disponible." });
  }
  if (!token) return response.status(409).json({ error: "Connectez WordPress.com avant de publier." });

  const { data: article, error: articleError } = await supabase
    .from("articles")
    .select("id,title,content,status")
    .eq("id", articleId)
    .maybeSingle();

  if (articleError) {
    console.error("Erreur Supabase lors de la récupération de l'article pour publication.", { code: articleError.code });
    return response.status(500).json({ error: "Impossible de récupérer l'article à publier." });
  }
  if (!article) return response.status(404).json({ error: "Article introuvable." });
  if (!article.title?.trim() || !article.content?.trim()) {
    return response.status(400).json({ error: "L'article doit avoir un titre et un contenu avant publication." });
  }

  let wordpressResponse: globalThis.Response;
  try {
    const postUrl = `https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(config.siteId)}/posts/new`;
    wordpressResponse = await fetch(postUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ title: article.title, content: article.content, status: "publish" }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    console.error("Erreur réseau lors de la création du post WordPress.");
    return response.status(502).json({ error: "WordPress.com ne répond pas. L'article n'a pas pu être publié." });
  }

  const wordpressBody: unknown = await wordpressResponse.json().catch(() => null);
  if (!wordpressResponse.ok || typeof wordpressBody !== "object" || wordpressBody === null
    || !("ID" in wordpressBody) || (typeof wordpressBody.ID !== "string" && typeof wordpressBody.ID !== "number")) {
    console.error("WordPress.com a refusé la création du post.", { httpStatus: wordpressResponse.status });
    return response.status(502).json({ error: `WordPress.com a refusé la publication (HTTP ${wordpressResponse.status}).` });
  }

  const postId = String(wordpressBody.ID);
  const postUrl = "URL" in wordpressBody && typeof wordpressBody.URL === "string" ? wordpressBody.URL : null;
  const update: { wordpress_post_id: string; wordpress_url: string | null; status: "published" } = {
    wordpress_post_id: postId,
    wordpress_url: postUrl,
    status: "published",
  };

  const { error: updateError } = await supabase.from("articles").update({
    ...update,
    updated_at: new Date().toISOString(),
  }).eq("id", articleId);
  if (updateError) {
    console.error("Le post WordPress est créé, mais la mise à jour Supabase a échoué.", { code: updateError.code });
    return response.status(502).json({
      error: "Le post a été créé sur WordPress.com, mais ses informations n'ont pas pu être enregistrées dans NexusSEO.",
      wordpressPostId: postId,
      wordpressUrl: postUrl,
    });
  }

  return response.status(201).json({
    success: true,
    wordpressPostId: postId,
    wordpressUrl: postUrl,
    status: selectedStatus,
  });
}));

export default router;
