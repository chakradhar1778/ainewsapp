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
  { url: 'https://www.theverge.com/rss/index.xml', source: 'The Verge' },
  { url: 'https://www.cnet.com/rss/news/', source: 'CNET' },
  { url: 'https://www.techradar.com/rss', source: 'TechRadar' }
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

    const prompt = `Summarize the article in 2–4 short sentences. Be factual and neutral. No opinions or hype. If the source already provides a summary, tighten it to <60 words.

Title: ${title}
Description: ${description}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const summary = response.text || '';
    
    // Cap at ~60-80 words
    const words = summary.split(' ');
    if (words.length > 80) {
      return words.slice(0, 80).join(' ') + '...';
    }
    
    return summary;
  } catch (error) {
    console.error('Summary generation failed:', error);
    // Fallback to shortened description
    if (description) {
      const words = description.split(' ');
      if (words.length > 60) {
        return words.slice(0, 60).join(' ') + '...';
      }
      return description;
    }
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

// Normalize article data across different RSS feeds
function normalizeArticle(item: RSSItem, source: string): Omit<ClientArticle, 'id' | 'summary' | 'categories'> {
  // Parse and normalize publishedAt to IST
  let publishedAt = '';
  if (item.pubDate) {
    try {
      const date = new Date(item.pubDate);
      publishedAt = date.toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('Error parsing date:', item.pubDate, error);
    }
  }

  return {
    title: item.title.trim(),
    link: item.link.trim(),
    description: item.description?.trim(),
    imageUrl: item.enclosure?.url,
    pubDate: publishedAt,
    source
  };
}

// Check if article is from previous day in IST
function isFromPreviousDay(pubDateStr: string): boolean {
  if (!pubDateStr) return false;
  
  try {
    const articleDate = new Date(pubDateStr);
    const now = new Date();
    
    // Get previous day in IST
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayIST = yesterday.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const articleDateIST = articleDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    
    return articleDateIST === yesterdayIST;
  } catch (error) {
    return false;
  }
}

export async function fetchRSSFeeds(onlyPreviousDay: boolean = false): Promise<ClientArticle[]> {
  const allArticles: ClientArticle[] = [];
  const seenUrls = new Set<string>(); // For deduplication
  
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
          // Skip duplicates by URL
          if (seenUrls.has(item.link)) {
            continue;
          }
          seenUrls.add(item.link);
          
          const normalizedArticle = normalizeArticle(item, feed.source);
          
          // Filter by previous day if requested
          if (onlyPreviousDay && !isFromPreviousDay(normalizedArticle.pubDate || '')) {
            continue;
          }
          
          const summary = await generateSummary(item.title, item.description || '');
          const categories = categorizeArticle(item.title, item.description || '');
          
          const article: ClientArticle = {
            id: `${feed.source}-${Date.now()}-${Math.random()}`,
            ...normalizedArticle,
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
  
  // Sort by publication date (newest first) and limit to 30
  return allArticles
    .sort((a, b) => {
      if (!a.pubDate || !b.pubDate) return 0;
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    })
    .slice(0, 30);
}