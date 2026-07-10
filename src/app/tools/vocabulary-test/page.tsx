"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileCheck, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { word: "happy", options: ["悲伤的", "快乐的", "愤怒的", "疲倦的"], answer: "快乐的", level: "基础" },
  { word: "beautiful", options: ["丑陋的", "普通的", "美丽的", "便宜的"], answer: "美丽的", level: "基础" },
  { word: "abandon", options: ["坚持", "放弃", "获得", "保存"], answer: "放弃", level: "中级" },
  { word: "compassion", options: ["冷漠", "同情", "愤怒", "嫉妒"], answer: "同情", level: "中级" },
  { word: "diligent", options: ["懒惰的", "勤奋的", "粗心的", "急躁的"], answer: "勤奋的", level: "中级" },
  { word: "eloquent", options: ["沉默的", "口才好的", "粗鲁的", "害羞的"], answer: "口才好的", level: "高级" },
  { word: "frugal", options: ["奢侈的", "节俭的", "慷慨的", "浪费的"], answer: "节俭的", level: "高级" },
  { word: "gregarious", options: ["内向的", "群居的，爱交际的", "孤独的", "安静的"], answer: "群居的，爱交际的", level: "高级" },
  { word: "meticulous", options: ["粗心的", "一丝不苟的", "随意的", "马虎的"], answer: "一丝不苟的", level: "高级" },
  { word: "pragmatic", options: ["理想主义的", "务实的", "浪漫的", "天真的"], answer: "务实的", level: "高级" },
  { word: "resilient", options: ["脆弱的", "有弹性的，适应力强的", "僵硬的", "固定的"], answer: "有弹性的，适应力强的", level: "高级" },
  { word: "scrutinize", options: ["忽视", "仔细检查", "赞美", "批评"], answer: "仔细检查", level: "高级" },
  { word: "tentative", options: ["确定的", "试探性的", "最终的", "永久的"], answer: "试探性的", level: "高级" },
  { word: "ubiquitous", options: ["稀有的", "无处不在的", "隐藏的", "独特的"], answer: "无处不在的", level: "高级" },
  { word: "vivid", options: ["暗淡的", "生动的", "模糊的", "灰色的"], answer: "生动的", level: "中级" },
];

export default function VocabularyTestPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const question = QUESTIONS[current];

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === question.answer;
    if (correct) setScore(score + 1);
    setResults([...results, correct]);
    setShowResult(true);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) { setCurrent(current + 1); setSelected(null); setShowResult(false); }
    else setFinished(true);
  };

  const handleRestart = () => { setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setFinished(false); setResults([]); };

  const vocabEstimate = Math.round(3000 + (score / QUESTIONS.length) * 7000);

  return (
    <ToolLayout title="词汇量测试" description="测试你的英语词汇量" icon={FileCheck} category="教育学习" slug="vocabulary-test">
      <div className="p-6">
        {!finished ? (
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400">第 {current + 1} / {QUESTIONS.length} 题 · {question.level}</span>
              <span className="text-sm text-primary-400">得分: {score}</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
            </div>
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
              <div className="text-xs text-slate-500 mb-2">选择正确的中文释义</div>
              <div className="text-4xl font-bold text-primary-400 font-mono">{question.word}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {question.options.map((opt) => {
                let style = "bg-[#09090b] border-[#27272a] hover:border-primary-500/30 text-slate-300";
                if (showResult) {
                  if (opt === question.answer) style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                  else if (opt === selected) style = "bg-red-500/10 border-red-500/30 text-red-400";
                  else style = "bg-[#09090b] border-[#27272a] text-slate-500";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected} className={`p-4 border rounded-xl font-medium transition-all text-left ${style}`}>
                    {showResult && opt === question.answer && <CheckCircle className="w-4 h-4 inline mr-2" />}
                    {showResult && opt === selected && opt !== question.answer && <XCircle className="w-4 h-4 inline mr-2" />}
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
              <h3 className="text-2xl font-bold text-white mb-2">测试完成！</h3>
              <p className="text-4xl font-bold text-primary-400 my-2">{score} / {QUESTIONS.length}</p>
              <p className="text-slate-400">正确率: {Math.round((score / QUESTIONS.length) * 100)}%</p>
              <div className="mt-6 p-4 bg-[#18181b] rounded-xl">
                <div className="text-sm text-slate-500 mb-1">预估词汇量</div>
                <div className="text-3xl font-bold text-emerald-400">~{vocabEstimate}</div>
              </div>
            </div>
            <button onClick={handleRestart} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> 重新测试
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
