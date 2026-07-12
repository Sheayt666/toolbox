"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, RotateCcw } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "typing-test";
const DURATION = 60;

const TEXT =
  "The quick brown fox jumps over the lazy dog. 科技改变生活，code is poetry. " +
  "熟能生巧，practice makes perfect. 时间就是金钱，time is money. " +
  "知识就是力量，knowledge is power. 活到老学到老，never too old to learn. " +
  "失败乃成功之母，failure is the mother of success. 一寸光阴一寸金，an inch of time is an inch of gold. " +
  "千里之行始于足下，a journey of a thousand miles begins with a single step.";

interface Result {
  rank: number;
  total: number;
  beatPercent: number;
  wpm: number;
  accuracy: number;
}

export default function TypingTestPage() {
  const [typed, setTyped] = useState("");
  const typedRef = useRef("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const startRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  const finish = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setRunning(false);
    setFinished(true);
    const elapsedSec = startRef.current
      ? (Date.now() - startRef.current) / 1000
      : DURATION;
    const t = typedRef.current;
    let correct = 0;
    for (let i = 0; i < t.length; i++) if (t[i] === TEXT[i]) correct++;
    const mins = Math.max(elapsedSec, 1) / 60;
    const wpm = Math.round(correct / 5 / mins);
    const accuracy = t.length > 0 ? Math.round((correct / t.length) * 100) : 100;
    const r = submitScore(GAME_ID, wpm, `${wpm} WPM / 准确率 ${accuracy}%`);
    setResult({ ...r, wpm, accuracy });
    setRefreshKey((k) => k + 1);
  }, []);

  // 倒计时
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // 时间到自动结束
  useEffect(() => {
    if (running && timeLeft === 0) finish();
  }, [running, timeLeft, finish]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const v = e.target.value;
    if (!running && v.length > 0) {
      setRunning(true);
      startRef.current = Date.now();
    }
    typedRef.current = v;
    setTyped(v);
    if (v.length >= TEXT.length) finish();
  };

  const restart = () => {
    submittedRef.current = false;
    typedRef.current = "";
    setTyped("");
    setTimeLeft(DURATION);
    setRunning(false);
    setFinished(false);
    setResult(null);
    startRef.current = null;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 实时统计：直接从 state 推导，避免在渲染中读取 ref
  let correctSoFar = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === TEXT[i]) correctSoFar++;
  const elapsed = DURATION - timeLeft; // 已用秒数
  const mins = elapsed > 0 ? elapsed / 60 : 0;
  const wpm = mins > 0 ? Math.round(correctSoFar / 5 / mins) : 0;
  const accuracy =
    typed.length > 0 ? Math.round((correctSoFar / typed.length) * 100) : 100;

  const stats: GameStat[] = [
    { label: "WPM", value: wpm },
    { label: "准确率", value: `${accuracy}%` },
    { label: "剩余时间", value: `${timeLeft}s` },
    { label: "已输入", value: typed.length },
  ];

  return (
    <GameShell
      gameId={GAME_ID}
      title="打字速度测试"
      description="60 秒倒计时打字挑战，中英文混合文本，实时计算 WPM 与准确率"
      instructions={`点击下方文本区域开始输入，首次输入即开始 60 秒倒计时。
绿色表示输入正确，红色表示输入错误，紫色高亮为当前输入位置。
WPM = (正确字符数 / 5) / 已用分钟数；准确率 = 正确字符 / 总输入字符。
时间结束或完成全部文本后，WPM 将自动提交到排行榜。`}
      icon={Keyboard}
      stats={stats}
      shareScore={wpm}
      refreshKey={refreshKey}
    >
      <div className="flex flex-col items-center">
        {/* 进度条 */}
        <div className="w-full h-2 bg-[#27272a] rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-[#8b5cf6] rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(timeLeft / DURATION) * 100}%` }}
          />
        </div>

        {/* 文本区 + 隐藏输入 */}
        <div
          className="relative w-full cursor-text rounded-xl border border-[#27272a] bg-[#09090b] p-5"
          onClick={() => inputRef.current?.focus()}
        >
          <p className="font-mono text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
            {TEXT.split("").map((ch, i) => {
              let cls = "text-slate-600";
              if (i < typed.length) {
                cls =
                  typed[i] === ch
                    ? "text-emerald-400"
                    : "text-red-400 bg-red-500/20 rounded";
              } else if (i === typed.length) {
                cls = "text-white bg-[#8b5cf6]/40 rounded";
              }
              return (
                <span key={i} className={cls}>
                  {ch}
                </span>
              );
            })}
          </p>
          <input
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            disabled={finished}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 opacity-0 w-full h-full cursor-text"
            aria-label="打字输入框"
          />
        </div>

        {!finished && (
          <p className="mt-3 text-xs text-slate-500">
            {running ? "正在测试，保持输入…" : "点击文本区域并开始打字，首次输入开始计时"}
          </p>
        )}

        {finished && result && (
          <div className="mt-5 w-full max-w-md rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
            <div className="text-4xl mb-2">⌨️</div>
            <h3 className="text-lg font-bold mb-3">测试完成</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-slate-500">WPM</div>
                <div className="text-2xl font-bold text-[#a78bfa]">{result.wpm}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">准确率</div>
                <div className="text-2xl font-bold text-[#a78bfa]">
                  {result.accuracy}%
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
              <RotateCcw className="w-4 h-4" /> 再测一次
            </button>
          </div>
        )}

        {!finished && (
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
