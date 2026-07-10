"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Calculator, Play, Pause, RotateCcw, CheckCircle, XCircle, Trophy, Clock } from "lucide-react";

type Operation = "add" | "sub" | "mul" | "div" | "mixed";
type Difficulty = "easy" | "medium" | "hard";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Question {
  a: number;
  b: number;
  op: string;
  answer: number;
  text: string;
}

function generateQuestion(operation: Operation, difficulty: Difficulty): Question {
  let op = operation;
  if (op === "mixed") {
    const ops: Operation[] = ["add", "sub", "mul", "div"];
    op = ops[randInt(0, 3)];
  }

  const ranges: Record<Difficulty, { add: [number, number]; sub: [number, number]; mul: [number, number]; div: [number, number] }> = {
    easy: { add: [1, 20], sub: [1, 20], mul: [1, 9], div: [1, 9] },
    medium: { add: [10, 99], sub: [10, 99], mul: [2, 12], div: [2, 12] },
    hard: { add: [50, 500], sub: [50, 500], mul: [11, 25], div: [3, 20] },
  };
  const r = ranges[difficulty];
  let a: number, b: number, answer: number, opStr: string, text: string;

  switch (op) {
    case "add":
      a = randInt(r.add[0], r.add[1]);
      b = randInt(r.add[0], r.add[1]);
      opStr = "+";
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    case "sub":
      a = randInt(r.sub[0], r.sub[1]);
      b = randInt(r.sub[0], a);
      opStr = "−";
      answer = a - b;
      text = `${a} − ${b}`;
      break;
    case "mul":
      a = randInt(r.mul[0], r.mul[1]);
      b = randInt(r.mul[0], r.mul[1]);
      opStr = "×";
      answer = a * b;
      text = `${a} × ${b}`;
      break;
    case "div":
      b = randInt(r.div[0], r.div[1]);
      answer = randInt(r.div[0], r.div[1]);
      a = b * answer;
      opStr = "÷";
      text = `${a} ÷ ${b}`;
      break;
    default:
      a = 0; b = 0; answer = 0; opStr = "+"; text = "";
  }

  return { a, b, op: opStr, answer, text };
}

export default function MentalMathPracticePage() {
  const [operation, setOperation] = useState<Operation>("add");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle");
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<{ question: string; answer: number; userAns: number | null; correct: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextQuestion = useCallback(() => {
    const q = generateQuestion(operation, difficulty);
    setCurrentQ(q);
    setUserInput("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [operation, difficulty]);

  const startGame = () => {
    setGameState("playing");
    setQuestionIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setResults([]);
    setTimeLeft(totalQuestions * 10);
    nextQuestion();
  };

  const finishGame = useCallback(() => {
    setGameState("finished");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const submitAnswer = () => {
    if (!currentQ || userInput.trim() === "") return;

    const userAns = Number(userInput);
    const isCorrect = userAns === currentQ.answer;

    setResults((prev) => [
      ...prev,
      { question: currentQ.text, answer: currentQ.answer, userAns: isNaN(userAns) ? null : userAns, correct: isCorrect },
    ]);

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCount((c) => c + 1);
    }

    const nextIdx = questionIndex + 1;
    if (nextIdx >= totalQuestions) {
      finishGame();
    } else {
      setQuestionIndex(nextIdx);
      nextQuestion();
    }
  };

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            finishGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameState, timeLeft === 0, finishGame]);

  const resetGame = () => {
    setGameState("idle");
    setCurrentQ(null);
    setUserInput("");
    setResults([]);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      submitAnswer();
    }
  };

  const opLabels: Record<Operation, string> = {
    add: "加法",
    sub: "减法",
    mul: "乘法",
    div: "除法",
    mixed: "混合",
  };

  const diffLabels: Record<Difficulty, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  const accuracy = results.length > 0 ? ((correctCount / results.length) * 100).toFixed(0) : "0";

  return (
    <ToolLayout
      title="口算练习"
      description="加减乘除口算练习题，适合小学生心算能力训练"
      toolId="mental-math-practice"
      icon={Calculator}
      category="教育学习"
      slug="mental-math-practice"
    >
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        {/* Idle - Settings */}
        {gameState === "idle" && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-semibold text-white">练习设置</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">运算类型</label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(opLabels) as Operation[]).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOperation(o)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      operation === o
                        ? "bg-cyan-500 text-white"
                        : "bg-[#18181b] text-slate-400 border border-[#3f3f46] hover:text-white"
                    }`}
                  >
                    {opLabels[o]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">难度等级</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(diffLabels) as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      difficulty === d
                        ? "bg-cyan-500 text-white"
                        : "bg-[#18181b] text-slate-400 border border-[#3f3f46] hover:text-white"
                    }`}
                  >
                    {diffLabels[d]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                题目数量：<span className="text-cyan-400">{totalQuestions} 题</span>
                <span className="text-slate-500 text-xs ml-2">（每题10秒，共{totalQuestions * 10}秒）</span>
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full h-2 bg-[#3f3f46] rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            <button
              onClick={startGame}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
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
            <div className="flex items-center justify-between gap-4">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] px-4 py-3 flex-1">
                <div className="text-xs text-slate-500">进度</div>
                <div className="text-lg font-bold text-white">
                  {questionIndex + 1} / {totalQuestions}
                </div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-emerald-500/20 px-4 py-3">
                <div className="text-xs text-slate-500">正确</div>
                <div className="text-lg font-bold text-emerald-400">{correctCount}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-red-500/20 px-4 py-3">
                <div className="text-xs text-slate-500">错误</div>
                <div className="text-lg font-bold text-red-400">{wrongCount}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-amber-500/20 px-4 py-3">
                <div className="text-xs text-slate-500">倒计时</div>
                <div className={`text-lg font-bold ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-amber-400"}`}>
                  {timeLeft}s
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                style={{ width: `${((questionIndex) / totalQuestions) * 100}%` }}
              />
            </div>

            {/* Question card */}
            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent rounded-2xl border border-cyan-500/20 p-8 text-center">
              <div className="text-xs text-slate-400 mb-4">请心算并输入答案</div>
              <div className="text-5xl sm:text-6xl font-bold text-white mb-8 tracking-wide">
                {currentQ.text} = <span className="text-cyan-400">?</span>
              </div>
              <input
                ref={inputRef}
                type="number"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-48 mx-auto px-4 py-3 bg-[#0d0d0f] border-2 border-[#3f3f46] text-white rounded-xl text-3xl text-center font-bold focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="?"
                autoFocus
              />
              <div className="mt-6">
                <button
                  onClick={submitAnswer}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
                >
                  提交答案 (Enter)
                </button>
              </div>
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
            <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-2xl border border-amber-500/20 p-8 text-center">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <div className="text-sm text-slate-400 mb-1">练习完成！</div>
              <div className="text-5xl font-bold text-amber-400 mb-2">
                {correctCount}<span className="text-2xl text-slate-500"> / {totalQuestions}</span>
              </div>
              <div className="text-lg text-slate-300">
                正确率 {accuracy}% {Number(accuracy) >= 80 ? "🎉 优秀！" : Number(accuracy) >= 60 ? "👍 不错！" : "💪 继续努力！"}
              </div>
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> 正确 {correctCount}</span>
                <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-400" /> 错误 {wrongCount}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" /> 用时 {totalQuestions * 10 - timeLeft}秒</span>
              </div>
            </div>

            {/* Results detail */}
            {results.length > 0 && (
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
                <h3 className="text-sm font-semibold text-white mb-3">答题详情</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {results.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                        r.correct ? "bg-emerald-500/10" : "bg-red-500/10"
                      }`}
                    >
                      <span className="text-sm text-slate-300">
                        {i + 1}. {r.question} = {r.answer}
                      </span>
                      {r.correct ? (
                        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <span className="text-xs text-red-400 flex-shrink-0">
                          你答: {r.userAns ?? "—"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={resetGame}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition-colors"
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
