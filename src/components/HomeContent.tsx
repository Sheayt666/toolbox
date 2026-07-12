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
  Heart,
  Bookmark,
  QrCode,
  AlertTriangle,
  Briefcase,
  Palette,
  Code2,
  HeartPulse,
  GraduationCap,
  Home as HomeIcon,
  Gamepad2,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { categories, getPopularTools, getAllTools } from "@/lib/tools";
import { searchTools } from "@/lib/searchEngine";
import { useToolHistory } from "@/hooks/useToolHistory";

// 人群画像 / 场景导航
interface Persona {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  categories: string[];
  gradient: string;
  iconColor: string;
}

const personas: Persona[] = [
  {
    id: "office",
    name: "办公白领",
    icon: Briefcase,
    description: "文档处理 · 格式转换 · 文本编辑",
    categories: ["PDF工具", "文本工具", "转换工具"],
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    id: "designer",
    name: "设计美工",
    icon: Palette,
    description: "图片处理 · 创意设计",
    categories: ["设计工具", "图片工具"],
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-400",
  },
  {
    id: "developer",
    name: "程序员",
    icon: Code2,
    description: "开发辅助 · 编码调试",
    categories: ["开发工具", "转换工具"],
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-400",
  },
  {
    id: "finance",
    name: "理财达人",
    icon: TrendingUp,
    description: "投资计算 · 税务规划",
    categories: ["金融理财", "计算工具"],
    gradient: "from-amber-500/20 to-yellow-500/20",
    iconColor: "text-amber-400",
  },
  {
    id: "health",
    name: "健康管理",
    icon: HeartPulse,
    description: "健康监测 · 医疗计算",
    categories: ["健康医疗"],
    gradient: "from-red-500/20 to-rose-500/20",
    iconColor: "text-red-400",
  },
  {
    id: "student",
    name: "学生教师",
    icon: GraduationCap,
    description: "学习辅助 · 教育工具",
    categories: ["教育学习", "计算工具", "查询工具"],
    gradient: "from-indigo-500/20 to-purple-500/20",
    iconColor: "text-indigo-400",
  },
  {
    id: "life",
    name: "生活达人",
    icon: HomeIcon,
    description: "日常生活 · 实用助手",
    categories: ["生活工具", "查询工具"],
    gradient: "from-teal-500/20 to-cyan-500/20",
    iconColor: "text-teal-400",
  },
  {
    id: "creator",
    name: "内容创作",
    icon: Sparkles,
    description: "创意生成 · 多媒体制作",
    categories: ["生成工具", "视频音频", "图片工具"],
    gradient: "from-violet-500/20 to-fuchsia-500/20",
    iconColor: "text-violet-400",
  },
  {
    id: "casual",
    name: "休闲娱乐",
    icon: Gamepad2,
    description: "趣味工具 · 休闲游戏",
    categories: ["生活工具", "生成工具", "教育学习"],
    gradient: "from-orange-500/20 to-red-500/20",
    iconColor: "text-orange-400",
  },
  {
    id: "query",
    name: "资料查询",
    icon: Search,
    description: "信息检索 · 知识百科",
    categories: ["查询工具", "转换工具"],
    gradient: "from-slate-400/20 to-gray-500/20",
    iconColor: "text-slate-300",
  },
];

export default function HomeContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"trending" | "new" | "popular">("trending");

  // User retention: badge count for the "my toolbox" entry.
  const { favorites, history, hydrated } = useToolHistory();
  const myToolsCount = favorites.length + history.length;

  useEffect(() => {
    setSearchQuery(urlQuery);
  }, [urlQuery]);

  const allTools = getAllTools();
  const popularTools = getPopularTools();

  // Filter tools - 使用智能搜索引擎
  const filteredTools = useMemo(() => {
    let result: typeof allTools = [...allTools];

    if (searchQuery.trim()) {
      const searchResults = searchTools(searchQuery, allTools);
      result = searchResults.map((r) => r.tool);
    }

    if (activePersona) {
      const persona = personas.find((p) => p.id === activePersona);
      if (persona) {
        result = result.filter((t) => persona.categories.includes(t.category));
      }
    }

    if (activeCategory) {
      result = result.filter((t) => t.category === activeCategory);
    }

    // Sort
    if (sortBy === "new") {
      result = result.reverse();
    }

    return result;
  }, [searchQuery, activeCategory, activePersona, sortBy, allTools]);

  const displayTools = searchQuery || activeCategory || activePersona ? filteredTools : allTools;

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
                    placeholder="搜索工具，如 图片压缩、JSON格式化、我想把图片变小..."
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

      {/* My Toolbox entry - quick access to favorites & history */}
      <section className="pb-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/my-tools"
            className="group relative flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-primary-500/15 via-[#18181b] to-accent-500/10 border border-primary-500/20 hover:border-primary-500/40 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div className="relative flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors">
                  我的工具箱
                </h3>
                {hydrated && myToolsCount > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-primary-500 rounded-full">
                    {myToolsCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                收藏常用工具、查看最近使用记录，数据保存在本地浏览器
              </p>
            </div>
            <ChevronRight className="relative w-5 h-5 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        </div>
      </section>

      {/* Persona / Scene Navigation - 人群画像导航 */}
      <section className="pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">按场景选择</span>
            <span className="text-xs text-slate-500 ml-1">找到最适合你的工具集</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {personas.map((persona) => {
              const PIcon = persona.icon;
              const isActive = activePersona === persona.id;
              const count = allTools.filter((t) => persona.categories.includes(t.category)).length;
              return (
                <button
                  key={persona.id}
                  onClick={() => {
                    setActivePersona(isActive ? null : persona.id);
                    setActiveCategory(null);
                    setSearchQuery("");
                  }}
                  className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? "border-primary-500/50 bg-primary-500/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
                      : "border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] hover:bg-[#1c1c1f]"
                  }`}
                >
                  {/* Gradient glow */}
                  <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${persona.gradient} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity`} />

                  <div className="relative flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${persona.gradient} flex items-center justify-center flex-shrink-0`}>
                      <PIcon className={`w-5 h-5 ${persona.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-200 group-hover:text-white"} transition-colors`}>
                        {persona.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {persona.description}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-1">
                        {count} 个工具
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - 99工具 style */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              {(searchQuery || activeCategory || activePersona) && (
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                      setActivePersona(null);
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
                  : activePersona
                  ? (() => {
                      const p = personas.find((p) => p.id === activePersona);
                      return `${p?.name || ""}专属工具 (${filteredTools.length})`;
                    })()
                  : activeCategory
                  ? `${activeCategory} (${filteredTools.length})`
                  : "全部工具"}
              </h2>
              {activePersona && (
                <p className="text-xs text-slate-500 mt-1">
                  {(() => {
                    const p = personas.find((p) => p.id === activePersona);
                    return p ? `已为你筛选 ${p.categories.join("、")} 相关工具` : "";
                  })()}
                </p>
              )}
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
                    isPopular={i < 3 && !searchQuery && !activeCategory && !activePersona}
                    isNew={i >= displayTools.length - 3 && !searchQuery && !activeCategory && !activePersona}
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
                  setActivePersona(null);
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

      {/* Donate Section - 打赏支持 */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#18181b] to-emerald-500/5 border border-emerald-500/20 p-8 sm:p-10">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col sm:flex-row items-center gap-8">
              {/* 左侧文案 */}
              <div className="flex-1 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <Heart className="w-3.5 h-3.5" />
                  支持我们
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 tracking-tight">
                  喜欢本站？请我喝杯咖啡 ☕
                </h2>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  99在线工具坚持免费、无广告，为大家提供实用的在线工具。
                  如果觉得好用，欢迎打赏支持，你的鼓励是我持续维护更新的动力！
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5" />
                    收藏本站
                  </span>
                  <span className="w-px h-3 bg-[#27272a]" />
                  <span className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    分享给朋友
                  </span>
                </div>
              </div>

              {/* 右侧收款码 */}
              <div className="flex-shrink-0">
                <div className="bg-white rounded-xl p-3 shadow-xl shadow-emerald-500/10">
                  <div className="w-36 h-36 bg-[#f5f5f5] rounded-lg overflow-hidden">
                    <img
                      src="/wechat-pay.jpg"
                      alt="微信收款码"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-center text-xs text-slate-600 mt-2 font-medium">
                    微信扫码打赏
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer - 免责声明 */}
      <section className="pb-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#18181b]/60 rounded-xl border border-[#27272a] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  免责声明
                  <span className="text-xs font-normal text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">请务必阅读</span>
                </h3>
                <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
                  <p>
                    1. <strong className="text-slate-400">文件安全提示：</strong>使用本站任何工具处理文件前，请务必备份好原始文件。部分工具（如图片压缩、格式转换、PDF处理等）会对文件进行修改，<span className="text-amber-400/80">修改后的文件可能无法恢复到原始状态</span>。
                  </p>
                  <p>
                    2. <strong className="text-slate-400">风险自担：</strong>因使用本站工具导致的任何直接或间接损失（包括但不限于文件丢失、数据损坏、业务中断等），<span className="text-amber-400/80">本站不承担任何责任</span>。请确认无误后再使用。
                  </p>
                  <p>
                    3. <strong className="text-slate-400">数据隐私：</strong>本站所有工具均在您的浏览器本地运行，不会上传您的文件到服务器。但请避免使用公共设备或不安全的网络环境处理敏感文件。
                  </p>
                  <p>
                    4. <strong className="text-slate-400">使用范围：</strong>本站工具仅供个人学习和日常使用，请勿用于非法用途或批量商业用途。
                  </p>
                  <p>
                    5. <strong className="text-slate-400">技术支持：</strong>虽然我们尽力保证工具的稳定性，但不保证所有功能在所有环境下都完全正常。如有问题可联系反馈，但不承诺一定解决。
                  </p>
                  <p className="pt-1 text-slate-600">
                    继续使用本站即表示您已阅读并同意以上免责声明。
                    <Link
                      href="/disclaimer"
                      className="text-amber-400/80 hover:text-amber-400 transition-colors ml-1"
                    >
                      查看完整法律条款 →
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
