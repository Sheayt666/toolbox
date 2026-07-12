"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Play, Trophy, Calendar, Shuffle, Pause, ChevronLeft, ChevronRight, Check, Undo2 } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "water-sort";
const BEST_KEY = "gm_water_sort_best_level";
const STEPS_KEY = "gm_water_sort_best_steps";
const CAPACITY = 4;
const MAX_LEVEL = 10;

/* ===== Liquid colors ===== */
const LIQUID_COLORS = [
  { bg: "linear-gradient(180deg, #f87171, #dc2626)", solid: "#dc2626", glow: "rgba(220,38,38,0.5)" },
  { bg: "linear-gradient(180deg, #60a5fa, #2563eb)", solid: "#2563eb", glow: "rgba(37,99,235,0.5)" },
  { bg: "linear-gradient(180deg, #4ade80, #16a34a)", solid: "#16a34a", glow: "rgba(22,163,74,0.5)" },
  { bg: "linear-gradient(180deg, #facc15, #ca8a04)", solid: "#ca8a04", glow: "rgba(202,138,4,0.5)" },
  { bg: "linear-gradient(180deg, #c084fc, #9333ea)", solid: "#9333ea", glow: "rgba(147,51,234,0.5)" },
  { bg: "linear-gradient(180deg, #fb923c, #ea580c)", solid: "#ea580c", glow: "rgba(234,88,12,0.5)" },
];

/* ===== Level configs ===== */
const LEVELS = [
  { tubes: 4, colors: 2 },
  { tubes: 5, colors: 2 },
  { tubes: 6, colors: 3 },
  { tubes: 7, colors: 3 },
  { tubes: 8, colors: 4 },
  { tubes: 9, colors: 4 },
  { tubes: 10, colors: 5 },
  { tubes: 11, colors: 5 },
  { tubes: 12, colors: 6 },
  { tubes: 12, colors: 6 },
];

/* ===== Seeded RNG ===== */
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

/* ===== Level generation ===== */
function generateLevel(level: number, rng: () => number = Math.random): number[][] {
  const config = LEVELS[level - 1];
  const { tubes: tubeCount, colors } = config;
  const filledTubes = colors;

  // Create all liquid units (each color fills one tube = CAPACITY units)
  const units: number[] = [];
  for (let c = 0; c < colors; c++) {
    for (let i = 0; i < CAPACITY; i++) units.push(c);
  }

  // Fisher-Yates shuffle
  for (let i = units.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [units[i], units[j]] = [units[j], units[i]];
  }

  // Distribute among filled tubes (bottom = index 0)
  const tubes: number[][] = [];
  for (let t = 0; t < filledTubes; t++) {
    tubes.push(units.slice(t * CAPACITY, (t + 1) * CAPACITY));
  }
  // Add empty tubes
  for (let t = 0; t < tubeCount - filledTubes; t++) {
    tubes.push([]);
  }

  return tubes;
}

/* ===== Game logic ===== */
function pour(tubes: number[][], from: number, to: number): { tubes: number[][]; poured: boolean } {
  if (from === to) return { tubes, poured: false };
  const source = tubes[from];
  const target = tubes[to];
  if (source.length === 0) return { tubes, poured: false };
  const topColor = source[source.length - 1];
  if (target.length > 0 && target[target.length - 1] !== topColor) return { tubes, poured: false };
  if (target.length >= CAPACITY) return { tubes, poured: false };

  const newTubes = tubes.map((t) => [...t]);
  const ns = newTubes[from];
  const nt = newTubes[to];
  while (ns.length > 0 && ns[ns.length - 1] === topColor && nt.length < CAPACITY) {
    nt.push(ns.pop()!);
  }
  return { tubes: newTubes, poured: true };
}

function checkWin(tubes: number[][]): boolean {
  for (const tube of tubes) {
    if (tube.length === 0) continue;
    if (tube.length !== CAPACITY) return false;
    const color = tube[0];
    for (let i = 1; i < tube.length; i++) {
      if (tube[i] !== color) return false;
    }
  }
  return true;
}

/* ===== Component ===== */
export default function WaterSortPage() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "won">("idle");
  const [level, setLevel] = useState(1);
  const [tubes, setTubes] = useState<number[][]>([[]]);
  const [selected, setSelected] = useState<number | null>(null);
  const [steps, setSteps] = useState(0);
  const [bestLevel, setBestLevel] = useState(0);
  const [bestSteps, setBestSteps] = useState<Record<number, number>>({});
  const [refreshKey, setRefreshKey] = useState(0);
  const [dailyMode, setDailyMode] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pouringFrom, setPouringFrom] = useState<number | null>(null);
  const [pouringTo, setPouringTo] = useState<number | null>(null);

  // Refs
  const tubesRef = useRef<number[][]>([[]]);
  const levelRef = useRef(1);
  const stepsRef = useRef(0);
  const selectedRef = useRef<number | null>(null);
  const pausedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const historyRef = useRef<number[][][]>([]);

  /* ===== Mount: load best ===== */
  useEffect(() => {
    setMounted(true);
    try {
      const bl = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (bl > 0) { setBestLevel(bl); }
      const raw = localStorage.getItem(STEPS_KEY);
      if (raw) setBestSteps(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* ===== Cleanup on unmount ===== */
  useEffect(() => {
    return () => { timersRef.current.forEach(clearTimeout); };
  }, []);

  /* ===== Pause hotkey (P) ===== */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "p" || e.key === "P") {
        if (phase === "playing") {
          setPaused((p) => { pausedRef.current = !p; return !p; });
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase]);

  /* ===== Load level ===== */
  const loadLevel = useCallback((lvl: number, daily: boolean) => {
    const rng = daily ? mulberry32(getDailySeed() + lvl) : Math.random;
    const newTubes = generateLevel(lvl, rng);
    tubesRef.current = newTubes;
    levelRef.current = lvl;
    stepsRef.current = 0;
    selectedRef.current = null;
    historyRef.current = [];
    setTubes(newTubes);
    setLevel(lvl);
    setSteps(0);
    setSelected(null);
    setPouringFrom(null);
    setPouringTo(null);
    setPaused(false);
    pausedRef.current = false;
    setPhase("playing");
  }, []);

  /* ===== Start game ===== */
  const start = useCallback((lvl: number) => {
    loadLevel(lvl, dailyMode);
  }, [dailyMode, loadLevel]);

  /* ===== Handle tube click ===== */
  const handleTubeClick = useCallback((idx: number) => {
    if (pausedRef.current) return;
    const sel = selectedRef.current;
    if (sel === null) {
      if (tubesRef.current[idx].length === 0) return;
      selectedRef.current = idx;
      setSelected(idx);
      return;
    }
    if (sel === idx) {
      selectedRef.current = null;
      setSelected(null);
      return;
    }
    // Attempt pour
    const { tubes: newTubes, poured } = pour(tubesRef.current, sel, idx);
    if (poured) {
      historyRef.current.push(tubesRef.current.map((t) => [...t]));
      tubesRef.current = newTubes;
      stepsRef.current += 1;
      setTubes(newTubes);
      setSteps(stepsRef.current);
      setPouringFrom(sel);
      setPouringTo(idx);
      const t = setTimeout(() => { setPouringFrom(null); setPouringTo(null); }, 400);
      timersRef.current.push(t);

      // Check win
      if (checkWin(newTubes)) {
        const t2 = setTimeout(() => {
          setPhase("won");
          const lvl = levelRef.current;
          const s = stepsRef.current;
          void submitScore(GAME_ID, lvl * 1000 + Math.max(0, 500 - s * 10));
          setRefreshKey((k) => k + 1);
          // Save best level
          if (lvl > bestLevel) {
            setBestLevel(lvl);
            try { localStorage.setItem(BEST_KEY, String(lvl)); } catch { /* ignore */ }
          }
          // Save best steps for this level
          const prev = bestSteps[lvl] ?? Infinity;
          if (s < prev) {
            const newBest = { ...bestSteps, [lvl]: s };
            setBestSteps(newBest);
            try { localStorage.setItem(STEPS_KEY, JSON.stringify(newBest)); } catch { /* ignore */ }
          }
        }, 500);
        timersRef.current.push(t2);
      }
    }
    selectedRef.current = null;
    setSelected(null);
  }, [bestLevel, bestSteps]);

  /* ===== Undo ===== */
  const undo = useCallback(() => {
    if (pausedRef.current) return;
    if (historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    tubesRef.current = prev;
    stepsRef.current = Math.max(0, stepsRef.current - 1);
    setTubes(prev);
    setSteps(stepsRef.current);
    selectedRef.current = null;
    setSelected(null);
  }, []);

  /* ===== Reset level ===== */
  const resetLevel = useCallback(() => {
    loadLevel(levelRef.current, dailyMode);
  }, [dailyMode, loadLevel]);

  /* ===== Next level ===== */
  const nextLevel = useCallback(() => {
    const next = Math.min(MAX_LEVEL, levelRef.current + 1);
    loadLevel(next, dailyMode);
  }, [dailyMode, loadLevel]);

  /* ===== Restart to menu ===== */
  const restart = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("idle");
    setSteps(0);
    setSelected(null);
    setPaused(false);
    pausedRef.current = false;
  }, []);

  const stats: GameStat[] = [
    { label: "关卡", value: `${level}/${MAX_LEVEL}`, icon: "🎯" },
    { label: "步数", value: steps, icon: "👣" },
    { label: "最佳步数", value: bestSteps[level] ?? "-", icon: "🏆" },
    { label: "颜色数", value: LEVELS[level - 1]?.colors ?? 0, icon: "🎨" },
  ];

  if (!mounted) {
    return (
      <GameShell gameId={GAME_ID} title="水管排序" iconEmoji="🧪" iconGradient="from-cyan-500 to-blue-600"
        stats={stats} shareScore={0} refreshKey={0}>
        <div className="flex items-center justify-center h-[400px]">
          <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </GameShell>
    );
  }

  const tubeCount = tubes.length;

  return (
    <GameShell gameId={GAME_ID} title="水管排序" iconEmoji="🧪" iconGradient="from-cyan-500 to-blue-600"
      stats={stats} shareScore={level * 1000 + Math.max(0, 500 - steps * 10)} refreshKey={refreshKey}>
      <style>{`
        @keyframes ws-pour { 0% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(-8px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        .ws-pour { animation: ws-pour 0.4s ease-out; }
        @keyframes ws-win { 0% { transform: scale(0.5); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        .ws-win { animation: ws-win 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes ws-liquid-fill { 0% { transform: scaleY(0); } 100% { transform: scaleY(1); } }
        .ws-liquid { transition: height 0.3s ease-out; }
      `}</style>

      <div className="flex flex-col items-center p-4 min-h-[500px]">
        {/* Level indicator */}
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => level > 1 && loadLevel(level - 1, dailyMode)}
            disabled={level <= 1 || phase !== "playing"}
            aria-label="上一关"
            className="flex items-center justify-center h-11 w-11 rounded-lg bg-[#18181b] border border-[#27272a] text-slate-400 hover:text-cyan-400 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <div className="text-xs text-slate-500">关卡</div>
            <div className="text-2xl font-bold text-cyan-400">{level} / {MAX_LEVEL}</div>
          </div>
          <button
            onClick={() => level < MAX_LEVEL && loadLevel(level + 1, dailyMode)}
            disabled={level >= MAX_LEVEL || phase !== "playing"}
            aria-label="下一关"
            className="flex items-center justify-center h-11 w-11 rounded-lg bg-[#18181b] border border-[#27272a] text-slate-400 hover:text-cyan-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tubes grid */}
        <div className="relative flex-1 flex items-center justify-center w-full">
          <div
            className="grid gap-2 sm:gap-3 p-4 rounded-2xl bg-[#0d0d12] border border-[#1e1e24]"
            style={{
              gridTemplateColumns: `repeat(${Math.min(tubeCount, 6)}, 1fr)`,
              maxWidth: tubeCount <= 6 ? "400px" : "520px",
            }}
          >
            {tubes.map((tube, idx) => {
              const isSelected = selected === idx;
              const isPourTarget = pouringTo === idx;
              const isPourSource = pouringFrom === idx;
              const isComplete = tube.length > 0 && tube.length === CAPACITY && tube.every((c) => c === tube[0]);
              return (
                <button
                  key={idx}
                  onClick={() => handleTubeClick(idx)}
                  disabled={phase !== "playing" || paused}
                  aria-label={`试管${idx + 1} ${tube.length > 0 ? `含${tube.length}层液体` : "空"}`}
                  className="relative flex flex-col justify-end items-center rounded-b-xl rounded-t-md overflow-hidden transition-all duration-200"
                  style={{
                    width: "44px",
                    height: "176px",
                    background: isSelected
                      ? "rgba(34,211,238,0.08)"
                      : "rgba(255,255,255,0.03)",
                    border: isSelected
                      ? "2px solid rgba(34,211,238,0.6)"
                      : isComplete
                        ? "2px solid rgba(74,222,128,0.5)"
                        : "2px solid rgba(255,255,255,0.12)",
                    boxShadow: isSelected
                      ? "0 0 16px rgba(34,211,238,0.3)"
                      : isComplete
                        ? "0 0 12px rgba(74,222,128,0.2)"
                        : "none",
                    cursor: phase === "playing" && !paused ? "pointer" : "default",
                  }}
                >
                  {/* Liquid layers (bottom to top) */}
                  <div className="flex flex-col-reverse justify-start w-full" style={{ height: "100%" }}>
                    {tube.map((color, ci) => (
                      <div
                        key={ci}
                        className={`ws-liquid w-full ${isPourSource || isPourTarget ? "ws-pour" : ""}`}
                        style={{
                          height: `${(1 / CAPACITY) * 100}%`,
                          background: LIQUID_COLORS[color].bg,
                          borderTop: ci === tube.length - 1 ? `1px solid ${LIQUID_COLORS[color].solid}` : "none",
                          opacity: isComplete ? 0.85 : 1,
                        }}
                      />
                    ))}
                  </div>
                  {/* Glass shine */}
                  <div className="absolute top-0 left-1 w-1 h-full rounded-l-md bg-white/5 pointer-events-none" />
                  {/* Complete checkmark */}
                  {isComplete && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {/* Tube opening */}
                  <div className="absolute top-0 w-full h-1.5 bg-white/8 rounded-t-md pointer-events-none" />
                </button>
              );
            })}
          </div>

          {/* Idle overlay */}
          {phase === "idle" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-5xl mb-3">🧪</div>
              <h3 className="text-xl font-bold mb-2 text-white">水管排序</h3>
              <p className="text-sm text-slate-400 mb-4 text-center px-4 max-w-[320px]">
                点击试管选择，再点击另一试管倒入顶部同色液体。将每管排成单一颜色即过关！10关递进难度。
              </p>
              <div className="flex gap-2 mb-4">
                <button onClick={() => setDailyMode(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!dailyMode ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Shuffle className="w-3 h-3 inline mr-1" /> 随机模式
                </button>
                <button onClick={() => setDailyMode(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dailyMode ? "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300" : "bg-[#27272a] border border-[#3f3f46] text-slate-400"}`}>
                  <Calendar className="w-3 h-3 inline mr-1" /> 每日挑战
                </button>
              </div>
              {/* Level select */}
              <div className="flex flex-wrap gap-1.5 mb-4 max-w-[360px] justify-center">
                {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((lvl) => {
                  const unlocked = lvl <= bestLevel + 1;
                  return (
                    <button
                      key={lvl}
                      onClick={() => unlocked && start(lvl)}
                      disabled={!unlocked}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                        !unlocked
                          ? "bg-[#18181b] border border-[#27272a] text-slate-700 cursor-not-allowed"
                          : lvl <= bestLevel
                            ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25"
                            : "bg-[#18181b] border border-[#3f3f46] text-slate-300 hover:border-cyan-500/40"
                      }`}
                    >
                      {unlocked ? lvl : "🔒"}
                    </button>
                  );
                })}
              </div>
              <button onClick={() => start(1)} aria-label="从第1关开始"
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95">
                <Play className="w-5 h-5" /> 开始游戏
              </button>
              {bestLevel > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <Trophy className="w-3 h-3 text-amber-400" /> 已通关: <span className="text-amber-400 font-bold">{bestLevel}</span> 关
                </div>
              )}
            </div>
          )}

          {/* Win overlay */}
          {phase === "won" && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center ws-win">
              <div className="text-5xl mb-3">{level >= MAX_LEVEL ? "🎉" : "🎉"}</div>
              <h3 className="text-xl font-bold mb-1 text-white">{level >= MAX_LEVEL ? "全部通关！" : "过关！"}</h3>
              <p className="text-sm text-slate-400 mb-2">第 {level} 关完成</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs w-full max-w-[240px]">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">用时步数</div>
                  <div className="text-lg font-bold text-cyan-400">{steps}</div>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <div className="text-slate-500">最佳步数</div>
                  <div className="text-lg font-bold text-amber-400">{bestSteps[level] ?? steps}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {level < MAX_LEVEL && (
                  <button onClick={nextLevel} aria-label="下一关"
                    className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95">
                    下一关 <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button onClick={resetLevel} aria-label="重玩本关"
                  className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] hover:border-cyan-500/30 rounded-xl transition-all active:scale-95">
                  <RotateCcw className="w-4 h-4" /> 重玩
                </button>
                <button onClick={restart} aria-label="返回菜单"
                  className="inline-flex items-center gap-2 h-11 px-5 text-sm font-medium text-slate-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-xl transition-all active:scale-95">
                  菜单
                </button>
              </div>
            </div>
          )}

          {/* Pause overlay */}
          {phase === "playing" && paused && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Pause className="w-12 h-12 text-cyan-400 mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">已暂停</h3>
              <p className="text-sm text-slate-400 mb-4">按 P 键或点击按钮继续</p>
              <button onClick={() => { pausedRef.current = false; setPaused(false); }} aria-label="继续游戏"
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl transition-all shadow-lg shadow-cyan-500/30 active:scale-95">
                <Play className="w-4 h-4" /> 继续游戏
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        {phase === "playing" && !paused && (
          <div className="mt-4 flex items-center gap-2">
            <button onClick={undo} disabled={historyRef.current.length === 0} aria-label="撤销上一步"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-cyan-400 bg-[#18181b] border border-[#27272a] hover:border-cyan-500/30 rounded-lg transition-colors disabled:opacity-40">
              <Undo2 className="w-3.5 h-3.5" /> 撤销
            </button>
            <button onClick={resetLevel} aria-label="重置本关"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-amber-400 bg-[#18181b] border border-[#27272a] hover:border-amber-500/30 rounded-lg transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> 重置
            </button>
            <button onClick={() => { pausedRef.current = true; setPaused(true); }} aria-label="暂停游戏"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-300 hover:text-cyan-400 bg-[#18181b] border border-[#27272a] hover:border-cyan-500/30 rounded-lg transition-colors">
              <Pause className="w-3.5 h-3.5" /> 暂停
            </button>
            <button onClick={restart} aria-label="返回菜单"
              className="inline-flex items-center gap-2 h-11 px-4 text-xs font-medium text-slate-400 hover:text-red-400 bg-[#18181b] border border-[#27272a] hover:border-red-500/30 rounded-lg transition-colors">
              菜单
            </button>
          </div>
        )}

        {/* Hint */}
        {phase === "playing" && !paused && (
          <div className="mt-2 text-xs text-slate-500 text-center">
            {selected !== null ? `已选择试管 ${selected + 1}，点击目标试管倒入` : "点击一个试管选择，再点击另一试管倒入同色液体"}
          </div>
        )}
      </div>
    </GameShell>
  );
}
