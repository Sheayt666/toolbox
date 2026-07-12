"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Crosshair, Trophy, Share2, ArrowLeft, Home, RefreshCw, Target, Clock, Zap } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

const GAME_ID = "aim-trainer";
const GAME_DURATION = 30; // 30 秒
const TARGET_SIZE = 48; // 目标直径 px
const TARGET_LIFETIME = 1500; // 目标自动消失时间 ms

type Phase = "ready" | "playing" | "over";

interface TargetData {
  id: number;
  x: number;
  y: number;
}

/* ============ 组件 ============ */

export default function AimTrainerPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState<TargetData | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);

  const arenaRef = useRef<HTMLDivElement>(null);
  const targetIdRef = useRef(0);
  const targetSpawnTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
    if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);
  }, []);

  const spawnTarget = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const rect = arena.getBoundingClientRect();
    const maxX = rect.width - TARGET_SIZE - 8;
    const maxY = rect.height - TARGET_SIZE - 8;
    const x = Math.max(4, Math.random() * maxX);
    const y = Math.max(4, Math.random() * maxY);
    targetIdRef.current++;
    targetSpawnTimeRef.current = Date.now();
    setTarget({ id: targetIdRef.current, x, y });

    // 自动消失换位置（算 miss）
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    autoHideRef.current = setTimeout(() => {
      setMisses((m) => m + 1);
      spawnTarget();
    }, TARGET_LIFETIME);
  }, []);

  const endGame = useCallback(() => {
    setPhase("over");
    setTarget(null);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (autoHideRef.current) { clearTimeout(autoHideRef.current); autoHideRef.current = null; }
    if (!submitted) {
      submitScore(GAME_ID, hits, `命中 ${hits} 次`);
      setBestScore((prev) => (prev === null ? hits : Math.max(prev, hits)));
      setLeaderboard(getLeaderboard(GAME_ID));
      setSubmitted(true);
    }
  }, [hits, submitted]);

  const startGame = useCallback(() => {
    setPhase("playing");
    setHits(0);
    setMisses(0);
    setSubmitted(false);
    setReactionTimes([]);
    setTimeLeft(GAME_DURATION);
    // 等待下一帧让 arena 渲染
    setTimeout(() => spawnTarget(), 50);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, [spawnTarget, endGame]);

  const handleHit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reactionTime = Date.now() - targetSpawnTimeRef.current;
    setReactionTimes((prev) => [...prev, reactionTime]);
    setHits((h) => h + 1);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
    spawnTarget();
  };

  const handleMiss = () => {
    if (phase !== "playing") return;
    setMisses((m) => m + 1);
  };

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);
  }, []);

  const handleShare = () => {
    const score = bestScore ?? 0;
    const r = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(r.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  const totalShots = hits + misses;
  const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;
  const avgReaction = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/games" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            返回游戏大厅
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-[#8b5cf6] transition-colors text-sm">
            <Home className="w-4 h-4" />
            首页
          </Link>
        </div>

        {/* 标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] mb-4 shadow-lg shadow-[#8b5cf6]/30">
            <Crosshair className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">瞄准训练器</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            30 秒倒计时，随机位置出现圆形目标。点击目标得分，目标会在 1.5 秒后自动消失换位置。统计命中数和命中率。
          </p>
        </div>

        {/* 统计栏 */}
        {phase !== "ready" && (
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <Clock className="w-4 h-4 text-[#8b5cf6]" />
              <span className="font-mono text-lg font-bold">{timeLeft}s</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm text-zinc-500">命中</span>
              <span className="font-mono text-lg font-bold text-green-400">{hits}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <span className="text-sm text-zinc-500">未中</span>
              <span className="font-mono text-lg font-bold text-red-400">{misses}</span>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-zinc-500">命中率</span>
              <span className="font-mono text-lg font-bold text-yellow-400">{accuracy}%</span>
            </div>
          </div>
        )}

        {/* 游戏区域 */}
        {phase === "ready" && (
          <div className="text-center py-16">
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-8 py-3 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#8b5cf6]/30"
            >
              开始训练
            </button>
          </div>
        )}

        {phase === "playing" && (
          <div
            ref={arenaRef}
            onClick={handleMiss}
            className="relative w-full bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6 select-none cursor-crosshair"
            style={{ height: "420px" }}
          >
            {target && (
              <button
                key={target.id}
                onClick={handleHit}
                className="absolute rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] hover:from-[#a78bfa] hover:to-[#7c3aed] transition-all active:scale-90 shadow-lg shadow-[#8b5cf6]/50"
                style={{
                  left: `${target.x}px`,
                  top: `${target.y}px`,
                  width: `${TARGET_SIZE}px`,
                  height: `${TARGET_SIZE}px`,
                }}
              >
                <span className="flex items-center justify-center w-full h-full">
                  <span className="w-2 h-2 rounded-full bg-white/80" />
                </span>
              </button>
            )}
          </div>
        )}

        {phase === "over" && (
          <div className="text-center py-8 mb-6">
            <div className="inline-block bg-zinc-900 border border-zinc-800 rounded-xl px-8 py-6">
              <p className="text-2xl font-bold mb-4">
                {hits >= 25 ? "🎯 神枪手！" : hits >= 15 ? "👍 不错！" : "💪 继续训练！"}
              </p>
              <div className="grid grid-cols-3 gap-6 mb-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">命中数</p>
                  <p className="text-3xl font-bold text-green-400">{hits}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">命中率</p>
                  <p className="text-3xl font-bold text-yellow-400">{accuracy}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">平均反应</p>
                  <p className="text-3xl font-bold text-[#8b5cf6]">{avgReaction}<span className="text-base">ms</span></p>
                </div>
              </div>
              <button
                onClick={startGame}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-6 py-2.5 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳命中数</p>
              <p className="text-xl font-bold">{bestScore ?? "—"}</p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white font-medium"
          >
            <Share2 className="w-5 h-5" />
            分享挑战
          </button>
        </div>

        {shareMsg && (
          <div className="mb-6 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-xl p-3 text-center text-sm text-[#c4b5fd]">
            {shareMsg}
          </div>
        )}

        {/* 排行榜 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-bold text-lg">排行榜</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  entry.name.includes("(你)") ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" : "bg-zinc-800/40"
                }`}
              >
                <span className={`w-7 text-center font-bold ${i === 0 ? "text-yellow-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-500"}`}>
                  {i + 1}
                </span>
                <span className="text-xl">{entry.avatar}</span>
                <span className="flex-1 text-sm truncate">{entry.name}</span>
                <span className="font-mono font-bold text-[#8b5cf6]">{entry.score} <span className="text-xs text-zinc-500">命中</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
