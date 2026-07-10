"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Map, CheckCircle, XCircle, RotateCcw } from "lucide-react";

const QUESTIONS = [
  { q: "世界上面积最大的国家是？", answer: "俄罗斯", options: ["中国", "美国", "俄罗斯", "加拿大"] },
  { q: "世界上最长的河流是？", answer: "尼罗河", options: ["长江", "尼罗河", "亚马逊河", "密西西比河"] },
  { q: "世界上最高的山峰是？", answer: "珠穆朗玛峰", options: ["珠穆朗玛峰", "乔戈里峰", "干城章嘉峰", "洛子峰"] },
  { q: "世界上最大的沙漠是？", answer: "撒哈拉沙漠", options: ["戈壁沙漠", "撒哈拉沙漠", "阿拉伯沙漠", "塔克拉玛干沙漠"] },
  { q: "世界上最深的湖泊是？", answer: "贝加尔湖", options: ["里海", "贝加尔湖", "苏必利尔湖", "青海湖"] },
  { q: "世界上人口最多的国家是？", answer: "印度", options: ["中国", "印度", "美国", "印度尼西亚"] },
  { q: "世界上最大的洋是？", answer: "太平洋", options: ["大西洋", "太平洋", "印度洋", "北冰洋"] },
  { q: "世界上面积最大的洲是？", answer: "亚洲", options: ["非洲", "亚洲", "北美洲", "南美洲"] },
  { q: "世界上最小的国家是？", answer: "梵蒂冈", options: ["摩纳哥", "梵蒂冈", "圣马力诺", "瑙鲁"] },
  { q: "世界上最大的岛屿是？", answer: "格陵兰岛", options: ["新几内亚岛", "格陵兰岛", "加里曼丹岛", "马达加斯加岛"] },
  { q: "世界上最长的山脉是？", answer: "安第斯山脉", options: ["喜马拉雅山脉", "安第斯山脉", "落基山脉", "阿尔卑斯山脉"] },
  { q: "世界上最大的热带雨林在哪个国家？", answer: "巴西", options: ["刚果", "巴西", "印度尼西亚", "秘鲁"] },
  { q: "世界上唯一一个四面环海的国家是？", answer: "澳大利亚", options: ["日本", "英国", "澳大利亚", "新西兰"] },
  { q: "中国的母亲河是？", answer: "黄河", options: ["长江", "黄河", "珠江", "淮河"] },
  { q: "世界上最低的湖泊是？", answer: "死海", options: ["死海", "里海", "咸海", "青海湖"] },
];

export default function GeographyQuizPage() {
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
    <ToolLayout title="地理知识问答" description="世界地理知识小测验" icon={Map} category="教育学习" slug="geography-quiz">
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
