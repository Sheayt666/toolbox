"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, RotateCcw, Play } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

/* ============ 常量 ============ */
const GAME_ID = "rhythm-tap";
const W = 500;
const H = 560;
const BEST_SCORE_KEY = "gm_rhythm_tap_best_score";

const SONG_DURATION = 60000; // 60 秒
const FALL_TIME = 1800; // 音符从顶部到判定线的时间 (ms)
const PERFECT_WINDOW = 50;
const GOOD_WINDOW = 100;
const MISS_WINDOW = 150;
const JUDGE_Y = H - 100; // 判定线 y 位置
const LANE_W = W / 4;
const NOTE_H = 26;

const LANE_COLORS = [
  { main: "#06b6d4", light: "#67e8f9", glow: "rgba(6,182,212,0.35)" }, // 青
  { main: "#22c55e", light: "#86efac", glow: "rgba(34,197,94,0.35)" }, // 绿
  { main: "#eab308", light: "#fde047", glow: "rgba(234,179,8,0.35)" }, // 黄
  { main: "#a855f7", light: "#d8b4fe", glow: "rgba(168,85,247,0.35)" }, // 紫
];

const LANE_KEYS = ["d", "f", "j", "k"];
const LANE_LABELS = ["D", "F", "J", "K"];

interface Note {
  time: number;
  lane: number;
}

interface HitEffect {
  lane: number;
  judgment: "perfect" | "good" | "miss";
  time: number;
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ============ 确定性节谱生成（无 Math.random）============ */
function generateBeatChart(): Note[] {
  const notes: Note[] = [];
  const bpm = 130;
  const beat = 60000 / bpm; // ≈ 461.5ms
  const half = beat / 2;
  const quarter = beat / 4;

  // 第一段 (0-15s)：简单，每拍一个音符，循环轨道
  let t = beat * 2;
  const cycle1 = [0, 1, 2, 3, 3, 2, 1, 0];
  let i = 0;
  while (t < 15000) {
    notes.push({ time: t, lane: cycle1[i % cycle1.length] });
    i++;
    t += beat;
  }

  // 第二段 (15-30s)：半拍节奏
  const cycle2 = [0, 2, 1, 3, 0, 1, 2, 3];
  i = 0;
  while (t < 30000) {
    notes.push({ time: t, lane: cycle2[i % cycle2.length] });
    i++;
    t += half;
  }

  // 第三段 (30-45s)：混合模式，偶尔双键
  const cycle3a = [0, 1, 2, 3];
  const cycle3b = [3, 2, 1, 0];
  i = 0;
  let useA = true;
  while (t < 45000) {
    const pat = useA ? cycle3a : cycle3b;
    const lane = pat[i % pat.length];
    notes.push({ time: t, lane });
    if (i % 3 === 2 && t < 44000) {
      notes.push({ time: t, lane: (lane + 2) % 4 });
    }
    i++;
    t += half;
    if (i % 4 === 0) useA = !useA;
  }

  // 第四段 (45-58s)：高潮，更快节奏
  const cycle4 = [0, 1, 2, 3, 2, 1, 0, 3, 1, 2, 0, 3];
  i = 0;
  while (t < 58000) {
    notes.push({ time: t, lane: cycle4[i % cycle4.length] });
    i++;
    t += quarter * 3; // 比 half 稍快
  }

  // 结尾双键
  notes.push({ time: 59000, lane: 0 });
  notes.push({ time: 59000, lane: 3 });
  notes.push({ time: 59500, lane: 1 });
  notes.push({ time: 59500, lane: 2 });

  return notes.sort((a, b) => a.time - b.time);
}

const BEAT_CHART: Note[] = generateBeatChart();

/* ============ 工具函数 ============ */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ============ 组件 ============ */
export default function RhythmTapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 游戏状态（ref）
  const startTimeRef = useRef(0);
  const hitNotesRef = useRef<Set<number>>(new Set());
  const missedNotesRef = useRef<Set<number>>(new Set());
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const scoreRef = useRef(0);
  const judgmentsRef = useRef({ perfect: 0, good: 0, miss: 0 });
  const hitEffectsRef = useRef<HitEffect[]>([]);
  const laneFlashRef = useRef<number[]>([0, 0, 0, 0]);
  const pressedRef = useRef<Set<string>>(new Set());
  const runningRef = useRef(false);
  const overRef = useRef(false);
  const submittedRef = useRef(false);
  const bestRef = useRef(0);
  const animFrameRef = useRef(0);
  const comboPopRef = useRef(0);

  // UI 状态
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ perfect: 0, good: 0, miss: 0, maxCombo: 0 });

  /* ----- 命中处理 ----- */
  const handleHit = useCallback((lane: number) => {
    if (!runningRef.current || overRef.current) return;
    const elapsed = performance.now() - startTimeRef.current;

    // 找最近的待判定音符
    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < BEAT_CHART.length; i++) {
      if (hitNotesRef.current.has(i) || missedNotesRef.current.has(i)) continue;
      const note = BEAT_CHART[i];
      if (note.lane !== lane) continue;
      const delta = Math.abs(note.time - elapsed);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIdx = i;
      }
    }
    if (bestIdx === -1 || bestDelta > MISS_WINDOW) return;

    let judgment: "perfect" | "good" | "miss";
    if (bestDelta <= PERFECT_WINDOW) {
      judgment = "perfect";
      const pts = Math.round(100 * (1 + comboRef.current * 0.1));
      scoreRef.current += pts;
      judgmentsRef.current.perfect++;
      comboRef.current++;
      if (comboRef.current > maxComboRef.current)
        maxComboRef.current = comboRef.current;
      comboPopRef.current = 1;
    } else if (bestDelta <= GOOD_WINDOW) {
      judgment = "good";
      scoreRef.current += 50;
      judgmentsRef.current.good++;
      comboRef.current++;
      if (comboRef.current > maxComboRef.current)
        maxComboRef.current = comboRef.current;
      comboPopRef.current = 1;
    } else {
      judgment = "miss";
      judgmentsRef.current.miss++;
      comboRef.current = 0;
    }
    hitNotesRef.current.add(bestIdx);
    hitEffectsRef.current.push({ lane, judgment, time: elapsed });
    laneFlashRef.current[lane] = 1;

    setScore(scoreRef.current);
    setCombo(comboRef.current);
  }, []);

  /* ----- 游戏结束 ----- */
  const doGameOver = useCallback(() => {
    if (overRef.current) return;
    overRef.current = true;
    runningRef.current = false;
    setOver(true);
    setRunning(false);
    if (submittedRef.current) return;
    submittedRef.current = true;
    const s = scoreRef.current;
    const r = submitScore(GAME_ID, s, `${judgmentsRef.current.perfect} Perfect`);
    setResult(r);
    setRefreshKey((k) => k + 1);
    setStats({
      perfect: judgmentsRef.current.perfect,
      good: judgmentsRef.current.good,
      miss: judgmentsRef.current.miss,
      maxCombo: maxComboRef.current,
    });
    if (s > bestRef.current) {
      bestRef.current = s;
      setBest(s);
      try {
        localStorage.setItem(BEST_SCORE_KEY, String(s));
      } catch {
        /* ignore */
      }
    }
  }, []);

  /* ----- 绘制 ----- */
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    animFrameRef.current++;

    const elapsed = runningRef.current
      ? performance.now() - startTimeRef.current
      : 0;

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0a0f");
    bg.addColorStop(1, "#09090b");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 轨道背景
    for (let lane = 0; lane < 4; lane++) {
      const lx = lane * LANE_W;
      const flash = laneFlashRef.current[lane];
      // 轨道底色
      ctx.fillStyle = lane % 2 === 0 ? "rgba(24,24,27,0.6)" : "rgba(15,15,18,0.6)";
      ctx.fillRect(lx, 0, LANE_W, H);
      // 闪烁
      if (flash > 0.01) {
        ctx.fillStyle = LANE_COLORS[lane].glow.replace(/[\d.]+\)$/, `${flash * 0.4})`);
        ctx.fillRect(lx, 0, LANE_W, H);
        laneFlashRef.current[lane] *= 0.85;
      }
      // 轨道边线
      if (lane > 0) {
        ctx.strokeStyle = "rgba(39,39,42,0.8)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, 0);
        ctx.lineTo(lx, H);
        ctx.stroke();
      }
    }

    // 判定线
    const lineGlow = 0.5 + 0.5 * Math.sin(animFrameRef.current * 0.05);
    ctx.save();
    ctx.shadowColor = "rgba(168,85,247,0.6)";
    ctx.shadowBlur = 12 + lineGlow * 6;
    const lineGrad = ctx.createLinearGradient(0, JUDGE_Y - 2, 0, JUDGE_Y + 2);
    lineGrad.addColorStop(0, "rgba(168,85,247,0.2)");
    lineGrad.addColorStop(0.5, "#a855f7");
    lineGrad.addColorStop(1, "rgba(168,85,247,0.2)");
    ctx.fillStyle = lineGrad;
    ctx.fillRect(0, JUDGE_Y - 2, W, 4);
    ctx.restore();

    // 判定线两端标记
    for (let lane = 0; lane < 4; lane++) {
      const lx = lane * LANE_W;
      ctx.fillStyle = LANE_COLORS[lane].main;
      ctx.globalAlpha = 0.5;
      roundRect(ctx, lx + 8, JUDGE_Y - 3, LANE_W - 16, 6, 3);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // 绘制音符
    for (let i = 0; i < BEAT_CHART.length; i++) {
      if (hitNotesRef.current.has(i)) continue;
      const note = BEAT_CHART[i];
      const noteY =
        (JUDGE_Y * (FALL_TIME + elapsed - note.time)) / FALL_TIME;
      if (noteY < -NOTE_H || noteY > H + 10) continue;

      const isMissed = missedNotesRef.current.has(i);
      const alpha = isMissed ? 0.25 : 1;
      const lc = LANE_COLORS[note.lane];
      const lx = note.lane * LANE_W;
      const nx = lx + 8;
      const nw = LANE_W - 16;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = lc.glow;
      ctx.shadowBlur = isMissed ? 0 : 10;

      // 音符主体渐变
      const grad = ctx.createLinearGradient(0, noteY, 0, noteY + NOTE_H);
      grad.addColorStop(0, lc.light);
      grad.addColorStop(0.5, lc.main);
      grad.addColorStop(1, lc.main);
      ctx.fillStyle = grad;
      roundRect(ctx, nx, noteY, nw, NOTE_H, 8);
      ctx.fill();

      // 高光
      if (!isMissed) {
        ctx.fillStyle = "rgba(255,255,255,0.4)";
        roundRect(ctx, nx + 4, noteY + 3, nw - 8, 4, 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 命中特效文字
    const now = elapsed;
    hitEffectsRef.current = hitEffectsRef.current.filter((e) => now - e.time < 600);
    for (const e of hitEffectsRef.current) {
      const age = (now - e.time) / 600;
      const alpha = 1 - age;
      const offsetY = age * 30;
      const lx = e.lane * LANE_W + LANE_W / 2;
      const ly = JUDGE_Y - 30 - offsetY;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = "center";
      ctx.font = "bold 18px Inter, sans-serif";
      if (e.judgment === "perfect") {
        ctx.fillStyle = "#67e8f9";
        ctx.shadowColor = "rgba(6,182,212,0.8)";
        ctx.shadowBlur = 8;
        ctx.fillText("PERFECT", lx, ly);
      } else if (e.judgment === "good") {
        ctx.fillStyle = "#86efac";
        ctx.shadowColor = "rgba(34,197,94,0.6)";
        ctx.shadowBlur = 6;
        ctx.fillText("GOOD", lx, ly);
      } else {
        ctx.fillStyle = "#f87171";
        ctx.fillText("MISS", lx, ly);
      }
      ctx.restore();
    }

    // Combo 显示
    if (comboRef.current > 0 && runningRef.current) {
      const popScale = comboPopRef.current > 0 ? 1 + comboPopRef.current * 0.3 : 1;
      comboPopRef.current *= 0.88;
      ctx.save();
      ctx.textAlign = "center";
      ctx.translate(W / 2, H / 2 - 40);
      ctx.scale(popScale, popScale);
      ctx.font = "bold 56px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.shadowColor = "rgba(168,85,247,0.6)";
      ctx.shadowBlur = 16;
      ctx.fillText(String(comboRef.current), 0, 0);
      ctx.font = "bold 16px Inter, sans-serif";
      ctx.fillStyle = "rgba(167,139,250,0.8)";
      ctx.fillText("COMBO", 0, 26);
      ctx.restore();
    }

    // 进度条
    const prog = Math.min(1, elapsed / SONG_DURATION);
    ctx.fillStyle = "rgba(39,39,42,0.8)";
    ctx.fillRect(0, 0, W, 4);
    const progGrad = ctx.createLinearGradient(0, 0, W, 0);
    progGrad.addColorStop(0, "#a855f7");
    progGrad.addColorStop(1, "#ec4899");
    ctx.fillStyle = progGrad;
    ctx.fillRect(0, 0, W * prog, 4);

    // 底部按键标签
    for (let lane = 0; lane < 4; lane++) {
      const lx = lane * LANE_W + LANE_W / 2;
      ctx.save();
      ctx.textAlign = "center";
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillStyle = pressedRef.current.has(LANE_KEYS[lane])
        ? LANE_COLORS[lane].light
        : "rgba(113,113,122,0.6)";
      ctx.fillText(LANE_LABELS[lane], lx, H - 20);
      ctx.restore();
    }
  }, []);

  /* ----- 主循环 ----- */
  useEffect(() => {
    let raf: number;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (runningRef.current && !overRef.current) {
        const elapsed = performance.now() - startTimeRef.current;

        // 检查漏判音符
        for (let i = 0; i < BEAT_CHART.length; i++) {
          if (hitNotesRef.current.has(i) || missedNotesRef.current.has(i)) continue;
          const note = BEAT_CHART[i];
          if (elapsed > note.time + MISS_WINDOW) {
            missedNotesRef.current.add(i);
            judgmentsRef.current.miss++;
            if (comboRef.current > 0) {
              comboRef.current = 0;
              setCombo(0);
            }
          }
        }

        // 更新进度
        setProgress(Math.min(100, (elapsed / SONG_DURATION) * 100));

        // 歌曲结束
        if (elapsed >= SONG_DURATION) {
          doGameOver();
        }
      }
      draw();
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw, doGameOver]);

  /* ----- 初始化（mounted 模式）----- */
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem(BEST_SCORE_KEY) || "0", 10) || 0;
      if (saved > 0) {
        bestRef.current = saved;
        setBest(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  /* ----- 开始游戏 ----- */
  const start = useCallback(() => {
    if (runningRef.current || overRef.current) return;
    hitNotesRef.current = new Set();
    missedNotesRef.current = new Set();
    comboRef.current = 0;
    maxComboRef.current = 0;
    scoreRef.current = 0;
    judgmentsRef.current = { perfect: 0, good: 0, miss: 0 };
    hitEffectsRef.current = [];
    laneFlashRef.current = [0, 0, 0, 0];
    pressedRef.current = new Set();
    submittedRef.current = false;
    setScore(0);
    setCombo(0);
    setProgress(0);
    setStats({ perfect: 0, good: 0, miss: 0, maxCombo: 0 });
    setOver(false);
    setResult(null);
    startTimeRef.current = performance.now();
    runningRef.current = true;
    setRunning(true);
  }, []);

  /* ----- 重新开始 ----- */
  const restart = useCallback(() => {
    overRef.current = false;
    runningRef.current = false;
    submittedRef.current = false;
    hitNotesRef.current = new Set();
    missedNotesRef.current = new Set();
    comboRef.current = 0;
    maxComboRef.current = 0;
    scoreRef.current = 0;
    judgmentsRef.current = { perfect: 0, good: 0, miss: 0 };
    hitEffectsRef.current = [];
    setScore(0);
    setCombo(0);
    setProgress(0);
    setOver(false);
    setResult(null);
    setRunning(false);
  }, []);

  /* ----- 键盘控制 ----- */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const lane = LANE_KEYS.indexOf(k);
      if (lane >= 0) {
        e.preventDefault();
        if (pressedRef.current.has(k)) return; // 防重复
        pressedRef.current.add(k);
        handleHit(lane);
      } else if (k === " " || k === "enter") {
        e.preventDefault();
        if (!runningRef.current && !overRef.current) start();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      pressedRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleHit, start]);

  /* ----- 触摸按钮控制 ----- */
  const handleLanePress = useCallback(
    (lane: number) => {
      handleHit(lane);
    },
    [handleHit],
  );

  const totalNotes = BEAT_CHART.length;
  const accuracy =
    totalNotes > 0
      ? Math.round(
          ((stats.perfect * 1 + stats.good * 0.5) / totalNotes) * 100,
        )
      : 0;

  const statsDisplay: GameStat[] = [
    { label: "分数", value: score },
    { label: "连击", value: combo },
    { label: "最高分", value: best },
    { label: "进度", value: `${Math.round(progress)}%` },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="节奏大师"
      description="4列轨道音符下落，在恰当时机点击对应按键获得完美判定！连击越高分数越高，挑战60秒音游盛宴。"
      instructions={`键盘：D F J K 分别对应4列轨道，空格/回车开始。
移动端：点击下方4个按钮对应4列。
判定规则：
  Perfect (±50ms) = 100分 × (1 + 连击 × 0.1)
  Good (±100ms) = 50分
  Miss (超过150ms) = 0分，连击清零
连续 Perfect/Good 增加连击数，连击越高单次得分越高。
歌曲时长60秒，播放完毕游戏结束。
你的最高分会自动保存在本地。`}
      icon={Music}
      iconEmoji="🎵"
      iconGradient="from-purple-400 to-fuchsia-500"
      stats={statsDisplay}
      shareScore={score}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="w-full max-w-[500px] h-auto rounded-xl border border-[#27272a] touch-none shadow-lg shadow-purple-500/10"
          />

          {/* 待开始覆盖层 */}
          {!running && !over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/85 backdrop-blur-sm flex flex-col items-center justify-center animate-overlay-in">
              <div className="text-5xl mb-4">🎵</div>
              <button
                onClick={start}
                className="inline-flex items-center gap-2 h-12 px-7 text-base font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                <Play className="w-5 h-5" /> 开始演奏
              </button>
              <p className="mt-4 text-xs text-slate-400 text-center px-4 leading-relaxed">
                D F J K 对应4列轨道
                <br />
                音符到达判定线时按下对应键
              </p>
            </div>
          )}

          {/* 游戏结束覆盖层 */}
          {over && (
            <div className="absolute inset-0 rounded-xl bg-[#09090b]/92 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center animate-overlay-in overflow-y-auto">
              <div className="text-5xl mb-3">🎶</div>
              <h3 className="text-2xl font-bold mb-3">演奏结束！</h3>
              <p className="text-sm text-slate-400 mb-1">最终得分</p>
              <p className="text-4xl font-bold text-purple-400 mb-3">{score}</p>
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <span className="text-cyan-400 font-bold">Perfect</span>
                  <span className="text-white ml-2">{stats.perfect}</span>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <span className="text-green-400 font-bold">Good</span>
                  <span className="text-white ml-2">{stats.good}</span>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <span className="text-red-400 font-bold">Miss</span>
                  <span className="text-white ml-2">{stats.miss}</span>
                </div>
                <div className="bg-[#27272a]/60 rounded-lg px-3 py-2">
                  <span className="text-purple-400 font-bold">Max Combo</span>
                  <span className="text-white ml-2">{stats.maxCombo}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                准确率 <span className="text-white font-bold">{accuracy}%</span>
                {score >= best && score > 0 ? " · 新纪录！" : ` · 最高: ${best}`}
              </p>
              {result && (
                <p className="text-xs text-slate-400 mb-3 bg-[#27272a]/60 rounded-lg px-3 py-2">
                  排名第 <span className="text-purple-400 font-bold">{result.rank}</span>/{result.total}
                  ，超越了 <span className="text-purple-400 font-bold">{result.beatPercent}%</span> 的玩家
                </p>
              )}
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
              >
                <RotateCcw className="w-4 h-4" /> 再来一曲
              </button>
            </div>
          )}
        </div>

        {/* 4个触摸按钮（移动端 + 桌面端都显示）*/}
        <div className="mt-5 grid grid-cols-4 gap-2 w-full max-w-[500px]">
          {LANE_COLORS.map((lc, lane) => (
            <button
              key={lane}
              onTouchStart={(e) => {
                e.preventDefault();
                handleLanePress(lane);
              }}
              onMouseDown={() => handleLanePress(lane)}
              className="h-16 sm:h-18 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 border-2"
              style={{
                borderColor: lc.main,
                background: `linear-gradient(180deg, ${lc.glow.replace(/[\d.]+\)$/, "0.15)")}, ${lc.glow.replace(/[\d.]+\)$/, "0.05)")})`,
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: lc.light }}
              >
                {LANE_LABELS[lane]}
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                {LANE_KEYS[lane].toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {/* 开始/重开按钮 */}
        <div className="mt-4 flex items-center gap-3">
          {!running && !over && (
            <button
              onClick={start}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors shadow-lg shadow-purple-500/30"
            >
              <Play className="w-4 h-4" /> 开始
            </button>
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors border border-[#3f3f46]"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        </div>
      </div>
    </GameShell>
  );
}
