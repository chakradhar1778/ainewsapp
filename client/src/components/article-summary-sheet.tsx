import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ClientArticle } from "@shared/schema";
import { useSwipeable } from "react-swipeable";

interface ArticleSummarySheetProps {
  article: ClientArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArticleSummarySheet({ article, isOpen, onClose }: ArticleSummarySheetProps) {
  const handlers = useSwipeable({
    onSwipedDown: onClose,
    trackMouse: true,
    delta: 50
  });

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

  if (!article) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh] rounded-t-xl" {...handlers}>
        <div className="flex flex-col h-full">
          <SheetHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-left text-lg">{article.title}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose} data-testid="button-close-sheet">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-sm text-gray-600">
              {article.source} · {formatTimeIST(article.pubDate || '')}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-4">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
                data-testid="img-article-summary"
              />
            )}

            <div className="space-y-4">
              {article.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Summary</h3>
                  <p className="text-gray-700 leading-relaxed" data-testid="text-summary">
                    {article.summary}
                  </p>
                </div>
              )}

              {article.description && article.description !== article.summary && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 text-sm leading-relaxed" data-testid="text-description">
                    {article.description}
                  </p>
                </div>
              )}

              {article.categories && article.categories.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        data-testid={`badge-category-${index}`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 mt-6">
            <Button
              onClick={() => window.open(article.link, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              data-testid="button-view-more"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              View More
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}