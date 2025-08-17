import { useState } from "react";
import { Search, Filter, Wifi, WifiOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useArticles, useArticleSearch } from "@/hooks/use-articles";
import type { ClientArticle } from "@shared/schema";

interface RSSArticleListProps {
  onArticleSelect?: (article: ClientArticle) => void;
}

export default function RSSArticleList({ onArticleSelect }: RSSArticleListProps) {
  const { articles, isLoading, error, isOffline, refetch } = useArticles();
  const { 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory, 
    categories, 
    filteredArticles 
  } = useArticleSearch(articles || []);

  const [showFilters, setShowFilters] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Latest AI News</h2>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error && !isOffline) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load articles</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-slate-800">Latest AI News</h2>
          {isOffline ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <WifiOff size={12} />
              Offline
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi size={12} />
              Live
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </Button>
          {!isOffline && (
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery || selectedCategory !== 'All' 
              ? 'No articles match your filters'
              : 'No articles available'}
          </div>
        ) : (
          filteredArticles.map((article) => (
            <Card 
              key={article.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onArticleSelect?.(article)}
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Article Image */}
                  {article.imageUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-24 h-24 object-cover rounded-lg"
                        loading="lazy"
                      />
                    </div>
                  )}
                  
                  {/* Article Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-slate-800 line-clamp-2">
                        {article.title}
                      </h3>
                      <ExternalLink size={16} className="text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    {/* Categories */}
                    {article.categories && article.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {article.categories.map((cat, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Summary */}
                    {article.summary && (
                      <p className="text-sm text-slate-600 mb-3 line-clamp-3">
                        {article.summary}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="font-medium">{article.source}</span>
                      {article.pubDate && (
                        <span>
                          {new Date(article.pubDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load Status */}
      <div className="text-center text-sm text-gray-500">
        {isOffline 
          ? `Showing ${filteredArticles.length} cached articles`
          : `Showing ${filteredArticles.length} of ${(articles || []).length} articles`
        }
      </div>
    </div>
  );
}