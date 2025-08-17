import OpenAI from "openai";
import type { ClientArticle, ChatMessage } from "../../shared/schema.js";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function searchArticlesByKeyword(articles: ClientArticle[], query: string): Promise<ClientArticle[]> {
  const keywords = query.toLowerCase().split(' ');
  
  return articles.filter(article => {
    const searchText = `${article.title} ${article.description || ''} ${article.summary || ''}`.toLowerCase();
    return keywords.some(keyword => searchText.includes(keyword));
  }).slice(0, 5); // Return top 5 matches
}

export async function generateChatResponse(question: string, relevantArticles: ClientArticle[]): Promise<string> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return "OpenAI API key not available. Please provide an API key to enable chat functionality.";
    }

    if (relevantArticles.length === 0) {
      return "Not found";
    }

    const summariesText = relevantArticles
      .map((article, index) => `${index + 1}. ${article.title}\nSummary: ${article.summary || article.description || 'No summary available'}\nSource: ${article.source}\n`)
      .join('\n');

    const systemPrompt = "You are a News Assistant. Answer only from the provided summaries. If the information is not in the summaries, reply exactly 'Not found'.";

    const userPrompt = `Question: ${question}\n\nAvailable summaries:\n${summariesText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    return response.choices[0].message.content || "Not found";
  } catch (error) {
    console.error('Chat response generation failed:', error);
    return "Sorry, I encountered an error while processing your question. Please try again.";
  }
}

export function generateChatMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}