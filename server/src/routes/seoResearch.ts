import { Router } from "express";
import type { RequestHandler } from "express";
import type { ResponseCreateParamsNonStreaming } from "openai/resources/responses/responses";
import { OPENAI_SEO_MODEL, OPENAI_TIMEOUT_MS, openai } from "../lib/openai.ts";

const router = Router();

type Intent = "informationnelle" | "commerciale" | "transactionnelle" | "navigationnelle";
type QualitativeLevel = "fort" | "moyen" | "faible";
type CompetitionLevel = "forte" | "moyenne" | "faible";

interface KeywordOpportunity {
  keyword: string;
  intent: Intent;
  cluster: string;
  seoPotential: QualitativeLevel;
  observedCompetition: CompetitionLevel;
  reason: string;
}

interface ResearchSource {
  title: string;
  url: string;
}

const OPPORTUNITIES_SCHEMA = {
  type: "object",
  properties: {
    keywords: {
      type: "array",
      items: {
        type: "object",
        properties: {
          keyword: { type: "string" },
          intent: { type: "string", enum: ["informationnelle", "commerciale", "transactionnelle", "navigationnelle"] },
          cluster: { type: "string" },
          seoPotential: { type: "string", enum: ["fort", "moyen", "faible"] },
          observedCompetition: { type: "string", enum: ["forte", "moyenne", "faible"] },
          reason: { type: "string" },
        },
        required: ["keyword", "intent", "cluster", "seoPotential", "observedCompetition", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["keywords"],
  additionalProperties: false,
} as const;

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function getSearchSources(output: unknown): ResearchSource[] {
  if (!Array.isArray(output)) return [];

  const sources = new Map<string, ResearchSource>();
  for (const item of output) {
    if (typeof item !== "object" || item === null || !("type" in item)) continue;

    if (item.type === "web_search_call" && "action" in item) {
      const action = item.action;
      if (typeof action === "object" && action !== null && "sources" in action && Array.isArray(action.sources)) {
        for (const source of action.sources) {
          if (typeof source !== "object" || source === null || !("url" in source) || typeof source.url !== "string") continue;
          try {
            const parsedUrl = new URL(source.url);
            if (parsedUrl.protocol !== "https:") continue;
            const title = "title" in source && typeof source.title === "string" ? source.title.trim() : "";
            sources.set(parsedUrl.href, { title: title || sources.get(parsedUrl.href)?.title || parsedUrl.hostname, url: parsedUrl.href });
          } catch {
            // Ignore malformed URLs from tool metadata; never invent replacement sources.
          }
        }
      }
    }

    if (item.type === "message" && "content" in item && Array.isArray(item.content)) {
      for (const content of item.content) {
        if (typeof content !== "object" || content === null || !("annotations" in content) || !Array.isArray(content.annotations)) continue;
        for (const annotation of content.annotations) {
          if (typeof annotation !== "object" || annotation === null || !("type" in annotation) || annotation.type !== "url_citation" ||
            !("url" in annotation) || typeof annotation.url !== "string") continue;
          try {
            const parsedUrl = new URL(annotation.url);
            if (parsedUrl.protocol !== "https:") continue;
            const title = "title" in annotation && typeof annotation.title === "string" ? annotation.title.trim() : "";
            sources.set(parsedUrl.href, { title: title || sources.get(parsedUrl.href)?.title || parsedUrl.hostname, url: parsedUrl.href });
          } catch {
            // Ignore malformed citation URLs.
          }
        }
      }
    }
  }

  return Array.from(sources.values()).slice(0, 8);
}

router.post("/research", asyncRoute(async (request, response) => {
  const body: unknown = request.body;
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    response.status(400).json({ error: "Le corps de la requête doit être un objet JSON." });
    return;
  }

  const input = body as Record<string, unknown>;
  if (typeof input.topic !== "string" || !input.topic.trim()) {
    response.status(400).json({ error: "Le sujet de recherche est obligatoire." });
    return;
  }
  if (input.market !== undefined && typeof input.market !== "string") {
    response.status(400).json({ error: "Le marché doit être un texte." });
    return;
  }

  const topic = input.topic.trim();
  const market = (input.market as string | undefined)?.trim() || "France";
  console.log("[SEO DEBUG] topic received:", topic);

  try {
    const requestOptions: ResponseCreateParamsNonStreaming = {
      model: OPENAI_SEO_MODEL,
      tools: [{ type: "web_search" }],
      tool_choice: "required",
      include: ["web_search_call.action.sources"],
      max_output_tokens: 4_000,
      input: [
        {
          role: "system",
          content: "Tu es un analyste SEO. Effectue une vraie recherche web sur le sujet et le marché indiqués, puis propose entre 10 et 15 opportunités de mots-clés pertinentes en français. Base-toi sur les résultats web observés pour estimer qualitativement la concurrence et le potentiel. Écris toutes les chaînes en français correctement accentué et conserve intégralement les accents et caractères Unicode dans topic, market, keywords, clusters et reasons. Ne supprime jamais un accent et ne le remplace jamais par un espace : écris par exemple « vidéaste indépendant », « référencement », « création », « être » et « compétences ». N'invente aucune métrique, aucun volume, CPC, trafic, difficulté chiffrée, position Google, ni donnée Semrush ou Ahrefs. Le potentiel et la concurrence sont uniquement qualitatifs. Pour chaque proposition, donne un cluster concis et une justification en français de 1 à 2 phrases maximum. Retourne uniquement les champs du schéma demandé.",
        },
        {
          role: "user",
          content: `Sujet : ${topic}\nMarché cible : ${market}\nAnalyse les formulations et intentions réellement pertinentes pour ce marché.`,
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "seo_keyword_opportunities",
          strict: true,
          schema: OPPORTUNITIES_SCHEMA,
        },
      },
    };
    const requestOpenAI = () => openai.responses.create(requestOptions, { timeout: OPENAI_TIMEOUT_MS });
    let result = await requestOpenAI();
    if (result.status === "completed" && result.output_text.includes("\u0000")) {
      console.log("[SEO DEBUG] Invalid Unicode detected in OpenAI response.");
      console.log("[SEO DEBUG] Retrying OpenAI SEO request once.");
      result = await requestOpenAI();
      if (result.status === "completed" && result.output_text.includes("\u0000")) {
        console.log("[SEO DEBUG] Retry failed: invalid Unicode still present.");
        response.status(502).json({ error: "La r\u00e9ponse SEO re\u00e7ue est invalide. Veuillez relancer l'analyse." });
        return;
      }
      if (result.status === "completed") console.log("[SEO DEBUG] Retry succeeded.");
    }

    if (result.status !== "completed") {
      response.status(502).json({ error: "L'analyse SEO n'a pas pu être terminée. Réessayez dans un instant." });
      return;
    }

    let parsed: unknown;
    try {
      if (result.output_text.includes("\u0000")) {
        response.status(502).json({ error: "La r\u00e9ponse SEO re\u00e7ue est invalide. Veuillez relancer l'analyse." });
        return;
      }
      console.log("[SEO DEBUG] raw OpenAI output:", result.output_text);
      parsed = JSON.parse(result.output_text);
      const parsedRecord = typeof parsed === "object" && parsed !== null
        ? parsed as { topic?: unknown; keywords?: unknown }
        : {};
      const parsedKeywords = Array.isArray(parsedRecord.keywords) ? parsedRecord.keywords : [];
      const firstParsedKeyword = typeof parsedKeywords[0] === "object" && parsedKeywords[0] !== null
        ? parsedKeywords[0] as { keyword?: unknown; reason?: unknown }
        : undefined;
      console.log("[SEO DEBUG] parsed output:", {
        topic: parsedRecord.topic,
        firstKeyword: firstParsedKeyword?.keyword,
        firstReason: firstParsedKeyword?.reason,
      });
    } catch {
      response.status(502).json({ error: "Le service d'analyse a retourné un résultat inexploitable." });
      return;
    }

    if (typeof parsed !== "object" || parsed === null || !("keywords" in parsed) || !Array.isArray(parsed.keywords)) {
      response.status(502).json({ error: "Le service d'analyse a retourné un résultat inexploitable." });
      return;
    }

    const keywords = parsed.keywords as KeywordOpportunity[];
    if (keywords.length < 10 || keywords.length > 15 || keywords.some((item) =>
      typeof item.keyword !== "string" || typeof item.cluster !== "string" || typeof item.reason !== "string" ||
      !["informationnelle", "commerciale", "transactionnelle", "navigationnelle"].includes(item.intent) ||
      !["fort", "moyen", "faible"].includes(item.seoPotential) ||
      !["forte", "moyenne", "faible"].includes(item.observedCompetition)
    )) {
      response.status(502).json({ error: "L'analyse n'a pas retourné entre 10 et 15 opportunités valides." });
      return;
    }

    const sources = getSearchSources(result.output);
    if (sources.length === 0) {
      response.status(502).json({ error: "Aucune source web exploitable n'a été retournée pour cette analyse." });
      return;
    }

    console.log("[SEO DEBUG] response sent:", {
      topic,
      firstKeyword: keywords[0]?.keyword,
      firstReason: keywords[0]?.reason,
    });
    response.json({ topic, market, keywords, sources });
  } catch (error) {
    console.error("Échec de la recherche SEO OpenAI :", error instanceof Error ? error.message : "Erreur inconnue");
    response.status(502).json({ error: "La recherche SEO est temporairement indisponible. Vérifiez la configuration OpenAI puis réessayez." });
  }
}));

export default router;
