"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, RotateCcw, Trophy } from "lucide-react";
import GameShell, { type GameStat } from "@/components/games/GameShell";
import { submitScore } from "@/lib/gamification";

const GAME_ID = "typing-test";
const DURATION = 60;
const BEST_KEY = "toolbox_typing_best_wpm";

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
  correctChars: number;
  totalChars: number;
  elapsed: number;
  isNewBest: boolean;
}

export default function TypingTestPage() {
  const [typed, setTyped] = useState("");
  const typedRef = useRef("");
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [best, setBest] = useState(0);
  const [focused, setFocused] = useState(false);

  const startRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const submittedRef = useRef(false);

  // 读取最佳 WPM
  useEffect(() => {
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
    const isNewBest = wpm > best;
    if (isNewBest) {
      setBest(wpm);
      try {
        localStorage.setItem(BEST_KEY, String(wpm));
      } catch {
        /* ignore */
      }
    }
    setResult({
      ...r,
      wpm,
      accuracy,
      correctChars: correct,
      totalChars: t.length,
      elapsed: Math.round(elapsedSec),
      isNewBest,
    });
    setRefreshKey((k) => k + 1);
  }, [best]);

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

  // 实时统计
  let correctSoFar = 0;
  for (let i = 0; i < typed.length; i++) if (typed[i] === TEXT[i]) correctSoFar++;
  const elapsed = DURATION - timeLeft;
  const mins = elapsed > 0 ? elapsed / 60 : 0;
  const wpm = mins > 0 ? Math.round(correctSoFar / 5 / mins) : 0;
  const accuracy =
    typed.length > 0 ? Math.round((correctSoFar / typed.length) * 100) : 100;
  const progress = Math.round((typed.length / TEXT.length) * 100);

  const stats: GameStat[] = [
    { label: "WPM", value: wpm },
    { label: "准确率", value: `${accuracy}%` },
    { label: "剩余时间", value: `${timeLeft}s` },
    { label: "进度", value: `${progress}%` },
  ];

  const timePercent = (timeLeft / DURATION) * 100;

  return (
    <GameShell
      gameId={GAME_ID}
      title="打字速度测试"
      description="60 秒倒计时打字挑战，中英文混合文本，实时计算 WPM 与准确率"
      instructions={`点击下方文本区域开始输入，首次输入即开始 60 秒倒计时。
绿色表示输入正确，红色表示输入错误，紫色闪烁光标为当前输入位置。
WPM = (正确字符数 / 5) / 已用分钟数；准确率 = 正确字符 / 总输入字符。
时间结束或完成全部文本后，WPM 将自动提交到排行榜。`}
      icon={Keyboard}
      iconEmoji="⌨️"
      iconGradient="from-blue-500 to-cyan-500"
      stats={stats}
      shareScore={result?.wpm ?? wpm}
      refreshKey={refreshKey}
    >
      <style>{`
        @keyframes typing-blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .typing-cursor {
          display: inline-block;
          width: 2px;
          height: 1.1em;
          background: #c084fc;
          vertical-align: text-bottom;
          margin-left: 1px;
          animation: typing-blink 1s step-end infinite;
          border-radius: 1px;
        }
        @keyframes typing-float-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-float-in { animation: typing-float-in 0.4s ease-out forwards; }
      `}</style>

      <div className="flex flex-col items-center">
        {/* 进度条 */}
        <div className="w-full h-2 bg-[#27272a] rounded-full mb-5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{
              width: `${timePercent}%`,
              background:
                timePercent > 25
                  ? "linear-gradient(90deg, #8b5cf6, #c084fc)"
                  : "linear-gradient(90deg, #ef4444, #f59e0b)",
              boxShadow: "0 0 10px rgba(168, 85, 247, 0.4)",
            }}
          />
        </div>

        {finished && result ? (
          /* ===== 结果界面 ===== */
          <div className="w-full max-w-2xl typing-float-in">
            <div className="rounded-xl border border-[#27272a] bg-[#09090b] p-6 text-center">
              <div className="text-5xl mb-3">⌨️</div>
              <h3 className="text-xl font-bold mb-1">测试完成</h3>
              {result.isNewBest && (
                <div className="inline-flex items-center gap-1 mt-2 mb-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-medium animate-scale-in">
                  <Trophy className="w-3 h-3" /> 新纪录！
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 mb-4 mt-4">
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">WPM</div>
                  <div className="text-2xl font-bold text-[#a78bfa]">{result.wpm}</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">准确率</div>
                  <div className="text-2xl font-bold text-emerald-400">{result.accuracy}%</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">正确字符</div>
                  <div className="text-2xl font-bold text-white">{result.correctChars}</div>
                </div>
                <div className="bg-[#18181b] rounded-lg p-3 border border-[#27272a]">
                  <div className="text-xs text-slate-500 mb-1">用时</div>
                  <div className="text-2xl font-bold text-white">{result.elapsed}s</div>
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
                  历史最佳 <span className="text-amber-400 font-medium">{best} WPM</span>
                </span>
              </div>
              <button
                onClick={restart}
                className="inline-flex items-center gap-2 h-11 px-6 text-sm font-medium text-white bg-[#8b5cf6] hover:bg-[#7c3aed] rounded-xl transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" /> 再测一次
              </button>
            </div>
          </div>
        ) : (
          /* ===== 游戏界面 ===== */
          <>
            {/* 文本区 + 隐藏输入 */}
            <div
              className={`relative w-full cursor-text rounded-xl border bg-[#09090b] p-5 transition-colors ${
                focused
                  ? "border-[#8b5cf6]/50 shadow-[0_0_0_3px_rgba(168,85,247,0.1)]"
                  : "border-[#27272a]"
              }`}
              onClick={() => inputRef.current?.focus()}
            >
              <p className="font-mono text-xl sm:text-2xl lg:text-3xl leading-relaxed whitespace-pre-wrap break-words">
                {TEXT.split("").map((ch, i) => {
                  let cls = "text-slate-600";
                  if (i < typed.length) {
                    cls =
                      typed[i] === ch
                        ? "text-emerald-400"
                        : "text-red-400 bg-red-500/20 rounded";
                  } else if (i === typed.length) {
                    cls = "text-white bg-[#8b5cf6]/30 rounded";
                  }
                  return (
                    <span key={i} className={cls}>
                      {ch}
                      {i === typed.length && (
                        <span className="typing-cursor" />
                      )}
                    </span>
                  );
                })}
                {/* 光标在末尾的情况 */}
                {typed.length >= TEXT.length && !finished && (
                  <span className="typing-cursor" />
                )}
              </p>
              <input
                ref={inputRef}
                value={typed}
                onChange={handleChange}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={finished}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="absolute inset-0 opacity-0 w-full h-full cursor-text text-xl sm:text-2xl"
                aria-label="打字输入框"
              />
            </div>

            {!finished && (
              <>
                <p className="mt-3 text-xs text-slate-500">
                  {running ? (
                    <span className="text-[#a78bfa]">正在测试，保持输入…</span>
                  ) : (
                    <span className="animate-pulse">
                      点击文本区域并开始打字，首次输入开始计时
                    </span>
                  )}
                </p>
                <button
                  onClick={restart}
                  className="mt-5 inline-flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> 重新开始
                </button>
              </>
            )}
          </>
        )}
      </div>
    </GameShell>
  );
}
