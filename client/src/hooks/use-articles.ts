import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { ClientArticle } from '@shared/schema';

const STORAGE_KEY = 'ai_news_articles';
const STORAGE_TIMESTAMP_KEY = 'ai_news_articles_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

export function useArticles() {
  const [cachedArticles, setCachedArticles] = useState<ClientArticle[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load cached articles from localStorage on mount
  useEffect(() => {
    const loadCachedArticles = () => {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        const timestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);
        
        if (cached && timestamp) {
          const cacheTime = parseInt(timestamp);
          const now = Date.now();
          
          // Check if cache is still valid (30 minutes)
          if (now - cacheTime < CACHE_DURATION) {
            setCachedArticles(JSON.parse(cached));
          } else {
            // Clear expired cache
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading cached articles:', error);
      }
    };

    loadCachedArticles();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const { data: fetchedArticles, isLoading, error, refetch } = useQuery<ClientArticle[]>({
    queryKey: ['/api/articles'],
    enabled: !isOffline, // Only fetch when online
    staleTime: CACHE_DURATION,
    retry: (failureCount, error: any) => {
      // If network error, switch to offline mode
      if (error?.code === 'NETWORK_ERROR' || !navigator.onLine) {
        setIsOffline(true);
        return false;
      }
      return failureCount < 3;
    }
  });

  // Save to localStorage when new articles are fetched
  useEffect(() => {
    if (fetchedArticles && fetchedArticles.length > 0) {
      try {
        const articlesToStore = fetchedArticles.slice(0, 20); // Keep only latest 20
        localStorage.setItem(STORAGE_KEY, JSON.stringify(articlesToStore));
        localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
        setCachedArticles(articlesToStore);
      } catch (error) {
        console.error('Error saving articles to localStorage:', error);
      }
    }
  }, [fetchedArticles]);

  // Return cached articles when offline or when fetch fails
  const articles = isOffline || (!fetchedArticles && cachedArticles.length > 0) 
    ? cachedArticles 
    : (fetchedArticles || []);

  return {
    articles,
    isLoading: isLoading && !isOffline && cachedArticles.length === 0,
    error: isOffline ? null : error,
    isOffline,
    refetch: () => {
      if (!isOffline) {
        refetch();
      }
    }
  };
}

export function useTriggeredArticles() {
  const [cachedTriggeredArticles, setCachedTriggeredArticles] = useState<ClientArticle[]>([]);
  const [triggeredDate, setTriggeredDate] = useState<string>('');

  const TRIGGERED_STORAGE_KEY = 'ai_news_triggered_articles';
  const TRIGGERED_DATE_KEY = 'ai_news_triggered_date';

  // Load cached triggered articles from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(TRIGGERED_STORAGE_KEY);
      const date = localStorage.getItem(TRIGGERED_DATE_KEY);
      
      if (cached && date) {
        setCachedTriggeredArticles(JSON.parse(cached));
        setTriggeredDate(date);
      }
    } catch (error) {
      console.error('Error loading cached triggered articles:', error);
    }
  }, []);

  const { data, isLoading, error } = useQuery<{ articles: ClientArticle[], triggeredDate: string }>({
    queryKey: ['/api/last-triggered'],
    staleTime: Infinity, // Don't refetch unless manually invalidated
    retry: 2,
  });

  // Save triggered articles to localStorage when fetched
  useEffect(() => {
    if (data && data.articles) {
      try {
        localStorage.setItem(TRIGGERED_STORAGE_KEY, JSON.stringify(data.articles));
        localStorage.setItem(TRIGGERED_DATE_KEY, data.triggeredDate);
        setCachedTriggeredArticles(data.articles);
        setTriggeredDate(data.triggeredDate);
      } catch (error) {
        console.error('Error saving triggered articles to localStorage:', error);
      }
    }
  }, [data]);

  return {
    triggeredArticles: data?.articles || cachedTriggeredArticles,
    triggeredDate: data?.triggeredDate || triggeredDate,
    isLoading,
    error
  };
}

export function useArticleSearch(articles: ClientArticle[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'AI Models', 'AI in Education', 'AI Agents', 'Web Development'];

  // Filter articles based on enabled sources from settings
  const getEnabledSources = () => {
    try {
      const sources = localStorage.getItem('ai-news-sources');
      if (sources) {
        const parsedSources = JSON.parse(sources);
        return parsedSources.filter((s: any) => s.enabled).map((s: any) => s.name);
      }
    } catch {
      // Return default sources if parsing fails
    }
    return ['TechCrunch', 'Wired', 'The Verge', 'CNET', 'TechRadar'];
  };

  const filteredArticles = articles.filter(article => {
    const enabledSources = getEnabledSources();
    const matchesSource = enabledSources.includes(article.source);

    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || 
      article.categories?.includes(selectedCategory);

    return matchesSource && matchesSearch && matchesCategory;
  });

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    categories,
    filteredArticles
  };
}