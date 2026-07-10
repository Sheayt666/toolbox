"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FlaskRound, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { symbol: "H", answer: "氢", options: ["氢", "氦", "锂", "铍"] },
  { symbol: "He", answer: "氦", options: ["氢", "氦", "碳", "氮"] },
  { symbol: "Li", answer: "锂", options: ["锂", "钠", "钾", "镁"] },
  { symbol: "C", answer: "碳", options: ["碳", "氮", "氧", "硼"] },
  { symbol: "N", answer: "氮", options: ["碳", "氮", "氧", "氟"] },
  { symbol: "O", answer: "氧", options: ["碳", "氮", "氧", "氟"] },
  { symbol: "Na", answer: "钠", options: ["钠", "钾", "钙", "镁"] },
  { symbol: "Fe", answer: "铁", options: ["铜", "铁", "锌", "锰"] },
  { symbol: "Cu", answer: "铜", options: ["银", "铜", "金", "铁"] },
  { symbol: "Au", answer: "金", options: ["银", "铜", "金", "铂"] },
  { symbol: "Ag", answer: "银", options: ["银", "铝", "镁", "钙"] },
  { symbol: "Cl", answer: "氯", options: ["氟", "氯", "溴", "碘"] },
  { symbol: "Ca", answer: "钙", options: ["镁", "钙", "钡", "锶"] },
  { symbol: "P", answer: "磷", options: ["磷", "硫", "硅", "硼"] },
  { symbol: "Zn", answer: "锌", options: ["铜", "铁", "锌", "镍"] },
];

export default function ChemistryElementQuizPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[current];

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === question.answer) setScore(score + 1);
    setShowResult(true);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFinished(false);
  };

  return (
    <ToolLayout title="元素符号测验" description="化学元素符号记忆测验" icon={FlaskRound} category="教育学习" slug="chemistry-element-quiz">
      <div className="p-6">
        {!finished ? (
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400">第 {current + 1} / {QUESTIONS.length} 题</span>
              <span className="text-sm text-primary-400">得分: {score}</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((current) / QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
              <div className="text-xs text-slate-500 mb-2">这个元素的符号是？</div>
              <div className="text-6xl font-bold text-primary-400 font-mono">{question.symbol}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt) => {
                let style = "bg-[#09090b] border-[#27272a] hover:border-primary-500/30 text-slate-300";
                if (showResult) {
                  if (opt === question.answer) style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                  else if (opt === selected) style = "bg-red-500/10 border-red-500/30 text-red-400";
                  else style = "bg-[#09090b] border-[#27272a] text-slate-500";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected} className={`p-4 border rounded-xl font-medium transition-all ${style}`}>
                    {showResult && opt === question.answer && <CheckCircle className="w-4 h-4 inline mr-1" />}
                    {showResult && opt === selected && opt !== question.answer && <XCircle className="w-4 h-4 inline mr-1" />}
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <button onClick={handleNext} className="w-full mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
                {current < QUESTIONS.length - 1 ? "下一题" : "查看结果"}
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center">
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
              <div className="text-6xl mb-4">{score >= QUESTIONS.length * 0.8 ? "🎉" : score >= QUESTIONS.length * 0.6 ? "👍" : "📚"}</div>
              <h3 className="text-2xl font-bold text-white mb-2">测验完成！</h3>
              <p className="text-slate-400">你答对了</p>
              <p className="text-4xl font-bold text-primary-400 my-2">{score} / {QUESTIONS.length}</p>
              <p className="text-slate-400">正确率: {Math.round((score / QUESTIONS.length) * 100)}%</p>
            </div>
            <button onClick={handleRestart} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> 重新开始
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
