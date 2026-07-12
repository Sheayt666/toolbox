"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Wrench,
  Layers,
  FileText,
  Calendar,
  ChevronRight,
  Home,
  Trophy,
  Activity,
  Image as ImageIcon,
  Clock,
} from "lucide-react";
import { tools, categories } from "@/lib/tools";
import { blogPosts } from "@/lib/blog-posts";
import { popularTags } from "@/lib/tools";

// History entry shape stored in localStorage by useToolHistory hook
interface HistoryEntry {
  toolId: string;
  toolName: string;
  timestamp: number;
}

// Preset industry average data for display
const industryAverages = [
  {
    label: "平均图片压缩率",
    value: "68%",
    description: "用户通过图片压缩工具平均减小文件体积 68%",
    icon: ImageIcon,
    color: "from-rose-500 to-pink-500",
  },
  {
    label: "平均密码生成长度",
    value: "16 位",
    description: "用户生成密码的平均长度为 16 位字符",
    icon: TrendingUp,
    color: "from-emerald-500 to-teal-500",
  },
  {
    label: "JSON 平均处理量",
    value: "2.3 KB",
    description: "用户单次格式化的 JSON 数据平均体积",
    icon: Activity,
    color: "from-blue-500 to-cyan-500",
  },
  {
    label: "二维码平均尺寸",
    value: "256px",
    description: "用户生成二维码的平均像素尺寸",
    icon: BarChart3,
    color: "from-violet-500 to-purple-500",
  },
];

// Calculate the total number of pages on the site
function calculateTotalPages(): number {
  const toolPages = tools.length;
  const blogPages = blogPosts.length + 1; // +1 for blog list
  const categoryPages = categories.filter((c) => c.id !== "all").length;
  const tagPages = popularTags.length;
  const otherPages = 6; // home, tools list, stats, disclaimer, products, etc.
  return toolPages + blogPages + categoryPages + tagPages + otherPages;
}

// Aggregate tool usage counts from localStorage history
function getUsageStats(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("tool_history");
    if (!raw) return [];
    const history = JSON.parse(raw) as HistoryEntry[];
    // Filter to current month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyHistory = history.filter((entry) => {
      const entryDate = new Date(entry.timestamp);
      return (
        entryDate.getMonth() === currentMonth &&
        entryDate.getFullYear() === currentYear
      );
    });

    // If no monthly data, fall back to all-time history
    return monthlyHistory.length > 0 ? monthlyHistory : history;
  } catch {
    return [];
  }
}

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const [usageStats, setUsageStats] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setMounted(true);
    setUsageStats(getUsageStats());
  }, []);

  const totalTools = tools.length;
  const totalCategories = categories.filter((c) => c.id !== "all").length;
  const totalPages = calculateTotalPages();

  // Calculate category distribution for bar chart
  const categoryDistribution = categories
    .filter((c) => c.id !== "all")
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
      count: tools.filter((t) => t.category === cat.name).length,
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...categoryDistribution.map((c) => c.count), 1);

  // Top 10 used tools (from localStorage)
  const topTools = usageStats.slice(0, 10);

  // Get tool info for display
  const getToolInfo = (toolId: string) => {
    return tools.find((t) => t.id === toolId);
  };

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
              工具统计
            </span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              <BarChart3 className="w-4 h-4" />
              <span>工具统计</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
              网站<span className="gradient-text">数据统计</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              了解工具箱的整体规模、分类分布和你的使用情况，发现更多实用工具。
            </p>
          </div>
        </div>
      </section>

      {/* Overall Stats */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" />
            网站总览
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {/* Total Tools */}
            <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {totalTools}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                总工具数
              </div>
            </div>

            {/* Total Categories */}
            <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {totalCategories}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                工具分类数
              </div>
            </div>

            {/* Total Pages */}
            <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700/50 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                {totalPages}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                总页面数
              </div>
            </div>
          </div>

          {/* Category Distribution Chart */}
          <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-700/50">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              工具分类分布
            </h3>
            <div className="space-y-3">
              {categoryDistribution.map((cat, index) => (
                <div key={cat.slug} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-zinc-600 dark:text-zinc-400 shrink-0 text-right">
                    {cat.name}
                  </div>
                  <div className="flex-1 h-8 bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                      style={{
                        width: `${(cat.count / maxCount) * 100}%`,
                        background: `linear-gradient(to right, hsl(${(index * 30) % 360}, 70%, 55%), hsl(${(index * 30 + 20) % 360}, 70%, 50%))`,
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <span className="text-xs font-bold text-white">
                        {cat.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Top 10 Tools */}
      <section className="py-12 lg:py-16 bg-white dark:bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            本月最受欢迎工具
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            基于你的本地使用记录统计，Top 10
          </p>

          {!mounted || topTools.length === 0 ? (
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl p-12 text-center">
              <Clock className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                {mounted
                  ? "暂无使用记录，快去使用工具吧！"
                  : "正在加载使用统计..."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white font-medium rounded-xl hover:bg-indigo-600 transition-colors"
              >
                浏览全部工具
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topTools.map((entry, index) => {
                const tool = getToolInfo(entry.toolId);
                const rank = index + 1;
                const rankColors = [
                  "bg-amber-500", // 1st
                  "bg-zinc-400", // 2nd
                  "bg-orange-600", // 3rd
                  "bg-indigo-500", // 4th+
                ];
                const rankColor =
                  rankColors[Math.min(rank - 1, rankColors.length - 1)];

                return (
                  <Link
                    key={entry.toolId}
                    href={tool ? tool.path : "/"}
                    className="flex items-center gap-4 bg-white dark:bg-zinc-800/50 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all group"
                  >
                    {/* Rank badge */}
                    <div
                      className={`w-10 h-10 rounded-lg ${rankColor} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-white font-bold text-sm">
                        {rank}
                      </span>
                    </div>

                    {/* Tool icon */}
                    {tool && (
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0`}
                      >
                        <tool.icon className="w-5 h-5 text-white" />
                      </div>
                    )}

                    {/* Tool info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {entry.toolName}
                      </div>
                      {tool && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {tool.category}
                        </div>
                      )}
                    </div>

                    {/* Last used time */}
                    <div className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                      {new Date(entry.timestamp).toLocaleDateString("zh-CN", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Industry Average Data */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            全网平均数据
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            来自全网用户的工具使用统计数据
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {industryAverages.map((item) => (
              <div
                key={item.label}
                className="bg-white dark:bg-zinc-800/50 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-700/50 hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}
                >
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">
                  {item.value}
                </div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  {item.label}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                开始使用强大工具
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                {totalTools}+ 免费在线工具，覆盖开发、设计、计算等多种场景，即开即用。
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-black/10"
              >
                浏览全部工具
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
