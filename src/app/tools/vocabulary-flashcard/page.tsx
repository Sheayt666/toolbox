"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Layers, ChevronLeft, ChevronRight, RotateCcw, Volume2, Check } from "lucide-react";

interface Flashcard {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

const FLASHCARDS: Flashcard[] = [
  { word: "abundant", phonetic: "/əˈbʌndənt/", meaning: "丰富的，充裕的", example: "This region has abundant natural resources." },
  { word: "consequence", phonetic: "/ˈkɒnsɪkwəns/", meaning: "结果，后果", example: "Every action has consequences." },
  { word: "diligent", phonetic: "/ˈdɪlɪdʒənt/", meaning: "勤奋的，用功的", example: "She is a diligent student who studies every day." },
  { word: "elaborate", phonetic: "/ɪˈlæbərət/", meaning: "精心制作的，详尽的", example: "Can you elaborate on your plan?" },
  { word: "fundamental", phonetic: "/ˌfʌndəˈmentl/", meaning: "基本的，根本的", example: "Honesty is fundamental to trust." },
  { word: "genuine", phonetic: "/ˈdʒenjuɪn/", meaning: "真正的，真诚的", example: "His smile was genuine and warm." },
  { word: "hesitate", phonetic: "/ˈhezɪteɪt/", meaning: "犹豫，踌躇", example: "Don't hesitate to ask for help." },
  { word: "inevitable", phonetic: "/ɪnˈevɪtəbl/", meaning: "不可避免的", example: "Change is inevitable in life." },
  { word: "judgment", phonetic: "/ˈdʒʌdʒmənt/", meaning: "判断，评判", example: "Trust your own judgment." },
  { word: "knowledge", phonetic: "/ˈnɒlɪdʒ/", meaning: "知识，学识", example: "Knowledge is power." },
  { word: "legitimate", phonetic: "/lɪˈdʒɪtɪmət/", meaning: "合法的，正当的", example: "He has a legitimate reason for being late." },
  { word: "magnificent", phonetic: "/mæɡˈnɪfɪsnt/", meaning: "壮丽的，宏伟的", example: "The view from the mountain was magnificent." },
  { word: "negotiate", phonetic: "/nɪˈɡəʊʃieɪt/", meaning: "谈判，协商", example: "We need to negotiate a better deal." },
  { word: "obstacle", phonetic: "/ˈɒbstəkl/", meaning: "障碍，阻碍", example: "Fear is the biggest obstacle to success." },
  { word: "perspective", phonetic: "/pəˈspektɪv/", meaning: "观点，视角", example: "Try to see things from her perspective." },
];

export default function VocabularyFlashcardPage() {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const card = FLASHCARDS[current];

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      speechSynthesis.speak(u);
    }
  };

  const handleNext = () => { if (current < FLASHCARDS.length - 1) { setCurrent(current + 1); setFlipped(false); } };
  const handlePrev = () => { if (current > 0) { setCurrent(current - 1); setFlipped(false); } };
  const handleMarkKnown = () => { const s = new Set(known); s.add(current); setKnown(s); setFlipped(false); if (current < FLASHCARDS.length - 1) setCurrent(current + 1); };
  const handleRestart = () => { setCurrent(0); setFlipped(false); setKnown(new Set()); };

  return (
    <ToolLayout title="单词闪卡" description="通过闪卡方式背诵英语单词" icon={Layers} category="教育学习" slug="vocabulary-flashcard">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">{current + 1} / {FLASHCARDS.length}</span>
            <span className="text-sm text-emerald-400">已掌握: {known.size}</span>
          </div>
          <div className="w-full h-2 bg-[#27272a] rounded-full mb-8">
            <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${((current + 1) / FLASHCARDS.length) * 100}%` }} />
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            className="relative h-72 bg-[#09090b] border border-[#27272a] rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary-500/30 transition-colors mb-4"
          >
            {!flipped ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-3">{card.word}</div>
                <div className="text-lg text-slate-500 font-mono">{card.phonetic}</div>
                <button onClick={(e) => { e.stopPropagation(); speak(card.word); }} className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-500/10 text-primary-400 rounded-lg text-sm hover:bg-primary-500/20 transition-colors"><Volume2 className="w-4 h-4" /> 发音</button>
                <div className="text-xs text-slate-600 mt-4">点击卡片查看释义</div>
              </div>
            ) : (
              <div className="text-center px-8">
                <div className="text-2xl font-bold text-primary-400 mb-3">{card.meaning}</div>
                <div className="text-sm text-slate-400 italic mt-4">"{card.example}"</div>
                <div className="text-xs text-slate-600 mt-4">点击卡片返回</div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mb-4">
            <button onClick={handlePrev} disabled={current === 0} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] disabled:opacity-30 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleMarkKnown} className="flex-1 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium transition-colors inline-flex items-center justify-center gap-2"><Check className="w-4 h-4" /> 已掌握</button>
            <button onClick={handleNext} disabled={current === FLASHCARDS.length - 1} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] disabled:opacity-30 transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>

          <button onClick={handleRestart} className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] transition-colors inline-flex items-center justify-center gap-2 text-sm"><RotateCcw className="w-4 h-4" /> 重新开始</button>
        </div>
      </div>
    </ToolLayout>
  );
}
