"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Brain, Trophy, Share2, ArrowLeft, Home, RefreshCw, Eye, EyeOff, Check, X } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

const GAME_ID = "number-memory";
const START_LENGTH = 3;
const MAX_LENGTH = 20;
const SHOW_DURATION = 3000; // 3 seconds

type Phase = "ready" | "showing" | "input" | "correct" | "wrong" | "over";

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
  const [scoreAnim, setScoreAnim] = useState(0);
  const [progressPercent, setProgressPercent] = useState(100);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    try {
      const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
      if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);
    } catch {
      /* ignore */
    }
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    if (progressRef.current) { clearInterval(progressRef.current); progressRef.current = null; }
  }, []);

  const startRound = useCallback((len: number) => {
    const num = generateNumber(len);
    setTarget(num);
    setInput("");
    setPhase("showing");

    // Countdown timer (seconds)
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

    // Smooth progress bar animation (updates every 50ms)
    const startTime = Date.now();
    setProgressPercent(100);
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 100 - (elapsed / SHOW_DURATION) * 100);
      setProgressPercent(pct);
      if (pct <= 0 && progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    }, 50);

    timerRef.current = setTimeout(() => {
      setPhase("input");
      setShowCountdown(0);
      setProgressPercent(0);
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
      // Correct
      setPhase("correct");
      setScoreAnim((n) => n + 1);
      if (length >= MAX_LENGTH) {
        setFinalScore(length);
        if (!submitted) {
          submitScore(GAME_ID, length, `记忆 ${length} 位`);
          setBestScore((prev) => (prev === null ? length : Math.max(prev, length)));
          setLeaderboard(getLeaderboard(GAME_ID));
          setSubmitted(true);
        }
        setTimeout(() => setPhase("over"), 1500);
        return;
      }
      // Next round
      setTimeout(() => {
        const nextLen = length + 1;
        setLength(nextLen);
        startRound(nextLen);
      }, 1300);
    } else {
      // Wrong
      setPhase("wrong");
      setTimeout(() => {
        setPhase("over");
        const score = length > START_LENGTH ? length - 1 : 0;
        setFinalScore(score);
        if (!submitted && score > 0) {
          submitScore(GAME_ID, score, `记忆 ${score} 位`);
          setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
          setLeaderboard(getLeaderboard(GAME_ID));
          setScoreAnim((n) => n + 1);
          setSubmitted(true);
        } else if (!submitted) {
          submitScore(GAME_ID, 0, "未通过");
          setSubmitted(true);
        }
      }, 1200);
    }
  }, [phase, input, target, length, submitted, startRound]);

  // Enter key to submit
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
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 flex-wrap">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-5 py-2.5 flex items-center gap-2 min-h-[44px]">
              <span className="text-sm text-zinc-500">当前位数</span>
              <span key={length} className="font-mono text-xl font-bold text-[#c084fc] animate-score-pop">{length}</span>
              <span className="text-sm text-zinc-500">/ {MAX_LENGTH}</span>
            </div>
            {bestScore !== null && (
              <div className="flex items-center gap-2 bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-zinc-500">最佳：</span>
                <span key={scoreAnim} className="text-sm font-bold text-[#c084fc] animate-score-pop">{bestScore}</span>
              </div>
            )}
          </div>
        )}

        {/* 倒计时进度条 */}
        {phase === "showing" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">记忆倒计时</span>
              <span className={`font-mono text-sm font-bold text-[#c084fc] ${showCountdown <= 1 ? "animate-countdown-pulse" : ""}`}>
                {showCountdown}s
              </span>
            </div>
            <div className="h-3 bg-[#18181b] border border-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full progress-shimmer rounded-full"
                style={{
                  width: `${progressPercent}%`,
                  transition: "width 50ms linear",
                }}
              />
            </div>
          </div>
        )}

        {/* 游戏区域 */}
        <div className={`bg-[#18181b] border border-[#27272a] rounded-xl p-8 mb-6 min-h-[240px] flex flex-col items-center justify-center ${
          phase === "wrong" ? "animate-wrong-flash" : ""
        } ${phase === "correct" ? "animate-correct-flash" : ""}`}>
          {phase === "ready" && (
            <div className="text-center">
              <div className="flex justify-center gap-2 mb-6">
                {[3, 7, 1, 9].map((n, i) => (
                  <span
                    key={i}
                    className="text-4xl font-mono font-bold text-[#8b5cf6]/30 animate-float"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  >
                    {n}
                  </span>
                ))}
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-8 py-3.5 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#8b5cf6]/30 active:scale-95 min-h-[44px]"
              >
                开始挑战
              </button>
            </div>
          )}

          {phase === "showing" && (
            <div className="text-center">
              <div className="flex items-center gap-2 text-[#c084fc] mb-6 justify-center">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">记住这串数字</span>
              </div>
              <p key={target} className="font-mono text-4xl sm:text-6xl font-bold tracking-[0.15em] sm:tracking-[0.25em] text-zinc-100 break-all animate-number-reveal">
                {target}
              </p>
            </div>
          )}

          {phase === "input" && (
            <div className="text-center w-full max-w-md">
              <div className="flex items-center gap-2 text-[#c084fc] mb-4 justify-center">
                <EyeOff className="w-5 h-5" />
                <span className="text-sm font-medium">输入你记住的数字（{length} 位）</span>
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
                className="w-full bg-[#09090b] border border-[#27272a] rounded-xl px-4 py-4 text-center font-mono text-3xl font-bold text-zinc-100 focus:border-[#8b5cf6] focus:outline-none focus:ring-2 focus:ring-[#8b5cf6]/30 transition-all min-h-[44px]"
                placeholder="••••••"
              />
              <button
                onClick={handleSubmit}
                className="mt-4 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-8 py-3 text-white font-medium hover:opacity-90 transition-opacity active:scale-95 min-h-[44px]"
              >
                提交
              </button>
            </div>
          )}

          {phase === "correct" && (
            <div className="text-center animate-bounce-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border border-green-500/40 mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-green-400 font-bold text-2xl mb-2">正确！</p>
              <p className="text-zinc-400 text-sm">正确答案：{target}</p>
              <p className="text-[#c084fc] text-sm mt-3 animate-countdown-pulse">进入下一轮...</p>
            </div>
          )}

          {phase === "wrong" && (
            <div className="text-center animate-shake">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 mb-4">
                <X className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 font-bold text-2xl mb-2">答错了</p>
              <p className="text-zinc-400 text-sm">正确答案：<span className="font-mono text-zinc-200">{target}</span></p>
              <p className="text-zinc-400 text-sm">你的输入：<span className="font-mono text-red-400">{input}</span></p>
            </div>
          )}

          {phase === "over" && (
            <div className="text-center animate-bounce-in">
              {finalScore > 0 ? (
                <>
                  <div className="text-5xl mb-3">🧠</div>
                  <p className="text-zinc-300 font-bold text-xl mb-2">挑战结束</p>
                  <p className="text-green-400 text-sm mb-1">你成功记忆了 <span key={scoreAnim} className="font-bold text-2xl text-[#c084fc] animate-score-pop">{finalScore}</span> 位数字</p>
                  <p className="text-zinc-500 text-xs mb-4">正确答案：<span className="font-mono">{target}</span></p>
                </>
              ) : (
                <p className="text-red-400 font-bold text-2xl mb-4">再接再厉！</p>
              )}
              <button
                onClick={startGame}
                className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity active:scale-95 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                再来一次
              </button>
            </div>
          )}
        </div>

        {/* 进度条 - 总体进度 */}
        {phase !== "ready" && phase !== "over" && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">总进度</span>
              <span className="text-xs text-zinc-500 font-mono">{length} / {MAX_LENGTH}</span>
            </div>
            <div className="h-2 bg-[#18181b] border border-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] rounded-full transition-all duration-500"
                style={{ width: `${(length / MAX_LENGTH) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳记忆位数</p>
              <p key={scoreAnim} className="text-xl font-bold animate-score-pop">{bestScore ?? "—"} <span className="text-sm text-zinc-500">位</span></p>
            </div>
          </div>
          <button
            onClick={handleShare}
            className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl p-4 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-white font-medium min-h-[44px]"
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
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="font-bold text-lg">排行榜</h2>
          </div>
          <div className="space-y-2">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  entry.name.includes("(你)") ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" : "bg-[#09090b]/60"
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
