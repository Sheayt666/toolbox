"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Languages, Search } from "lucide-react";

const INITIALS = ["b", "p", "m", "f", "d", "t", "n", "l", "g", "k", "h", "j", "q", "x", "zh", "ch", "sh", "r", "z", "c", "s", "y", "w"];
const FINALS = ["a", "o", "e", "i", "u", "ü", "ai", "ei", "ui", "ao", "ou", "iu", "ie", "üe", "er", "an", "en", "in", "un", "ün", "ang", "eng", "ing", "ong"];
const WHOLE_SYLLABLES = ["zhi", "chi", "shi", "ri", "zi", "ci", "si", "yi", "wu", "yu", "ye", "yue", "yuan", "yin", "yun", "ying"];
const TONES = [
  { name: "第一声（阴平）", symbol: "ˉ", example: "mā（妈）" },
  { name: "第二声（阳平）", symbol: "ˊ", example: "má（麻）" },
  { name: "第三声（上声）", symbol: "ˇ", example: "mǎ（马）" },
  { name: "第四声（去声）", symbol: "ˋ", example: "mà（骂）" },
  { name: "轻声", symbol: "˙", example: "ma（吗）" },
];

export default function PinyinTablePage() {
  const [tab, setTab] = useState<"initials" | "finals" | "whole" | "tones">("initials");
  const [query, setQuery] = useState("");

  const filteredInitials = useMemo(() => query ? INITIALS.filter((i) => i.includes(query.toLowerCase())) : INITIALS, [query]);
  const filteredFinals = useMemo(() => query ? FINALS.filter((f) => f.includes(query.toLowerCase())) : FINALS, [query]);
  const filteredWhole = useMemo(() => query ? WHOLE_SYLLABLES.filter((w) => w.includes(query.toLowerCase())) : WHOLE_SYLLABLES, [query]);

  return (
    <ToolLayout title="拼音对照表" description="查询汉语拼音声母韵母、整体认读音节和声调规则" icon={Languages} category="查询工具" slug="pinyin-table">
      <div className="p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "initials", label: "声母" },
            { key: "finals", label: "韵母" },
            { key: "whole", label: "整体认读" },
            { key: "tones", label: "声调" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab !== "tones" && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索拼音..."
              className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>
        )}

        {tab === "initials" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredInitials.map((item) => (
              <div key={item} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center hover:border-primary-500/30 transition-colors">
                <div className="text-2xl font-bold text-primary-400 font-mono">{item}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "finals" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredFinals.map((item) => (
              <div key={item} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center hover:border-primary-500/30 transition-colors">
                <div className="text-2xl font-bold text-emerald-400 font-mono">{item}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "whole" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {filteredWhole.map((item) => (
              <div key={item} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center hover:border-primary-500/30 transition-colors">
                <div className="text-2xl font-bold text-purple-400 font-mono">{item}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "tones" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TONES.map((tone) => (
              <div key={tone.name} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl text-primary-400">{tone.symbol}</span>
                  <div>
                    <div className="text-white font-medium">{tone.name}</div>
                    <div className="text-sm text-slate-400 font-mono">{tone.example}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
