import { Eye } from "lucide-react";

interface ArticleCardProps {
  image: string;
  imageAlt: string;
  category: string;
  categoryColor: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  views: string;
  readTime: string;
}

export default function ArticleCard({
  image,
  imageAlt,
  category,
  categoryColor,
  timeAgo,
  title,
  excerpt,
  views,
  readTime
}: ArticleCardProps) {
  const getCategoryClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      purple: "bg-purple-100 text-purple-800",
      red: "bg-red-100 text-red-800"
    };
    return colorMap[color] || "bg-gray-100 text-gray-800";
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <img src={image} alt={imageAlt} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="flex items-center mb-3">
          <span className={`${getCategoryClasses(categoryColor)} px-2 py-1 rounded text-xs font-medium`}>
            {category}
          </span>
          <span className="text-slate-500 text-sm ml-3">{timeAgo}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-slate-600 text-sm mb-4 line-clamp-3">
          {excerpt}
        </p>
        <div className="flex items-center text-sm text-slate-500">
          <Eye className="mr-1" size={14} />
          <span>{views} views</span>
          <span className="mx-2">•</span>
          <span>{readTime} min read</span>
        </div>
      </div>
    </article>
  );
}
