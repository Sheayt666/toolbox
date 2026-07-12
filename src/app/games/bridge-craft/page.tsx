"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore, recordGamePlay } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "bridge-craft";
const BEST_KEY = "gm_bridge_craft_best";
const GAME_W = 400;
const GAME_H = 500;
const PLATFORM_Y = 340;
const PLATFORM_H = 160;
const MAX_LEVEL = 10;
const BRIDGE_SPEED = 2.8;
const MAX_BRIDGE = 360;
const BRIDGE_W = 6;
const CHAR_W = 22;
const CHAR_H = 32;
const BRIDGE_FALL_MS = 500;
const WALK_MS = 600;
const FALL_MS = 500;

interface LevelData {
  p1w: number;
  p2x: number;
  p2w: number;
  gap: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

type Phase = "idle" | "building" | "falling" | "walking" | "falling-off" | "gameover";

function genLevel(level: number): LevelData {
  const p1w = 55 + Math.random() * 30;
  const minGap = 55 + level * 9;
  const maxGap = 85 + level * 13;
  const gap = minGap + Math.random() * (maxGap - minGap);
  const p2w = Math.max(32, 70 - level * 3 + Math.random() * 12);
  const p2x = p1w + gap;
  return { p1w, p2x, p2w, gap };
}

function genStars(): { x: number; y: number; r: number; tw: number }[] {
  const stars: { x: number; y: number; r: number; tw: number }[] = [];
  for (let i = 0; i < 30; i++) {
    stars.push({
      x: Math.random() * GAME_W,
      y: Math.random() * PLATFORM_Y,
      r: 0.5 + Math.random() * 1.5,
      tw: Math.random() * Math.PI * 2,
    });
  }
  return stars;
}

/* ============ 组件 ============ */
export default function BridgeCraftPage() {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef = useRef(0);
  const buildingRef = useRef(false);
  const pausedRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const bridgeHeightRef = useRef(0);
  const starsRef = useRef<{ x: number; y: number; r: number; tw: number }[]>([]);
  const animRef = useRef(0);
  // 用于避免stale closure的函数refs
  const doReleaseRef = useRef<() => void>(() => {});
  const checkResultRef = useRef<() => void>(() => {});
  const handleSuccessRef = useRef<() => void>(() => {});
  const doGameOverRef = useRef<() => void>(() => {});

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(1);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [levelData, setLevelData] = useState<LevelData>({ p1w: 70, p2x: 180, p2w: 60, gap: 110 });
  const [bridgeHeight, setBridgeHeight] = useState(0);
  const [bridgeRotation, setBridgeRotation] = useState(0);
  const [bridgeTransition, setBridgeTransition] = useState(false);
  const [charX, setCharX] = useState(48);
  const [charFalling, setCharFalling] = useState(false);
  const [showPerfect, setShowPerfect] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [paused, setPaused] = useState(false);

  const setPhaseSafe = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  useEffect(() => {
    setMounted(true);
    starsRef.current = genStars();
    try {
      const saved = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;
      if (saved > 0) setBest(saved);
    } catch {
      /* ignore */
    }
    return () => {
      timersRef.current.forEach(clearTimeout);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  /* ----- 背景动画 ----- */
  useEffect(() => {
    let raf: number;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      animRef.current++;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* ----- 建桥循环 ----- */
  const buildLoop = useCallback(() => {
    if (!buildingRef.current || pausedRef.current) return;
    const nh = Math.min(bridgeHeightRef.current + BRIDGE_SPEED, MAX_BRIDGE);
    bridgeHeightRef.current = nh;
    setBridgeHeight(nh);
    if (nh >= MAX_BRIDGE) {
      doReleaseRef.current();
      return;
    }
    rafRef.current = requestAnimationFrame(buildLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- 开始建桥 ----- */
  const startBuilding = useCallback(() => {
    if (phaseRef.current !== "idle" || pausedRef.current) return;
    buildingRef.current = true;
    bridgeHeightRef.current = 0;
    setBridgeHeight(0);
    setBridgeRotation(0);
    setBridgeTransition(false);
    setPhaseSafe("building");
    rafRef.current = requestAnimationFrame(buildLoop);
  }, [buildLoop, setPhaseSafe]);

  /* ----- 释放桥梁 ----- */
  const doRelease = useCallback(() => {
    if (phaseRef.current !== "building") return;
    buildingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    setPhaseSafe("falling");
    setBridgeTransition(true);
    setBridgeRotation(90);
    const timer = setTimeout(() => {
      checkResultRef.current();
    }, BRIDGE_FALL_MS);
    timersRef.current.push(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPhaseSafe]);

  /* ----- 检查结果 ----- */
  const checkResult = useCallback(() => {
    const len = bridgeHeightRef.current;
    const p1Right = levelData.p1w;
    const p2Left = levelData.p2x;
    const p2Right = levelData.p2x + levelData.p2w;
    const bridgeEnd = p1Right + len;

    const perfectMin = p2Left + levelData.p2w * 0.3;
    const perfectMax = p2Left + levelData.p2w * 0.7;
    const isPerfect = bridgeEnd >= perfectMin && bridgeEnd <= perfectMax;

    if (bridgeEnd >= p2Left && bridgeEnd <= p2Right) {
      // 成功
      setPhaseSafe("walking");
      const targetX = levelData.p2x + levelData.p2w / 2 - CHAR_W / 2;
      setCharX(targetX);
      if (isPerfect) {
        setShowPerfect(true);
        const t = setTimeout(() => setShowPerfect(false), 1000);
        timersRef.current.push(t);
      }
      const baseScore = 10;
      const comboBonus = combo * 5;
      const perfectBonus = isPerfect ? 15 : 0;
      const levelBonus = level * 5;
      const gained = baseScore + comboBonus + perfectBonus + levelBonus;
      setScore(s => s + gained);
      setCombo(c => c + 1);
      const timer = setTimeout(() => {
        handleSuccessRef.current();
      }, WALK_MS);
      timersRef.current.push(timer);
    } else {
      // 失败 - 走到桥尽头
      setPhaseSafe("walking");
      const targetX = Math.max(p1Right - CHAR_W, bridgeEnd - CHAR_W / 2);
      setCharX(targetX);
      const timer = setTimeout(() => {
        setPhaseSafe("falling-off");
        setCharFalling(true);
        const t2 = setTimeout(() => {
          doGameOverRef.current();
        }, FALL_MS);
        timersRef.current.push(t2);
      }, WALK_MS);
      timersRef.current.push(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData, combo, level, setPhaseSafe]);

  /* ----- 成功后进入下一关 ----- */
  const handleSuccess = useCallback(() => {
    if (level >= MAX_LEVEL) {
      doGameOverRef.current();
      return;
    }
    const nextLevel = level + 1;
    setLevel(nextLevel);
    const nd = genLevel(nextLevel);
    setLevelData(nd);
    setCharX(nd.p1w - CHAR_W);
    setCharFalling(false);
    setBridgeHeight(0);
    setBridgeRotation(0);
    setBridgeTransition(false);
    bridgeHeightRef.current = 0;
    setPhaseSafe("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, setPhaseSafe]);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    setPhaseSafe("gameover");
    buildingRef.current = false;
    cancelAnimationFrame(rafRef.current);
    const r = submitScore(GAME_ID, score, `第${level}关 连击${combo}`);
    setResult(r);
    setRefreshKey(k => k + 1);
    if (score > best) {
      setBest(score);
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        /* ignore */
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score, level, combo, best, setPhaseSafe]);

  // 更新函数refs，避免stale closure
  doReleaseRef.current = doRelease;
  checkResultRef.current = checkResult;
  handleSuccessRef.current = handleSuccess;
  doGameOverRef.current = doGameOver;

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    const d = genLevel(1);
    setLevelData(d);
    setLevel(1);
    setCombo(0);
    setScore(0);
    setCharX(d.p1w - CHAR_W);
    setCharFalling(false);
    setBridgeHeight(0);
    setBridgeRotation(0);
    setBridgeTransition(false);
    bridgeHeightRef.current = 0;
    setResult(null);
    setShowPerfect(false);
    pausedRef.current = false;
    setPaused(false);
    setPhaseSafe("idle");
    recordGamePlay(GAME_ID, 0);
  }, [setPhaseSafe]);

  /* ----- 暂停 ----- */
  const togglePause = useCallback(() => {
    if (phaseRef.current !== "building" && phaseRef.current !== "idle") return;
    setPaused(p => {
      const np = !p;
      pausedRef.current = np;
      if (!np && phaseRef.current === "building" && buildingRef.current) {
        rafRef.current = requestAnimationFrame(buildLoop);
      } else if (np) {
        cancelAnimationFrame(rafRef.current);
      }
      return np;
    });
  }, [buildLoop]);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        if (phaseRef.current === "idle" && !pausedRef.current) {
          startBuilding();
        }
      } else if (k === "p") {
        e.preventDefault();
        togglePause();
      } else if (k === "enter") {
        e.preventDefault();
        if (phaseRef.current === "gameover" || (phaseRef.current === "idle" && level === 1 && score === 0)) {
          start();
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === " " || k === "spacebar") {
        e.preventDefault();
        if (phaseRef.current === "building" && !pausedRef.current) {
          doRelease();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [startBuilding, doRelease, togglePause, start]);

  /* ----- 触摸/鼠标控制 ----- */
  const onPressStart = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (phaseRef.current === "idle" && !pausedRef.current) {
      startBuilding();
    }
  };
  const onPressEnd = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (phaseRef.current === "building" && !pausedRef.current) {
      doRelease();
    }
  };

  const stats: GameStat[] = [
    { label: "关卡", value: `${level}/${MAX_LEVEL}`, icon: "🏗️" },
    { label: "连击", value: combo, icon: "🔥" },
    { label: "分数", value: score, icon: "⭐" },
    { label: "最佳", value: best, icon: "🏆" },
  ];

  if (!mounted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-2xl text-gray-400">加载中...</div>
      </div>
    );
  }

  const p1Right = levelData.p1w;
  const p2Left = levelData.p2x;
  const p2Right = levelData.p2x + levelData.p2w;

  return (
    <GameShell
      gameId={GAME_ID}
      title="造桥大师"
      iconEmoji="🌉"
      iconGradient="from-teal-400 to-cyan-600"
      stats={stats}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center p-4">
        <div
          className="relative overflow-hidden rounded-xl shadow-lg shadow-cyan-500/10"
          style={{ width: GAME_W, height: GAME_H, maxWidth: "100%" }}
          onMouseDown={onPressStart}
          onMouseUp={onPressEnd}
          onMouseLeave={onPressEnd}
          onTouchStart={onPressStart}
          onTouchEnd={onPressEnd}
        >
          {/* 背景 */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, #0a0f1e 0%, #0d1b2e 40%, #14213d 70%, #1a1a2e 100%)",
            }}
          />
          {/* 星星 */}
          <div className="absolute inset-0">
            {starsRef.current.map((s, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: s.x,
                  top: s.y,
                  width: s.r * 2,
                  height: s.r * 2,
                  background: "rgba(167,139,250,0.4)",
                  animation: `twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.1}s infinite alternate`,
                }}
              />
            ))}
          </div>

          {/* 月亮 */}
          <div
            className="absolute rounded-full"
            style={{
              right: 30,
              top: 30,
              width: 40,
              height: 40,
              background: "radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24)",
              boxShadow: "0 0 30px rgba(251,191,36,0.3)",
            }}
          />

          {/* 远景山脉 */}
          <svg
            className="absolute"
            style={{ bottom: PLATFORM_H - 20, left: 0, width: "100%", opacity: 0.3 }}
            height="120"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
          >
            <polygon points="0,120 60,40 120,80 180,20 250,70 320,30 400,60 400,120" fill="#1e293b" />
            <polygon points="0,120 40,70 100,100 160,50 220,90 280,60 340,95 400,75 400,120" fill="#0f172a" />
          </svg>

          {/* 平台1 */}
          <div
            className="absolute rounded-t-lg"
            style={{
              left: 0,
              top: PLATFORM_Y,
              width: levelData.p1w,
              height: PLATFORM_H,
              background: "linear-gradient(180deg, #2dd4bf 0%, #14b8a6 30%, #0f766e 100%)",
              boxShadow: "0 0 20px rgba(45,212,191,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-300 rounded-t-lg opacity-50" />
          </div>

          {/* 平台2 */}
          <div
            className="absolute rounded-t-lg"
            style={{
              left: levelData.p2x,
              top: PLATFORM_Y,
              width: levelData.p2w,
              height: PLATFORM_H,
              background: "linear-gradient(180deg, #2dd4bf 0%, #14b8a6 30%, #0f766e 100%)",
              boxShadow: "0 0 20px rgba(45,212,191,0.3), inset 0 2px 0 rgba(255,255,255,0.2)",
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-teal-300 rounded-t-lg opacity-50" />
            {/* 完美区域标记 */}
            <div
              className="absolute top-0 h-full"
              style={{
                left: "30%",
                width: "40%",
                background: "rgba(251,191,36,0.15)",
                borderLeft: "2px dashed rgba(251,191,36,0.5)",
                borderRight: "2px dashed rgba(251,191,36,0.5)",
              }}
            />
          </div>

          {/* 桥梁 */}
          {bridgeHeight > 0 && (
            <div
              className="absolute rounded-sm"
              style={{
                left: p1Right - BRIDGE_W / 2,
                bottom: GAME_H - PLATFORM_Y,
                width: BRIDGE_W,
                height: bridgeHeight,
                background: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
                boxShadow: "0 0 8px rgba(251,191,36,0.4)",
                transformOrigin: "bottom center",
                transform: `rotate(${bridgeRotation}deg)`,
                transition: bridgeTransition ? `transform ${BRIDGE_FALL_MS}ms ease-in` : "none",
              }}
            />
          )}

          {/* 角色 */}
          <div
            className="absolute transition-all ease-linear"
            style={{
              left: charX,
              top: charFalling ? GAME_H + 50 : PLATFORM_Y - CHAR_H,
              width: CHAR_W,
              height: CHAR_H,
              transition: `left ${WALK_MS}ms linear, top ${FALL_MS}ms ease-in`,
              transform: charFalling ? "rotate(180deg)" : "rotate(0deg)",
              zIndex: 10,
            }}
          >
            <div
              className="w-full h-full rounded-lg relative"
              style={{
                background: "linear-gradient(180deg, #f472b6 0%, #ec4899 50%, #be185d 100%)",
                boxShadow: "0 0 10px rgba(236,72,153,0.4)",
              }}
            >
              {/* 眼睛 */}
              <div className="absolute top-2 left-1.5 w-2 h-2 rounded-full bg-white">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-900" />
              </div>
              <div className="absolute top-2 right-1.5 w-2 h-2 rounded-full bg-white">
                <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-900" />
              </div>
              {/* 嘴 */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-1.5 rounded-full bg-slate-900 opacity-60" />
            </div>
          </div>

          {/* Perfect提示 */}
          {showPerfect && (
            <div
              className="absolute left-1/2 top-1/3 -translate-x-1/2 text-2xl font-bold text-yellow-400 z-20"
              style={{ animation: "popUp 0.8s ease-out forwards", textShadow: "0 0 10px rgba(251,191,36,0.6)" }}
            >
              PERFECT!
            </div>
          )}

          {/* 分数提示 */}
          <div className="absolute top-2 left-2 text-sm font-bold text-white/80 z-20">
            <span className="text-teal-400">第{level}关</span>
            {combo > 1 && <span className="ml-2 text-orange-400">连击 x{combo}</span>}
          </div>

          {/* 桥梁长度指示器 */}
          {phase === "building" && (
            <div className="absolute top-2 right-2 z-20">
              <div className="text-xs text-amber-400 font-bold">{Math.round(bridgeHeight)}px</div>
            </div>
          )}

          {/* 开始界面 */}
          {phase === "idle" && level === 1 && score === 0 && !paused && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
              <div className="text-6xl mb-4">🌉</div>
              <h2 className="text-3xl font-bold text-white mb-2">造桥大师</h2>
              <p className="text-sm text-gray-300 mb-6 text-center px-4 leading-relaxed max-w-[300px]">
                按住空格或触摸屏幕延伸桥梁
                <br />
                松开后桥梁倒下，长度合适即可通过
                <br />
                命中平台中央获得完美奖励！
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); start(); }}
                aria-label="开始游戏"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold text-lg shadow-lg shadow-teal-500/30 transition hover:scale-105 active:scale-95"
              >
                开始造桥
              </button>
            </div>
          )}

          {/* 暂停界面 */}
          {paused && phase !== "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
              <div className="text-5xl mb-3">⏸️</div>
              <h3 className="text-2xl font-bold text-white mb-4">已暂停</h3>
              <button
                onClick={(e) => { e.stopPropagation(); togglePause(); }}
                aria-label="继续游戏"
                className="h-12 px-6 rounded-xl bg-teal-500 text-white font-medium shadow-lg transition hover:bg-teal-600 active:scale-95"
              >
                继续
              </button>
            </div>
          )}

          {/* 游戏结束界面 */}
          {phase === "gameover" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30 p-4">
              <div className="text-5xl mb-3">{level >= MAX_LEVEL ? "🎉" : "💥"}</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {level >= MAX_LEVEL ? "通关成功！" : "游戏结束"}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                到达第 {level} 关 · 连击 {combo}
              </p>
              <div className="text-4xl font-bold text-teal-400 mb-2">{score}</div>
              <p className="text-xs text-gray-400 mb-1">
                {score >= best && score > 0 ? "🎉 新纪录！" : `最佳: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-gray-400 mb-4">
                  排名第 <span className="text-teal-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越 <span className="text-teal-400 font-bold">{result.beatPercent}%</span> 玩家
                </p>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); start(); }}
                aria-label="重新开始"
                className="h-12 px-8 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg transition hover:scale-105 active:scale-95"
              >
                再来一局
              </button>
            </div>
          )}

          {/* 提示文字 */}
          {phase === "idle" && level > 1 && !paused && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400 z-20 animate-pulse">
              按住空格或触摸屏幕建桥
            </div>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          {phase === "idle" && (
            <button
              onClick={startBuilding}
              aria-label="开始建桥"
              className="h-11 px-8 rounded-xl bg-teal-500 text-white font-bold text-lg shadow-lg shadow-teal-500/30 transition hover:bg-teal-600 active:scale-95 select-none"
            >
              按住建桥
            </button>
          )}
          {phase === "building" && (
            <button
              onMouseDown={onPressStart}
              onMouseUp={onPressEnd}
              onTouchStart={onPressStart}
              onTouchEnd={onPressEnd}
              aria-label="松开放下桥梁"
              className="h-11 px-8 rounded-xl bg-amber-500 text-white font-bold text-lg shadow-lg shadow-amber-500/30 transition hover:bg-amber-600 active:scale-95 select-none"
            >
              松开放桥
            </button>
          )}
          {(phase === "building" || phase === "idle") && (
            <button
              onClick={togglePause}
              aria-label="暂停游戏"
              className="h-11 px-6 rounded-xl bg-gray-700 text-white font-medium shadow-lg transition hover:bg-gray-600 active:scale-95"
            >
              {paused ? "继续" : "暂停"}
            </button>
          )}
          <button
            onClick={start}
            aria-label="重新开始游戏"
            className="h-11 px-6 rounded-xl bg-gray-700 text-white font-medium shadow-lg transition hover:bg-gray-600 active:scale-95"
          >
            重新开始
          </button>
        </div>

        <style jsx>{`
          @keyframes twinkle {
            from { opacity: 0.2; }
            to { opacity: 0.8; }
          }
          @keyframes popUp {
            0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
            30% { transform: translate(-50%, -20px) scale(1.3); opacity: 1; }
            100% { transform: translate(-50%, -60px) scale(1); opacity: 0; }
          }
        `}</style>
      </div>
    </GameShell>
  );
}
