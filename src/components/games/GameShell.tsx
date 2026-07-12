"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Share2,
  Swords,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import {
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

export interface GameStat {
  label: string;
  value: string | number;
}

interface GameShellProps {
  gameId: string;
  title: string;
  description: string;
  instructions: string;
  icon: LucideIcon;
  stats?: GameStat[];
  /** 用于生成挑战链接的分数（通常是本局或历史最高分） */
  shareScore?: number;
  /** 递增该值会刷新排行榜 */
  refreshKey: number;
  children: React.ReactNode;
}

export default function GameShell({
  gameId,
  title,
  description,
  instructions,
  icon: Icon,
  stats,
  shareScore,
  refreshKey,
  children,
}: GameShellProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  useEffect(() => {
    setBoard(getLeaderboard(gameId));
  }, [gameId, refreshKey]);

  const handleShare = async () => {
    const target =
      board[0]?.name?.replace(/\s*\(你\)\s*$/, "") ?? "所有玩家";
    const { url, message } = createDiss(gameId, shareScore ?? 0, target);
    setShareMsg(message);
    try {
      await navigator.clipboard?.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // 剪贴板不可用时静默
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} 挑战`,
          text: message,
          url,
        });
      } catch {
        // 用户取消分享，保留已复制状态
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 返回游戏大厅 */}
        <Link
          href="/games"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#a78bfa] transition-colors mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          返回游戏大厅
        </Link>

        {/* 标题区 */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center shadow-lg shadow-[#8b5cf6]/25 flex-shrink-0">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* 数据统计 */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3"
              >
                <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                <div className="text-xl font-bold text-white tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 游戏主区域 */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 sm:p-6 mb-6">
          {children}
        </div>

        {/* 玩法说明 */}
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 sm:p-5 mb-6">
          <h2 className="text-sm font-semibold text-white mb-2">玩法说明</h2>
          <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
            {instructions}
          </p>
        </div>

        {/* 分享挑战 + 排行榜 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* 分享挑战 */}
          <div className="bg-gradient-to-br from-[#8b5cf6]/15 via-[#18181b] to-[#18181b] border border-[#8b5cf6]/25 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Swords className="w-4 h-4 text-[#a78bfa]" />
              <h2 className="text-sm font-semibold text-white">发起挑战</h2>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              用你的分数向排行榜榜首发起 Diss 挑战，生成专属挑战链接，复制后发给好友一较高下。
            </p>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
              {copied ? "挑战链接已复制" : "分享挑战"}
            </button>
            {shareMsg && (
              <p className="mt-3 text-xs text-slate-500 italic line-clamp-2">
                “{shareMsg}”
              </p>
            )}
          </div>

          {/* 排行榜 */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">排行榜</h2>
            </div>
            <ol className="space-y-1.5">
              {board.slice(0, 10).map((e, i) => {
                const isYou = e.name.includes("(你)");
                const rankColor =
                  i === 0
                    ? "text-amber-400"
                    : i === 1
                      ? "text-slate-300"
                      : i === 2
                        ? "text-amber-600"
                        : "text-slate-500";
                return (
                  <li
                    key={`${e.name}-${i}`}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                      isYou
                        ? "bg-[#8b5cf6]/15 border border-[#8b5cf6]/30"
                        : "bg-[#09090b]/60"
                    }`}
                  >
                    <span
                      className={`w-6 text-center text-sm font-bold ${rankColor}`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-lg">{e.avatar}</span>
                    <span
                      className={`flex-1 truncate text-sm ${isYou ? "text-white font-medium" : "text-slate-300"}`}
                    >
                      {e.name}
                    </span>
                    <span className="text-sm font-semibold text-white tabular-nums">
                      {e.score}
                    </span>
                  </li>
                );
              })}
              {board.length === 0 && (
                <li className="text-sm text-slate-500 text-center py-6">
                  暂无排行榜数据
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
