"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Brain, Trophy, Share2, ArrowLeft, Home, RefreshCw, Eye, EyeOff } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

const GAME_ID = "number-memory";
const START_LENGTH = 3;
const MAX_LENGTH = 20;
const SHOW_DURATION = 3000; // 3 秒

type Phase = "ready" | "showing" | "input" | "correct" | "over";

function generateNumber(length: number): string {
  let s = "";
  for (let i = 0; i < length; i++) {
    s += Math.floor(Math.random() * 10).toString();
  }
  return s;
}

/* ============ 组件 ============ */

export default function NumberMemoryPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [length, setLength] = useState(START_LENGTH);
  const [target, setTarget] = useState("");
  const [input, setInput] = useState("");
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
    if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  }, []);

  const startRound = useCallback((len: number) => {
    const num = generateNumber(len);
    setTarget(num);
    setInput("");
    setPhase("showing");
    // 倒计时显示
    let remaining = Math.ceil(SHOW_DURATION / 1000);
    setShowCountdown(remaining);
    countdownRef.current = setInterval(() => {
      remaining--;
      setShowCountdown(remaining);
      if (remaining <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }, 1000);
    timerRef.current = setTimeout(() => {
      setPhase("input");
      setShowCountdown(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }, SHOW_DURATION);
  }, []);

  const startGame = useCallback(() => {
    clearTimers();
    setLength(START_LENGTH);
    setSubmitted(false);
    startRound(START_LENGTH);
  }, [clearTimers, startRound]);

  const handleSubmit = useCallback(() => {
    if (phase !== "input") return;
    if (input === target) {
      // 答对
      setPhase("correct");
      if (length >= MAX_LENGTH) {
        // 达到上限，游戏结束（满分）
        setFinalScore(length);
        if (!submitted) {
          submitScore(GAME_ID, length, `记忆 ${length} 位`);
          setBestScore((prev) => (prev === null ? length : Math.max(prev, length)));
          setLeaderboard(getLeaderboard(GAME_ID));
          setSubmitted(true);
        }
        setPhase("over");
        return;
      }
      // 下一轮
      setTimeout(() => {
        const nextLen = length + 1;
        setLength(nextLen);
        startRound(nextLen);
      }, 1200);
    } else {
      // 答错
      setPhase("over");
      // 分数 = 上一次成功记忆的位数；若第一轮就失败则为 0
      const score = length > START_LENGTH ? length - 1 : 0;
      setFinalScore(score);
      if (!submitted && score > 0) {
        submitScore(GAME_ID, score, `记忆 ${score} 位`);
        setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
        setLeaderboard(getLeaderboard(GAME_ID));
        setSubmitted(true);
      } else if (!submitted) {
        submitScore(GAME_ID, 0, "未通过");
        setSubmitted(true);
      }
    }
  }, [phase, input, target, length, submitted, startRound]);

  // 回车提交
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && phase === "input") {
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleSubmit]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handleShare = () => {
    const score = bestScore ?? 0;
    const r = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(r.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
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
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">数字记忆挑战</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            屏幕显示一串数字 3 秒后隐藏，请输入你记住的数字。答对则位数 +1，答错游戏结束。从 3 位开始，最高 20 位。
          </p>
        </div>

        {/* 关卡显示 */}
        {phase !== "ready" && (
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-2 flex items-center gap-2">
              <span className="text-sm text-zinc-500">当前位数</span>
              <span className="font-mono text-xl font-bold text-[#8b5cf6]">{length}</span>
              <span className="text-sm text-zinc-500">/ {MAX_LENGTH}</span>
            </div>
          </div>
        )}

        {/* 游戏区域 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6 min-h-[200px] flex flex-col items-center justify-center">
          {phase === "ready" && (
            <button
              onClick={startGame}
              className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-8 py-3 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#8b5cf6]/30"
            >
              开始挑战
            </button>
          )}

          {phase === "showing" && (
            <div className="text-center">
              <div className="flex items-center gap-2 text-[#8b5cf6] mb-4">
                <Eye className="w-5 h-5" />
                <span className="text-sm">记住这串数字</span>
                {showCountdown > 0 && (
                  <span className="font-mono text-sm text-zinc-500">({showCountdown}s)</span>
                )}
              </div>
              <p className="font-mono text-4xl sm:text-5xl font-bold tracking-[0.2em] text-zinc-100 break-all">
                {target}
              </p>
            </div>
          )}

          {phase === "input" && (
            <div className="text-center w-full max-w-md">
              <div className="flex items-center gap-2 text-[#8b5cf6] mb-4 justify-center">
                <EyeOff className="w-5 h-5" />
                <span className="text-sm">输入你记住的数字（{length} 位）</span>
              </div>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={input}
                onChange={(e) => setInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                maxLength={length}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-center font-mono text-2xl font-bold text-zinc-100 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30"
                placeholder="••••••"
              />
              <button
                onClick={handleSubmit}
                className="mt-4 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity"
              >
                提交
              </button>
            </div>
          )}

          {phase === "correct" && (
            <div className="text-center">
              <p className="text-green-400 font-bold text-2xl mb-2">✓ 正确！</p>
              <p className="text-zinc-400 text-sm">正确答案：{target}</p>
              <p className="text-[#8b5cf6] text-sm mt-2">进入下一轮...</p>
            </div>
          )}

          {phase === "over" && (
            <div className="text-center">
              {finalScore > 0 ? (
                <>
                  <p className="text-red-400 font-bold text-2xl mb-2">✗ 答错了</p>
                  <p className="text-zinc-400 text-sm mb-1">正确答案：<span className="font-mono text-zinc-200">{target}</span></p>
                  <p className="text-zinc-400 text-sm">你的输入：<span className="font-mono text-red-400">{input}</span></p>
                  <p className="text-green-400 text-sm mt-3">你成功记忆了 {finalScore} 位数字</p>
                </>
              ) : (
                <p className="text-red-400 font-bold text-2xl mb-2">再接再厉！</p>
              )}
              <button
                onClick={startGame}
                className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-6 py-2 text-white font-medium hover:opacity-90 transition-opacity"
              >
                <RefreshCw className="w-4 h-4" />
                再来一次
              </button>
            </div>
          )}
        </div>

        {/* 进度条 */}
        {phase !== "ready" && phase !== "over" && (
          <div className="mb-6">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-full transition-all duration-500"
                style={{ width: `${(length / MAX_LENGTH) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳记忆位数</p>
              <p className="text-xl font-bold">{bestScore ?? "—"} <span className="text-sm text-zinc-500">位</span></p>
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
                <span className="font-mono font-bold text-[#8b5cf6]">{entry.score} <span className="text-xs text-zinc-500">位</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
