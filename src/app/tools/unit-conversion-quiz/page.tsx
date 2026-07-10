"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ruler, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  answer: number;
  unit: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  { question: "5千米 = ? 米", answer: 5000, unit: "米", hint: "1千米 = 1000米" },
  { question: "3米 = ? 厘米", answer: 300, unit: "厘米", hint: "1米 = 100厘米" },
  { question: "2小时 = ? 分钟", answer: 120, unit: "分钟", hint: "1小时 = 60分钟" },
  { question: "500克 = ? 千克", answer: 0.5, unit: "千克", hint: "1000克 = 1千克" },
  { question: "1吨 = ? 千克", answer: 1000, unit: "千克", hint: "1吨 = 1000千克" },
  { question: "360秒 = ? 分钟", answer: 6, unit: "分钟", hint: "60秒 = 1分钟" },
  { question: "2.5千米 = ? 米", answer: 2500, unit: "米", hint: "1千米 = 1000米" },
  { question: "1500毫升 = ? 升", answer: 1.5, unit: "升", hint: "1000毫升 = 1升" },
  { question: "1平方米 = ? 平方厘米", answer: 10000, unit: "平方厘米", hint: "1平方米 = 10000平方厘米" },
  { question: "3天 = ? 小时", answer: 72, unit: "小时", hint: "1天 = 24小时" },
];

export default function UnitConversionQuizPage() {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[current];

  const handleCheck = () => {
    if (!input.trim()) return;
    setShowResult(true);
    const num = parseFloat(input);
    if (Math.abs(num - question.answer) < 0.01) setScore(score + 1);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) { setCurrent(current + 1); setInput(""); setShowResult(false); setShowHint(false); }
    else setFinished(true);
  };

  const handleRestart = () => { setCurrent(0); setInput(""); setShowResult(false); setShowHint(false); setScore(0); setFinished(false); };

  return (
    <ToolLayout title="单位换算练习" description="单位换算练习题" icon={Ruler} category="教育学习" slug="unit-conversion-quiz">
      <div className="p-6">
        {!finished ? (
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400">第 {current + 1} / {QUESTIONS.length} 题</span>
              <span className="text-sm text-primary-400">得分: {score}</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
              <div className="text-2xl font-bold text-white mb-2">{question.question}</div>
            </div>
            <div className="flex gap-3 mb-4">
              <input type="number" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !showResult && handleCheck()} disabled={showResult} placeholder="输入答案" className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-lg font-mono text-center" />
              <span className="px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-slate-400 font-medium flex items-center">{question.unit}</span>
            </div>
            {!showResult && (
              <button onClick={() => setShowHint(!showHint)} className="text-sm text-amber-400 hover:text-amber-300 mb-4">{showHint ? "隐藏提示" : "需要提示？"}</button>
            )}
            {showHint && !showResult && <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-sm text-amber-400 mb-4">{question.hint}</div>}
            {showResult && (
              <div className={`p-4 rounded-xl mb-4 ${parseFloat(input) === question.answer ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <div className="flex items-center gap-2">
                  {parseFloat(input) === question.answer ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  <span className={parseFloat(input) === question.answer ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>{parseFloat(input) === question.answer ? "正确！" : "错误"}</span>
                  {parseFloat(input) !== question.answer && <span className="text-slate-400 text-sm">正确答案: {question.answer} {question.unit}</span>}
                </div>
              </div>
            )}
            {!showResult ? (
              <button onClick={handleCheck} disabled={!input.trim()} className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">确认答案</button>
            ) : (
              <button onClick={handleNext} className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">{current < QUESTIONS.length - 1 ? "下一题" : "查看结果"}</button>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center">
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
              <div className="text-6xl mb-4">{score >= QUESTIONS.length * 0.8 ? "🎉" : score >= QUESTIONS.length * 0.6 ? "👍" : "📚"}</div>
              <h3 className="text-2xl font-bold text-white mb-2">练习完成！</h3>
              <p className="text-4xl font-bold text-primary-400 my-2">{score} / {QUESTIONS.length}</p>
              <p className="text-slate-400">正确率: {Math.round((score / QUESTIONS.length) * 100)}%</p>
            </div>
            <button onClick={handleRestart} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" /> 重新开始</button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
