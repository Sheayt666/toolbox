"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileQuestion, Plus, Printer, RotateCcw, CheckCircle, XCircle, Settings } from "lucide-react";

type ProblemType = "add" | "sub" | "mul" | "div" | "mixed";
type Difficulty = "easy" | "medium" | "hard";

interface Problem {
  id: number;
  text: string;
  answer: number;
  type: ProblemType;
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(type: ProblemType, difficulty: Difficulty, id: number): Problem {
  let a: number, b: number, text: string, answer: number;
  let actualType = type;
  if (type === "mixed") {
    const types: ProblemType[] = ["add", "sub", "mul", "div"];
    actualType = types[randInt(0, 3)];
  }

  const ranges: Record<Difficulty, { add: [number, number]; sub: [number, number]; mul: [number, number]; div: [number, number] }> = {
    easy: { add: [1, 20], sub: [1, 20], mul: [1, 9], div: [1, 9] },
    medium: { add: [10, 99], sub: [10, 99], mul: [2, 12], div: [2, 12] },
    hard: { add: [100, 999], sub: [100, 999], mul: [11, 25], div: [2, 20] },
  };

  const r = ranges[difficulty];

  switch (actualType) {
    case "add":
      a = randInt(r.add[0], r.add[1]);
      b = randInt(r.add[0], r.add[1]);
      text = `${a} + ${b} = ?`;
      answer = a + b;
      break;
    case "sub":
      a = randInt(r.sub[0], r.sub[1]);
      b = randInt(r.sub[0], a);
      text = `${a} - ${b} = ?`;
      answer = a - b;
      break;
    case "mul":
      a = randInt(r.mul[0], r.mul[1]);
      b = randInt(r.mul[0], r.mul[1]);
      text = `${a} × ${b} = ?`;
      answer = a * b;
      break;
    case "div":
      b = randInt(r.div[0], r.div[1]);
      answer = randInt(r.div[0], r.div[1]);
      a = b * answer;
      text = `${a} ÷ ${b} = ?`;
      break;
    default:
      a = 0; b = 0; text = ""; answer = 0;
  }

  return { id, text, answer, type: actualType };
}

function generateWordProblem(difficulty: Difficulty, id: number): Problem {
  const templates = [
    (a: number, b: number) => ({
      text: `小明有${a}个苹果，吃了${b}个，还剩多少个？`,
      answer: a - b,
    }),
    (a: number, b: number) => ({
      text: `教室里有${a}排座位，每排${b}个座位，一共有多少个座位？`,
      answer: a * b,
    }),
    (a: number, b: number) => ({
      text: `老师准备了${a}颗糖果，平均分给${b}个小朋友，每个小朋友分到几颗？`,
      answer: Math.floor(a / b),
    }),
    (a: number, b: number) => ({
      text: `小红第一天看了${a}页书，第二天看了${b}页，两天一共看了多少页？`,
      answer: a + b,
    }),
    (a: number, b: number) => ({
      text: `商店有${a}个鸡蛋，卖出了${b}个，又进了${b}个，现在有多少个？`,
      answer: a,
    }),
    (a: number, b: number) => ({
      text: `一根绳子长${a}厘米，剪掉${b}厘米，还剩多少厘米？`,
      answer: a - b,
    }),
  ];

  const range = difficulty === "easy" ? [5, 30] : difficulty === "medium" ? [20, 99] : [50, 500];
  const a = randInt(range[0], range[1]);
  const b = randInt(2, Math.min(a, 12));
  const template = templates[randInt(0, templates.length - 1)];
  const result = template(a, b);
  return { id, text: result.text, answer: result.answer, type: "mixed" };
}

export default function MathProblemGeneratorPage() {
  const [problemType, setProblemType] = useState<ProblemType>("mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [count, setCount] = useState(10);
  const [useWord, setUseWord] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  const generateProblems = useCallback(() => {
    const newProblems: Problem[] = [];
    for (let i = 0; i < count; i++) {
      if (useWord) {
        newProblems.push(generateWordProblem(difficulty, i + 1));
      } else {
        newProblems.push(generateProblem(problemType, difficulty, i + 1));
      }
    }
    setProblems(newProblems);
    setAnswers({});
    setShowAnswers(false);
  }, [problemType, difficulty, count, useWord]);

  const checkAnswers = () => {
    setShowAnswers(true);
  };

  const correctCount = useMemo(() => {
    if (!showAnswers) return 0;
    return problems.filter((p) => {
      const userAns = answers[p.id];
      return userAns !== undefined && Number(userAns) === p.answer;
    }).length;
  }, [problems, answers, showAnswers]);

  const handlePrint = () => {
    window.print();
  };

  const typeLabels: Record<ProblemType, string> = {
    add: "加法",
    sub: "减法",
    mul: "乘法",
    div: "除法",
    mixed: "混合运算",
  };

  const diffLabels: Record<Difficulty, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难",
  };

  return (
    <ToolLayout
      title="数学题生成器"
      description="自动生成小学数学应用题，可打印练习"
      toolId="math-problem-generator"
      icon={FileQuestion}
      category="教育学习"
      slug="math-problem-generator"
    >
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Settings */}
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-semibold text-white">题目设置</h2>
          </div>

          {/* Type selection */}
          {!useWord && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">题型</label>
              <div className="grid grid-cols-5 gap-2">
                {(Object.keys(typeLabels) as ProblemType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setProblemType(t)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      problemType === t
                        ? "bg-violet-500 text-white"
                        : "bg-[#18181b] text-slate-400 border border-[#3f3f46] hover:text-white"
                    }`}
                  >
                    {typeLabels[t]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">难度</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(diffLabels) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    difficulty === d
                      ? "bg-violet-500 text-white"
                      : "bg-[#18181b] text-slate-400 border border-[#3f3f46] hover:text-white"
                  }`}
                >
                  {diffLabels[d]}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              题目数量：<span className="text-violet-400">{count} 题</span>
            </label>
            <input
              type="range"
              min={5}
              max={50}
              step={5}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full h-2 bg-[#3f3f46] rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </div>

          {/* Word problem toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setUseWord(!useWord)}
              className={`relative w-11 h-6 rounded-full transition-colors ${useWord ? "bg-violet-500" : "bg-[#3f3f46]"}`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  useWord ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-slate-300">应用题模式</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateProblems}
              className="flex items-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              生成题目
            </button>
            {problems.length > 0 && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#18181b] border border-[#3f3f46] text-slate-300 hover:text-white rounded-lg font-medium transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  打印
                </button>
                <button
                  onClick={checkAnswers}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  对答案
                </button>
              </>
            )}
          </div>
        </div>

        {/* Score */}
        {showAnswers && problems.length > 0 && (
          <div className="bg-gradient-to-br from-violet-500/10 to-transparent rounded-xl border border-violet-500/20 p-5 text-center">
            <div className="text-sm text-slate-400 mb-1">本次成绩</div>
            <div className="text-4xl font-bold text-violet-400">
              {correctCount}<span className="text-2xl text-slate-500"> / {problems.length}</span>
            </div>
            <div className="text-sm text-slate-400 mt-1">
              正确率 {((correctCount / problems.length) * 100).toFixed(0)}%
              {correctCount === problems.length ? " 🏆 全对！" : correctCount >= problems.length * 0.8 ? " 很棒！" : " 继续加油！"}
            </div>
          </div>
        )}

        {/* Problems list */}
        {problems.length > 0 && (
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {problems.map((p) => {
                const userAns = answers[p.id];
                const isCorrect = showAnswers && userAns !== undefined && Number(userAns) === p.answer;
                const isWrong = showAnswers && (userAns === undefined || Number(userAns) !== p.answer);
                return (
                  <div
                    key={p.id}
                    className={`bg-[#18181b] rounded-lg border p-4 ${
                      isCorrect ? "border-emerald-500/40" : isWrong ? "border-red-500/40" : "border-[#3f3f46]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 mr-2">{p.id}.</span>
                        <span className="text-base text-white">{p.text}</span>
                      </div>
                      <input
                        type="number"
                        value={userAns || ""}
                        onChange={(e) => setAnswers({ ...answers, [p.id]: e.target.value })}
                        disabled={showAnswers}
                        className="w-20 px-2 py-1.5 bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg text-center text-sm focus:outline-none focus:border-violet-500 disabled:opacity-60"
                        placeholder="答案"
                      />
                    </div>
                    {showAnswers && (
                      <div className="mt-2 flex items-center gap-2 text-sm">
                        {isCorrect ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> 正确
                          </span>
                        ) : (
                          <span className="text-red-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> 正确答案：{p.answer}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {problems.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <FileQuestion className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">点击"生成题目"开始练习</p>
            <p className="text-sm mt-2">支持加减乘除、混合运算和应用题，可打印练习</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
