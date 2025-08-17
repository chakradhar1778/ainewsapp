import { useState } from "react";
import { useArticles } from "@/hooks/use-articles";
import ChatBox from "@/components/chat-box";
import { ClientArticle } from "@shared/schema";

export default function HomePage() {
  const { articles, isLoading, error, isOffline } = useArticles();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter articles by search query
  const filteredArticles = (articles || []).filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format relative time in IST
  const formatTimeIST = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-IN', { 
        month: 'short', 
        day: 'numeric',
        timeZone: 'Asia/Kolkata'
      });
    }
  };

  // Truncate summary to 2-4 sentences
  const truncateSummary = (text: string, maxSentences: number = 3) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.slice(0, maxSentences).join('. ') + (sentences.length > maxSentences ? '.' : '');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top Bar */}
      <header className="border-b border-gray-200 px-4 py-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-normal text-black">AI News</h1>
          <time className="meta-text text-base">{getCurrentIST()}</time>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-4 text-lg border border-gray-300 rounded-sm bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black"
          />
        </div>

        {/* Status Messages */}
        {isLoading && (
          <div className="text-center py-8">
            <p className="meta-text">Loading articles...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="meta-text">Failed to load articles</p>
            <p className="meta-text text-sm mt-2">
              {isOffline ? "You're offline - showing cached articles" : "Please check your connection"}
            </p>
          </div>
        )}

        {/* Articles List */}
        {filteredArticles.length > 0 && (
          <div className="space-y-8">
            {filteredArticles.map((article: ClientArticle) => (
              <article key={article.id} className="border-b border-gray-100 pb-8">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  {article.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-18 md:w-32 md:h-24">
                      <img
                        src={article.imageUrl}
                        alt=""
                        className="w-full h-full object-cover rounded-sm"
                      />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="flex-grow">
                    <h2 className="text-xl font-normal leading-tight mb-2 text-black">
                      <a href={article.link} target="_blank" rel="noopener noreferrer" className="hover:no-underline">
                        {article.title}
                      </a>
                    </h2>
                    
                    <div className="flex items-center gap-3 mb-3 text-sm meta-text">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{article.pubDate ? formatTimeIST(article.pubDate) : 'Recent'}</span>
                    </div>
                    
                    {article.summary && (
                      <p className="text-black mb-3 leading-relaxed">
                        {truncateSummary(article.summary, 3)}
                      </p>
                    )}
                    
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-black underline hover:no-underline text-sm"
                    >
                      View more
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* No Articles */}
        {!isLoading && filteredArticles.length === 0 && (
          <div className="text-center py-8">
            <p className="meta-text">
              {searchQuery ? "No articles found matching your search" : "No articles available"}
            </p>
          </div>
        )}

        {/* Article Count */}
        {filteredArticles.length > 0 && (
          <div className="text-center mt-8 pt-8 border-t border-gray-100">
            <p className="meta-text text-sm">
              {isOffline 
                ? `Showing ${filteredArticles.length} cached articles`
                : `Showing ${filteredArticles.length} of ${(articles || []).length} articles`
              }
            </p>
          </div>
        )}
      </main>

      {/* Chat Assistant */}
      <ChatBox articles={articles || []} />
    </div>
  );
}