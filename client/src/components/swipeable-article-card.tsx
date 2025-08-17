import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { ClientArticle } from "@shared/schema";
import ArticleSummarySheet from "./article-summary-sheet";

interface SwipeableArticleCardProps {
  article: ClientArticle;
  children: React.ReactNode;
}

export default function SwipeableArticleCard({ article, children }: SwipeableArticleCardProps) {
  const [showSummary, setShowSummary] = useState(false);

  const handlers = useSwipeable({
    onSwipedLeft: () => setShowSummary(true),
    trackMouse: true,
    delta: 10
  });

  const handleThumbnailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSummary(true);
  };

  return (
    <>
      <div {...handlers} className="cursor-pointer">
        <div onClick={handleThumbnailClick}>
          {children}
        </div>
      </div>
      
      <ArticleSummarySheet
        article={article}
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
      />
    </>
  );
}