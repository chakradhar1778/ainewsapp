import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Category {
  name: string;
  description?: string;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'All', description: 'Show all articles from enabled sources' },
  { name: 'AI Models', description: 'Large language models, neural networks, and AI architectures' },
  { name: 'AI in Education', description: 'Educational technology, learning platforms, and AI tutoring' },
  { name: 'AI Agents', description: 'Autonomous systems, chatbots, and intelligent assistants' },
  { name: 'Web Development', description: 'Programming tools, frameworks, and developer technologies' },
  { name: 'General', description: 'Other technology news and updates' }
];

export default function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const savedCategories = localStorage.getItem('ai-news-categories');
    if (savedCategories) {
      const customCategories = JSON.parse(savedCategories);
      setCategories([
        DEFAULT_CATEGORIES[0], // Keep 'All' at the beginning
        ...customCategories
      ]);
    }
  }, []);

  return (
    <div className="mb-6">
      <ScrollArea className="w-full">
        <div className="flex space-x-2 pb-2">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center space-x-1 flex-shrink-0">
              <Button
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryChange(category.name)}
                className="whitespace-nowrap"
                data-testid={`button-category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category.name}
              </Button>
              {category.description && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                        data-testid={`button-category-info-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-sm">{category.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}