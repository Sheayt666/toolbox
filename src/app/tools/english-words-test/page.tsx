"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Headphones, Check, X, RotateCcw, Volume2 } from "lucide-react";

const WORDS = [
  { en: "apple", cn: "苹果", phonetic: "/ˈæpl/" },
  { en: "banana", cn: "香蕉", phonetic: "/bəˈnɑːnə/" },
  { en: "computer", cn: "电脑", phonetic: "/kəmˈpjuːtə/" },
  { en: "dictionary", cn: "词典", phonetic: "/ˈdɪkʃənri/" },
  { en: "elephant", cn: "大象", phonetic: "/ˈelɪfənt/" },
  { en: "football", cn: "足球", phonetic: "/ˈfʊtbɔːl/" },
  { en: "garden", cn: "花园", phonetic: "/ˈɡɑːdn/" },
  { en: "homework", cn: "作业", phonetic: "/ˈhəʊmwɜːk/" },
  { en: "important", cn: "重要的", phonetic: "/ɪmˈpɔːtnt/" },
  { en: "journey", cn: "旅行", phonetic: "/ˈdʒɜːni/" },
  { en: "knowledge", cn: "知识", phonetic: "/ˈnɒlɪdʒ/" },
  { en: "language", cn: "语言", phonetic: "/ˈlæŋɡwɪdʒ/" },
  { en: "mountain", cn: "山", phonetic: "/ˈmaʊntən/" },
  { en: "neighbor", cn: "邻居", phonetic: "/ˈneɪbə/" },
  { en: "orange", cn: "橙子", phonetic: "/ˈɒrɪndʒ/" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function EnglishWordsTestPage() {
  const [questions, setQuestions] = useState(() => shuffle(WORDS).slice(0, 10));
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const word = questions[current];

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = 0.8;
      speechSynthesis.speak(u);
    }
  };

  const handleCheck = () => {
    if (!input.trim()) return;
    setShowResult(true);
    if (input.trim().toLowerCase() === word.en) setScore(score + 1);
  };

  const handleNext = () => {
    if (current < questions.length - 1) { setCurrent(current + 1); setInput(""); setShowResult(false); }
    else setFinished(true);
  };

  const handleRestart = () => {
    setQuestions(shuffle(WORDS).slice(0, 10));
    setCurrent(0); setInput(""); setShowResult(false); setScore(0); setFinished(false);
  };

  return (
    <ToolLayout title="单词听写测试" description="英语单词听写练习" icon={Headphones} category="教育学习" slug="english-words-test">
      <div className="p-6">
        {!finished ? (
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm text-slate-400">第 {current + 1} / {questions.length} 题</span>
              <span className="text-sm text-primary-400">得分: {score}</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
              <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(current / questions.length) * 100}%` }} />
            </div>
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
              <div className="text-xs text-slate-500 mb-4">听写下面的单词（中文含义）</div>
              <div className="text-5xl font-bold text-white mb-4">{word.cn}</div>
              <button onClick={() => speak(word.en)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500/10 text-primary-400 rounded-xl hover:bg-primary-500/20 transition-colors">
                <Volume2 className="w-5 h-5" /> 点击听单词
              </button>
              <div className="text-sm text-slate-600 mt-2">可重复点击播放</div>
            </div>
            <div className="flex gap-3 mb-4">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !showResult && handleCheck()} placeholder="输入听到的单词..." className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-lg font-mono" />
              <button onClick={handleCheck} disabled={showResult || !input.trim()} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">确认</button>
            </div>
            {showResult && (
              <div className={`p-4 rounded-xl mb-4 ${input.trim().toLowerCase() === word.en ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <div className="flex items-center gap-2 mb-2">
                  {input.trim().toLowerCase() === word.en ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-400" />}
                  <span className={input.trim().toLowerCase() === word.en ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                    {input.trim().toLowerCase() === word.en ? "正确！" : "错误"}
                  </span>
                </div>
                <div className="text-slate-400 text-sm">正确答案: <span className="text-primary-400 font-mono font-bold">{word.en}</span> <span className="text-slate-500">{word.phonetic}</span></div>
              </div>
            )}
            {showResult && (
              <button onClick={handleNext} className="w-full px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">
                {current < questions.length - 1 ? "下一题" : "查看结果"}
              </button>
            )}
          </div>
        ) : (
          <div className="max-w-xl mx-auto text-center">
            <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl mb-6">
              <div className="text-6xl mb-4">{score >= 8 ? "🎉" : score >= 6 ? "👍" : "📚"}</div>
              <h3 className="text-2xl font-bold text-white mb-2">听写完成！</h3>
              <p className="text-4xl font-bold text-primary-400 my-2">{score} / {questions.length}</p>
              <p className="text-slate-400">正确率: {Math.round((score / questions.length) * 100)}%</p>
            </div>
            <button onClick={handleRestart} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> 再来一轮
            </button>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
