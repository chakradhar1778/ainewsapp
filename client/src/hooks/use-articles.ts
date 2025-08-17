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

export function useArticleSearch(articles: ClientArticle[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'AI Models', 'AI in Education', 'AI Agents', 'Web Development'];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || 
      article.categories?.includes(selectedCategory);

    return matchesSearch && matchesCategory;
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