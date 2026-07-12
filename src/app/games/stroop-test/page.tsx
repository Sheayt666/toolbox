"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "stroop-test";
const DURATION = 30;

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
}

export default function StroopTestPage() {
  const [q, setQ] = useState<Question>(() => makeQuestion());
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const correctRef = useRef(0);
  const totalRef = useRef(0);
  const submittedRef = useRef(false);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setRunning(false);
    setFinished(true);
    const c = correctRef.current;
    const score = c * 100;
    const r = submitScore(GAME_ID, score, `答对 ${c} 题`);
    setResult({
      ...r,
      correct: c,
      attempts: totalRef.current,
      score,
    });
    setRefreshKey((k) => k + 1);
  }, []);

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
    if (finished) return;
    if (!running) setRunning(true);
    const isCorrect = name === q.ink.name;
    totalRef.current += 1;
    setTotal(totalRef.current);
    if (isCorrect) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
    }
    setFlash(isCorrect ? "correct" : "wrong");
    window.setTimeout(() => setFlash(null), 180);
    setQ(makeQuestion());
  };

  const restart = () => {
    submittedRef.current = false;
    correctRef.current = 0;
    totalRef.current = 0;
    setCorrect(0);
    setTotal(0);
    setTimeLeft(DURATION);
    setRunning(false);
    setFinished(false);
    setFlash(null);
    setResult(null);
    setQ(makeQuestion());
  };

  const accuracy =
    total > 0 ? Math.round((correct / total) * 100) : 100;

  const stats: GameStat[] = [
    { label: "答对", value: correct },
    { label: "答题数", value: total },
    { label: "正确率", value: `${accuracy}%` },
    { label: "剩余时间", value: `${timeLeft}s` },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="色字干扰测试"
      description="Stroop 经典认知测试，30 秒内选出文字的“颜色”而非字义，答对越多分数越高"
      instructions={`屏幕会显示一个颜色词（如“红”字），但文字本身可能用其他颜色显示（如蓝色）。
你需要选出文字所显示的“颜色”，而不是字面的意思。
30 秒倒计时内尽可能多答对，每答对一题得 100 分。
注意：选的是墨色，不是字义。首次点击选项即开始计时。`}
      icon={Palette}
      stats={stats}
      shareScore={result?.score ?? 0}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 进度条 */}
        <div className="w-full h-2 bg-[#27272a] rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#8b5cf6] rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / DURATION) * 100}%` }}
          />
        </div>

        <div
          className={`w-full max-w-md rounded-xl border p-8 sm:p-10 text-center transition-colors ${
            flash === "correct"
              ? "border-emerald-500/50 bg-emerald-500/5"
              : flash === "wrong"
                ? "border-red-500/50 bg-red-500/5"
                : "border-[#27272a] bg-[#09090b]"
          }`}
        >
          <p className="text-sm text-slate-500 mb-6">
            下方文字的“颜色”是？
          </p>
          <div
            className="text-7xl sm:text-8xl font-bold mb-8 select-none"
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
                className="h-14 rounded-xl bg-[#27272a] hover:bg-[#3f3f46] text-white text-lg font-medium transition-colors disabled:opacity-50"
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>

        {!finished && !running && (
          <p className="mt-4 text-xs text-slate-500">
            点击任意选项开始 30 秒倒计时
          </p>
        )}

        {finished && result && (
          <div className="mt-6 w-full max-w-md rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
            <div className="text-4xl mb-2">🎨</div>
            <h3 className="text-lg font-bold mb-3">测试完成</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500">答对</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.correct}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">正确率</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.attempts > 0
                    ? Math.round((result.correct / result.attempts) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">分数</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.score}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              排名第 {result.rank}/{result.total}，超越了 {result.beatPercent}% 的玩家
            </p>
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 再来一次
            </button>
          </div>
        )}

        {!finished && running && (
          <button
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> 重新开始
          </button>
        )}
      </div>
    </GameShell>
  );
}
