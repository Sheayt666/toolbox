"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Check, X, RotateCcw } from "lucide-react";

interface RadicalQuestion {
  char: string;
  radical: string;
  options: string[];
}

const CHARACTERS: RadicalQuestion[] = [
  { char: "好", radical: "女", options: ["女", "子", "大", "人"] },
  { char: "树", radical: "木", options: ["木", "又", "寸", "土"] },
  { char: "河", radical: "氵", options: ["氵", "可", "口", "一"] },
  { char: "说", radical: "讠", options: ["讠", "兑", "口", "言"] },
  { char: "花", radical: "艹", options: ["艹", "化", "十", "日"] },
  { char: "铁", radical: "钅", options: ["钅", "失", "金", "大"] },
  { char: "跑", radical: "足", options: ["足", "包", "走", "手"] },
  { char: "妈", radical: "女", options: ["女", "马", "大", "人"] },
  { char: "听", radical: "口", options: ["口", "斤", "耳", "月"] },
  { char: "明", radical: "日", options: ["日", "月", "光", "明"] },
  { char: "请", radical: "讠", options: ["讠", "青", "言", "月"] },
  { char: "草", radical: "艹", options: ["艹", "早", "日", "十"] },
];

export default function ChineseRadicalPracticePage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = CHARACTERS[current];

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === question.radical) setScore(score + 1);
    setShowResult(true);
  };

  const handleNext = () => {
    if (current < CHARACTERS.length - 1) { setCurrent(current + 1); setSelected(null); setShowResult(false); }
    else setFinished(true);
  };

  const handleRestart = () => { setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setFinished(false); };

  return (
    <ToolLayout title="偏旁部首练习" description="学习汉字偏旁部首名称和例字" icon={Type} category="教育学习" slug="chinese-radical-practice">
      <div className="p-6">
        {!finished ? (
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400">第 {current + 1} / {CHARACTERS.length} 题</span>
              <span className="text-sm text-primary-400">得分: {score}</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(current / CHARACTERS.length) * 100}%` }} />
            </div>
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
              <div className="text-xs text-slate-500 mb-2">这个字的偏旁部首是？</div>
              <div className="text-7xl font-bold text-primary-400">{question.char}</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {question.options.map((opt) => {
                let style = "bg-[#09090b] border-[#27272a] hover:border-primary-500/30 text-slate-300";
                if (showResult) {
                  if (opt === question.radical) style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                  else if (opt === selected) style = "bg-red-500/10 border-red-500/30 text-red-400";
                  else style = "bg-[#09090b] border-[#27272a] text-slate-500";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected} className={`p-4 border rounded-xl font-medium transition-all ${style} text-2xl`}>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showResult && (
              <button onClick={handleNext} className="w-full mt-6 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
                {current < CHARACTERS.length - 1 ? "下一题" : "查看结果"}
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center">
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
              <div className="text-6xl mb-4">{score >= CHARACTERS.length * 0.8 ? "🎉" : score >= CHARACTERS.length * 0.6 ? "👍" : "📚"}</div>
              <h3 className="text-2xl font-bold text-white mb-2">练习完成！</h3>
              <p className="text-4xl font-bold text-primary-400 my-2">{score} / {CHARACTERS.length}</p>
              <p className="text-slate-400">正确率: {Math.round((score / CHARACTERS.length) * 100)}%</p>
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
