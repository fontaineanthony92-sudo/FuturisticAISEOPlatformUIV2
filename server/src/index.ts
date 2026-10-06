import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "node:url";
import articlesRouter from "./routes/articles.ts";
import generateArticleRouter from "./routes/generateArticle.ts";
import wordpressRouter from "./routes/wordpress.ts";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/articles", articlesRouter);
app.use("/api/generate-article", generateArticleRouter);
app.use("/api/wordpress", wordpressRouter);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "nexusseo-api",
  });
});

app.use((_request, response) => {
  response.status(404).json({ error: "Route introuvable." });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const status =
    typeof error === "object" && error !== null && "status" in error && typeof error.status === "number"
      ? error.status
      : 500;

  if (status >= 500) {
    console.error("Erreur inattendue du serveur :", error);
  }

  response.status(status).json({
    error: status === 400 ? "Le corps de la requête doit être un JSON valide." : "Une erreur interne est survenue.",
  });
});

app.listen(port, () => {
  console.log(`NexusSEO API listening at http://localhost:${port}`);
});
