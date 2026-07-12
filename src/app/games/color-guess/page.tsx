"use client";

import { useState, useEffect, useCallback } from "react";
import { Palette, RefreshCw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

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
  const [submitted, setSubmitted] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);
  const [flashEffect, setFlashEffect] = useState<"none" | "correct" | "wrong">("none");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
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
        setScoreAnim((n) => n + 1);
        setRefreshKey((k) => k + 1);
        setSubmitted(true);
      }
    }
  };

  const stats: GameStat[] = [
    { label: "关卡", value: level },
    { label: "网格", value: levelData ? `${levelData.n}×${levelData.n}` : "—" },
    { label: "最佳", value: bestScore ?? "—" },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="颜色辨别测试"
      description="所有格子颜色相同，其中一格色差不同。点击找出它，答对进入下一关，网格变大、色差变小。答错游戏结束。"
      instructions={`所有格子颜色相同，其中一格色差不同。
点击找出那个颜色不同的格子，答对进入下一关。
每过 3 关网格变大（最大 8×8），同时色差变小，难度递增。
答错则游戏结束，通过的关卡数即为你的分数。`}
      icon={Palette}
      iconEmoji="🌈"
      iconGradient="from-fuchsia-500 to-pink-500"
      stats={stats}
      shareScore={bestScore ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 准备状态 */}
        {state === "ready" && (
          <div className="text-center py-12">
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

        {/* 游戏进行中 */}
        {(state === "playing" || state === "transitioning") && levelData && (
          <div
            className={`flex justify-center mb-4 ${flashEffect === "correct" ? "animate-correct-flash" : ""} ${flashEffect === "wrong" ? "animate-wrong-flash" : ""} rounded-xl overflow-x-auto max-w-full`}
          >
            <div key={`level-${level}`} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-xl animate-level-in">
              <div
                className="grid gap-1.5 sm:gap-2.5 lg:gap-3"
                style={{ gridTemplateColumns: `repeat(${levelData.n}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: levelData.n * levelData.n }).map((_, i) => {
                  const isCorrect = correctIndex === i;
                  const isWrong = wrongIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleCellClick(i)}
                      className={`w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg transition-all hover:scale-105 active:scale-95 ${
                        isCorrect ? "ring-4 ring-green-400 scale-110" : ""
                      } ${isWrong ? "ring-4 ring-red-400 scale-110" : ""}`}
                      style={{
                        backgroundColor: rgbToCss(i === levelData.differentIndex ? levelData.diffColor : levelData.baseColor),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 游戏结束 */}
        {state === "over" && levelData && (
          <div className="text-center py-4 animate-bounce-in">
            {/* Show the correct answer */}
            <div className="flex justify-center mb-4 overflow-x-auto max-w-full">
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 shadow-xl animate-shake">
                <div
                  className="grid gap-1.5 sm:gap-2.5 lg:gap-3"
                  style={{ gridTemplateColumns: `repeat(${levelData.n}, minmax(0, 1fr))` }}
                >
                  {Array.from({ length: levelData.n * levelData.n }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-14 h-14 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg ${
                        i === levelData.differentIndex ? "ring-4 ring-green-400" : ""
                      } ${i === wrongIndex ? "ring-4 ring-red-400" : ""}`}
                      style={{
                        backgroundColor: rgbToCss(i === levelData.differentIndex ? levelData.diffColor : levelData.baseColor),
                        opacity: i === wrongIndex ? 0.5 : 1,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="inline-block bg-red-500/10 border border-red-500/30 rounded-xl px-6 py-4 mb-4">
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
      </div>
    </GameShell>
  );
}
