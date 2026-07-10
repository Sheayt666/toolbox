"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Link, RotateCcw, Check, X } from "lucide-react";

const IDIOM_CHAIN = [
  { idiom: "一马当先", lastChar: "先", pinyin: "yī mǎ dāng xiān" },
  { idiom: "先发制人", lastChar: "人", pinyin: "xiān fā zhì rén" },
  { idiom: "人山人海", lastChar: "海", pinyin: "rén shān rén hǎi" },
  { idiom: "海阔天空", lastChar: "空", pinyin: "hǎi kuò tiān kōng" },
  { idiom: "空谷传声", lastChar: "声", pinyin: "kōng gǔ chuán shēng" },
  { idiom: "声东击西", lastChar: "西", pinyin: "shēng dōng jī xī" },
  { idiom: "西窗剪烛", lastChar: "烛", pinyin: "xī chuāng jiǎn zhú" },
  { idiom: "烛照数计", lastChar: "计", pinyin: "zhú zhào shù jì" },
  { idiom: "计上心来", lastChar: "来", pinyin: "jì shàng xīn lái" },
  { idiom: "来日方长", lastChar: "长", pinyin: "lái rì fāng cháng" },
  { idiom: "长驱直入", lastChar: "入", pinyin: "cháng qū zhí rù" },
  { idiom: "入木三分", lastChar: "分", pinyin: "rù mù sān fēn" },
  { idiom: "分秒必争", lastChar: "争", pinyin: "fēn miǎo bì zhēng" },
  { idiom: "争分夺秒", lastChar: "秒", pinyin: "zhēng fēn duó miǎo" },
  { idiom: "三心二意", lastChar: "意", pinyin: "sān xīn èr yì" },
  { idiom: "意味深长", lastChar: "长", pinyin: "yì wèi shēn cháng" },
  { idiom: "长年累月", lastChar: "月", pinyin: "cháng nián lěi yuè" },
  { idiom: "月下老人", lastChar: "人", pinyin: "yuè xià lǎo rén" },
  { idiom: "人面桃花", lastChar: "花", pinyin: "rén miàn táo huā" },
  { idiom: "花言巧语", lastChar: "语", pinyin: "huā yán qiǎo yǔ" },
];

export default function IdiomQuizPage() {
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState<string[]>([IDIOM_CHAIN[0].idiom]);

  const currentIdiom = IDIOM_CHAIN[current];
  const expectedNext = current < IDIOM_CHAIN.length - 1 ? IDIOM_CHAIN[current + 1] : null;

  const handleCheck = () => {
    if (!input.trim()) return;
    setShowResult(true);
    if (input.trim() === (expectedNext?.idiom || "")) {
      setScore(score + 1);
      setChain([...chain, expectedNext!.idiom]);
    }
  };

  const handleSkip = () => {
    if (expectedNext) { setChain([...chain, expectedNext.idiom]); }
    handleNext();
  };

  const handleNext = () => {
    if (current < IDIOM_CHAIN.length - 1) { setCurrent(current + 1); setInput(""); setShowResult(false); }
  };

  const handleRestart = () => { setCurrent(0); setInput(""); setShowResult(false); setScore(0); setChain([IDIOM_CHAIN[0].idiom]); };

  return (
    <ToolLayout title="成语接龙" description="成语接龙游戏" icon={Link} category="教育学习" slug="idiom-quiz">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm text-slate-400">第 {current + 1} / {IDIOM_CHAIN.length - 1} 步</span>
            <span className="text-sm text-primary-400">正确: {score}</span>
          </div>

          <div className="p-6 bg-[#09090b] border border-[#27272a] rounded-xl text-center mb-4">
            <div className="text-xs text-slate-500 mb-2">当前成语（用最后一个字接龙）</div>
            <div className="text-4xl font-bold text-primary-400 mb-2">{currentIdiom.idiom}</div>
            <div className="text-sm text-slate-500">{currentIdiom.pinyin}</div>
            <div className="mt-2 text-sm text-emerald-400">请以「<span className="font-bold text-2xl">{currentIdiom.lastChar}</span>」字开头接成语</div>
          </div>

          <div className="flex gap-3 mb-4">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !showResult && handleCheck()} placeholder={`输入以「${currentIdiom.lastChar}」开头的成语...`} className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors text-lg" />
            <button onClick={handleCheck} disabled={showResult || !input.trim()} className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors">确认</button>
          </div>

          {showResult && (
            <div className={`p-4 rounded-xl mb-4 ${input.trim() === (expectedNext?.idiom || "") ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center gap-2 mb-1">
                {input.trim() === (expectedNext?.idiom || "") ? <Check className="w-5 h-5 text-emerald-400" /> : <X className="w-5 h-5 text-red-400" />}
                <span className={input.trim() === (expectedNext?.idiom || "") ? "text-emerald-400 font-medium" : "text-red-400 font-medium"}>
                  {input.trim() === (expectedNext?.idiom || "") ? "接龙成功！" : "接龙失败"}
                </span>
              </div>
              {expectedNext && input.trim() !== expectedNext.idiom && (
                <div className="text-slate-400 text-sm">参考答案: <span className="text-primary-400 font-bold">{expectedNext.idiom}</span> <span className="text-slate-500">{expectedNext.pinyin}</span></div>
              )}
            </div>
          )}

          <div className="flex gap-3 mb-6">
            {showResult && <button onClick={handleNext} className="flex-1 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors">下一题</button>}
            {!showResult && <button onClick={handleSkip} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] transition-colors">跳过</button>}
            <button onClick={handleRestart} className="px-4 py-3 bg-[#09090b] border border-[#27272a] text-slate-400 rounded-xl hover:border-[#3f3f46] transition-colors inline-flex items-center gap-2"><RotateCcw className="w-4 h-4" />重开</button>
          </div>

          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
            <h4 className="text-sm font-medium text-slate-400 mb-2">接龙记录</h4>
            <div className="flex flex-wrap gap-2">
              {chain.map((c, i) => (
                <span key={i} className="px-3 py-1 bg-[#18181b] text-primary-400 rounded-lg text-sm">{c}{i < chain.length - 1 && " →"}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
