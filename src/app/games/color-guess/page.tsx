"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Palette, Trophy, Share2, ArrowLeft, Home, RefreshCw, Target } from "lucide-react";
import {
  submitScore,
  getLeaderboard,
  createDiss,
  type LeaderboardEntry,
} from "@/lib/gamification";

const GAME_ID = "color-guess";

type GameState = "ready" | "playing" | "transitioning" | "over";

interface LevelData {
  n: number;
  baseColor: { r: number; g: number; b: number };
  diffColor: { r: number; g: number; b: number };
  differentIndex: number;
}

/* ============ 工具函数 ============ */
function randomHSL(): { r: number; g: number; b: number } {
  const h = Math.floor(Math.random() * 360);
  const s = 50 + Math.floor(Math.random() * 30);
  const l = 40 + Math.floor(Math.random() * 25);
  return hslToRgb(h, s, l);
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

function rgbToCss(c: { r: number; g: number; b: number }): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

function generateLevel(level: number): LevelData {
  const n = Math.min(2 + Math.floor((level - 1) / 3), 8);
  const baseColor = randomHSL();
  const diffAmount = Math.max(8, 90 - level * 6);
  const sign = () => (Math.random() < 0.5 ? -1 : 1);
  const diffColor = {
    r: Math.max(0, Math.min(255, baseColor.r + sign() * diffAmount)),
    g: Math.max(0, Math.min(255, baseColor.g + sign() * diffAmount)),
    b: Math.max(0, Math.min(255, baseColor.b + sign() * diffAmount)),
  };
  const total = n * n;
  const differentIndex = Math.floor(Math.random() * total);
  return { n, baseColor, diffColor, differentIndex };
}

/* ============ 组件 ============ */

export default function ColorGuessPage() {
  const [state, setState] = useState<GameState>("ready");
  const [level, setLevel] = useState(1);
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [flashEffect, setFlashEffect] = useState<"none" | "correct" | "wrong">("none");

  useEffect(() => {
    setLeaderboard(getLeaderboard(GAME_ID));
    try {
      const statsRaw = JSON.parse(localStorage.getItem("gm_stats") || "{}");
      if (statsRaw.highScores?.[GAME_ID]) setBestScore(statsRaw.highScores[GAME_ID]);
    } catch {
      /* ignore */
    }
  }, []);

  const startGame = useCallback(() => {
    setState("playing");
    setLevel(1);
    setSubmitted(false);
    setWrongIndex(null);
    setCorrectIndex(null);
    setLevelData(generateLevel(1));
    setFlashEffect("none");
  }, []);

  const handleCellClick = (index: number) => {
    if (state !== "playing" || !levelData) return;
    if (index === levelData.differentIndex) {
      // Correct - flash green, then transition
      setCorrectIndex(index);
      setFlashEffect("correct");
      setState("transitioning");
      window.setTimeout(() => {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setLevelData(generateLevel(nextLevel));
        setCorrectIndex(null);
        setFlashEffect("none");
        setState("playing");
      }, 500);
    } else {
      // Wrong - flash red, shake, then game over
      setWrongIndex(index);
      setFlashEffect("wrong");
      setState("over");
      const score = level;
      if (!submitted) {
        submitScore(GAME_ID, score, `通过 ${score} 关`);
        setBestScore((prev) => (prev === null ? score : Math.max(prev, score)));
        setLeaderboard(getLeaderboard(GAME_ID));
        setScoreAnim((n) => n + 1);
        setSubmitted(true);
      }
    }
  };

  const handleShare = () => {
    const score = bestScore ?? 0;
    const r = createDiss(GAME_ID, score, "排行榜上的各位");
    setShareMsg(r.message);
    setTimeout(() => setShareMsg(null), 4000);
  };

  const cellSize = (n: number) => `${Math.max(36, 300 / n)}px`;

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
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">颜色辨别测试</h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            所有格子颜色相同，其中一格色差不同。点击找出它，答对进入下一关，网格变大、色差变小。答错游戏结束。
          </p>
        </div>

        {/* 分数显示 */}
        {(state === "playing" || state === "transitioning") && (
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6 flex-wrap">
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-5 py-2.5 flex items-center gap-2 min-h-[44px]">
              <Target className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-sm text-zinc-500">第</span>
              <span key={level} className="font-mono text-xl font-bold text-[#c084fc] animate-score-pop">{level}</span>
              <span className="text-sm text-zinc-500">关</span>
            </div>
            <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-5 py-2.5 min-h-[44px]">
              <span className="text-sm text-zinc-500">网格</span>
              <span className="font-mono text-xl font-bold ml-2">{levelData?.n}×{levelData?.n}</span>
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

        {/* 游戏区域 */}
        {state === "ready" && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-6">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-xl animate-float"
                    style={{
                      backgroundColor: rgbToCss(randomHSL()),
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
              <button
                onClick={startGame}
                className="bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-8 py-3.5 text-white font-bold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#8b5cf6]/30 active:scale-95 min-h-[44px]"
              >
                开始游戏
              </button>
            </div>
          </div>
        )}

        {(state === "playing" || state === "transitioning") && levelData && (
          <div
            className={`flex justify-center mb-8 ${flashEffect === "correct" ? "animate-correct-flash" : ""} ${flashEffect === "wrong" ? "animate-wrong-flash" : ""} rounded-xl`}
          >
            <div key={`level-${level}`} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-xl animate-level-in">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${levelData.n}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: levelData.n * levelData.n }).map((_, i) => {
                  const isCorrect = correctIndex === i;
                  const isWrong = wrongIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleCellClick(i)}
                      className={`rounded-lg transition-all hover:scale-105 active:scale-95 ${
                        isCorrect ? "ring-4 ring-green-400 scale-110" : ""
                      } ${isWrong ? "ring-4 ring-red-400 scale-110" : ""}`}
                      style={{
                        backgroundColor: rgbToCss(i === levelData.differentIndex ? levelData.diffColor : levelData.baseColor),
                        width: cellSize(levelData.n),
                        height: cellSize(levelData.n),
                        minWidth: "36px",
                        minHeight: "36px",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {state === "over" && levelData && (
          <div className="text-center py-8 animate-bounce-in">
            {/* Show the correct answer */}
            <div className="flex justify-center mb-6">
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-xl animate-shake">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${levelData.n}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: levelData.n * levelData.n }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-lg ${
                        i === levelData.differentIndex ? "ring-4 ring-green-400" : ""
                      } ${i === wrongIndex ? "ring-4 ring-red-400" : ""}`}
                      style={{
                        backgroundColor: rgbToCss(i === levelData.differentIndex ? levelData.diffColor : levelData.baseColor),
                        width: cellSize(levelData.n),
                        height: cellSize(levelData.n),
                        minWidth: "36px",
                        minHeight: "36px",
                        opacity: i === wrongIndex ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 mb-6">
              <p className="text-red-400 font-bold text-xl mb-1">游戏结束！</p>
              <p className="text-zinc-400 text-sm">你通过了 <span key={scoreAnim} className="font-bold text-[#c084fc] animate-score-pop">{level - 1}</span> 关</p>
              <p className="text-zinc-500 text-xs mt-1">绿色为正确答案</p>
            </div>
            <div>
              <button
                onClick={startGame}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] rounded-xl px-6 py-3 text-white font-medium hover:opacity-90 transition-opacity active:scale-95 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                再来一局
              </button>
            </div>
          </div>
        )}

        {/* 分数 + 分享 */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <div>
              <p className="text-xs text-zinc-500">最佳关卡</p>
              <p key={scoreAnim} className="text-xl font-bold animate-score-pop">{bestScore ?? "—"} <span className="text-sm text-zinc-500">关</span></p>
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
                <span className="font-mono font-bold text-[#8b5cf6]">{entry.score} <span className="text-xs text-zinc-500">关</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
