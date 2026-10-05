import OpenAI from "openai";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Configuration OpenAI manquante : renseignez OPENAI_API_KEY dans server/.env.");
}

export const OPENAI_MODEL = "gpt-4o-mini";
export const OPENAI_TIMEOUT_MS = 60_000;
export const openai = new OpenAI({
  apiKey,
  timeout: OPENAI_TIMEOUT_MS,
  maxRetries: 0,
});
