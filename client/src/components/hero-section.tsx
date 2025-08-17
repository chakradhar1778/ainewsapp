import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 mb-4">
          Latest in <span className="text-primary">Artificial Intelligence</span>
        </h2>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Stay updated with cutting-edge AI research, industry developments, and breakthrough technologies shaping our future.
        </p>
      </div>

      {/* Featured Article */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
        <img 
          src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&h=600" 
          alt="AI data center with neural networks" 
          className="w-full h-64 sm:h-80 object-cover" 
        />
        <div className="p-8">
          <div className="flex items-center mb-4">
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">Featured</span>
            <span className="text-slate-500 text-sm ml-4">2 hours ago</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-3">
            OpenAI Announces Breakthrough in Multimodal AI Understanding
          </h3>
          <p className="text-slate-600 text-lg leading-relaxed mb-4">
            The latest advancement promises to revolutionize how AI systems process and understand complex visual and textual information simultaneously, marking a significant step toward artificial general intelligence.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-slate-800">Sarah Chen</p>
                <p className="text-sm text-slate-500">Senior AI Reporter</p>
              </div>
            </div>
            <button className="text-primary hover:text-blue-700 font-medium flex items-center transition-colors">
              Read More <ArrowRight className="ml-2" size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
