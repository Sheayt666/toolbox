"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
  Hash,
  ChevronRight,
  Zap,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { categories, getPopularTools, getAllTools } from "@/lib/tools";

export default function HomeContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "new" | "popular">("trending");

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const allTools = getAllTools();
  const popularTools = getPopularTools();

  // Filter tools
  const filteredTools = useMemo(() => {
    let result = [...allTools];

    if (searchQuery) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }

    // Sort
    if (sortBy === "new") {
      result = result.reverse();
    }

    return result;
  }, [searchQuery, activeCategory, sortBy, allTools]);

  const displayTools = searchQuery || activeCategory ? filteredTools : allTools;

  return (
    <>
      {/* Hero Section - 99工具 style minimal */}
      <section className="relative overflow-hidden pt-14 pb-10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />

        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/[0.12] rounded-full blur-[100px] pointer-events-none" />

        {/* Grid pattern subtle */}
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Title - 99工具 style large */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight leading-[1.2] animate-fade-in-up">
              发现最好用的
              <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-pink-400 bg-clip-text text-transparent">
                在线工具
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8 animate-fade-in-up stagger-1">
              精选 {allTools.length}+ 款实用在线工具，涵盖开发、设计、效率、生活等领域
            </p>

            {/* Search Bar - 99工具 style */}
            <div className="max-w-xl mx-auto mb-8 animate-fade-in-up stagger-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-500/20 rounded-xl blur-md opacity-50" />
                <div className="relative flex items-center bg-[#18181b] rounded-xl border border-[#27272a] focus-within:border-primary-500/40 focus-within:shadow-[0_0_0_4px_rgba(168,85,247,0.08)] transition-all">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索工具，如 PDF 压缩、JSON 格式化、图片转换..."
                    className="w-full h-14 pl-12 pr-24 text-base bg-transparent text-white outline-none placeholder:text-slate-500"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all">
                    搜索
                  </button>
                </div>
              </div>
            </div>

            {/* Quick category tags - 99工具 #tag style */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 animate-fade-in-up stagger-3">
              <span className="text-xs text-slate-500 mr-1">热门:</span>
              {categories
                .filter((c) => c.id !== "all")
                .slice(0, 8)
                .map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(activeCategory === cat.name ? null : cat.name);
                      setSearchQuery("");
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      activeCategory === cat.name
                        ? "text-white bg-primary-500/20 border border-primary-500/30"
                        : "text-slate-400 bg-[#18181b]/60 border border-transparent hover:text-white hover:bg-[#27272a] hover:border-[#3f3f46]"
                    }`}
                  >
                    <Hash className="w-3 h-3 opacity-70" />
                    {cat.name}
                  </button>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - 99工具 style */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              {(searchQuery || activeCategory) && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ← 返回全部
                  </button>
                </div>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {searchQuery
                  ? `"${searchQuery}" 的搜索结果 (${filteredTools.length})`
                  : activeCategory
                  ? `${activeCategory} (${filteredTools.length})`
                  : "全部工具"}
              </h2>
            </div>

            {/* Sort tabs - 99工具 style */}
            <div className="flex items-center gap-1 bg-[#18181b] rounded-lg p-1 border border-[#27272a]">
              {[
                { key: "trending", label: "热门", icon: TrendingUp },
                { key: "new", label: "最新", icon: Clock },
                { key: "popular", label: "收藏最多", icon: Star },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSortBy(tab.key as typeof sortBy)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    sortBy === tab.key
                      ? "text-white bg-[#27272a]"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tools Grid - 99工具 4 column layout */}
          {displayTools.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayTools.map((tool, i) => (
                <div
                  key={tool.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(i * 20, 200)}ms` }}
                >
                  <ToolCard
                    href={`/tools/${tool.id}`}
                    icon={tool.icon}
                    name={tool.name}
                    description={tool.description}
                    color={tool.color}
                    category={tool.category}
                    isPopular={i < 3 && !searchQuery && !activeCategory}
                    isNew={i >= displayTools.length - 3 && !searchQuery && !activeCategory}
                    verified={i % 5 === 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center">
                <Search className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                未找到相关工具
              </h3>
              <p className="text-slate-400 mb-5">试试其他关键词或浏览全部工具</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#18181b] border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                清除筛选
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Categories - 99工具 style category cards */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-sm font-medium text-primary-400">分类浏览</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                按分类探索工具
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories
              .filter((c) => c.id !== "all")
              .map((cat) => {
                const CatIcon = cat.icon;
                const count = allTools.filter((t) => t.category === cat.name).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group flex items-center gap-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all">
                      <CatIcon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500">{count} 个工具</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* CTA Section - Minimal */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-accent-500/20 border border-primary-500/20 p-8 sm:p-12 text-center">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium text-primary-300 bg-primary-500/10 rounded-full border border-primary-500/20">
                <Zap className="w-3.5 h-3.5" />
                持续更新中
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                觉得有用？收藏本网站
              </h2>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                每天更新精选工具，让你的工作和生活更高效。
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
                >
                  开始探索
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Tools Sitemap - SEO内链矩阵 */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Hash className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">全站工具导航</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              按分类浏览全部工具
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              共 {allTools.length} 个精选在线工具，覆盖{categories.filter(c => c.id !== "all").length}大分类
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categories
              .filter((c) => c.id !== "all")
              .map((cat) => {
                const CatIcon = cat.icon;
                const catTools = allTools.filter((t) => t.category === cat.name).slice(0, 8);
                return (
                  <div
                    key={cat.id}
                    className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 hover:border-[#3f3f46] transition-colors"
                  >
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-2.5 mb-4 group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                        <CatIcon className="w-4 h-4 text-primary-400" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
                          {cat.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                    <ul className="space-y-1.5">
                      {catTools.map((tool) => (
                        <li key={tool.id}>
                          <Link
                            href={tool.path}
                            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors truncate"
                          >
                            <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 flex-shrink-0" />
                            <span className="truncate">{tool.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {catTools.length >= 8 && (
                      <Link
                        href={`/category/${cat.slug}`}
                        className="inline-flex items-center gap-1 mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        查看全部
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>
    </>
  );
}
