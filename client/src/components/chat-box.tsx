import { useState } from "react";
import { MessageCircle, X, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ClientArticle } from "@shared/schema";

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

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-black hover:bg-gray-800 text-white rounded-sm shadow-lg z-50 flex items-center justify-center transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-96 bg-white rounded-sm shadow-xl border border-gray-300 z-50 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <h3 className="font-normal text-black text-lg">AI Assistant</h3>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={clearChat}
                    className="text-sm meta-text hover:text-black px-2 py-1 border border-gray-300 rounded-sm"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="meta-text hover:text-black p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            <p className="text-sm meta-text mt-1">Ask me about the articles</p>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 p-4 min-h-0">
            {messages.length === 0 ? (
              <div className="text-center meta-text text-sm mt-8">
                <MessageCircle className="mx-auto mb-2 opacity-50" size={32} />
                <p>Ask me anything about the AI news!</p>
                <p className="text-xs mt-2">
                  Try: "What's new in AI models?" or "Tell me about recent developments"
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-3">
                  {/* User Question */}
                  <div className="flex justify-end">
                    <div className="bg-black text-white rounded-sm px-3 py-2 max-w-xs text-sm">
                      {message.question}
                    </div>
                  </div>

                  {/* AI Answer */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-sm px-3 py-2 max-w-xs text-sm text-black">
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
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                placeholder="Ask about AI news..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 p-2 text-sm border border-gray-300 rounded-sm bg-white text-black placeholder-gray-400 focus:outline-none focus:border-black disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-3 py-2 bg-black text-white text-sm rounded-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : "Send"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}