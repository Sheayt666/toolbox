"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { getCategorySlugByName } from "@/lib/tools";

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: LucideIcon;
  color?: string;
  category?: string;
  size?: "sm" | "md" | "lg";
  popular?: boolean;
  new?: boolean;
}

export default function ToolCard({
  name,
  description,
  path,
  icon: Icon,
  color = "from-primary-500 to-accent-500",
  category,
  size = "md",
  popular = false,
  new: isNew = false,
}: ToolCardProps) {
  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-7",
  };

  const iconSizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-14 h-14",
  };

  const iconInnerSize = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  const titleSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <Link
      href={path}
      className={`tool-card group relative block bg-white dark:bg-slate-800/40 rounded-2xl ${sizeClasses[size]} border border-slate-200/80 dark:border-slate-700/50 hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_10px_30px_-10px_rgba(99,102,241,0.3)]`}
    >
      {/* Badges */}
      {(popular || isNew) && (
        <div className="absolute top-4 right-4 flex gap-1.5">
          {popular && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
              热门
            </span>
          )}
          {isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
              NEW
            </span>
          )}
        </div>
      )}

      {/* Icon */}
      <div
        className={`${iconSizeClasses[size]} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md`}
      >
        <Icon className={`${iconInnerSize[size]} text-white`} />
      </div>

      {/* Content */}
      <h3
        className={`${titleSizeClasses[size]} font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors`}
      >
        {name}
      </h3>

      {category && size !== "sm" && (
        <Link
          href={`/category/${getCategorySlugByName(category)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-block px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 rounded-md mb-2 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
        >
          {category}
        </Link>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
        {description}
      </p>

      {/* CTA */}
      <div className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300">
        <span>立即使用</span>
        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
    </Link>
  );
}
