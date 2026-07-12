"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Share2,
  Swords,
  CheckCircle,
  ChevronDown,
  BookOpen,
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
  iconEmoji?: string;
  iconGradient?: string;
  stats?: GameStat[];
  shareScore?: number;
  refreshKey: number;
  children: React.ReactNode;
}

export default function GameShell({
  gameId,
  title,
  description,
  instructions,
  icon: Icon,
  iconEmoji,
  iconGradient = "from-[#8b5cf6] to-[#6d28d9]",
  stats,
  shareScore,
  refreshKey,
  children,
}: GameShellProps) {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

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
        // 用户取消分享
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col">
      {/* 顶部导航条 */}
      <div className="border-b border-[#27272a]/60 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-[#a78bfa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            游戏大厅
          </Link>
          <div className="flex items-center gap-2">
            {stats && stats.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                {stats.slice(0, 3).map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-lg"
                  >
                    <span className="text-[11px] text-slate-500">{s.label}</span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* 标题区 — 大图标 + 标题 */}
        <div className="flex items-center gap-4 mb-5">
          <div
            className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-xl shadow-[#8b5cf6]/20 flex-shrink-0`}
          >
            {/* 光晕效果 */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${iconGradient} blur-xl opacity-40 -z-10`}
            />
            {iconEmoji ? (
              <span className="text-3xl sm:text-4xl drop-shadow-lg">
                {iconEmoji}
              </span>
            ) : (
              <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1 leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        {/* 移动端统计条 */}
        {stats && stats.length > 0 && (
          <div className="sm:hidden grid grid-cols-4 gap-2 mb-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-[#18181b] border border-[#27272a] rounded-lg px-2 py-2 text-center"
              >
                <div className="text-[10px] text-slate-500 truncate">{s.label}</div>
                <div className="text-base font-bold text-white tabular-nums">
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 桌面端两列布局：游戏区 + 侧边栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 lg:gap-6">
          {/* 左侧：游戏主区域 */}
          <div className="flex flex-col gap-4">
            {/* 游戏画布容器 */}
            <div className="relative bg-gradient-to-b from-[#18181b] to-[#131316] border border-[#27272a] rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden">
              {/* 装饰性光晕 */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#8b5cf6]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                {children}
              </div>
            </div>

            {/* 玩法说明 — 可折叠 */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#1c1c1f] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#a78bfa]" />
                  <span className="text-sm font-semibold text-white">玩法说明</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 transition-transform ${showInstructions ? "rotate-180" : ""}`}
                />
              </button>
              {showInstructions && (
                <div className="px-5 pb-4 pt-1">
                  <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                    {instructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧侧边栏：排行榜 + 挑战 */}
          <div className="flex flex-col gap-4">
            {/* 分享挑战卡 */}
            <div className="bg-gradient-to-br from-[#8b5cf6]/15 via-[#18181b] to-[#18181b] border border-[#8b5cf6]/25 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <Swords className="w-4 h-4 text-[#a78bfa]" />
                <h2 className="text-sm font-semibold text-white">发起挑战</h2>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                用你的分数向榜首玩家发起 Diss 挑战，复制链接发给好友一较高下。
              </p>
              <button
                onClick={handleShare}
                className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                {copied ? "链接已复制！" : "分享挑战"}
              </button>
              {shareMsg && (
                <p className="mt-3 text-xs text-slate-500 italic line-clamp-3">
                  &ldquo;{shareMsg}&rdquo;
                </p>
              )}
            </div>

            {/* 排行榜 */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4">
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
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                        isYou
                          ? "bg-[#8b5cf6]/15 border border-[#8b5cf6]/30"
                          : "bg-[#09090b]/60 hover:bg-[#09090b]"
                      }`}
                    >
                      <span
                        className={`w-5 text-center text-sm font-bold ${rankColor}`}
                      >
                        {i + 1}
                      </span>
                      <span className="text-base">{e.avatar}</span>
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
    </div>
  );
}
