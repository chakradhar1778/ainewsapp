import { useState } from "react";
import { Bot, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Bot className="text-white text-lg" size={20} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">AI News</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-primary transition-colors font-medium">Latest</a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors font-medium">Research</a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors font-medium">Industry</a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors font-medium">Ethics</a>
            <a href="#" className="text-slate-600 hover:text-primary transition-colors font-medium">Tools</a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-slate-600 hover:text-primary">
              <Search size={20} />
            </Button>
            <Button className="hidden sm:block bg-primary text-white hover:bg-blue-700 transition-colors">
              Subscribe
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            <a href="#" className="block px-3 py-2 text-slate-600 hover:text-primary font-medium">Latest</a>
            <a href="#" className="block px-3 py-2 text-slate-600 hover:text-primary font-medium">Research</a>
            <a href="#" className="block px-3 py-2 text-slate-600 hover:text-primary font-medium">Industry</a>
            <a href="#" className="block px-3 py-2 text-slate-600 hover:text-primary font-medium">Ethics</a>
            <a href="#" className="block px-3 py-2 text-slate-600 hover:text-primary font-medium">Tools</a>
            <div className="px-3 py-2">
              <Button className="w-full bg-primary text-white hover:bg-blue-700 transition-colors">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
