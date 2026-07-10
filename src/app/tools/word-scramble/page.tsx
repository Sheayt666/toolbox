"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shuffle, RotateCcw, Check, X } from "lucide-react";

const WORDS: { word: string; hint: string }[] = [
  { word: "PYTHON", hint: "一种编程语言" },
  { word: "JAVASCRIPT", hint: "网页编程语言" },
  { word: "COMPUTER", hint: "电子计算设备" },
  { word: "KEYBOARD", hint: "输入设备" },
  { word: "INTERNET", hint: "全球网络" },
  { word: "ALGORITHM", hint: "解决问题的步骤" },
  { word: "DATABASE", hint: "数据存储系统" },
  { word: "FUNCTION", hint: "可重复使用的代码块" },
  { word: "VARIABLE", hint: "存储数据的容器" },
  { word: "BROWSER", hint: "浏览网页的软件" },
  { word: "NETWORK", hint: "互连的计算机系统" },
  { word: "PROGRAM", hint: "计算机指令集合" },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

export default function WordScramblePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [scrambled, setScrambled] = useState("");
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);

  const currentWord = WORDS[wordIndex];

  useEffect(() => {
    setScrambled(scramble(currentWord.word));
  }, [wordIndex, currentWord.word]);

  const handleCheck = () => {
    if (!input.trim()) return;
    setShowResult(true);
    if (input.trim().toUpperCase() === currentWord.word) setScore(score + 1);
  };

  const handleNext = useCallback(() => {
    setWordIndex((wordIndex + 1) % WORDS.length);
    setInput("");
    setShowResult(false);
    setRound(round + 1);
  }, [wordIndex, round]);

  const handleRestart = () => { setWordIndex(0); setInput(""); setShowResult(false); setScore(0); setRound(1); };

  return (
    <ToolLayout title="单词重组" description="英语单词字母重组游戏" icon={Shuffle} category="教育学习" slug="word-scramble">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">第 {round} 轮</span>
            <span className="text-sm text-primary-400">得分: {score}</span>
          </div>

          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-4">
            <div className="text-xs text-slate-500 mb-2">提示: {currentWord.hint}</div>
            <div className="flex justify-center gap-2 flex-wrap">
              {scrambled.split("").map((char, i) => (
                <span key={i} className="w-10 h-12 flex items-center justify-center bg-primary-500/10 text-primary-400 rounded-lg text-2xl font-bold font-mono">{char}</span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mb-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (showResult ? handleNext() : handleCheck())} disabled={showResult} placeholder="输入重组后的单词..." className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-lg font-mono text-center uppercase" />
            {!showResult ? (
              <button onClick={handleCheck} disabled={!input.trim()} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">确认</button>
            ) : (
              <button onClick={handleNext} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">下一个</button>
            )}
          </div>

          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${input.trim().toUpperCase() === currentWord.word ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center gap-2">
                {input.trim().toUpperCase() === currentWord.word ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-400" />}
                <span className={input.trim().toUpperCase() === currentWord.word ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                  {input.trim().toUpperCase() === currentWord.word ? "正确！" : "错误"}
                </span>
                {input.trim().toUpperCase() !== currentWord.word && <span className="text-slate-400 text-sm">正确答案: <span className="font-mono font-bold text-primary-400">{currentWord.word}</span></span>}
              </div>
            </div>
          )}

          <button onClick={handleRestart} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] transition-colors inline-flex items-center justify-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> 重新开始</button>
        </div>
      </div>
    </ToolLayout>
  );
}
