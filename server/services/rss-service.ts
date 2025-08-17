import { GoogleGenAI } from "@google/genai";
import type { ClientArticle } from "../../shared/schema.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  enclosure?: { url: string; type: string };
  content?: string;
}

interface RSSFeed {
  title: string;
  items: RSSItem[];
}

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', source: 'TechCrunch' },
  { url: 'https://www.wired.com/category/artificial-intelligence/feed/', source: 'Wired' },
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' }
];

export async function parseXMLToJSON(xmlString: string): Promise<RSSFeed> {
  // Simple XML parser for RSS feeds
  const items: RSSItem[] = [];
  
  // Extract items using regex (basic implementation)
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xmlString)) !== null) {
    const itemXML = match[1];
    
    const title = extractTag(itemXML, 'title') || '';
    const link = extractTag(itemXML, 'link') || '';
    const description = extractTag(itemXML, 'description') || extractTag(itemXML, 'content:encoded') || '';
    const pubDate = extractTag(itemXML, 'pubDate') || '';
    
    // Extract image from enclosure or media:content
    let imageUrl = '';
    const enclosureMatch = itemXML.match(/<enclosure[^>]*url="([^"]*)"[^>]*type="image/);
    const mediaMatch = itemXML.match(/<media:content[^>]*url="([^"]*)"[^>]*medium="image"/);
    const imgMatch = description.match(/<img[^>]*src="([^"]*)"/);
    
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else if (mediaMatch) {
      imageUrl = mediaMatch[1];
    } else if (imgMatch) {
      imageUrl = imgMatch[1];
    }
    
    if (title && link) {
      items.push({
        title: cleanText(title),
        link: cleanText(link),
        description: cleanText(description),
        pubDate: cleanText(pubDate),
        enclosure: imageUrl ? { url: imageUrl, type: 'image' } : undefined
      });
    }
  }
  
  return {
    title: extractTag(xmlString, 'title') || 'RSS Feed',
    items: items.slice(0, 10) // Limit to 10 items per feed
  };
}

function extractTag(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}(?:[^>]*)>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : undefined;
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

export async function generateSummary(title: string, description: string): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not available');
    }

    const prompt = `Create a detailed 10-sentence summary for this news article:

Title: ${title}
Description: ${description}

Provide exactly 10 sentences that capture the key points, implications, and context of this AI/tech news article. Focus on technical details, business impact, and future implications.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || '';
  } catch (error) {
    console.error('Summary generation failed:', error);
    return '';
  }
}

export function categorizeArticle(title: string, description: string): string[] {
  const content = `${title} ${description}`.toLowerCase();
  const categories: string[] = [];
  
  if (content.includes('ai model') || content.includes('language model') || content.includes('gpt') || content.includes('llm')) {
    categories.push('AI Models');
  }
  
  if (content.includes('education') || content.includes('learning') || content.includes('student') || content.includes('teaching')) {
    categories.push('AI in Education');
  }
  
  if (content.includes('agent') || content.includes('assistant') || content.includes('chatbot') || content.includes('autonomous')) {
    categories.push('AI Agents');
  }
  
  if (content.includes('web') || content.includes('developer') || content.includes('coding') || content.includes('programming')) {
    categories.push('Web Development');
  }
  
  return categories.length > 0 ? categories : ['General'];
}

export async function fetchRSSFeeds(): Promise<ClientArticle[]> {
  const allArticles: ClientArticle[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching RSS feed from ${feed.source}...`);
      
      const response = await fetch(feed.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        },
      });
      
      if (!response.ok) {
        console.error(`Failed to fetch ${feed.source}: ${response.status}`);
        continue;
      }
      
      const xmlText = await response.text();
      const parsedFeed = await parseXMLToJSON(xmlText);
      
      for (const item of parsedFeed.items) {
        try {
          const summary = await generateSummary(item.title, item.description || '');
          const categories = categorizeArticle(item.title, item.description || '');
          
          const article: ClientArticle = {
            id: `${feed.source}-${Date.now()}-${Math.random()}`,
            title: item.title,
            link: item.link,
            description: item.description,
            imageUrl: item.enclosure?.url,
            pubDate: item.pubDate,
            source: feed.source,
            summary: summary || undefined,
            categories
          };
          
          allArticles.push(article);
        } catch (error) {
          console.error(`Failed to process article from ${feed.source}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error fetching RSS feed ${feed.source}:`, error);
    }
  }
  
  // Sort by publication date (newest first) and limit to 20
  return allArticles
    .sort((a, b) => {
      if (!a.pubDate || !b.pubDate) return 0;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    })
    .slice(0, 20);
}