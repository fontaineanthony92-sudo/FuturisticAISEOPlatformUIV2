import { getWordPressConfig, readWordPressToken } from "./wordpress.ts";
import { supabase } from "./supabase.ts";

export interface NexusMediaAsset {
  id: string;
  filename: string;
  public_url: string;
  alt_text: string | null;
  wordpress_media_id: number | null;
  wordpress_url: string | null;
  wordpress_synced_at: string | null;
}

export interface SyncedWordPressMedia {
  wordpress_media_id: number;
  wordpress_url: string;
  wordpress_synced_at: string | null;
  alreadySynced: boolean;
}

export class WordPressMediaError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 502) {
    super(message);
    this.name = "WordPressMediaError";
    this.statusCode = statusCode;
  }
}

const pendingSyncs = new Map<string, Promise<SyncedWordPressMedia>>();

function redactWordPressResponseBody(body: string, secrets: string[]): string {
  let redacted = body;
  for (const secret of secrets) {
    if (secret) redacted = redacted.split(secret).join("[REDACTED]");
  }
  return redacted
    .replace(/Bearer\s+[^\s"',}]+/gi, "Bearer [REDACTED]")
    .replace(/("?(?:access_token|client_secret)"?\s*:\s*")[^\"]*(")/gi, "$1[REDACTED]$2");
}

async function importMedia(asset: NexusMediaAsset): Promise<SyncedWordPressMedia> {
  let token;
  let config;
  try {
    [token, config] = await Promise.all([
      readWordPressToken(),
      Promise.resolve().then(getWordPressConfig),
    ]);
  } catch {
    throw new WordPressMediaError("La configuration WordPress n'est pas disponible.", 500);
  }
  if (!token) throw new WordPressMediaError("Connectez WordPress.com avant de synchroniser une image.", 409);

  if (asset.wordpress_media_id !== null) {
    if (!asset.wordpress_url) throw new WordPressMediaError("Cette image possède un ID WordPress, mais son URL synchronisée manque dans NexusSEO.", 409);
    return {
      wordpress_media_id: asset.wordpress_media_id,
      wordpress_url: asset.wordpress_url,
      wordpress_synced_at: asset.wordpress_synced_at,
      alreadySynced: true,
    };
  }

  const form = new URLSearchParams({ "media_urls[]": asset.public_url });
  if (asset.alt_text?.trim()) form.set("attrs[0][alt]", asset.alt_text.trim());

  let response: globalThis.Response;
  try {
    response = await fetch(`https://public-api.wordpress.com/rest/v1.1/sites/${encodeURIComponent(config.siteId)}/media/new`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form,
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new WordPressMediaError("WordPress.com ne répond pas pendant l'import de l'image.");
  }

  const responseText = await response.text().catch(() => "");
  let body: unknown = null;
  try {
    body = JSON.parse(responseText) as unknown;
  } catch {
    // Keep non-JSON error bodies available to the server-side diagnostic log.
  }
  const safeResponseBody = redactWordPressResponseBody(responseText, [token.access_token, config.clientSecret]);
  if (!response.ok) {
    console.error("WordPress.com a refusé l'import média.", { httpStatus: response.status, responseBody: safeResponseBody });
    throw new WordPressMediaError(`WordPress.com a refusé l'import de l'image (HTTP ${response.status}).`);
  }
  if (typeof body !== "object" || body === null) {
    console.error("Réponse média WordPress.com invalide.", { httpStatus: response.status, responseBody: safeResponseBody });
    throw new WordPressMediaError("WordPress.com a renvoyé une réponse invalide pour l'image.");
  }

  const responseData = body as { media?: unknown; errors?: unknown; media_errors?: unknown };
  const mediaEntries = Array.isArray(responseData.media) ? responseData.media : [];
  const firstMedia = mediaEntries[0];
  const hasUploadErrors = [responseData.errors, responseData.media_errors].some(value =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
  if (hasUploadErrors || typeof firstMedia !== "object" || firstMedia === null) {
    console.error("WordPress.com n'a pas retourné de média importé.", { httpStatus: response.status, responseBody: safeResponseBody });
    throw new WordPressMediaError("WordPress.com n'a pas pu importer cette image.");
  }
  const item = firstMedia as Record<string, unknown>;
  const mediaId = typeof item.ID === "number" ? item.ID : typeof item.ID === "string" ? Number(item.ID) : NaN;
  const wordpressUrl = typeof item.URL === "string" ? item.URL : typeof item.url === "string" ? item.url : null;
  if (!Number.isSafeInteger(mediaId) || !wordpressUrl) {
    throw new WordPressMediaError("WordPress.com a renvoyé des informations d'image incomplètes.");
  }

  const syncedAt = new Date().toISOString();
  const { data, error } = await supabase.from("media_assets").update({
    wordpress_media_id: mediaId,
    wordpress_url: wordpressUrl,
    wordpress_synced_at: syncedAt,
  }).eq("id", asset.id).select("wordpress_media_id,wordpress_url,wordpress_synced_at").single();

  if (error || !data) {
    console.error("Média importé dans WordPress mais impossible d'enregistrer sa synchronisation dans Supabase.", { code: error?.code });
    throw new WordPressMediaError("L'image a été importée dans WordPress, mais son état n'a pas pu être enregistré dans NexusSEO.", 500);
  }

  return {
    wordpress_media_id: data.wordpress_media_id,
    wordpress_url: data.wordpress_url,
    wordpress_synced_at: data.wordpress_synced_at,
    alreadySynced: false,
  };
}

export function syncMediaAssetToWordPress(asset: NexusMediaAsset): Promise<SyncedWordPressMedia> {
  if (asset.wordpress_media_id !== null) {
    return importMedia(asset);
  }

  const existing = pendingSyncs.get(asset.id);
  if (existing) return existing;

  const pending = importMedia(asset).finally(() => pendingSyncs.delete(asset.id));
  pendingSyncs.set(asset.id, pending);
  return pending;
}
