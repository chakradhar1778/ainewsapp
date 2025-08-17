import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { fetchRSSFeeds } from "./services/rss-service";
import { searchArticlesByKeyword, generateChatResponse, generateChatMessageId } from "./services/chat-service";
import type { ClientArticle } from "../shared/schema.js";

// Simple in-memory storage for triggered articles
let lastTriggeredArticles: ClientArticle[] = [];
let lastTriggeredDate: string = '';

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

  // fetch triggered articles from previous day
  app.get("/api/triggered-articles", async (req, res) => {
    try {
      console.log("Fetching triggered articles for previous day...");
      const articles = await fetchRSSFeeds(true);
      lastTriggeredArticles = articles;
      lastTriggeredDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
      console.log(`Fetched ${articles.length} triggered articles`);
      res.json({ articles, triggeredDate: lastTriggeredDate });
    } catch (error) {
      console.error("Error fetching triggered articles:", error);
      res.status(500).json({ error: "Failed to fetch triggered articles" });
    }
  });

  // get last triggered batch
  app.get("/api/last-triggered", (req, res) => {
    res.json({ articles: lastTriggeredArticles, triggeredDate: lastTriggeredDate });
  });

  // chat endpoint - only uses triggered articles
  app.post("/api/chat", async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ error: "Question is required" });
      }

      // Search only in triggered articles
      const relevantArticles = await searchArticlesByKeyword(lastTriggeredArticles, question);
      console.log(`Chat: Found ${relevantArticles.length} relevant articles from triggered batch`);
      
      // Generate response using Gemini
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
