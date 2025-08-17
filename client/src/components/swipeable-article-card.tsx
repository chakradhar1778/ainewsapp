import { useSwipeable } from 'react-swipeable';
import { useState } from 'react';
import { ClientArticle } from '@shared/schema';

interface SwipeableArticleCardProps {
  article: ClientArticle;
  children: React.ReactNode;
}

export default function SwipeableArticleCard({ article, children }: SwipeableArticleCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Mark as read/archived
      setIsArchived(true);
      setTimeout(() => setIsArchived(false), 2000); // Reset after 2 seconds
    },
    onSwipedRight: () => {
      // Bookmark article
      setIsBookmarked(!isBookmarked);
      
      // Save to localStorage
      const bookmarks = JSON.parse(localStorage.getItem('ai-news-bookmarks') || '[]');
      if (!isBookmarked) {
        bookmarks.push(article);
        localStorage.setItem('ai-news-bookmarks', JSON.stringify(bookmarks));
      } else {
        const filtered = bookmarks.filter((b: ClientArticle) => b.id !== article.id);
        localStorage.setItem('ai-news-bookmarks', JSON.stringify(filtered));
      }
    },
    trackMouse: true,
  });

  return (
    <div
      {...handlers}
      className={`transition-all duration-300 ${
        isArchived ? 'opacity-50 scale-95' : ''
      } ${isBookmarked ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
      data-testid={`swipeable-card-${article.id}`}
    >
      {children}
      
      {/* Swipe feedback */}
      {isBookmarked && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
          Bookmarked
        </div>
      )}
      
      {isArchived && (
        <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded text-xs">
          Archived
        </div>
      )}
    </div>
  );
}