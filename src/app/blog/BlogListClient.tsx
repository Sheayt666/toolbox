"use client";

import { useState } from "react";
import Link from "next/link";
import { blogPosts, blogCategories } from "@/lib/blog-posts";
import { Calendar, ArrowRight, Tag } from "lucide-react";

// Client component handling interactive category filtering for the blog list.
export default function BlogListClient() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPosts =
    activeCategory === "all"
      ? blogPosts
      : blogPosts.filter((post) => post.category === activeCategory);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-10">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeCategory === "all"
              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
              : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
          }`}
        >
          全部文章
        </button>
        {blogCategories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeCategory === category
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post, index) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="tool-card group bg-white dark:bg-zinc-800/50 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 flex flex-col"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Card header gradient */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />

            <div className="p-6 flex flex-col flex-1">
              {/* Category tag */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                  <Tag className="w-3 h-3" />
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                {post.title}
              </h2>

              {/* Excerpt */}
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-3 flex-1">
                {post.excerpt}
              </p>

              {/* Meta info */}
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 pt-4 border-t border-zinc-100 dark:border-zinc-700/50">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.publishDate)}
                </span>
                <span className="flex items-center gap-1 font-medium text-indigo-500 dark:text-indigo-400">
                  阅读
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-zinc-500 dark:text-zinc-400">
            该分类下暂无文章
          </p>
        </div>
      )}
    </>
  );
}
