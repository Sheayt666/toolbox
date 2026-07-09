"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileSearch,
  Type,
  Hash,
  AlignLeft,
  Clock,
  BookOpen,
} from "lucide-react";

interface TextStats {
  chars: number;
  charsNoSpace: number;
  words: number;
  lines: number;
  paragraphs: number;
  sentences: number;
  avgWordLength: number;
  readingTime: number;
  chineseChars: number;
  englishChars: number;
  digits: number;
  spaces: number;
  uniqueWords: number;
}

function analyzeText(text: string): TextStats {
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishChars = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  
  const lines = text ? text.split("\n").length : 0;
  const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
  const sentences = text ? (text.match(/[.!?。！？]/g) || []).length || (text.trim() ? 1 : 0) : 0;
  
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const chineseWords = chineseChars; // 中文按字算
  const words = englishWords + chineseWords;
  
  const avgWordLength = words > 0 ? charsNoSpace / words : 0;
  const readingTime = Math.ceil(words / 300); // 300词/分钟
  
  const allWords = text.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
  const uniqueWords = new Set(allWords).size;
  
  return {
    chars, charsNoSpace, words, lines, paragraphs, sentences,
    avgWordLength, readingTime, chineseChars, englishChars,
    digits, spaces, uniqueWords,
  };
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
  <div className="bg-[#09090b] rounded-xl p-4 border border-[#27272a]">
    <div className="flex items-center gap-2 mb-2">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-xs text-zinc-500">{label}</span>
    </div>
    <div className="text-xl font-bold text-zinc-100">{value}</div>
  </div>
);

export default function TextAnalyzerPage() {
  const [input, setInput] = useState("");

  const stats = useMemo(() => analyzeText(input), [input]);

  return (
    <ToolLayout
      title="文本综合分析"
      description="文本综合分析工具，统计字符、词频、可读性、平均词长等多维度分析"
      toolId="text-analyzer"
      icon={FileSearch}
      category="文本工具"
      slug="text-analyzer"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-sky-400" />
              <span className="text-sm font-medium text-zinc-300">输入文本</span>
              <span className="ml-auto text-xs text-zinc-500">
                实时统计
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入或粘贴文本进行综合分析...\n\n支持中英文混合文本分析，实时显示统计结果。"
              spellCheck={false}
              className="w-full h-48 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-zinc-200 text-sm resize-none outline-none focus:ring-0 focus:border-primary-500/50 placeholder-zinc-600 mt-2"
            />
          </div>

          {/* 统计卡片 */}
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              <StatCard icon={Type} label="总字符数" value={stats.chars} color="from-sky-500 to-blue-500" />
              <StatCard icon={Hash} label="不含空格" value={stats.charsNoSpace} color="from-cyan-500 to-teal-500" />
              <StatCard icon={BookOpen} label="总词数" value={stats.words} color="from-violet-500 to-purple-500" />
              <StatCard icon={AlignLeft} label="行数" value={stats.lines} color="from-indigo-500 to-blue-500" />
              <StatCard icon={FileSearch} label="段落数" value={stats.paragraphs} color="from-emerald-500 to-teal-500" />
              <StatCard icon={Clock} label="阅读时间" value={`${stats.readingTime} 分钟`} color="from-amber-500 to-orange-500" />
              <StatCard icon={Type} label="平均词长" value={stats.avgWordLength.toFixed(1)} color="from-pink-500 to-rose-500" />
              <StatCard icon={Hash} label="唯一词数" value={stats.uniqueWords} color="from-fuchsia-500 to-purple-500" />
            </div>

            {/* 字符构成 */}
            <div className="bg-[#09090b] rounded-xl p-4 border border-[#27272a]">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">字符构成分析</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-16">中文字符</span>
                  <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                      style={{ width: stats.chars > 0 ? `${(stats.chineseChars / stats.chars) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-300 w-16 text-right font-mono">{stats.chineseChars}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-16">英文字母</span>
                  <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: stats.chars > 0 ? `${(stats.englishChars / stats.chars) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-300 w-16 text-right font-mono">{stats.englishChars}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-16">数字</span>
                  <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: stats.chars > 0 ? `${(stats.digits / stats.chars) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-300 w-16 text-right font-mono">{stats.digits}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 w-16">空白字符</span>
                  <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-zinc-500 to-zinc-400 rounded-full"
                      style={{ width: stats.chars > 0 ? `${(stats.spaces / stats.chars) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-zinc-300 w-16 text-right font-mono">{stats.spaces}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            文本综合分析工具，统计字符、词频、可读性、平均词长等多维度分析。支持字符数、词数、行数、段落数、
            句子数、平均词长、阅读时间、字符构成等多维度分析。
            实时计算，无需点击按钮。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
