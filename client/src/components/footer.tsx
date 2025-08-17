import { Bot } from "lucide-react";
import { SiX, SiLinkedin, SiYoutube, SiGithub } from "react-icons/si";

export default function Footer() {
  const categories = ["Research", "Industry News", "AI Ethics", "Tools & Reviews"];
  const company = ["About Us", "Contact", "Privacy Policy", "Terms of Service"];

  return (
    <footer className="bg-slate-800 text-slate-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="text-white" size={16} />
              </div>
              <h3 className="text-xl font-bold text-white">AI News</h3>
            </div>
            <p className="text-slate-400 mb-4 max-w-md">
              Your trusted source for the latest developments in artificial intelligence, machine learning, and emerging technologies.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <SiX size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <SiLinkedin size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <SiYoutube size={18} />
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <SiGithub size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {categories.map((category, index) => (
                <li key={index}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {company.map((item, index) => (
                <li key={index}>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
          <p>&copy; 2024 AI News. All rights reserved. Built with React and Vite.</p>
        </div>
      </div>
    </footer>
  );
}
