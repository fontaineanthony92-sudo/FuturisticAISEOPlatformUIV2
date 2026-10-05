import { Router } from "express";
import type { RequestHandler, Response } from "express";
import { OPENAI_MODEL, OPENAI_TIMEOUT_MS, openai } from "../lib/openai.ts";
import { supabase } from "../lib/supabase.ts";

const router = Router();

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

interface GenerationRequest {
  subject: string;
  mainKeyword: string;
  secondaryKeywords: string[];
  audience: string;
  tone: string;
  length: string;
  includeFaq: boolean;
  generateMetaDescription: boolean;
}

interface GeneratedArticle {
  title: string;
  metaDescription: string;
  content: string;
  faq: Array<{ question: string; answer: string }>;
}

const ARTICLE_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    metaDescription: { type: "string" },
    content: { type: "string" },
    faq: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "metaDescription", "content", "faq"],
  additionalProperties: false,
} as const;

function validateRequest(body: unknown): { request?: GenerationRequest; error?: string } {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Le corps de la requête doit être un objet JSON." };
  }

  const input = body as Record<string, unknown>;
  if (typeof input.subject !== "string" || !input.subject.trim()) {
    return { error: "Le sujet de l’article est obligatoire." };
  }
  if (typeof input.mainKeyword !== "string" || !input.mainKeyword.trim()) {
    return { error: "Le keyword principal est obligatoire." };
  }
  if (input.secondaryKeywords !== undefined &&
      (!Array.isArray(input.secondaryKeywords) || !input.secondaryKeywords.every((value) => typeof value === "string"))) {
    return { error: "Les keywords secondaires doivent être une liste de textes." };
  }
  for (const field of ["audience", "tone", "length"] as const) {
    if (input[field] !== undefined && typeof input[field] !== "string") {
      return { error: `Le champ ${field} doit être un texte.` };
    }
  }
  for (const field of ["includeFaq", "generateMetaDescription"] as const) {
    if (input[field] !== undefined && typeof input[field] !== "boolean") {
      return { error: `Le champ ${field} doit être un booléen.` };
    }
  }

  return {
    request: {
      subject: input.subject.trim(),
      mainKeyword: input.mainKeyword.trim(),
      secondaryKeywords: (input.secondaryKeywords as string[] | undefined) ?? [],
      audience: (input.audience as string | undefined)?.trim() || "Audience générale",
      tone: (input.tone as string | undefined)?.trim() || "Professionnel",
      length: (input.length as string | undefined)?.trim() || "Standard",
      includeFaq: (input.includeFaq as boolean | undefined) ?? false,
      generateMetaDescription: (input.generateMetaDescription as boolean | undefined) ?? false,
    },
  };
}

function sendSupabaseError(response: Response, error: { code?: string; message: string }) {
  console.error("Supabase article insert failed:", { code: error.code, message: error.message });
  response.status(500).json({ error: "L’article a été généré, mais son enregistrement dans Supabase a échoué." });
}

function redactOpenAISecrets(message: string): string {
  const configuredKey = process.env.OPENAI_API_KEY;
  const messageWithoutConfiguredKey = configuredKey
    ? message.split(configuredKey).join("[OPENAI_API_KEY masquée]")
    : message;

  return messageWithoutConfiguredKey.replace(/\bsk-[A-Za-z0-9_-]{8,}/g, "[OPENAI_API_KEY masquée]");
}

router.post("/", asyncRoute(async (request, response) => {
  const validation = validateRequest(request.body);
  if (validation.error || !validation.request) {
    return response.status(400).json({ error: validation.error ?? "Paramètres invalides." });
  }

  const options = validation.request;
  let article: GeneratedArticle;

  try {
    const result = await openai.responses.create({
      model: OPENAI_MODEL,
      max_output_tokens: 10000,
      input: [
        {
          role: "system",
          content: [
            "Tu es un rédacteur francophone spécialisé en contenu éditorial utile.",
            "Rédige un article original adapté aux paramètres fournis : sujet, keyword principal, keywords secondaires, audience, ton et longueur.",
            "Commence le contenu par une introduction puis écris plusieurs sections structurées avec des titres Markdown de niveau H2 (##).",
            "N’invente jamais de volume de recherche, position Google, trafic, score SEO, statistique, donnée Semrush ou résultat chiffré non fourni.",
            "Si une information chiffrée n’est pas fournie, reste qualitatif et ne la présente pas comme un fait.",
            options.includeFaq
              ? "Fournis plusieurs questions et réponses pertinentes dans le champ faq, et ne répète pas la FAQ dans content."
              : "Le champ faq doit être un tableau vide et aucune FAQ ne doit apparaître dans content.",
            options.generateMetaDescription
              ? "Rédige une meta description concise et fidèle au contenu."
              : "Le champ metaDescription doit être une chaîne vide : aucune meta description n’est demandée.",
            "Le champ content contient l’introduction et les sections de l’article, sans score ni affirmation de performance SEO.",
          ].join(" "),
        },
        {
          role: "user",
          content: JSON.stringify(options),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "nexusseo_article",
          strict: true,
          schema: ARTICLE_SCHEMA,
        },
      },
    });

    if (!result.output_text) throw new Error("OpenAI n’a retourné aucun contenu.");
    article = JSON.parse(result.output_text) as GeneratedArticle;
  } catch (error) {
    const apiError = error as { name?: unknown; status?: unknown; type?: unknown; code?: unknown; message?: unknown };
    console.error("OpenAI article generation failed:", {
      name: typeof apiError.name === "string" ? apiError.name : "UnknownError",
      status: typeof apiError.status === "number" ? apiError.status : undefined,
      type: typeof apiError.type === "string" ? redactOpenAISecrets(apiError.type) : undefined,
      code: typeof apiError.code === "string" ? apiError.code : undefined,
      message: redactOpenAISecrets(
        typeof apiError.message === "string" ? apiError.message : "Erreur OpenAI sans message exploitable.",
      ),
    });

    if (apiError.code === "credit_balance_exhausted") {
      return response.status(503).json({ error: "Le crédit API OpenAI est épuisé. Rechargez le compte OpenAI puis réessayez." });
    }
    if (apiError.status === 429) {
      return response.status(429).json({ error: "La limite temporaire de requêtes OpenAI est atteinte. Réessayez dans quelques instants." });
    }
    const timeoutMessage = error instanceof Error && error.name === "APIConnectionTimeoutError"
      ? `OpenAI n’a pas répondu dans le délai de ${Math.round(OPENAI_TIMEOUT_MS / 1000)} secondes.`
      : "La génération a échoué. Vérifiez la configuration OpenAI puis réessayez.";
    return response.status(502).json({ error: timeoutMessage });
  }

  if (!options.includeFaq) article.faq = [];
  if (!options.generateMetaDescription) article.metaDescription = "";

  const faqContent = article.faq.length
    ? `\n\n## FAQ\n\n${article.faq.map(({ question, answer }) => `### ${question}\n\n${answer}`).join("\n\n")}`
    : "";

  const { data: savedArticle, error } = await supabase
    .from("articles")
    .insert({
      title: article.title,
      subject: options.subject,
      main_keyword: options.mainKeyword,
      secondary_keywords: options.secondaryKeywords,
      audience: options.audience,
      tone: options.tone,
      article_length: options.length,
      meta_description: options.generateMetaDescription ? article.metaDescription : null,
      content: `${article.content}${faqContent}`,
      seo_score: null,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return sendSupabaseError(response, error);

  return response.status(201).json({
    id: savedArticle.id,
    article,
  });
}));

export default router;
