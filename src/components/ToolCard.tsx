import Link from "next/link";
import { LucideIcon, Bookmark, ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  href: string;
  icon: LucideIcon;
  name: string;
  description: string;
  color: string;
  category?: string;
  isPopular?: boolean;
  isNew?: boolean;
  verified?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function ToolCard({
  href,
  icon: Icon,
  name,
  description,
  color,
  category,
  isPopular,
  isNew,
  verified,
  size = "md",
}: ToolCardProps) {
  const paddingClasses = {
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  const iconSizeClasses = {
    sm: "w-10 h-10",
    md: "w-11 h-11",
    lg: "w-12 h-12",
  };

  const iconInnerSize = {
    sm: "w-5 h-5",
    md: "w-[22px] h-[22px]",
    lg: "w-6 h-6",
  };

  const titleSizeClasses = {
    sm: "text-[15px]",
    md: "text-[15px]",
    lg: "text-base",
  };

  return (
    <Link
      href={href}
      className={`tool-card group relative block bg-[#18181b] rounded-xl ${paddingClasses[size]} border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all duration-200`}
    >
      {/* Top row: icon + actions */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`${iconSizeClasses[size]} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg shadow-black/20`}
        >
          <Icon className={`${iconInnerSize[size]} text-white`} />
        </div>

        <div className="flex items-center gap-1">
          {isNew && (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-md">
              NEW
            </span>
          )}
          {isPopular && (
            <span className="px-2 py-0.5 text-[10px] font-semibold text-orange-400 bg-orange-500/10 rounded-md">
              HOT
            </span>
          )}
        </div>
      </div>

      {/* Title + verified */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <h3
          className={`${titleSizeClasses[size]} font-semibold text-white group-hover:text-primary-400 transition-colors truncate`}
        >
          {name}
        </h3>
        {verified && (
          <div className="w-4 h-4 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-2.5 h-2.5 text-primary-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
        {description}
      </p>

      {/* Bottom: category tag + arrow */}
      <div className="flex items-center justify-between">
        {category ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-400 bg-[#27272a]/60 rounded-md">
            #{category}
          </span>
        ) : (
          <span />
        )}
        <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
