"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkles, RotateCcw, Play, Trophy, Flame, Calendar, Shuffle } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "meme-tap";
const BEST_KEY = "gm_meme_tap_best";
const GAME_DURATION = 30; // seconds
const GRID_COLS = 4;
const GRID_ROWS = 3;
const CELL_COUNT = GRID_COLS * GRID_ROWS;

/* ===== Meme type definitions ===== */
interface MemeType {
  emoji: string;
  points: number;
  weight: number;
  label: string;
  ringColor: string;
  glowColor: string;
}

const MEME_TYPES: MemeType[] = [
  { emoji: "😭", points: 1, weight: 28, label: "哭泣", ringColor: "border-blue-400/50", glowColor: "shadow-blue-500/30" },
  { emoji: "💀", points: 1, weight: 28, label: "骷髅", ringColor: "border-slate-400/50", glowColor: "shadow-slate-500/30" },
  { emoji: "😂", points: 1, weight: 24, label: "笑哭", ringColor: "border-yellow-400/50", glowColor: "shadow-yellow-500/30" },
  { emoji: "🤡", points: 3, weight: 14, label: "小丑", ringColor: "border-red-400/50", glowColor: "shadow-red-500/30" },
  { emoji: "🥵", points: 3, weight: 12, label: "热脸", ringColor: "border-orange-400/50", glowColor: "shadow-orange-500/30" },
  { emoji: "🫠", points: 5, weight: 8, label: "融化", ringColor: "border-cyan-400/50", glowColor: "shadow-cyan-500/30" },
  { emoji: "🗿", points: 5, weight: 6, label: "石像", ringColor: "border-stone-400/50", glowColor: "shadow-stone-500/30" },
  { emoji: "🦄", points: 10, weight: 3, label: "独角兽", ringColor: "border-pink-400/60", glowColor: "shadow-pink-500/40" },
  { emoji: "👽", points: 10, weight: 2, label: "外星人", ringColor: "border-green-400/60", glowColor: "shadow-green-500/40" },
];

const TOTAL_WEIGHT = MEME_TYPES.reduce((s, m) => s + m.weight, 0);

function pickMemeType(rng: () => number): number {
  let r = rng() * TOTAL_WEIGHT;
  for (let i = 0; i < MEME_TYPES.length; i++) {
    r -= MEME_TYPES[i].weight;
    if (r <= 0) return i;
  }
  return 0;
}

/* ===== Seeded RNG (mulberry32) for daily challenge ===== */
function mulberry32(seed: number): () => number {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getDailySeed(): number {
  const today = new Date().toISOString().slice(0, 10);
  return parseInt(today.replace(/-/g, ""), 10);
}

/* ===== Types ===== */
interface CellData {
  id: number;
  type: number;
  spawnTime: number;
  lifetime: number;
}

interface FloatScore {
  id: number;
  value: number;
  cellIndex: number;
  color: string;
}

interface GameResult {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ===== Component ===== */
export default function MemeTapPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "over">("idle");
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [cells, setCells] = useState<(CellData | null)[]>(Array(CELL_COUNT).fill(null));
  const [bestScore, setBestScore] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [dailyMode, setDailyMode] = useState(false);
  const [floats, setFloats] = useState<FloatScore[]>([]);

  // Refs
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const cellsRef = useRef<(CellData | null)[]>(Array(CELL_COUNT).fill(null));
  const timeLeftRef = useRef(GAME_DURATION);
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const memeIdRef = useRef(0);
  const floatIdRef = useRef(0);
  const spawnAccRef = useRef(0);
  const dailyRngRef = useRef<(() => number) | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  /* ===== Mount: load best score ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const b = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (b > 0) {
        bestRef.current = b;
        setBestScore(b);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ===== Game loop ===== */
  useEffect(() => {
    if (phase !== "playing") return;

    const tick = () => {
      // Decrement timer
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 0.1);
      setTimeLeft(timeLeftRef.current);

      if (timeLeftRef.current <= 0) {
        doGameOver();
        return;
      }

      const now = Date.now();
      let changed = false;

      // Check expired memes (misses)
      for (let i = 0; i < CELL_COUNT; i++) {
        const cell = cellsRef.current[i];
        if (cell && now - cell.spawnTime > cell.lifetime) {
          cellsRef.current[i] = null;
          changed = true;
          missesRef.current++;
          setMisses(missesRef.current);
          if (comboRef.current > 0) {
            comboRef.current = 0;
            setCombo(0);
          }
        }
      }

      // Spawn new memes
      spawnAccRef.current += 100;
      const elapsed = (GAME_DURATION - timeLeftRef.current) * 1000;
      const spawnInterval = Math.max(350, 800 - elapsed * 0.012);
      const currentLifetime = Math.max(900, 1800 - elapsed * 0.02);

      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current = 0;
        const rng = dailyRngRef.current || Math.random;
        const cellIdx = Math.floor(rng() * CELL_COUNT);
        if (!cellsRef.current[cellIdx]) {
          const typeIdx = pickMemeType(rng);
          cellsRef.current[cellIdx] = {
            id: memeIdRef.current++,
            type: typeIdx,
            spawnTime: now,
            lifetime: currentLifetime,
          };
          changed = true;
        }
      }

      if (changed) {
        setCells([...cellsRef.current]);
      }
    };

    tickRef.current = setInterval(tick, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ===== Game over ===== */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    if (tickRef.current) clearInterval(tickRef.current);
    setPhase("over");

    if (!submittedRef.current) {
      submittedRef.current = true;
      const s = Math.floor(scoreRef.current);
      const r = submitScore(GAME_ID, s, `${hitsRef.current}命中 ${maxComboRef.current}连击`);
      setResult(r);
      setRefreshKey((k) => k + 1);
      if (s > bestRef.current) {
        bestRef.current = s;
        setBestScore(s);
        try {
          localStorage.setItem(BEST_KEY, String(s));
        } catch {
          /* ignore */
        }
      }
    }
  }, []);

  /* ===== Start game ===== */
  const start = useCallback(() => {
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    cellsRef.current = Array(CELL_COUNT).fill(null);
    timeLeftRef.current = GAME_DURATION;
    spawnAccRef.current = 0;
    overRef.current = false;
    runningRef.current = true;
    submittedRef.current = false;

    if (dailyMode) {
      dailyRngRef.current = mulberry32(getDailySeed());
    } else {
      dailyRngRef.current = null;
    }

    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setCells(Array(CELL_COUNT).fill(null));
    setResult(null);
    setFloats([]);
    setPhase("playing");
  }, [dailyMode]);

  /* ===== Click cell ===== */
  const clickCell = useCallback(
    (index: number) => {
      if (!runningRef.current || overRef.current) return;
      const cell = cellsRef.current[index];
      if (!cell) return;

      const memeType = MEME_TYPES[cell.type];
      const multiplier = Math.min(1 + comboRef.current * 0.1, 5);
      const points = Math.floor(memeType.points * multiplier);

      scoreRef.current += points;
      comboRef.current += 1;
      hitsRef.current += 1;
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current;
      }

      setScore(scoreRef.current);
      setCombo(comboRef.current);
      setMaxCombo(maxComboRef.current);
      setHits(hitsRef.current);

      // Floating score
      const fid = floatIdRef.current++;
      setFloats((prev) => [
        ...prev,
        { id: fid, value: points, cellIndex: index, color: memeType.ringColor },
      ]);
      setTimeout(() => {
        setFloats((prev) => prev.filter((f) => f.id !== fid));
      }, 800);

      // Clear cell
      cellsRef.current[index] = null;
      setCells([...cellsRef.current]);
    },
    [],
  );

  /* ===== Restart ===== */
  const restart = useCallback(() => {
    setPhase("idle");
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    scoreRef.current = 0;
    comboRef.current = 0;
    cellsRef.current = Array(CELL_COUNT).fill(null);
    setScore(0);
    setCombo(0);
    setHits(0);
    setMisses(0);
    setTimeLeft(GAME_DURATION);
    setCells(Array(CELL_COUNT).fill(null));
    setResult(null);
    setFloats([]);
  }, []);

  const timePercent = (timeLeft / GAME_DURATION) * 100;
  const multiplier = Math.min(1 + combo * 0.1, 5);

  const stats: GameStat[] = [
    { label: "分数", value: score },
    { label: "连击", value: combo },
    { label: "命中", value: hits },
    { label: "剩余", value: `${Math.ceil(timeLeft)}s` },
  ];

  /* ===== Loading state ===== */
  if (!mounted) {
    return (
      <GameShell
        gameId={GAME_ID}
        title="梗图快打"
        description="热梗角色随机弹出，快速点击得分！连击越高倍率越大，30秒挑战极限反应。"
        instructions="梗图角色会在网格中随机弹出，点击它们得分。不同梗图分值不同，越稀有分越高。连续命中积累连击，连击越高得分倍率越大。漏掉梗图会重置连击。30秒倒计时，挑战最高分！"
        icon={Sparkles}
        iconEmoji="🫧"
        iconGradient="from-fuchsia-400 to-pink-500"
        stats={stats}
        shareScore={0}
        refreshKey={0}
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell
      gameId={GAME_ID}
      title="梗图快打"
      description="热梗角色随机弹出，快速点击得分！连击越高倍率越大，30秒挑战极限反应。"
      instructions={`梗图角色会在 4×3 网格中随机弹出，点击它们得分。
不同梗图分值不同：
  😭💀😂 = 1分（常见）  🤡🥵 = 3分  🫠🗿 = 5分  🦄👽 = 10分（稀有）
连续命中积累连击，连击越高得分倍率越大（最高5倍）。
漏掉梗图（未点击就消失）会重置连击为0。
30秒倒计时，挑战最高分！
每日挑战模式：所有玩家面对相同的梗图序列，公平PK。`}
      icon={Sparkles}
      iconEmoji="🫧"
      iconGradient="from-fuchsia-400 to-pink-500"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes meme-pop-in {
          0% { opacity: 0; transform: scale(0.3) rotate(-15deg); }
          60% { opacity: 1; transform: scale(1.15) rotate(5deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .meme-pop-in { animation: meme-pop-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes meme-tap-out {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
        .meme-tap-out { animation: meme-tap-out 0.3s ease-out forwards; }
        @keyframes meme-fade-out {
          0% { opacity: 0.7; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.8); }
        }
        .meme-fade-out { animation: meme-fade-out 0.3s ease-out forwards; }
        @keyframes float-score {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.4); }
        }
        .float-score-anim { animation: float-score 0.8s ease-out forwards; }
        @keyframes combo-bounce {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .combo-bounce { animation: combo-bounce 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 0 0 rgba(217, 70, 239, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(217, 70, 239, 0); }
        }
        .pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
      `}</style>

      <div className="flex flex-col items-center max-w-[520px] mx-auto">
        {/* Timer bar */}
        <div className="w-full h-2.5 bg-[#27272a] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${timePercent}%`,
              background:
                timePercent > 33
                  ? "linear-gradient(90deg, #d946ef, #ec4899)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(217, 70, 239, 0.4)",
            }}
          />
        </div>

        {/* Score & Combo display */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="text-left">
            <div className="text-xs text-slate-500">分数</div>
            <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">{score}</div>
          </div>
          <div className="text-center">
            {combo >= 2 && (
              <div key={combo} className="combo-bounce">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30">
                  <Flame className="w-4 h-4 text-fuchsia-400" />
                  <span className="text-lg font-bold text-fuchsia-300">{combo}</span>
                  <span className="text-xs text-fuchsia-400/70">连击</span>
                </div>
                <div className="text-xs text-fuchsia-400/50 mt-0.5">{multiplier.toFixed(1)}x 倍率</div>
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">最佳</div>
            <div className="text-lg font-bold text-amber-400 tabular-nums">{bestScore}</div>
          </div>
        </div>

        {/* Game grid */}
        <div className="relative w-full">
          <div
            className="grid gap-2 sm:gap-3"
            style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
          >
            {cells.map((cell, i) => (
              <button
                key={i}
                onClick={() => clickCell(i)}
                disabled={phase !== "playing"}
                className={`relative aspect-square rounded-xl border-2 flex items-center justify-center transition-all duration-150 ${
                  phase !== "playing"
                    ? "border-[#27272a] bg-[#18181b]"
                    : cell
                      ? `border-2 ${MEME_TYPES[cell.type].ringColor} bg-[#1c1c1f] ${MEME_TYPES[cell.type].glowColor} shadow-lg hover:scale-105 active:scale-95 cursor-pointer meme-pop-in`
                      : "border-[#27272a] bg-[#18181b]/50 hover:bg-[#1c1c1f] cursor-default"
                }`}
              >
                {cell && (
                  <span className="text-3xl sm:text-4xl lg:text-5xl select-none">
                    {MEME_TYPES[cell.type].emoji}
                  </span>
                )}
                {/* Floating score */}
                {floats
                  .filter((f) => f.cellIndex === i)
                  .map((f) => (
                    <span
                      key={f.id}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none float-score-anim text-lg font-bold text-fuchsia-300"
                    >
                      +{f.value}
                    </span>
                  ))}
              </button>
            ))}
          </div>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <div className="text-5xl mb-4">🫧</div>
              <h3 className="text-xl font-bold mb-2 text-white">梗图快打</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4">
                30秒内点击弹出的梗图角色得分
              </p>

              {/* Mode toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    !dailyMode
                      ? "bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Shuffle className="w-3 h-3 inline mr-1" /> 随机模式
                </button>
                <button
                  onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dailyMode
                      ? "bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300"
                      : "bg-[#27272a] border border-[#3f3f46] text-slate-400"
                  }`}
                >
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战
                </button>
              </div>

              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-fuchsia-500/30 active:scale-95"
              >
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestScore > 0 && (
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  最佳: <span className="text-amber-400 font-bold">{bestScore}</span>
                </div>
              )}
            </div>
          )}

          {/* Game over overlay */}
          {phase === "over" && result && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in">
              <div className="text-5xl mb-3">{score >= bestScore && score > 0 ? "🏆" : "🫧"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">
                {score >= bestScore && score > 0 ? "新纪录！" : "游戏结束"}
              </h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-fuchsia-400 mb-3">{score}</p>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs w-full max-w-[280px]">
                <div className="bg-[#27272a]/60 rounded-lg px-2 py-2">
                  <div className="text-slate-500">命中</div>
                  <div className="text-lg font-bold text-emerald-400">{hits}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-2 py-2">
                  <div className="text-slate-500">漏掉</div>
                  <div className="text-lg font-bold text-red-400">{misses}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-2 py-2">
                  <div className="text-slate-500">最高连击</div>
                  <div className="text-lg font-bold text-amber-400">{maxCombo}</div>
                </div>
              </div>
              {result && (
                <p className="text-xs text-slate-400 mb-3 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="fuchsia-400 font-bold text-fuchsia-400">{result.rank}</span>/
                  {result.total}，超越了 <span className="font-bold text-fuchsia-400">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 rounded-xl transition-all shadow-lg shadow-fuchsia-500/30 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一局
              </button>
            </div>
          )}
        </div>

        {/* Meme legend */}
        {phase === "playing" && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
            {MEME_TYPES.filter((m, i) => i < 9).map((m, i) => (
              <div
                key={i}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#18181b] border ${m.ringColor}`}
              >
                <span className="text-base">{m.emoji}</span>
                <span className="text-slate-400">{m.points}pt</span>
              </div>
            ))}
          </div>
        )}

        {/* Restart button during play */}
        {phase === "playing" && (
          <button
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> 放弃
          </button>
        )}
      </div>
    </GameShell>
  );
}
