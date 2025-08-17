import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Sidebar() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  const trendingTopics = [
    { topic: "GPT-5 Release", badge: "🔥 Hot" },
    { topic: "Quantum AI", badge: "📈 Rising" },
    { topic: "AI Ethics", badge: "💬 Trending" },
    { topic: "Autonomous Vehicles", badge: "⚡ Breaking" }
  ];

  const recentDiscussions = [
    {
      comment: "This breakthrough could change everything...",
      author: "Alex on GPT-5 Research"
    },
    {
      comment: "The ethical implications are huge...",
      author: "Maria on AI Governance"
    },
    {
      comment: "When will this be available commercially?",
      author: "James on Medical AI"
    }
  ];

  return (
    <aside className="lg:col-span-1">
      {/* Trending Topics Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {trendingTopics.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{item.topic}</span>
              <span className="text-xs text-slate-500">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="bg-gradient-to-br from-primary to-blue-700 rounded-xl p-6 text-white mb-6">
        <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
        <p className="text-blue-100 text-sm mb-4">Get the latest AI news delivered to your inbox.</p>
        <form className="space-y-3" onSubmit={handleNewsletterSubmit}>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full text-slate-800 text-sm"
            required
          />
          <Button 
            type="submit"
            className="w-full bg-white text-primary hover:bg-gray-100 transition-colors"
          >
            Subscribe
          </Button>
        </form>
      </div>

      {/* Recent Comments Widget */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Discussions</h3>
        <div className="space-y-4">
          {recentDiscussions.map((discussion, index) => (
            <div key={index} className="text-sm">
              <p className="text-slate-600">"{discussion.comment}"</p>
              <p className="text-slate-500 mt-1">— {discussion.author}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
