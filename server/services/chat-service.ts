import { GoogleGenAI } from "@google/genai";
import type { ClientArticle, ChatMessage } from "../../shared/schema.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function searchArticlesByKeyword(articles: ClientArticle[], query: string): Promise<ClientArticle[]> {
  const keywords = query.toLowerCase().split(' ');
  
  return articles.filter(article => {
    const searchText = `${article.title} ${article.description || ''} ${article.summary || ''}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  }).slice(0, 5); // Return top 5 matches
}

export async function generateChatResponse(question: string, relevantArticles: ClientArticle[]): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Gemini API key not available. Please provide an API key to enable chat functionality.";
    }

    if (relevantArticles.length === 0) {
      // Suggest random source
      const sources = ['TechCrunch', 'The Verge', 'WIRED', 'CNET', 'TechRadar'];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      return `Not found. Try checking ${randomSource} for recent updates.`;
    }

    const summariesText = relevantArticles
      .map((article, index) => `${index + 1}. ${article.title}\nSummary: ${article.summary || article.description || 'No summary available'}\nSource: ${article.source}\nTime: ${article.pubDate}\n`)
      .join('\n');

    const prompt = `Answer ONLY using the provided summaries and their timestamps. If information is not present, reply exactly 'Not found'. Keep answers to 1–3 sentences. Include source and time when citing.

Question: ${question}

Available summaries:
${summariesText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Not found";
  } catch (error) {
    console.error('Chat response generation failed:', error);
    return "Sorry, I encountered an error while processing your question. Please try again.";
  }
}

export function generateChatMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}