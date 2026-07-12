"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Heart,
  Clock,
  BarChart3,
  Layers,
  Trash2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { useToolHistory } from "@/hooks/useToolHistory";
import { getAllTools, getToolBySlug, getPopularTools, type Tool } from "@/lib/tools";

interface RecentItem {
  tool: Tool;
  timestamp: number;
  toolName: string;
}

export default function MyToolsPage() {
  const { history, favorites, hydrated, clearHistory, clearFavorites } =
    useToolHistory();
  const [confirmClearHistory, setConfirmClearHistory] = useState(false);
  const [confirmClearFavorites, setConfirmClearFavorites] = useState(false);

  const allTools = getAllTools();
  const popularTools = getPopularTools();

  // Resolve favorite tools to full Tool objects (skip any that no longer exist).
  const favoriteTools = useMemo<Tool[]>(() => {
    const items: Tool[] = [];
    for (const f of favorites) {
      const tool = getToolBySlug(f.toolId);
      if (tool) items.push(tool);
    }
    return items;
  }, [favorites]);

  // Resolve recent tools from history (already deduplicated by the hook).
  const recentTools = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [];
    for (const h of history) {
      const tool = getToolBySlug(h.toolId);
      if (tool) {
        items.push({ tool, timestamp: h.timestamp, toolName: h.toolName });
      }
    }
    return items;
  }, [history]);

  // Unique tool count used in history.
  const uniqueUsedCount = useMemo(() => {
    return new Set(history.map((h) => h.toolId)).size;
  }, [history]);

  const hasData = favoriteTools.length > 0 || recentTools.length > 0;

  // Stats cards
  const stats: {
    label: string;
    value: number;
    icon: LucideIcon;
    color: string;
    bg: string;
  }[] = [
    {
      label: "已使用工具",
      value: uniqueUsedCount,
      icon: Layers,
      color: "text-primary-400",
      bg: "from-primary-500/20 to-primary-500/5",
    },
    {
      label: "我的收藏",
      value: favorites.length,
      icon: Heart,
      color: "text-rose-400",
      bg: "from-rose-500/20 to-rose-500/5",
    },
    {
      label: "全站工具",
      value: allTools.length,
      icon: BarChart3,
      color: "text-emerald-400",
      bg: "from-emerald-500/20 to-emerald-500/5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8">
          <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  首页
                </Link>
              </li>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <li>
                <span className="text-slate-300 font-medium">我的工具箱</span>
              </li>
            </ol>
          </nav>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              我的工具箱
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            你的专属工具空间，收藏常用工具、回顾最近使用记录，数据仅保存在你的浏览器本地。
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((stat) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl border border-[#27272a] bg-gradient-to-br ${stat.bg} p-5`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-white tabular-nums">
                      {hydrated ? stat.value : "—"}
                    </div>
                    <div className="text-sm text-slate-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#18181b]/60 flex items-center justify-center">
                    <StatIcon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state: no history and no favorites */}
        {hydrated && !hasData && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-8 sm:p-12 text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              还没有使用记录
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              浏览工具并点击收藏，或直接使用任意工具，这里就会显示你的收藏与最近使用记录。
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
              >
                去发现工具
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Recommended tools for first-time users */}
            <div className="mt-10 text-left">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">为你推荐</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularTools.slice(0, 4).map((tool) => (
                  <ToolCard
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    icon={tool.icon}
                    name={tool.name}
                    description={tool.description}
                    color={tool.color}
                    category={tool.category}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My favorites */}
        {hydrated && favoriteTools.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-white">我的收藏</h2>
                <span className="text-xs text-slate-500">
                  {favoriteTools.length} 个
                </span>
              </div>
              {favoriteTools.length > 0 && (
                <button
                  onClick={() => {
                    if (confirmClearFavorites) {
                      clearFavorites();
                      setConfirmClearFavorites(false);
                    } else {
                      setConfirmClearFavorites(true);
                      setTimeout(() => setConfirmClearFavorites(false), 3000);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-rose-400 hover:border-rose-500/30 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {confirmClearFavorites ? "确认清空？" : "清空收藏"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {favoriteTools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  href={`/tools/${tool.id}`}
                  icon={tool.icon}
                  name={tool.name}
                  description={tool.description}
                  color={tool.color}
                  category={tool.category}
                  size="sm"
                />
              ))}
            </div>
          </section>
        )}

        {/* Recently used */}
        {hydrated && recentTools.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-400" />
                <h2 className="text-lg font-bold text-white">最近使用</h2>
                <span className="text-xs text-slate-500">
                  {recentTools.length} 条记录
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirmClearHistory) {
                    clearHistory();
                    setConfirmClearHistory(false);
                  } else {
                    setConfirmClearHistory(true);
                    setTimeout(() => setConfirmClearHistory(false), 3000);
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-rose-400 hover:border-rose-500/30 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {confirmClearHistory ? "确认清空？" : "清空历史"}
              </button>
            </div>

            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] divide-y divide-[#27272a]">
              {recentTools.map(({ tool, timestamp }) => {
                const RecentIcon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={`/tools/${tool.id}`}
                    className="group flex items-center gap-4 p-4 hover:bg-[#1c1c1f] transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}
                    >
                      <RecentIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                        {tool.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {tool.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-slate-500 tabular-nums">
                        {formatRelativeTime(timestamp)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-400 bg-[#27272a]/60 rounded-md">
                        #{tool.category}
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// Format a timestamp into a short relative time string (e.g. "3 分钟前").
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;
  // Fallback to a date string for older entries.
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
