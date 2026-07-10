"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Grid3x3, BookOpen, Brain, RotateCcw, CheckCircle, XCircle, Trophy, ChevronRight } from "lucide-react";

type Mode = "table" | "practice" | "test";

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function MultiplicationTablePage() {
  const [mode, setMode] = useState<Mode>("table");
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);

  // Practice mode
  const [practiceRow, setPracticeRow] = useState<number | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<{ a: number; b: number; answer: number }[]>([]);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceInput, setPracticeInput] = useState("");
  const [practiceCorrect, setPracticeCorrect] = useState(0);
  const [practiceWrong, setPracticeWrong] = useState(0);
  const [practiceFeedback, setPracticeFeedback] = useState<"correct" | "wrong" | null>(null);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const practiceInputRef = useRef<HTMLInputElement>(null);

  // Test mode
  const [testQuestions, setTestQuestions] = useState<{ a: number; b: number; answer: number }[]>([]);
  const [testIndex, setTestIndex] = useState(0);
  const [testInput, setTestInput] = useState("");
  const [testCorrect, setTestCorrect] = useState(0);
  const [testWrong, setTestWrong] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [testResults, setTestResults] = useState<{ a: number; b: number; answer: number; userAns: number | null; correct: boolean }[]>([]);
  const testInputRef = useRef<HTMLInputElement>(null);

  // Table mode: click a cell to practice that row
  const handleCellClick = (row: number) => {
    setMode("practice");
    setPracticeRow(row);
    startPractice(row);
  };

  const startPractice = useCallback((row: number) => {
    const questions = [];
    for (let i = 1; i <= 9; i++) {
      questions.push({ a: row, b: i, answer: row * i });
    }
    // Shuffle
    for (let i = questions.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    setPracticeQuestions(questions);
    setPracticeIndex(0);
    setPracticeInput("");
    setPracticeCorrect(0);
    setPracticeWrong(0);
    setPracticeFeedback(null);
    setPracticeFinished(false);
    setTimeout(() => practiceInputRef.current?.focus(), 100);
  }, []);

  const submitPractice = () => {
    if (practiceQuestions.length === 0 || practiceInput.trim() === "") return;
    const q = practiceQuestions[practiceIndex];
    const userAns = Number(practiceInput);
    const isCorrect = userAns === q.answer;

    setPracticeFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setPracticeCorrect((c) => c + 1);
    } else {
      setPracticeWrong((c) => c + 1);
    }

    setTimeout(() => {
      const nextIdx = practiceIndex + 1;
      if (nextIdx >= practiceQuestions.length) {
        setPracticeFinished(true);
      } else {
        setPracticeIndex(nextIdx);
        setPracticeInput("");
        setPracticeFeedback(null);
        setTimeout(() => practiceInputRef.current?.focus(), 50);
      }
    }, isCorrect ? 400 : 900);
  };

  const startTest = () => {
    const questions: { a: number; b: number; answer: number }[] = [];
    const used = new Set<string>();
    while (questions.length < 20) {
      const a = randInt(2, 9);
      const b = randInt(2, 9);
      const key = `${a}x${b}`;
      if (!used.has(key)) {
        used.add(key);
        questions.push({ a, b, answer: a * b });
      }
    }
    setTestQuestions(questions);
    setTestIndex(0);
    setTestInput("");
    setTestCorrect(0);
    setTestWrong(0);
    setTestFinished(false);
    setTestResults([]);
    setTimeout(() => testInputRef.current?.focus(), 100);
  };

  const submitTest = () => {
    if (testQuestions.length === 0 || testInput.trim() === "") return;
    const q = testQuestions[testIndex];
    const userAns = Number(testInput);
    const isCorrect = userAns === q.answer;

    setTestResults((prev) => [...prev, { ...q, userAns: isNaN(userAns) ? null : userAns, correct: isCorrect }]);
    if (isCorrect) {
      setTestCorrect((c) => c + 1);
    } else {
      setTestWrong((c) => c + 1);
    }

    const nextIdx = testIndex + 1;
    if (nextIdx >= testQuestions.length) {
      setTestFinished(true);
    } else {
      setTestIndex(nextIdx);
      setTestInput("");
      setTimeout(() => testInputRef.current?.focus(), 50);
    }
  };

  const resetPractice = () => {
    setMode("table");
    setPracticeRow(null);
    setPracticeQuestions([]);
    setPracticeFinished(false);
  };

  const resetTest = () => {
    setMode("table");
    setTestQuestions([]);
    setTestFinished(false);
  };

  const accuracy = testResults.length > 0 ? ((testCorrect / testResults.length) * 100).toFixed(0) : "0";

  return (
    <ToolLayout
      title="九九乘法表"
      description="交互式九九乘法口诀表，支持练习模式和背诵测试"
      toolId="multiplication-table"
      icon={Grid3x3}
      category="教育学习"
      slug="multiplication-table"
    >
      <div className="max-w-4xl mx-auto space-y-6 p-6">
        {/* Mode tabs */}
        <div className="flex gap-2 bg-[#27272a] rounded-xl border border-[#3f3f46] p-1.5">
          <button
            onClick={() => setMode("table")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "table" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            乘法表
          </button>
          <button
            onClick={() => { setMode("practice"); if (practiceRow === null) setPracticeRow(2); startPractice(practiceRow || 2); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "practice" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            逐行练习
          </button>
          <button
            onClick={() => { setMode("test"); startTest(); }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === "test" ? "bg-indigo-500 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            背诵测试
          </button>
        </div>

        {/* Table Mode */}
        {mode === "table" && (
          <>
            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4 sm:p-6">
              <div className="text-center text-sm text-slate-400 mb-4">
                点击任意行数字，进入该行乘法口诀练习
              </div>
              {/* Multiplication table grid */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-12 h-12 bg-indigo-500/20 border border-[#3f3f46] rounded-tl-lg">
                        <Grid3x3 className="w-5 h-5 text-indigo-400 mx-auto" />
                      </th>
                      {Array.from({ length: 9 }, (_, i) => (
                        <th
                          key={i}
                          className="w-12 h-12 bg-indigo-500/10 border border-[#3f3f46] text-indigo-400 font-bold text-lg"
                        >
                          {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 9 }, (_, rowIdx) => (
                      <tr key={rowIdx}>
                        <td
                          onClick={() => handleCellClick(rowIdx + 1)}
                          className="w-12 h-12 bg-indigo-500/10 border border-[#3f3f46] text-indigo-400 font-bold text-lg text-center cursor-pointer hover:bg-indigo-500/30 transition-colors"
                        >
                          {rowIdx + 1}
                        </td>
                        {Array.from({ length: 9 }, (_, colIdx) => {
                          const value = (rowIdx + 1) * (colIdx + 1);
                          const isHovered = hoveredCell?.row === rowIdx + 1 || hoveredCell?.col === colIdx + 1;
                          return (
                            <td
                              key={colIdx}
                              onMouseEnter={() => setHoveredCell({ row: rowIdx + 1, col: colIdx + 1 })}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={() => handleCellClick(rowIdx + 1)}
                              className={`w-12 h-12 border border-[#3f3f46] text-center font-medium text-sm cursor-pointer transition-colors ${
                                isHovered
                                  ? "bg-indigo-500/30 text-white"
                                  : "bg-[#18181b] text-slate-300 hover:bg-[#27272a]"
                              }`}
                            >
                              {value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                乘法口诀表（文字版）
              </h3>
              <div className="space-y-3">
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}的口诀：</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-300">
                      {Array.from({ length: i + 1 }, (_, j) => (
                        <span key={j}>
                          {j + 1}{i > j ? `×${i + 1}` : ""}{(j === i) ? "" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {Array.from({ length: 9 }, (_, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold text-sm flex-shrink-0 mt-0.5">{i + 1}的乘法口诀：</span>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-300">
                      {Array.from({ length: 9 }, (_, j) => (
                        <span key={j} className="whitespace-nowrap">
                          {j + 1}×{i + 1}={((j + 1) * (i + 1))}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Practice Mode */}
        {mode === "practice" && !practiceFinished && practiceQuestions.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] px-4 py-2.5">
                <div className="text-xs text-slate-500">练习行</div>
                <div className="text-base font-bold text-indigo-400">{practiceRow}的乘法</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] px-4 py-2.5">
                <div className="text-xs text-slate-500">进度</div>
                <div className="text-base font-bold text-white">{practiceIndex + 1}/{practiceQuestions.length}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-emerald-500/20 px-4 py-2.5">
                <div className="text-xs text-slate-500">正确</div>
                <div className="text-base font-bold text-emerald-400">{practiceCorrect}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-red-500/20 px-4 py-2.5">
                <div className="text-xs text-slate-500">错误</div>
                <div className="text-base font-bold text-red-400">{practiceWrong}</div>
              </div>
            </div>

            <div
              className={`rounded-2xl border p-8 text-center transition-colors ${
                practiceFeedback === "correct"
                  ? "bg-emerald-500/10 border-emerald-500/40"
                  : practiceFeedback === "wrong"
                  ? "bg-red-500/10 border-red-500/40"
                  : "bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20"
              }`}
            >
              {practiceFeedback === null && (
                <>
                  <div className="text-xs text-slate-400 mb-4">输入正确答案</div>
                  <div className="text-5xl sm:text-6xl font-bold text-white mb-8">
                    {practiceQuestions[practiceIndex].a} × {practiceQuestions[practiceIndex].b} = <span className="text-indigo-400">?</span>
                  </div>
                  <input
                    ref={practiceInputRef}
                    type="number"
                    value={practiceInput}
                    onChange={(e) => setPracticeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitPractice()}
                    className="w-48 mx-auto px-4 py-3 bg-[#0d0d0f] border-2 border-[#3f3f46] text-white rounded-xl text-3xl text-center font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="?"
                    autoFocus
                  />
                  <div className="mt-6">
                    <button
                      onClick={submitPractice}
                      className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
                    >
                      提交 (Enter)
                    </button>
                  </div>
                </>
              )}
              {practiceFeedback === "correct" && (
                <div className="py-8">
                  <CheckCircle className="w-20 h-20 text-emerald-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-emerald-400 mb-2">正确！</div>
                  <div className="text-xl text-slate-300">
                    {practiceQuestions[practiceIndex].a} × {practiceQuestions[practiceIndex].b} = {practiceQuestions[practiceIndex].answer}
                  </div>
                </div>
              )}
              {practiceFeedback === "wrong" && (
                <div className="py-8">
                  <XCircle className="w-20 h-20 text-red-400 mx-auto mb-4" />
                  <div className="text-3xl font-bold text-red-400 mb-2">错误！</div>
                  <div className="text-xl text-slate-300">
                    {practiceQuestions[practiceIndex].a} × {practiceQuestions[practiceIndex].b} = <span className="text-emerald-400 font-bold">{practiceQuestions[practiceIndex].answer}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {[2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => { setPracticeRow(n); startPractice(n); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    practiceRow === n ? "bg-indigo-500 text-white" : "bg-[#27272a] text-slate-400 border border-[#3f3f46] hover:text-white"
                  }`}
                >
                  {n}的口诀
                </button>
              ))}
            </div>

            <button
              onClick={resetPractice}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              返回乘法表
            </button>
          </>
        )}

        {/* Practice Finished */}
        {mode === "practice" && practiceFinished && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20 p-8 text-center">
            <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <div className="text-sm text-slate-400 mb-1">{practiceRow}的乘法口诀练习完成！</div>
            <div className="text-5xl font-bold text-indigo-400 mb-2">
              {practiceCorrect}<span className="text-2xl text-slate-500"> / {practiceQuestions.length}</span>
            </div>
            <div className="text-lg text-slate-300">
              正确率 {((practiceCorrect / practiceQuestions.length) * 100).toFixed(0)}%
            </div>
            <button
              onClick={() => startPractice(practiceRow || 2)}
              className="mt-6 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
            >
              再练一次
            </button>
          </div>
        )}

        {/* Test Mode */}
        {mode === "test" && !testFinished && testQuestions.length > 0 && (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] px-4 py-2.5">
                <div className="text-xs text-slate-500">进度</div>
                <div className="text-base font-bold text-white">{testIndex + 1}/20</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-emerald-500/20 px-4 py-2.5">
                <div className="text-xs text-slate-500">正确</div>
                <div className="text-base font-bold text-emerald-400">{testCorrect}</div>
              </div>
              <div className="bg-[#27272a] rounded-xl border border-red-500/20 px-4 py-2.5">
                <div className="text-xs text-slate-500">错误</div>
                <div className="text-base font-bold text-red-400">{testWrong}</div>
              </div>
            </div>

            <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${(testIndex / 20) * 100}%` }}
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20 p-8 text-center">
              <div className="text-xs text-slate-400 mb-4">背诵测试 — 共20题</div>
              <div className="text-5xl sm:text-6xl font-bold text-white mb-8">
                {testQuestions[testIndex].a} × {testQuestions[testIndex].b} = <span className="text-indigo-400">?</span>
              </div>
              <input
                ref={testInputRef}
                type="number"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitTest()}
                className="w-48 mx-auto px-4 py-3 bg-[#0d0d0f] border-2 border-[#3f3f46] text-white rounded-xl text-3xl text-center font-bold focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="?"
                autoFocus
              />
              <div className="mt-6">
                <button
                  onClick={submitTest}
                  className="px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
                >
                  下一题 (Enter)
                </button>
              </div>
            </div>
          </>
        )}

        {/* Test Finished */}
        {mode === "test" && testFinished && (
          <>
            <div className="bg-gradient-to-br from-indigo-500/10 to-transparent rounded-2xl border border-indigo-500/20 p-8 text-center">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <div className="text-sm text-slate-400 mb-1">背诵测试完成！</div>
              <div className="text-5xl font-bold text-indigo-400 mb-2">
                {testCorrect}<span className="text-2xl text-slate-500"> / 20</span>
              </div>
              <div className="text-lg text-slate-300 mb-4">
                正确率 {accuracy}% {Number(accuracy) >= 95 ? "🏆 满分通关！" : Number(accuracy) >= 80 ? "👍 很棒！" : "💪 继续加油！"}
              </div>
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="text-xs text-slate-500">正确</div>
                  <div className="text-2xl font-bold text-emerald-400">{testCorrect}</div>
                </div>
                <div className="w-px h-12 bg-[#3f3f46]" />
                <div className="text-center">
                  <div className="text-xs text-slate-500">错误</div>
                  <div className="text-2xl font-bold text-red-400">{testWrong}</div>
                </div>
              </div>
            </div>

            {testResults.filter((r) => !r.correct).length > 0 && (
              <div className="bg-[#27272a] rounded-xl border border-red-500/20 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> 错题回顾
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {testResults.filter((r) => !r.correct).map((r, i) => (
                    <div key={i} className="px-3 py-2 bg-red-500/10 rounded-lg text-sm text-slate-300">
                      {r.a} × {r.b} = <span className="text-emerald-400 font-bold">{r.answer}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startTest}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors"
            >
              <RotateCcw className="w-5 h-5" />
              再测一次
            </button>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
