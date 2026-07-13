import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { callDeepSeekAPI } from "./lib/deepseek";
import { getMockResponse } from "./lib/mockResponses";

// Load environment variables from .env
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Route: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // API Route: Interactive step-by-step facilitation chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { stage, topic, userMessage, history } = req.body;

      if (!stage || !topic || !userMessage || !Array.isArray(history)) {
        res.status(400).json({ error: "参数不完整。需要 stage, topic, userMessage, history。" });
        return;
      }

      // 1. Try to call the real DeepSeek API
      const apiResult = await callDeepSeekAPI(stage, history);

      if (apiResult.success && apiResult.data) {
        res.json({
          ...apiResult.data,
          _mode: "api"
        });
        return;
      }

      // 2. If it's a demo or has failed, fallback to highly realistic Mock Facilitator
      console.log(`Entering demonstration mode for stage ${stage} due to ${apiResult.isDemo ? "missing API Key" : "API error: " + apiResult.error}`);
      const mockData = getMockResponse(stage, topic, userMessage, history);
      res.json({
        ...mockData,
        _mode: "demo",
        _warning: apiResult.error ? `API Error: ${apiResult.error}` : undefined
      });

    } catch (err: any) {
      console.error("Unexpected error in /api/chat:", err);
      res.status(500).json({ error: "服务器内部错误，请稍后再试。" });
    }
  });

  // Serve Frontend with Vite in development, static files in production
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static asset serving...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[清醒行动] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
