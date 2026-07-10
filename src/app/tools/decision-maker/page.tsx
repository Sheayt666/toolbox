"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shuffle, Plus, X, Check } from "lucide-react";

export default function DecisionMakerPage() {
  const [options, setOptions] = useState<string[]>(["吃饭", "吃面", "吃火锅", "点外卖"]);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const handleAdd = () => {
    if (!input.trim() || options.length >= 20) return;
    setOptions([...options, input.trim()]);
    setInput("");
  };

  const handleRemove = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleDecide = () => {
    if (options.length < 2) return;
    setSpinning(true);
    setResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setResult(options[Math.floor(Math.random() * options.length)]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setSpinning(false);
        setResult(options[Math.floor(Math.random() * options.length)]);
      }
    }, 100);
  };

  return (
    <ToolLayout title="决策助手" description="纠结不知道选什么？让随机帮你做决定" icon={Shuffle} category="生活工具" slug="decision-maker">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="flex gap-3 mb-6">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="添加选项..." className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
            <button onClick={handleAdd} disabled={!input.trim() || options.length >= 20} className="px-4 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors inline-flex items-center gap-2"><Plus className="w-5 h-5" />添加</button>
          </div>

          <div className="space-y-2 mb-6">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl group">
                <span className="w-7 h-7 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</span>
                <span className="text-slate-300 flex-1">{opt}</span>
                <button onClick={() => handleRemove(i)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-4 h-4" /></button>
              </div>
            ))}
            {options.length === 0 && <div className="text-center py-8 text-slate-500">请添加至少2个选项</div>}
          </div>

          <button onClick={handleDecide} disabled={options.length < 2 || spinning} className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-colors inline-flex items-center justify-center gap-2 mb-6">
            <Shuffle className={`w-6 h-6 ${spinning ? "animate-spin" : ""}`} /> {spinning ? "选择中..." : "帮我决定！"}
          </button>

          {result && (
            <div className="p-8 bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-2xl text-center">
              <div className="text-sm text-slate-400 mb-2">决定是</div>
              <div className="text-4xl font-bold text-primary-400 mb-4">{result}</div>
              {!spinning && <div className="inline-flex items-center gap-1 text-emerald-400 text-sm"><Check className="w-4 h-4" /> 就这个了！</div>}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
