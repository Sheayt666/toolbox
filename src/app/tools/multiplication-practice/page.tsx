"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Table2, Play, RotateCcw, CheckCircle, XCircle, Trophy, Star, Zap } from "lucide-react";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Question {
  a: number;
  b: number;
  answer: number;
}

interface ResultItem {
  question: Question;
  userAns: number | null;
  correct: boolean;
}

export default function MultiplicationPracticePage() {
  const [range, setRange] = useState<[number, number]>([2, 9]);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const generateQuestion = useCallback((): Question => {
    const a = randInt(range[0], range[1]);
    const b = randInt(range[0], range[1]);
    return { a, b, answer: a * b };
  }, [range]);

  const nextQuestion = useCallback(() => {
    setCurrentQ(generateQuestion());
    setUserInput("");
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [generateQuestion]);

  const startGame = () => {
    setGameState("playing");
    setQuestionIndex(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setResults([]);
    nextQuestion();
  };

  const submitAnswer = () => {
    if (!currentQ || userInput.trim() === "") return;

    const userAns = Number(userInput);
    const isCorrect = userAns === currentQ.answer;

    setResults((prev) => [...prev, { question: currentQ, userAns: isNaN(userAns) ? null : userAns, correct: isCorrect }]);
    setFeedback(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setMaxStreak((m) => Math.max(m, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      const nextIdx = questionIndex + 1;
      if (nextIdx >= totalQuestions) {
        setGameState("finished");
      } else {
        setQuestionIndex(nextIdx);
        nextQuestion();
      }
    }, isCorrect ? 300 : 800);
  };

  const resetGame = () => {
    setGameState("idle");
    setCurrentQ(null);
    setUserInput("");
    setResults([]);
    setFeedback(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  const accuracy = results.length > 0 ? ((correctCount / results.length) * 100).toFixed(0) : "0";
  const speed = results.length > 0 ? (results.length / (totalQuestions * 3)).toFixed(1) : "0";

  const rangeOptions: { label: string; value: [number, number] }[] = [
    { label: "2-5", value: [2, 5] },
    { label: "2-9", value: [2, 9] },
    { label: "6-9", value: [6, 9] },
    { label: "1-12", value: [1, 12] },
  ];

  return (
    <ToolLayout
      title="乘法口诀练习"
      description="九九乘法口诀练习模式，随机出题自动判分"
      toolId="multiplication-practice"
      icon={Table2}
      category="教育学习"
      slug="multiplication-practice"
    >
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        {/* Idle - Settings */}
        {gameState === "idle" && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Table2 className="w-5 h-5 text-orange-400" />
              <h2 className="text-base font-semibold text-white">练习设置</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">乘数范围</label>
              <div className="grid grid-cols-4 gap-2">
                {rangeOptions.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setRange(opt.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      range[0] === opt.value[0] && range[1] === opt.value[1]
                        ? "bg-orange-500 text-white"
                        : "bg-[#18181b] text-slate-400 border border-[#3f3f46] hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                题目数量：<span className="text-orange-400">{totalQuestions} 题</span>
              </label>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full h-2 bg-[#3f3f46] rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            <button
              onClick={startGame}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5" />
              开始练习
            </button>
          </div>
        )}

        {/* Playing */}
        {gameState === "playing" && currentQ && (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between gap-3">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] px-4 py-2.5 flex-1 text-center">
                <div className="text-xs text-slate-500">进度</div>
                <div className="text-base font-bold text-white">
                  {questionIndex + 1}/{totalQuestions}
                </div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-emerald-500/20 px-4 py-2.5 text-center">
                <div className="text-xs text-slate-500">正确</div>
                <div className="text-base font-bold text-emerald-400">{correctCount}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-amber-500/20 px-4 py-2.5 text-center">
                <div className="text-xs text-slate-500 flex items-center gap-1 justify-center">
                  <Zap className="w-3 h-3" />连击
                </div>
                <div className="text-base font-bold text-amber-400">{streak}🔥</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all"
                style={{ width: `${(questionIndex / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div
              className={`rounded-2xl border p-8 text-center transition-colors ${
                feedback === "correct"
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : feedback === "wrong"
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/20"
              }`}
            >
              {feedback === null && (
                <>
                  <div className="text-xs text-slate-400 mb-4">快速心算，输入答案</div>
                  <div className="text-5xl sm:text-6xl font-bold text-white mb-8 tracking-wide">
                    {currentQ.a} × {currentQ.b} = <span className="text-orange-400">?</span>
                  </div>
                  <input
                    ref={inputRef}
                    type="number"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="w-48 mx-auto px-4 py-3 bg-[#0d0d0f] border-2 border-[#3f3f46] text-white rounded-xl text-3xl text-center font-bold focus:outline-none focus:border-orange-500 transition-colors"
                    placeholder="?"
                    autoFocus
                  />
                  <div className="mt-6">
                    <button
                      onClick={submitAnswer}
                      className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      提交答案 (Enter)
                    </button>
                  </div>
                </>
              )}
              {feedback === "correct" && (
                <div className="py-8">
                  <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-emerald-400 mb-2">正确！</div>
                  <div className="text-xl text-slate-300">
                    {currentQ.a} × {currentQ.b} = {currentQ.answer}
                  </div>
                  {streak >= 3 && (
                    <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-medium">
                      <Star className="w-4 h-4 fill-current" />
                      {streak}连击！
                    </div>
                  )}
                </div>
              )}
              {feedback === "wrong" && (
                <div className="py-8">
                  <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-red-400 mb-2">错误！</div>
                  <div className="text-xl text-slate-300">
                    {currentQ.a} × {currentQ.b} = <span className="text-emerald-400 font-bold">{currentQ.answer}</span>
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    你答的是: {userInput || "—"}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </button>
          </>
        )}

        {/* Finished */}
        {gameState === "finished" && (
          <>
            <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-2xl border border-orange-500/20 p-8 text-center">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <div className="text-sm text-slate-400 mb-1">练习完成！</div>
              <div className="text-5xl font-bold text-orange-400 mb-2">
                {correctCount}<span className="text-2xl text-slate-500"> / {totalQuestions}</span>
              </div>
              <div className="text-lg text-slate-300 mb-4">
                正确率 {accuracy}% {Number(accuracy) >= 90 ? "🏆 太棒了！" : Number(accuracy) >= 70 ? "👍 不错！" : "💪 继续加油！"}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">最高连击</div>
                  <div className="text-2xl font-bold text-amber-400 flex items-center gap-1">
                    <Zap className="w-5 h-5" />{maxStreak}
                  </div>
                </div>
                <div className="w-px h-12 bg-[#3f3f46]" />
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">正确题数</div>
                  <div className="text-2xl font-bold text-emerald-400">{correctCount}</div>
                </div>
                <div className="w-px h-12 bg-[#3f3f46]" />
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">错误题数</div>
                  <div className="text-2xl font-bold text-red-400">{totalQuestions - correctCount}</div>
                </div>
              </div>
            </div>

            {/* Wrong answers review */}
            {results.filter((r) => !r.correct).length > 0 && (
              <div className="bg-[#27272a] rounded-xl border border-red-500/20 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> 错题回顾
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {results.filter((r) => !r.correct).map((r, i) => (
                    <div key={i} className="px-3 py-2 bg-red-500/10 rounded-lg text-sm text-slate-300">
                      {r.question.a} × {r.question.b} = <span className="text-emerald-400 font-bold">{r.question.answer}</span>
                      <span className="text-red-400 text-xs ml-2">(你: {r.userAns ?? "—"})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              再来一局
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
