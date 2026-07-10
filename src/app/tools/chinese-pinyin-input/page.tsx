"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Mic, Volume2, Check, RefreshCw } from "lucide-react";

const PRACTICE_ITEMS = [
  { pinyin: "bā", char: "八", audio: "ba" },
  { pinyin: "pó", char: "婆", audio: "po" },
  { pinyin: "mā", char: "妈", audio: "ma" },
  { pinyin: "fá", char: "罚", audio: "fa" },
  { pinyin: "dà", char: "大", audio: "da" },
  { pinyin: "tù", char: "兔", audio: "tu" },
  { pinyin: "nǐ", char: "你", audio: "ni" },
  { pinyin: "lǜ", char: "绿", audio: "lv" },
  { pinyin: "gē", char: "哥", audio: "ge" },
  { pinyin: "kè", char: "课", audio: "ke" },
  { pinyin: "hǎo", char: "好", audio: "hao" },
  { pinyin: "jī", char: "鸡", audio: "ji" },
  { pinyin: "qì", char: "气", audio: "qi" },
  { pinyin: "xī", char: "西", audio: "xi" },
  { pinyin: "zhōng", char: "中", audio: "zhong" },
  { pinyin: "chī", char: "吃", audio: "chi" },
  { pinyin: "shū", char: "书", audio: "shu" },
  { pinyin: "rì", char: "日", audio: "ri" },
  { pinyin: "zǎo", char: "早", audio: "zao" },
  { pinyin: "cǎo", char: "草", audio: "cao" },
];

const TONE_MARKS: Record<string, string> = {
  "1": "ˉ (第一声·阴平)", "2": "ˊ (第二声·阳平)", "3": "ˇ (第三声·上声)", "4": "ˋ (第四声·去声)", "0": "轻声",
};

function getTone(pinyin: string): number {
  const toneMap: Record<string, number> = { "ā": 1, "á": 2, "ǎ": 3, "à": 4, "ē": 1, "é": 2, "ě": 3, "è": 4, "ī": 1, "í": 2, "ǐ": 3, "ì": 4, "ō": 1, "ó": 2, "ǒ": 3, "ò": 4, "ū": 1, "ú": 2, "ǔ": 3, "ù": 4, "ǖ": 1, "ǘ": 2, "ǚ": 3, "ǜ": 4 };
  for (const ch of pinyin) if (toneMap[ch]) return toneMap[ch];
  return 0;
}

export default function ChinesePinyinInputPage() {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const item = PRACTICE_ITEMS[current];

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "zh-CN";
      utter.rate = 0.8;
      speechSynthesis.speak(utter);
    }
  };

  const handleCheck = () => {
    setShowAnswer(true);
    if (input.trim().toLowerCase() === item.pinyin) setCorrect(correct + 1);
    if (!completed.includes(current.toString())) setCompleted([...completed, current.toString()]);
  };

  const handleNext = () => {
    if (current < PRACTICE_ITEMS.length - 1) { setCurrent(current + 1); setInput(""); setShowAnswer(false); }
  };

  const handleReset = () => { setCurrent(0); setInput(""); setShowAnswer(false); setCorrect(0); setCompleted([]); };

  return (
    <ToolLayout title="拼音学习" description="汉语拼音学习工具" icon={Mic} category="教育学习" slug="chinese-pinyin-input">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">第 {current + 1} / {PRACTICE_ITEMS.length} 个</span>
            <span className="text-sm text-primary-400">正确: {correct}</span>
          </div>
          <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((current) / PRACTICE_ITEMS.length) * 100}%` }} />
          </div>

          <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-6">
            <div className="text-xs text-slate-500 mb-2">请写出这个字的拼音</div>
            <div className="text-7xl font-bold text-white mb-4">{item.char}</div>
            <button onClick={() => handleSpeak(item.char)} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-400 rounded-lg hover:bg-primary-500/20 transition-colors">
              <Volume2 className="w-4 h-4" /> 点击发音
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="输入拼音..." className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors font-mono text-lg" />
            <button onClick={handleCheck} disabled={showAnswer || !input.trim()} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">确认</button>
          </div>

          {showAnswer && (
            <div className={`p-4 rounded-xl mb-4 ${input.trim().toLowerCase() === item.pinyin ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center gap-2 mb-1">
                {input.trim().toLowerCase() === item.pinyin ? <Check className="w-5 h-5 text-emerald-400" /> : <span className="text-red-400">✗</span>}
                <span className={input.trim().toLowerCase() === item.pinyin ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                  {input.trim().toLowerCase() === item.pinyin ? "回答正确！" : "回答错误"}
                </span>
              </div>
              <div className="text-slate-400 text-sm">正确答案: <span className="text-primary-400 font-mono font-bold">{item.pinyin}</span> · 声调: {TONE_MARKS[getTone(item.pinyin).toString()]}</div>
            </div>
          )}

          <div className="flex gap-3">
            {showAnswer && <button onClick={handleNext} className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">下一个</button>}
            <button onClick={handleReset} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] transition-colors inline-flex items-center gap-2"><RefreshCw className="w-4 h-4" />重新开始</button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
