import { useState, useEffect } from "react";
import { Settings, Plus, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Source {
  name: string;
  url: string;
  enabled: boolean;
  isDefault: boolean;
}

interface Category {
  name: string;
  description?: string;
}

const DEFAULT_SOURCES: Source[] = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/tag/artificial-intelligence/feed/', enabled: true, isDefault: true },
  { name: 'Wired', url: 'https://www.wired.com/category/artificial-intelligence/feed/', enabled: true, isDefault: true },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', enabled: true, isDefault: true },
  { name: 'CNET', url: 'https://www.cnet.com/rss/news/', enabled: true, isDefault: true },
  { name: 'TechRadar', url: 'https://www.techradar.com/rss', enabled: true, isDefault: true }
];

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'AI Models', description: 'Large language models, neural networks, and AI architectures' },
  { name: 'AI in Education', description: 'Educational technology, learning platforms, and AI tutoring' },
  { name: 'AI Agents', description: 'Autonomous systems, chatbots, and intelligent assistants' },
  { name: 'Web Development', description: 'Programming tools, frameworks, and developer technologies' },
  { name: 'General', description: 'Other technology news and updates' }
];

interface SettingsModalProps {
  triggerTime: string;
  onTriggerTimeChange: (time: string) => void;
  onManualTrigger: () => void;
}

export default function SettingsModal({ triggerTime, onTriggerTimeChange, onManualTrigger }: SettingsModalProps) {
  const [sources, setSources] = useState<Source[]>(DEFAULT_SOURCES);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceUrl, setNewSourceUrl] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  // Load settings from localStorage
  useEffect(() => {
    const savedSources = localStorage.getItem('ai-news-sources');
    if (savedSources) {
      setSources(JSON.parse(savedSources));
    }

    const savedCategories = localStorage.getItem('ai-news-categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('ai-news-sources', JSON.stringify(sources));
    localStorage.setItem('ai-news-categories', JSON.stringify(categories));
  };

  const toggleSource = (index: number) => {
    const updated = sources.map((source, i) => 
      i === index ? { ...source, enabled: !source.enabled } : source
    );
    setSources(updated);
  };

  const addCustomSource = () => {
    if (newSourceName && newSourceUrl) {
      const newSource: Source = {
        name: newSourceName,
        url: newSourceUrl,
        enabled: true,
        isDefault: false
      };
      setSources([...sources, newSource]);
      setNewSourceName("");
      setNewSourceUrl("");
    }
  };

  const removeSource = (index: number) => {
    if (!sources[index].isDefault) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const addCategory = () => {
    if (newCategoryName) {
      const newCategory: Category = {
        name: newCategoryName,
        description: newCategoryDescription || undefined
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setNewCategoryDescription("");
    }
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategoryDescription = (index: number, description: string) => {
    const updated = categories.map((category, i) => 
      i === index ? { ...category, description } : category
    );
    setCategories(updated);
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) saveSettings(); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" data-testid="button-settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your RSS sources, categories, and daily trigger settings for the AI news platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Daily Trigger Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Daily Trigger</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Label htmlFor="trigger-time">Trigger Time (IST)</Label>
                <Input
                  id="trigger-time"
                  type="time"
                  value={triggerTime}
                  onChange={(e) => onTriggerTimeChange(e.target.value)}
                  className="w-32"
                  data-testid="input-trigger-time"
                />
              </div>
              <Button onClick={onManualTrigger} variant="outline" data-testid="button-run-now">
                Run Now (Previous Day)
              </Button>
            </div>
          </div>

          <Separator />

          {/* Sources Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sources</h3>
            <div className="space-y-3">
              {sources.map((source, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={source.enabled}
                      onCheckedChange={() => toggleSource(index)}
                      data-testid={`switch-source-${source.name.toLowerCase().replace(' ', '-')}`}
                    />
                    <div>
                      <div className="font-medium">{source.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-md">{source.url}</div>
                    </div>
                  </div>
                  {!source.isDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSource(index)}
                      data-testid={`button-remove-source-${index}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Custom Source</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Source name"
                  value={newSourceName}
                  onChange={(e) => setNewSourceName(e.target.value)}
                  data-testid="input-new-source-name"
                />
                <Input
                  placeholder="RSS URL"
                  value={newSourceUrl}
                  onChange={(e) => setNewSourceUrl(e.target.value)}
                  data-testid="input-new-source-url"
                />
                <Button onClick={addCustomSource} size="sm" data-testid="button-add-source">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Categories Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <div className="space-y-3">
              {categories.map((category, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{category.name}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{category.description || 'No description provided'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {index >= DEFAULT_CATEGORIES.length && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(index)}
                        data-testid={`button-remove-category-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Textarea
                    placeholder="Category description (optional)"
                    value={category.description || ''}
                    onChange={(e) => updateCategoryDescription(index, e.target.value)}
                    className="text-sm"
                    rows={2}
                    data-testid={`textarea-category-description-${index}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-3">Add Category</h4>
              <div className="space-y-3">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  data-testid="input-new-category-name"
                />
                <Textarea
                  placeholder="Category description (optional)"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  rows={2}
                  data-testid="textarea-new-category-description"
                />
                <Button onClick={addCategory} size="sm" data-testid="button-add-category">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}