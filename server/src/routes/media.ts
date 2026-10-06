import { randomUUID } from "node:crypto";
import { Router } from "express";
import type { RequestHandler } from "express";
import multer from "multer";
import { supabase } from "../lib/supabase.ts";

const router = Router();
const bucketName = "nexusseo-media";
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const fileExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error("Format non accepté. Utilisez JPG, PNG, WebP ou GIF."));
    callback(null, true);
  },
});

let bucketReady: Promise<void> | null = null;
async function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const { data, error } = await supabase.storage.getBucket(bucketName);
      if (!error && data) {
        if (data.public) return;
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, { public: true });
        if (updateError) throw updateError;
        return;
      }

      const { error: createError } = await supabase.storage.createBucket(bucketName, { public: true });
      if (createError && !/already exists|duplicate/i.test(createError.message)) throw createError;
    })();
  }

  try {
    await bucketReady;
  } catch (error) {
    bucketReady = null;
    throw error;
  }
}

function isValidId(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function asyncRoute(handler: RequestHandler): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

router.get("/", asyncRoute(async (_request, response) => {
  const { data, error } = await supabase
    .from("media_assets")
    .select("id,filename,storage_path,public_url,mime_type,size_bytes,alt_text,source,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur Supabase lors de la récupération des médias.", { code: error.code });
    return response.status(500).json({ error: "Impossible de récupérer la bibliothèque média." });
  }
  return response.json(data ?? []);
}));

router.post("/upload", (request, response, next) => {
  upload.single("file")(request, response, (error: unknown) => {
    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      return response.status(tooLarge ? 413 : 400).json({
        error: tooLarge ? "Le fichier dépasse la taille maximale de 10 Mo." : "Un seul fichier image peut être envoyé.",
      });
    }
    if (error) return response.status(400).json({ error: error instanceof Error ? error.message : "Fichier invalide." });
    return next();
  });
}, asyncRoute(async (request, response) => {
  const file = request.file;
  if (!file) return response.status(400).json({ error: "Sélectionnez une image à importer." });

  try {
    await ensureBucket();
  } catch (error) {
    console.error("Impossible de préparer le bucket média.", error instanceof Error ? error.message : "Erreur inconnue.");
    return response.status(500).json({ error: "Le stockage des médias n'est pas disponible." });
  }

  const storagePath = `${randomUUID()}${fileExtensions[file.mimetype]}`;
  const { error: storageError } = await supabase.storage.from(bucketName).upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (storageError) {
    console.error("Erreur Supabase Storage lors de l'upload média.", { message: storageError.message });
    return response.status(502).json({ error: "Impossible de stocker cette image." });
  }

  const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(storagePath);
  const { data, error: databaseError } = await supabase.from("media_assets").insert({
    filename: file.originalname,
    storage_path: storagePath,
    public_url: publicData.publicUrl,
    mime_type: file.mimetype,
    size_bytes: file.size,
    source: "upload",
  }).select("id,filename,storage_path,public_url,mime_type,size_bytes,alt_text,source,created_at").single();

  if (databaseError) {
    await supabase.storage.from(bucketName).remove([storagePath]);
    console.error("Erreur Supabase lors de l'enregistrement du média.", { code: databaseError.code });
    return response.status(500).json({ error: "L'image a été envoyée, mais ses informations n'ont pas pu être enregistrées." });
  }

  return response.status(201).json(data);
}));

router.put("/:id", asyncRoute(async (request, response) => {
  const { id } = request.params;
  if (typeof id !== "string" || !isValidId(id)) return response.status(400).json({ error: "L'identifiant du média doit être un UUID valide." });
  const altText: unknown = request.body?.alt_text;
  if (altText !== null && typeof altText !== "string") return response.status(400).json({ error: "alt_text doit être un texte ou null." });

  const { data, error } = await supabase.from("media_assets").update({ alt_text: altText })
    .eq("id", id)
    .select("id,filename,storage_path,public_url,mime_type,size_bytes,alt_text,source,created_at")
    .maybeSingle();
  if (error) {
    console.error("Erreur Supabase lors de la modification du média.", { code: error.code });
    return response.status(500).json({ error: "Impossible de modifier ce média." });
  }
  if (!data) return response.status(404).json({ error: "Média introuvable." });
  return response.json(data);
}));

router.delete("/:id", asyncRoute(async (request, response) => {
  const { id } = request.params;
  if (typeof id !== "string" || !isValidId(id)) return response.status(400).json({ error: "L'identifiant du média doit être un UUID valide." });

  const { data: asset, error: readError } = await supabase.from("media_assets").select("storage_path").eq("id", id).maybeSingle();
  if (readError) {
    console.error("Erreur Supabase lors de la récupération du média à supprimer.", { code: readError.code });
    return response.status(500).json({ error: "Impossible de supprimer ce média." });
  }
  if (!asset) return response.status(404).json({ error: "Média introuvable." });

  const { error: storageError } = await supabase.storage.from(bucketName).remove([asset.storage_path]);
  if (storageError) {
    console.error("Erreur Supabase Storage lors de la suppression du média.", { message: storageError.message });
    return response.status(502).json({ error: "Impossible de supprimer le fichier du stockage." });
  }

  const { error: deleteError } = await supabase.from("media_assets").delete().eq("id", id);
  if (deleteError) {
    console.error("Erreur Supabase lors de la suppression des informations média.", { code: deleteError.code });
    return response.status(500).json({ error: "Le fichier a été supprimé, mais ses informations n'ont pas pu l'être." });
  }
  return response.status(204).send();
}));

export default router;
