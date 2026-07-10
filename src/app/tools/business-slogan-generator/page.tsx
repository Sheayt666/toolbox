"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Megaphone, Copy, Check, RefreshCw, Plus, X } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const TEMPLATES = [
  "{kw}，让生活更美好",
  "选择{kw}，选择{adj}",
  "{kw}——你{adj}的选择",
  "不止于{kw}，更超越期待",
  "{kw}，{adj}生活每一天",
  "因为{kw}，所以{adj}",
  "懂{kw}，更懂你",
  "{kw}，{adj}到无法拒绝",
  "一次{kw}，一生信赖",
  "{kw}，定义{adj}新标准",
  "为{kw}而生，为{adj}而来",
  "{kw}，{adj}从这里开始",
  "遇见{kw}，遇见{adj}",
  "{kw}，{adj}不将就",
  "品质{kw}，{adj}之选",
  "{kw}，让{adj}触手可及",
  "专注{kw}，成就{adj}",
  "{kw}，{adj}的力量",
  "用{kw}，点亮{adj}人生",
  "{kw}——{adj}，就是这么简单",
];

const ADJS = ["精彩", "非凡", "卓越", "安心", "高效", "智能", "专业", "放心", "简单", "畅快", "美好", "尊贵", "极致", "无忧", "可靠"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function genSlogans(keywords: string[], count: number): string[] {
  const results: string[] = [];
  const used = new Set<number>();
  while (results.length < count) {
    const tIdx = Math.floor(Math.random() * TEMPLATES.length);
    if (used.has(tIdx) && used.size < TEMPLATES.length) continue;
    used.add(tIdx);
    const kw = keywords.length > 0 ? pick(keywords) : "好物";
    const adj = pick(ADJS);
    results.push(TEMPLATES[tIdx].replace(/\{kw\}/g, kw).replace(/\{adj\}/g, adj));
  }
  return results;
}

export default function BusinessSloganGeneratorPage() {
  const [keywords, setKeywords] = useState<string[]>(["品质生活", "智能科技"]);
  const [input, setInput] = useState("");
  const [count, setCount] = useState(8);
  const [slogans, setSlogans] = useState<string[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generate = useCallback(() => {
    setSlogans(genSlogans(keywords.length > 0 ? keywords : ["品牌"], count));
  }, [keywords, count]);

  const addKeyword = () => {
    const v = input.trim();
    if (v && !keywords.includes(v)) setKeywords([...keywords, v]);
    setInput("");
  };

  const removeKeyword = (i: number) => setKeywords(keywords.filter((_, idx) => idx !== i));

  const copy = (i: number, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedIdx(i);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  return (
    <ToolLayout
      title="宣传标语生成"
      description="输入关键词生成创意宣传标语"
      icon={Megaphone}
      category="生成工具"
      slug="business-slogan-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">关键词</label>
          <div className="flex gap-2 mb-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              placeholder="输入关键词后回车添加..."
              className={inputClass}
            />
            <button onClick={addKeyword} className="inline-flex items-center gap-1 px-3 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
              <Plus className="w-4 h-4" /> 添加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((k, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-primary-500/10 text-primary-400 rounded-md">
                {k}
                <button onClick={() => removeKeyword(i)} className="hover:text-white"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {keywords.length === 0 && <span className="text-xs text-slate-600">暂无关键词，将使用默认词</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-300 whitespace-nowrap">生成数量</label>
          <input type="range" min={3} max={20} value={count} onChange={(e) => setCount(Number(e.target.value))} className="flex-1 accent-primary-500" />
          <span className="text-sm text-white font-mono w-8 text-center">{count}</span>
          <button onClick={generate} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
            <RefreshCw className="w-4 h-4" /> 生成
          </button>
        </div>

        {slogans.length > 0 && (
          <div className="space-y-2">
            {slogans.map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3.5 hover:border-[#3f3f46]">
                <div className="flex items-center gap-3 flex-1">
                  <span className="w-7 h-7 rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <p className="text-sm text-white">{s}</p>
                </div>
                <button onClick={() => copy(i, s)} className="text-slate-500 hover:text-white flex-shrink-0 ml-2">
                  {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        {slogans.length === 0 && (
          <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-10 text-center">
            <Megaphone className="w-10 h-10 mx-auto text-slate-700 mb-3" />
            <p className="text-sm text-slate-500">添加关键词后点击「生成」获取创意标语</p>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
