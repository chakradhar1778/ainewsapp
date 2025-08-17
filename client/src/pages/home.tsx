import { useState } from "react";
import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import ArticleCard from "@/components/article-card";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("All");

  const articles = [
    {
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300",
      imageAlt: "Machine learning data visualization",
      category: "Research",
      categoryColor: "blue",
      timeAgo: "4 hours ago",
      title: "Meta's New Language Model Achieves 95% Accuracy in Code Generation",
      excerpt: "Researchers demonstrate significant improvements in automated programming with their latest transformer architecture...",
      views: "2.3k",
      readTime: "5"
    },
    {
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300",
      imageAlt: "AI and human hand interaction",
      category: "Industry",
      categoryColor: "green",
      timeAgo: "6 hours ago",
      title: "Apple Integrates Advanced AI into iOS 18 Developer Preview",
      excerpt: "The tech giant reveals how machine learning will enhance user experience across all native applications...",
      views: "1.8k",
      readTime: "3"
    },
    {
      image: "https://images.unsplash.com/photo-1563720223185-11003d516935?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300",
      imageAlt: "Autonomous vehicle with AI sensors",
      category: "Ethics",
      categoryColor: "purple",
      timeAgo: "8 hours ago",
      title: "New EU AI Act Guidelines Impact Autonomous Vehicle Development",
      excerpt: "European regulators establish comprehensive framework for AI safety in transportation systems...",
      views: "976",
      readTime: "7"
    },
    {
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=300",
      imageAlt: "AI medical diagnostics technology",
      category: "Healthcare",
      categoryColor: "red",
      timeAgo: "12 hours ago",
      title: "AI Diagnostic Tool Detects Cancer with 99.7% Accuracy in Clinical Trials",
      excerpt: "Breakthrough medical AI system shows unprecedented precision in early-stage cancer detection...",
      views: "3.1k",
      readTime: "6"
    }
  ];

  const filters = ["All", "Research", "Industry"];

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-slate-800">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection />

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Articles Section */}
          <section className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Latest Articles</h2>
              <div className="flex space-x-2">
                {filters.map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={
                      activeFilter === filter
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-slate-600 hover:bg-gray-200"
                    }
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {articles.map((article, index) => (
                <ArticleCard key={index} {...article} />
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center">
              <Button
                variant="outline"
                className="bg-white border border-gray-300 text-slate-700 hover:bg-gray-50 transition-colors"
              >
                Load More Articles
              </Button>
            </div>
          </section>

          <Sidebar />
        </div>
      </main>

      <Footer />
    </div>
  );
}
