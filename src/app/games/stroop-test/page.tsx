"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Palette, RotateCcw, Flame, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "stroop-test";
const DURATION = 30;
const BEST_KEY = "toolbox_stroop_best";

interface ColorDef {
  name: string;
  hex: string;
}

const COLORS: ColorDef[] = [
  { name: "红", hex: "#ef4444" },
  { name: "绿", hex: "#22c55e" },
  { name: "蓝", hex: "#3b82f6" },
  { name: "黄", hex: "#eab308" },
  { name: "紫", hex: "#a855f7" },
];

interface Question {
  word: ColorDef;
  ink: ColorDef;
  options: ColorDef[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(): Question {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  let ink = COLORS[Math.floor(Math.random() * COLORS.length)];
  // 大多数情况下让墨色与字义不同，制造干扰
  if (ink.name === word.name && Math.random() < 0.7) {
    ink = COLORS[(COLORS.indexOf(ink) + 1) % COLORS.length];
  }
  const distractors = COLORS.filter((c) => c.name !== ink.name);
  const options = shuffle([ink, ...shuffle(distractors).slice(0, 3)]);
  return { word, ink, options };
}

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  correct: number;
  attempts: number;
  score: number;
  maxCombo: number;
  isNewBest: boolean;
}

export default function StroopTestPage() {
  // ---- mounted pattern: 避免 makeQuestion() 中 Math.random 导致水合错误 #418 ----
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState<Question | null>(null);

  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [best, setBest] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const comboRef = useRef(0);
  const maxComboRef = useRef(0);
  const submittedRef = useRef(false);

  // 客户端挂载后才生成题目 + 读取最佳成绩
  useEffect(() => {
    setMounted(true);
    setQ(makeQuestion());
    try {
      const b = localStorage.getItem(BEST_KEY);
      if (b) setBest(parseInt(b, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setRunning(false);
    setFinished(true);
    const c = correctRef.current;
    const score = c * 100;
    const r = submitScore(GAME_ID, score, `答对 ${c} 题`);
    const isNewBest = score > best;
    if (isNewBest) {
      setBest(score);
      try {
        localStorage.setItem(BEST_KEY, String(score));
      } catch {
        /* ignore */
      }
    }
    setResult({
      ...r,
      correct: c,
      attempts: totalRef.current,
      score,
      maxCombo: maxComboRef.current,
      isNewBest,
    });
    setRefreshKey((k) => k + 1);
  }, [best]);

  // 倒计时
  useEffect(() => {
    if (!running || finished) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, finished]);

  // 时间到自动结束
  useEffect(() => {
    if (running && timeLeft === 0 && !finished) finish();
  }, [running, timeLeft, finished, finish]);

  const handleAnswer = (name: string) => {
    if (finished || !q) return;
    if (!running) setRunning(true);
    const isCorrect = name === q.ink.name;
    totalRef.current += 1;
    setTotal(totalRef.current);
    if (isCorrect) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
      comboRef.current += 1;
      if (comboRef.current > maxComboRef.current) {
        maxComboRef.current = comboRef.current;
        setMaxCombo(maxComboRef.current);
      }
      setCombo(comboRef.current);
    } else {
      comboRef.current = 0;
      setCombo(0);
    }
    setFlash(isCorrect ? "correct" : "wrong");
    window.setTimeout(() => setFlash(null), 300);
    setQ(makeQuestion());
    setAnimKey((k) => k + 1);
  };

  const restart = () => {
    submittedRef.current = false;
    correctRef.current = 0;
    totalRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    setCorrect(0);
    setTotal(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(DURATION);
    setRunning(false);
    setFinished(false);
    setFlash(null);
    setResult(null);
    setQ(makeQuestion());
    setAnimKey((k) => k + 1);
  };

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 100;

  const stats: GameStat[] = [
    { label: "答对", value: correct },
    { label: "正确率", value: `${accuracy}%` },
    { label: "连击", value: combo },
    { label: "剩余时间", value: `${timeLeft}s` },
  ];

  const timePercent = (timeLeft / DURATION) * 100;

  return (
    <GameShell
      gameId={GAME_ID}
      title="色字干扰测试"
      description="Stroop 经典认知测试，30 秒内选出文字的颜色而非字义，答对越多分数越高"
      instructions={`屏幕会显示一个颜色词（如"红"字），但文字本身可能用其他颜色显示（如蓝色）。
你需要选出文字所显示的"颜色"，而不是字面的意思。
30 秒倒计时内尽可能多答对，每答对一题得 100 分。
注意：选的是墨色，不是字义。首次点击选项即开始计时。`}
      icon={Palette}
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes stroop-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-7px); }
          40% { transform: translateX(7px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .stroop-shake { animation: stroop-shake 0.35s ease-in-out; }
        @keyframes stroop-pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        .stroop-pop { animation: stroop-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes stroop-float-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stroop-float-in { animation: stroop-float-in 0.4s ease-out forwards; }
      `}</style>

      <div className="flex flex-col items-center">
        {/* 进度条 */}
        <div className="w-full h-2 bg-[#27272a] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timePercent}%`,
              background:
                timePercent > 33
                  ? "linear-gradient(90deg, #8b5cf6, #c084fc)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
            }}
          />
        </div>

        {/* 加载状态（mounted pattern 避免水合错误） */}
        {!mounted || !q ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : finished && result ? (
          /* ===== 结果界面 ===== */
          <div className="w-full max-w-md stroop-float-in">
            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
              <div className="text-5xl mb-3">🎨</div>
              <h3 className="text-xl font-bold mb-1">测试完成</h3>
              {result.isNewBest && (
                <div className="inline-flex items-center gap-1 mt-2 mb-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium animate-scale-in">
                  <Trophy className="w-3 h-3" /> 新纪录！
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">答对</div>
                  <div className="text-2xl font-bold text-emerald-400">{result.correct}</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">正确率</div>
                  <div className="text-2xl font-bold text-[#a78bfa]">
                    {result.attempts > 0
                      ? Math.round((result.correct / result.attempts) * 100)
                      : 0}
                    %
                  </div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">最高连击</div>
                  <div className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5" />
                    {result.maxCombo}
                  </div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">总分</div>
                  <div className="text-2xl font-bold text-[#a78bfa]">{result.score}</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3 mb-4 text-xs text-slate-400 flex-wrap">
                <span>
                  排名第 <span className="text-white font-medium">{result.rank}</span>/
                  {result.total}
                </span>
                <span className="text-slate-600">|</span>
                <span>超越 {result.beatPercent}% 玩家</span>
                <span className="text-slate-600">|</span>
                <span>
                  历史最佳 <span className="text-amber-400 font-medium">{best}</span>
                </span>
              </div>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再来一次
              </button>
            </div>
          </div>
        ) : (
          /* ===== 游戏界面 ===== */
          <div
            className={`w-full max-w-md rounded-xl border p-6 sm:p-8 text-center transition-colors duration-200 ${
              flash === "correct"
                ? "border-emerald-500/50 bg-emerald-500/5"
                : flash === "wrong"
                  ? "border-red-500/50 bg-red-500/5 stroop-shake"
                  : "border-[#27272a] bg-[#09090b]"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-slate-500">选出文字的"颜色"</p>
              {combo >= 2 && (
                <div
                  key={combo}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-scale-in"
                >
                  <Flame className="w-3 h-3" /> {combo} 连击
                </div>
              )}
            </div>

            <div
              key={animKey}
              className="text-7xl sm:text-8xl font-bold mb-8 select-none stroop-pop"
              style={{ color: q.ink.hex }}
            >
              {q.word.name}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt) => (
                <button
                  key={opt.name}
                  onClick={() => handleAnswer(opt.name)}
                  disabled={finished}
                  className="h-14 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-white text-lg font-medium transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: opt.hex, boxShadow: `0 0 6px ${opt.hex}80` }}
                  />
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 提示 & 重新开始按钮 */}
        {!finished && mounted && q && (
          <>
            {!running && (
              <p className="mt-4 text-xs text-slate-500 animate-pulse">
                点击任意选项开始 30 秒倒计时
              </p>
            )}
            <button
              onClick={restart}
              className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 重新开始
            </button>
          </>
        )}
      </div>
    </GameShell>
  );
}
