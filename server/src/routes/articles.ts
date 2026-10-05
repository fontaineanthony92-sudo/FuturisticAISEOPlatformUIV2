import { Router } from "express";
import type { RequestHandler, Response } from "express";
import { supabase } from "../lib/supabase.ts";

const router = Router();

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

const ARTICLE_FIELDS = [
  "title",
  "subject",
  "main_keyword",
  "secondary_keywords",
  "audience",
  "tone",
  "article_length",
  "meta_description",
  "content",
  "seo_score",
  "status",
  "featured_image_url",
  "thumbnail_url",
  "wordpress_post_id",
  "wordpress_url",
] as const;

const ALLOWED_STATUSES = ["draft", "review", "scheduled", "published"] as const;
type ArticleStatus = (typeof ALLOWED_STATUSES)[number];
type ArticleInput = Record<(typeof ARTICLE_FIELDS)[number], unknown>;

function validateArticleInput(body: unknown): { data?: Partial<ArticleInput>; error?: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Le corps doit être un objet JSON." };
  }

  const input = body as Record<string, unknown>;
  const data: Partial<ArticleInput> = {};

  for (const field of ARTICLE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(input, field)) continue;

    const value = input[field];

    if (field === "status") {
      if (typeof value !== "string" || !ALLOWED_STATUSES.includes(value as ArticleStatus)) {
        return { error: "status doit être draft, review, scheduled ou published." };
      }
    } else if (field === "secondary_keywords") {
      if (!Array.isArray(value) || !value.every((keyword) => typeof keyword === "string")) {
        return { error: "secondary_keywords doit être un tableau de textes." };
      }
    } else if (field === "seo_score") {
      if (value !== null && (typeof value !== "number" || !Number.isInteger(value))) {
        return { error: "seo_score doit être un entier ou null." };
      }
    } else if (value !== null && typeof value !== "string") {
      return { error: `${field} doit être un texte ou null.` };
    }

    data[field] = value;
  }

  return { data };
}

function isValidId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function sendSupabaseError(response: Response, operation: string, error: { code?: string; message: string }) {
  console.error(`Erreur Supabase (${operation}) :`, { code: error.code, message: error.message });
  response.status(500).json({ error: `Impossible de ${operation} dans la base de données.` });
}

router.get("/", asyncRoute(async (_request, response) => {
  const { data, error } = await supabase.from("articles").select("*").order("created_at", { ascending: false });

  if (error) return sendSupabaseError(response, "récupérer les articles", error);
  return response.json(data);
}));

router.get("/:id", asyncRoute(async (request, response) => {
  const { id } = request.params;
  if (typeof id !== "string" || !isValidId(id)) {
    return response.status(400).json({ error: "L’identifiant de l’article doit être un UUID valide." });
  }

  const { data, error } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();

  if (error) return sendSupabaseError(response, "récupérer l’article", error);
  if (!data) return response.status(404).json({ error: "Article introuvable." });
  return response.json(data);
}));

router.post("/", asyncRoute(async (request, response) => {
  const validation = validateArticleInput(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  const { data, error } = await supabase.from("articles").insert(validation.data ?? {}).select().single();

  if (error) return sendSupabaseError(response, "créer l’article", error);
  return response.status(201).json(data);
}));

router.put("/:id", asyncRoute(async (request, response) => {
  const { id } = request.params;
  if (typeof id !== "string" || !isValidId(id)) {
    return response.status(400).json({ error: "L’identifiant de l’article doit être un UUID valide." });
  }

  const validation = validateArticleInput(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });

  const { data, error } = await supabase
    .from("articles")
    .update({ ...validation.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) return sendSupabaseError(response, "modifier l’article", error);
  if (!data) return response.status(404).json({ error: "Article introuvable." });
  return response.json(data);
}));

export default router;
