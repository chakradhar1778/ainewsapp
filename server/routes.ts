import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchRSSFeeds } from "./services/rss-service";
import { searchArticlesByKeyword, generateChatResponse, generateChatMessageId } from "./services/chat-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // fetch RSS articles
  app.get("/api/articles", async (req, res) => {
    try {
      console.log("Fetching RSS articles...");
      const articles = await fetchRSSFeeds();
      console.log(`Fetched ${articles.length} articles`);
      res.json(articles);
    } catch (error) {
      console.error("Error fetching articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  // chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { question, articles } = req.body;
      
      if (!question || !Array.isArray(articles)) {
        return res.status(400).json({ error: "Question and articles array are required" });
      }

      // Search for relevant articles
      const relevantArticles = await searchArticlesByKeyword(articles, question);
      
      // Generate response using OpenAI
      const answer = await generateChatResponse(question, relevantArticles);
      
      const chatMessage = {
        id: generateChatMessageId(),
        question,
        answer,
        timestamp: new Date().toISOString()
      };

      res.json(chatMessage);
    } catch (error) {
      console.error("Error processing chat request:", error);
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
