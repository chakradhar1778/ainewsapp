import { useState } from "react";
import { MessageCircle, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@/hooks/use-chat";
import type { ClientArticle } from "@shared/schema";

interface ChatBoxProps {
  articles: ClientArticle[];
}

export default function ChatBox({ articles }: ChatBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, inputValue, setInputValue, sendMessage, clearChat, isLoading } = useChat(articles);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue.trim());
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg"
        size="icon"
      >
        <MessageCircle size={20} />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-96 shadow-2xl z-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI News Assistant</CardTitle>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearChat}>
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Ask me about the latest AI news articles
        </p>
      </CardHeader>

      <CardContent className="flex flex-col h-full pb-4">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-0">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-sm mt-8">
              <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
              <p>Ask me anything about the AI news!</p>
              <p className="text-xs mt-2">
                Try: "What's new in AI models?" or "Tell me about recent AI developments"
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* User Question */}
                <div className="flex justify-end">
                  <div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 max-w-xs text-sm">
                    {message.question}
                  </div>
                </div>

                {/* AI Answer */}
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs text-sm">
                    {message.answer === '...' ? (
                      <div className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.answer}</div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Ask about AI news..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>

        {/* Status */}
        <div className="text-xs text-gray-500 mt-2 text-center">
          {articles.length > 0 
            ? `Searching through ${articles.length} articles`
            : 'No articles loaded yet'
          }
        </div>
      </CardContent>
    </Card>
  );
}