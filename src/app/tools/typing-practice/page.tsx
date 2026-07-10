"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Keyboard, RotateCcw } from "lucide-react";

const TEXTS = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet at least once.",
  "Technology is best when it brings people together. The future of the web is interactive and intelligent.",
  "Practice makes perfect. The more you type, the faster and more accurate you become. Keep going!",
  "Life is what happens when you're busy making other plans. Time flies when you're having fun typing.",
  "知识就是力量，学习是一辈子的事情。每天进步一点点，积累成就未来。持之以恒，必有所成。",
];

export default function TypingPracticePage() {
  const [textIndex, setTextIndex] = useState(0);
  const [input, setInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const targetText = TEXTS[textIndex];

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const value = e.target.value;
    if (!startTime && value.length > 0) setStartTime(Date.now());
    if (value.length <= targetText.length) {
      if (value.length > input.length && value[value.length - 1] !== targetText[value.length - 1]) {
        setErrors(errors + 1);
      }
      setInput(value);
      setCurrentIndex(value.length);
      if (value.length === targetText.length) {
        setEndTime(Date.now());
        setFinished(true);
      }
    }
  };

  const handleRestart = () => {
    setInput(""); setStartTime(null); setEndTime(null); setCurrentIndex(0); setErrors(0); setFinished(false);
    setTextIndex((textIndex + 1) % TEXTS.length);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const elapsed = endTime && startTime ? (endTime - startTime) / 1000 : startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((input.length / 5) / (elapsed / 60)) : 0;
  const accuracy = input.length > 0 ? Math.round(((input.length - errors) / input.length) * 100) : 100;

  return (
    <ToolLayout title="打字练习" description="在线打字练习工具" icon={Keyboard} category="教育学习" slug="typing-practice">
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
              <div className="text-xs text-slate-500 mb-1">速度 (WPM)</div>
              <div className="text-2xl font-bold text-primary-400">{wpm}</div>
            </div>
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
              <div className="text-xs text-slate-500 mb-1">准确率</div>
              <div className="text-2xl font-bold text-emerald-400">{accuracy}%</div>
            </div>
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
              <div className="text-xs text-slate-500 mb-1">用时</div>
              <div className="text-2xl font-bold text-orange-400">{elapsed.toFixed(1)}s</div>
            </div>
          </div>

          {finished && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center mb-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-emerald-400">打字完成！</h3>
              <p className="text-slate-400 mt-2">速度: {wpm} WPM | 准确率: {accuracy}% | 错误: {errors}个</p>
            </div>
          )}

          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl mb-4">
            <div className="text-lg leading-relaxed font-mono break-all">
              {targetText.split("").map((char, i) => {
                let style = "text-slate-500";
                if (i < currentIndex) style = input[i] === char ? "text-emerald-400" : "text-red-400 bg-red-500/10";
                else if (i === currentIndex) style = "text-white bg-primary-500/30 rounded";
                return <span key={i} className={style}>{char}</span>;
              })}
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            disabled={finished}
            placeholder="开始打字..."
            className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono text-lg"
          />

          <button onClick={handleRestart} className="w-full mt-4 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> {finished ? "下一题" : "重新开始"}
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}
