"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { games, gameCategories } from "@/lib/games";
import {
  getPlayer,
  getStats,
  getAchievementProgress,
  getTodayChallenge,
  checkAndRecordStreak,
  type PlayerInfo,
  type UserStats,
} from "@/lib/gamification";
import {
  Flame,
  Trophy,
  Target,
  Clock,
  ChevronRight,
  CheckCircle,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Home,
} from "lucide-react";

const difficultyConfig: Record<
  string,
  { label: string; className: string }
> = {
  easy: {
    label: "简单",
    className: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  medium: {
    label: "中等",
    className: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  hard: {
    label: "困难",
    className: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
};

export default function GamesPage() {
  const [mounted, setMounted] = useState(false);
  const [player, setPlayer] = useState<PlayerInfo>({ name: "", avatar: "" });
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievementProgress, setAchievementProgress] = useState({
    unlocked: 0,
    total: 0,
    percent: 0,
  });
  const [challenge, setChallenge] = useState<{
    gameId: string;
    gameName: string;
    task: string;
    target: number;
  } | null>(null);
  const [streakResult, setStreakResult] = useState<{
    isNewDay: boolean;
    streak: number;
    milestone: boolean;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    setMounted(true);
    setPlayer(getPlayer());
    setStats(getStats());
    setAchievementProgress(getAchievementProgress());
    setChallenge(getTodayChallenge());
    setStreakResult(checkAndRecordStreak());
  }, []);

  const filteredGames =
    selectedCategory === "all"
      ? games
      : games.filter((g) => g.category === selectedCategory);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#18181b] rounded-xl w-80" />
            <div className="h-6 bg-[#18181b] rounded-lg w-96" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
              <div className="lg:col-span-2 h-32 bg-[#18181b] rounded-xl" />
              <div className="h-32 bg-[#18181b] rounded-xl" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-48 bg-[#18181b] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                首页
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <li>
              <span className="text-slate-300 font-medium">休闲小游戏</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 gradient-bg-hero" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="relative py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-primary-300 bg-primary-500/15 rounded-full border border-primary-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                12款精选小游戏
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                免费即玩
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3 tracking-tight">
              休闲小游戏 🎮
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              12款经典休闲小游戏，即开即玩，无需下载。挑战每日任务，解锁成就，
              与全站玩家一较高下！
            </p>
          </div>
        </div>

        {/* Streak Notification */}
        {streakResult?.isNewDay && (
          <div className="mb-6 bg-gradient-to-r from-primary-500/15 to-accent-500/10 border border-primary-500/30 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Flame className="w-5 h-5 text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  签到成功！连续打卡 {streakResult.streak} 天 🔥
                </p>
                <p className="text-xs text-slate-400">
                  {streakResult.milestone
                    ? "恭喜达成里程碑成就！继续保持！"
                    : "继续坚持，解锁更多奖励！"}
                </p>
              </div>
              {streakResult.milestone && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-md border border-amber-500/20">
                  <Trophy className="w-3.5 h-3.5" />
                  里程碑
                </span>
              )}
            </div>
          </div>
        )}

        {/* Player Info + Daily Challenge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Player Info Card */}
          <div className="lg:col-span-2 bg-[#18181b] rounded-xl border border-[#27272a] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-white">玩家信息</h2>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {player.avatar}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-white truncate">
                    {player.name}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    连续签到 {stats?.dailyStreak ?? 0} 天
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Target className="w-3.5 h-3.5" />
                    最高 {stats?.maxStreak ?? 0} 天
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    总游戏 {stats?.totalGamesPlayed ?? 0} 次
                  </span>
                </div>
              </div>
            </div>

            {/* Achievement Progress Bar */}
            <div className="mt-4 pt-4 border-t border-[#27272a]">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                  成就进度
                </span>
                <span className="text-xs font-medium text-white">
                  {achievementProgress.unlocked} / {achievementProgress.total} (
                  {achievementProgress.percent}%)
                </span>
              </div>
              <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                  style={{ width: `${achievementProgress.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Challenge Card */}
          {challenge && (
            <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20 rounded-xl p-5 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-primary-400" />
                <h2 className="text-sm font-semibold text-white">每日挑战</h2>
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">今日挑战游戏</p>
                <p className="text-base font-bold text-white mb-2">
                  {challenge.gameName}
                </p>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-primary-300 bg-primary-500/10 rounded-md border border-primary-500/20 mb-3">
                  <Target className="w-3.5 h-3.5" />
                  {challenge.task}
                </div>
              </div>
              <Link
                href={`/games/${challenge.gameId}`}
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg hover:from-primary-500 hover:to-accent-500 transition-all"
              >
                开始挑战
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {gameCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                selectedCategory === cat.id
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                  : "bg-[#18181b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-10">
          {filteredGames.map((game, idx) => {
            const diff = difficultyConfig[game.difficulty];
            return (
              <Link
                key={game.id}
                href={game.path}
                className="group bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden hover:border-primary-500/30 transition-all hover:-translate-y-0.5 animate-fade-in-up"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                {/* Icon Area */}
                <div
                  className={`relative h-24 bg-gradient-to-br ${game.color} flex items-center justify-center overflow-hidden`}
                >
                  <span className="text-4xl drop-shadow-lg">{game.icon}</span>
                  {game.hasDailyChallenge && (
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-amber-400 bg-black/40 backdrop-blur-sm rounded-md border border-amber-500/30">
                      <Calendar className="w-2.5 h-2.5" />
                      每日
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-sm font-bold text-white mb-1 group-hover:text-primary-400 transition-colors truncate">
                    {game.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {game.description}
                  </p>
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-slate-400 bg-[#27272a] rounded">
                      {game.categoryName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded border ${diff.className}`}
                    >
                      {diff.label}
                    </span>
                  </div>
                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      约{game.avgSessionMin}分钟
                    </span>
                    {game.hasLeaderboard && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-primary-400">
                        <Trophy className="w-3 h-3" />
                        排行榜
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Community Leaderboard Entry */}
        <Link
          href="/community"
          className="group block relative overflow-hidden bg-gradient-to-r from-primary-500/10 via-accent-500/5 to-transparent border border-primary-500/20 rounded-xl p-6 hover:border-primary-500/40 transition-all"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-0.5">
                  社区排行榜 🏆
                </h3>
                <p className="text-sm text-slate-400">
                  查看全站高分排行、发起 Diss 挑战、发弹幕互动
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 h-10 px-5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg group-hover:from-primary-500 group-hover:to-accent-500 transition-all flex-shrink-0">
              进入社区
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
