import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export interface WordPressConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  siteId: string;
  siteUrl: string;
}

export interface WordPressToken {
  access_token: string;
}

const tokenFilePath = fileURLToPath(new URL("../../.wordpress-token.json", import.meta.url));

export function getWordPressConfig(): WordPressConfig {
  const variables = {
    clientId: process.env.WORDPRESS_CLIENT_ID,
    clientSecret: process.env.WORDPRESS_CLIENT_SECRET,
    redirectUri: process.env.WORDPRESS_REDIRECT_URI,
    siteId: process.env.WORDPRESS_SITE_ID,
    siteUrl: process.env.WORDPRESS_SITE_URL,
  };
  const missing = Object.entries(variables).filter(([, value]) => !value?.trim()).map(([name]) => name);

  if (missing.length) {
    const envNames: Record<string, string> = {
      clientId: "WORDPRESS_CLIENT_ID",
      clientSecret: "WORDPRESS_CLIENT_SECRET",
      redirectUri: "WORDPRESS_REDIRECT_URI",
      siteId: "WORDPRESS_SITE_ID",
      siteUrl: "WORDPRESS_SITE_URL",
    };
    throw new Error(`Configuration WordPress incomplète : ${missing.map(name => envNames[name]).join(", ")}.`);
  }

  return {
    clientId: variables.clientId!.trim(),
    clientSecret: variables.clientSecret!.trim(),
    redirectUri: variables.redirectUri!.trim(),
    siteId: variables.siteId!.trim(),
    siteUrl: variables.siteUrl!.trim().replace(/\/$/, ""),
  };
}

export function createOAuthState(): string {
  return randomBytes(32).toString("hex");
}

export async function readWordPressToken(): Promise<WordPressToken | null> {
  try {
    const content = await readFile(tokenFilePath, "utf8");
    const parsed: unknown = JSON.parse(content);
    if (typeof parsed !== "object" || parsed === null || !("access_token" in parsed)
      || typeof parsed.access_token !== "string" || !parsed.access_token) {
      return null;
    }
    return { access_token: parsed.access_token };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") return null;
    throw new Error("Impossible de lire le jeton WordPress stocké côté serveur.");
  }
}

export async function saveWordPressToken(accessToken: string): Promise<void> {
  await writeFile(tokenFilePath, `${JSON.stringify({ access_token: accessToken }, null, 2)}\n`, { mode: 0o600 });
}
