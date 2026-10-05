import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

app.get("/api/health", (_request, response) => {
  response.json({
    status: "ok",
    service: "nexusseo-api",
  });
});

app.listen(port, () => {
  console.log(`NexusSEO API listening at http://localhost:${port}`);
});
