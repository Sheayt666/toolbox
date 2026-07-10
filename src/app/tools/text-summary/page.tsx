"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Check, Eraser } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const STOPWORDS = new Set([
  "的","了","和","是","在","我","有","他","这","为","之","也","就","都","而","及","与","个","上","下","不","要","你","会","能","对","中","来","去","说","把","被","让","给","向","从","到","里","外","那","它","她","们","或","但","如","因","由","以","于","一","个","们","地","着","过","又","可","以","其","此","即","所","则","若","虽","然","the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","should","could","of","in","on","at","to","for","with","by","from","as","and","or","but","if","then","that","this","these","those","it","he","she","they","we","you","i","not","no","can","so","than","too","very",
]);

interface Sentence {
  text: string;
  index: number;
  score: number;
}

function summarize(text: string, count: number): Sentence[] {
  // 分句（中英文标点）
  const rawSentences = text
    .split(/(?<=[.!?。！？；;])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSentences.length === 0) return [];

  // 词频统计
  const freq: Record<string, number> = {};
  rawSentences.forEach((s) => {
    const tokens = s.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
    tokens.forEach((t) => {
      const lower = t.toLowerCase();
      if (!STOPWORDS.has(lower) && t.length > 1) {
        freq[lower] = (freq[lower] || 0) + 1;
      }
    });
  });

  const maxFreq = Math.max(1, ...Object.values(freq));

  // 句子打分：词频 + 位置（首尾句加权）+ 长度
  const scored: Sentence[] = rawSentences.map((s, i) => {
    const tokens = s.match(/[\u4e00-\u9fa5]+|[a-zA-Z]+/g) || [];
    let score = 0;
    let valid = 0;
    tokens.forEach((t) => {
      const lower = t.toLowerCase();
      if (!STOPWORDS.has(lower) && t.length > 1) {
        score += (freq[lower] || 0) / maxFreq;
        valid++;
      }
    });
    score = valid > 0 ? score / Math.sqrt(valid) : 0;
    // 位置加权：首句 +0.25，末句 +0.1
    if (i === 0) score *= 1.25;
    if (i === rawSentences.length - 1) score *= 1.1;
    // 过短/过长惩罚
    if (s.length < 8) score *= 0.5;
    if (s.length > 200) score *= 0.8;
    return { text: s, index: i, score };
  });

  // 取 top N 并按原顺序输出
  const top = [...scored].sort((a, b) => b.score - a.score).slice(0, Math.min(count, scored.length));
  return top.sort((a, b) => a.index - b.index);
}

export default function TextSummaryPage() {
  const [text, setText] = useState("");
  const [count, setCount] = useState(3);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => summarize(text, count), [text, count]);
  const summaryText = summary.map((s) => s.text).join(" ");
  const compression = text.length > 0 ? Math.round((1 - summaryText.length / text.length) * 100) : 0;

  const copy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="文本摘要生成"
      description="自动提取文章关键句生成摘要"
      icon={FileText}
      category="文本工具"
      slug="text-summary"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">输入文章</label>
            <button onClick={() => setText("")} className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1">
              <Eraser className="w-3.5 h-3.5" /> 清空
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="粘贴需要生成摘要的长文本文章..."
            rows={8}
            className={inputClass + " resize-y"}
          />
          <p className="text-xs text-slate-500 mt-1.5">{text.length} 字</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-300 whitespace-nowrap">摘要句数</label>
          <input
            type="range" min={1} max={10} value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="flex-1 accent-primary-500"
          />
          <span className="text-sm text-white font-mono w-8 text-center">{count}</span>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">摘要结果</label>
            <div className="flex items-center gap-3">
              {text.length > 0 && <span className="text-xs text-emerald-400">压缩率 {compression}%</span>}
              <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 min-h-[100px]">
            {summary.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-4">输入文本后自动生成摘要</p>
            ) : (
              <div className="space-y-3">
                {summary.map((s, i) => (
                  <p key={i} className="text-sm text-slate-200 leading-relaxed">
                    <span className="text-primary-400 font-mono text-xs mr-2">{i + 1}.</span>
                    {s.text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
