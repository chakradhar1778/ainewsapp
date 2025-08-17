import { useState } from "react";
import { useArticles, useArticleSearch, useTriggeredArticles } from "@/hooks/use-articles";
import { useScheduler } from "@/hooks/use-scheduler";
import ChatBox from "@/components/chat-box";
import SettingsModal from "@/components/settings-modal";
import CategoryFilter from "@/components/category-filter";
import SwipeableArticleCard from "@/components/swipeable-article-card";
import { ClientArticle } from "@shared/schema";

export default function HomePage() {
  const { articles, isLoading, error, isOffline } = useArticles();
  const { triggeredArticles, triggeredDate } = useTriggeredArticles();
  const { triggerTime, updateTriggerTime, manualTrigger } = useScheduler();
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredArticles } = useArticleSearch(articles);

  const [view, setView] = useState<'all' | 'triggered'>('all');

  // Get current time in IST
  const getCurrentIST = () => {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
  };

  // Format time in IST for display
  const formatTimeIST = (dateStr: string) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' IST';
    } catch {
      return dateStr;
    }
  };

  // Truncate summary to 2-4 sentences
  const truncateSummary = (text: string, maxSentences: number = 3) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, maxSentences).join('. ') + (sentences.length > maxSentences ? '.' : '');
  };

  const displayArticles = view === 'triggered' ? triggeredArticles : filteredArticles;

  const handleManualTrigger = async () => {
    await manualTrigger();
    setView('triggered');
  };

  const ArticleCard = ({ article }: { article: ClientArticle }) => (
    <article className="border-b border-gray-100 pb-8">
      <div className="flex gap-4">
        {/* Thumbnail */}
        {article.imageUrl && (
          <div className="flex-shrink-0 w-24 h-18 md:w-32 md:h-24">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover rounded-sm"
              data-testid={`img-article-${article.id}`}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-grow">
          <h2 className="text-xl font-normal leading-tight mb-2 text-black" data-testid={`text-article-title-${article.id}`}>
            <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:no-underline">
              {article.title}
            </a>
          </h2>
          
          <div className="flex items-center gap-3 mb-3 text-sm meta-text" data-testid={`text-article-meta-${article.id}`}>
            <span>{article.source}</span>
            <span>•</span>
            <span>{article.pubDate ? formatTimeIST(article.pubDate) : 'Recent'}</span>
          </div>
          
          {article.summary && (
            <p className="text-black mb-3 leading-relaxed" data-testid={`text-article-summary-${article.id}`}>
              {truncateSummary(article.summary, 3)}
            </p>
          )}
          
          {article.categories && article.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {article.categories.map((category, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                  data-testid={`badge-category-${article.id}-${index}`}
                >
                  {category}
                </span>
              ))}
            </div>
          )}
          
          <a 
            href={article.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-black underline hover:no-underline text-sm"
            data-testid={`link-view-more-${article.id}`}
          >
            View more
          </a>
        </div>
      </div>
    </article>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="border-b border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-normal text-black" data-testid="text-title">AI News</h1>
          <div className="flex items-center space-x-4">
            <time className="meta-text text-base" data-testid="text-current-time">
              {getCurrentIST()}
            </time>
            <SettingsModal 
              triggerTime={triggerTime}
              onTriggerTimeChange={updateTriggerTime}
              onManualTrigger={handleManualTrigger}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'all' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="button-view-all"
            >
              All Articles
            </button>
            <button
              onClick={() => setView('triggered')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                view === 'triggered' 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              data-testid="button-view-triggered"
            >
              Daily Digest {triggeredDate && `(${triggeredDate})`}
            </button>
          </div>
          
          <div className="text-sm text-gray-600" data-testid="text-article-count">
            {displayArticles.length} articles
          </div>
        </div>

        {/* Search Bar and Category Filter - only for 'all' view */}
        {view === 'all' && (
          <>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-4 text-lg border border-gray-300 rounded-sm bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
                data-testid="input-search"
              />
            </div>

            <CategoryFilter 
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </>
        )}

        {/* Status Messages */}
        {isLoading && (
          <div className="text-center py-8" data-testid="status-loading">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/6 mx-auto"></div>
            </div>
            <p className="meta-text mt-4">Loading articles...</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-8" data-testid="status-error">
            <p className="meta-text">Failed to load articles</p>
            <p className="meta-text text-sm mt-2">
              {isOffline ? "You're offline - showing cached articles" : "Please check your connection"}
            </p>
          </div>
        )}

        {/* Articles List */}
        {displayArticles.length > 0 && !isLoading && (
          <div className="space-y-8" data-testid="articles-list">
            {displayArticles.map((article) => (
              <SwipeableArticleCard key={article.id} article={article}>
                <ArticleCard article={article} />
              </SwipeableArticleCard>
            ))}
          </div>
        )}

        {/* No Articles */}
        {!isLoading && displayArticles.length === 0 && (
          <div className="text-center py-8" data-testid="status-no-articles">
            <p className="meta-text">
              {view === 'triggered' 
                ? "No triggered articles available. Try running the daily digest." 
                : (searchQuery || selectedCategory !== 'All') 
                  ? "No articles found matching your filters" 
                  : "No articles available"}
            </p>
            {view === 'triggered' && (
              <button
                onClick={handleManualTrigger}
                className="mt-4 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                data-testid="button-trigger-now"
              >
                Run Daily Digest
              </button>
            )}
          </div>
        )}

        {/* Article Count Footer */}
        {displayArticles.length > 0 && !isLoading && (
          <div className="text-center mt-8 pt-8 border-t border-gray-100" data-testid="footer-count">
            <p className="meta-text text-sm">
              {view === 'triggered' 
                ? `Showing ${displayArticles.length} articles from ${triggeredDate || 'previous day'}`
                : isOffline 
                  ? `Showing ${displayArticles.length} cached articles`
                  : `Showing ${displayArticles.length} of ${(articles || []).length} articles`
              }
            </p>
          </div>
        )}
      </main>

      {/* Chat Assistant */}
      <ChatBox />
    </div>
  );
}