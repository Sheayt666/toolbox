"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getGameById } from "@/lib/games";
import {
  receiveDiss,
  getLeaderboard,
  createDiss,
  getPlayer,
  getStats,
  type LeaderboardEntry,
} from "@/lib/gamification";
import {
  Home,
  ChevronRight,
  Gamepad2,
  Trophy,
  Share2,
  CheckCircle,
  Copy,
  Swords,
  ArrowRight,
  Clock,
  Flame,
  X,
} from "lucide-react";

interface GameLayoutProps {
  gameId: string;
  title: string;
  children: React.ReactNode;
}

export default function GameLayout({
  gameId,
  title,
  children,
}: GameLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [dissInfo, setDissInfo] = useState<{
    gameId: string;
    score: number;
    from: string;
    message: string;
  } | null>(null);
  const [showDissBanner, setShowDissBanner] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [sharePanel, setSharePanel] = useState<{
    url: string;
    message: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const game = getGameById(gameId);

  useEffect(() => {
    setMounted(true);
    // Detect diss challenge from URL
    const diss = receiveDiss();
    if (diss) {
      setDissInfo(diss);
    }
    // Load leaderboard
    setLeaderboard(getLeaderboard(gameId));
  }, [gameId]);

  const handleShareChallenge = () => {
    const stats = getStats();
    const player = getPlayer();
    const highScore = stats.highScores[gameId] ?? 0;
    const result = createDiss(gameId, highScore, "全站玩家");
    setSharePanel(result);
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

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

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="mb-5" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-1.5 text-xs">
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
              <Link
                href="/games"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                小游戏
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <li>
              <span className="text-slate-300 font-medium truncate max-w-[200px]">
                {title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Diss Challenge Banner */}
        {mounted && dissInfo && showDissBanner && (
          <div className="mb-5 relative overflow-hidden bg-gradient-to-r from-rose-500/15 via-primary-500/10 to-accent-500/10 border border-rose-500/30 rounded-xl p-4 animate-fade-in">
            <button
              onClick={() => setShowDissBanner(false)}
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-[#27272a]/50 hover:bg-[#3f3f46] text-slate-400 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-start gap-3 pr-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-primary-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Swords className="w-6 h-6 text-rose-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-white">
                    挑战书！{dissInfo.from} 向你发起了挑战 ⚔️
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  &ldquo;{dissInfo.message}&rdquo;
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-rose-400 bg-rose-500/10 rounded-md border border-rose-500/20">
                    <Trophy className="w-3 h-3" />
                    目标分数：{dissInfo.score}
                  </span>
                  <span className="text-slate-500">
                    超过这个分数即可赢下挑战！
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Title Area */}
        <div className="mb-6">
          <div className="flex items-start gap-4">
            {game && (
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center text-3xl shadow-lg flex-shrink-0`}
              >
                {game.icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                {game && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-primary-400 bg-primary-500/10 rounded-md">
                      {game.categoryName}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-md border ${
                        difficultyConfig[game.difficulty]?.className ?? ""
                      }`}
                    >
                      {difficultyConfig[game.difficulty]?.label ?? game.difficulty}
                    </span>
                    {game.hasLeaderboard && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-amber-400 bg-amber-500/10 rounded-md">
                        <Trophy className="w-3 h-3" />
                        有排行榜
                      </span>
                    )}
                  </>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
                {title}
              </h1>
              {game && (
                <p className="text-xs text-slate-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    约{game.avgSessionMin}分钟
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Flame className="w-3 h-3" />
                    留存评分 {game.retentionScore}/10
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden mb-6">
          {children}
        </div>

        {/* Share Challenge Panel */}
        {sharePanel && (
          <div className="mb-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-semibold text-white">
                挑战链接已生成
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {sharePanel.message}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={sharePanel.url}
                className="flex-1 h-9 px-3 text-xs text-slate-400 bg-[#09090b] border border-[#27272a] rounded-lg truncate"
              />
              <button
                onClick={() => handleCopyUrl(sharePanel.url)}
                className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg transition-all flex-shrink-0 ${
                  copiedUrl
                    ? "bg-emerald-500 text-white"
                    : "bg-[#27272a] text-slate-300 hover:bg-[#3f3f46] hover:text-white"
                }`}
              >
                {copiedUrl ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    复制链接
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Leaderboard + Actions */}
        {game?.hasLeaderboard && mounted && (
          <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden mb-6">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary-400" />
                <h3 className="text-sm font-semibold text-white">
                  {title} 排行榜
                </h3>
              </div>
              <Link
                href="/community"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                查看全部 →
              </Link>
            </div>
            <div className="divide-y divide-[#27272a]">
              {leaderboard.slice(0, 10).map((entry, idx) => {
                const isPlayer = entry.name.includes("(你)");
                const rank = idx + 1;
                return (
                  <div
                    key={`${entry.name}-${idx}`}
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                      isPlayer ? "bg-primary-500/5" : "hover:bg-[#1c1c1f]"
                    }`}
                  >
                    <div className="w-7 text-center flex-shrink-0">
                      {rank === 1 ? (
                        <span className="text-sm">🥇</span>
                      ) : rank === 2 ? (
                        <span className="text-sm">🥈</span>
                      ) : rank === 3 ? (
                        <span className="text-sm">🥉</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500">
                          {rank}
                        </span>
                      )}
                    </div>
                    <div className="w-7 h-7 rounded-md bg-[#27272a] flex items-center justify-center text-sm flex-shrink-0">
                      {entry.avatar}
                    </div>
                    <span
                      className={`flex-1 text-sm truncate ${
                        isPlayer ? "text-primary-400 font-medium" : "text-white"
                      }`}
                    >
                      {entry.name}
                    </span>
                    <span className="text-sm font-bold text-white flex-shrink-0">
                      {entry.score.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Share Challenge Button */}
          <button
            onClick={handleShareChallenge}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl hover:from-primary-500 hover:to-accent-500 transition-all shadow-lg shadow-primary-500/20"
          >
            <Swords className="w-4 h-4" />
            发起 Diss 挑战
          </button>

          {/* Share Button */}
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(window.location.href);
              } catch {
                // ignore
              }
            }}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-xl hover:text-white hover:border-[#3f3f46] transition-all"
          >
            <Share2 className="w-4 h-4" />
            分享游戏
          </button>

          {/* Back to Lobby */}
          <Link
            href="/games"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-xl hover:text-white hover:border-[#3f3f46] transition-all sm:ml-auto"
          >
            <Gamepad2 className="w-4 h-4" />
            返回游戏大厅
          </Link>
        </div>

        {/* More Games */}
        <div className="mt-6 pt-6 border-t border-[#27272a]">
          <Link
            href="/community"
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-primary-500/5 to-transparent rounded-xl border border-[#27272a] hover:border-primary-500/30 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  社区排行榜
                </p>
                <p className="text-xs text-slate-500">
                  查看全站排名、发起挑战、弹幕互动
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}
