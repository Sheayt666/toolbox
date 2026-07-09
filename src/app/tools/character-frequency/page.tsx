"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  BarChart2,
  Copy,
  Check,
  Trash2,
  Type,
} from "lucide-react";

function getFrequency(text: string): Array<{ char: string; count: number; percent: number }> {
  const map = new Map<string, number>();
  let total = 0;
  for (const ch of text) {
    if (ch === " " || ch === "\n" || ch === "\t") continue;
    map.set(ch, (map.get(ch) || 0) + 1);
    total++;
  }
  const result = Array.from(map.entries())
    .map(([char, count]) => ({ char, count, percent: total > 0 ? (count / total) * 100 : 0 }))
    .sort((a, b) => b.count - a.count);
  return result;
}

export default function CharacterFrequencyPage() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Array<{ char: string; count: number; percent: number }>>([]);
  const [error, setError] = useState("");

  const handleAnalyze = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入文本");
      return;
    }
    try {
      const r = getFrequency(input);
      setResults(r);
    } catch (e) {
      setError("分析失败: " + (e as Error).message);
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setResults([]);
    setError("");
  }, []);

  const totalCount = results.reduce((sum, r) => sum + r.count, 0);
  const maxCount = results.length > 0 ? results[0].count : 1;

  return (
    <ToolLayout
      title="字符频率统计"
      description="统计文本中每个字符出现的频率，按出现次数排序，快速分析字符分布"
      toolId="character-frequency"
      icon={BarChart2}
      category="文本工具"
      slug="character-frequency"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleAnalyze}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <BarChart2 className="w-4 h-4" />
              统计字符频率
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
            <div className="lg:col-span-2 border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">输入文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sampleText}
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="lg:col-span-3 border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-zinc-300">字符频率排行</span>
                </div>
                {results.length > 0 && (
                  <span className="text-xs text-zinc-500">
                    共 {results.length} 种字符，{totalCount} 次出现
                  </span>
                )}
              </div>
              <div className="h-72 overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                    统计结果将显示在这里...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-[#27272a]/50 rounded-lg">
                        <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                          i < 3 ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" : "bg-[#27272a] text-zinc-500"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="font-mono text-sm text-zinc-200 min-w-[80px]">
                          {item.char}
                        </span>
                        <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 w-16 text-right">
                          {item.count} 次
                        </span>
                        <span className="text-xs text-zinc-500 w-14 text-right">
                          {item.percent.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            统计文本中每个字符出现的频率，按出现次数排序，快速分析字符分布。按出现次数从高到低排序，可视化展示频率分布，
            支持中英文混合文本。常用于文本分析、关键词提取、密码分析等场景。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
