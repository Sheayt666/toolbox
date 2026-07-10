"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sparkles, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { q: "光速大约是每秒多少千米？", answer: "30万千米", options: ["10万千米", "20万千米", "30万千米", "40万千米"] },
  { q: "人体最大的器官是？", answer: "皮肤", options: ["心脏", "肝脏", "皮肤", "大脑"] },
  { q: "地球上最丰富的气体是？", answer: "氮气", options: ["氧气", "氮气", "二氧化碳", "氢气"] },
  { q: "水的化学分子式是？", answer: "H₂O", options: ["CO₂", "H₂O", "O₂", "NaCl"] },
  { q: "太阳系中最大的行星是？", answer: "木星", options: ["地球", "火星", "木星", "土星"] },
  { q: "人的DNA有几对染色体？", answer: "23对", options: ["22对", "23对", "24对", "46对"] },
  { q: "声音在空气中的传播速度约为？", answer: "340米/秒", options: ["100米/秒", "340米/秒", "1000米/秒", "3000米/秒"] },
  { q: "哪个行星被称为红色星球？", answer: "火星", options: ["金星", "火星", "木星", "水星"] },
  { q: "彩虹有几种颜色？", answer: "7种", options: ["5种", "6种", "7种", "8种"] },
  { q: "人体正常体温约为？", answer: "37°C", options: ["35°C", "37°C", "39°C", "40°C"] },
  { q: "哪个不是可再生能源？", answer: "煤炭", options: ["太阳能", "风能", "煤炭", "水能"] },
  { q: "光的三原色是？", answer: "红绿蓝", options: ["红黄蓝", "红绿蓝", "青品黄", "红黄绿"] },
  { q: "蜜蜂用什么传递信息？", answer: "舞蹈", options: ["声音", "舞蹈", "气味", "颜色"] },
  { q: "地球上71%的表面被什么覆盖？", answer: "水", options: ["森林", "沙漠", "水", "冰川"] },
  { q: "人类有多少颗牙齿（成年人）？", answer: "32颗", options: ["28颗", "30颗", "32颗", "34颗"] },
];

export default function ScienceQuizPage() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finished, setFinished] = useState(false);

  const question = QUESTIONS[current];

  const handleAnswer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === question.answer) setScore(score + 1);
    setShowResult(true);
  };

  const handleNext = () => {
    if (current < QUESTIONS.length - 1) { setCurrent(current + 1); setSelected(null); setShowResult(false); }
    else setFinished(true);
  };

  const handleRestart = () => { setCurrent(0); setScore(0); setSelected(null); setShowResult(false); setFinished(false); };

  return (
    <ToolLayout title="科普知识问答" description="趣味科学知识问答" icon={Sparkles} category="教育学习" slug="science-quiz">
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
            <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
              <h4 className="text-lg text-white font-medium">{question.q}</h4>
            </div>
            <div className="space-y-3">
              {question.options.map((opt) => {
                let style = "bg-[#09090b] border-[#27272a] hover:border-primary-500/30 text-slate-300";
                if (showResult) {
                  if (opt === question.answer) style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                  else if (opt === selected) style = "bg-red-500/10 border-red-500/30 text-red-400";
                  else style = "bg-[#09090b] border-[#27272a] text-slate-500";
                }
                return (
                  <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected} className={`w-full p-4 border rounded-xl text-left font-medium transition-all ${style}`}>
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
              <h3 className="text-2xl font-bold text-white mb-2">测验完成！</h3>
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
