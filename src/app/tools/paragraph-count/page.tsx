"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Check, Trash2, Info, AlignLeft } from "lucide-react";

function countParagraphs(text: string) {
  if (!text.trim()) return { total: 0, avgChars: 0, avgWords: 0, shortest: 0, longest: 0 };
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const total = paragraphs.length;
  const charCounts = paragraphs.map(p => p.length);
  const wordCounts = paragraphs.map(p => {
    const chinese = (p.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (p.match(/[a-zA-Z]+/g) || []).length;
    return chinese + english;
  });
  const avgChars = Math.round(charCounts.reduce((a, b) => a + b, 0) / total);
  const avgWords = Math.round(wordCounts.reduce((a, b) => a + b, 0) / total);
  const shortest = Math.min(...charCounts);
  const longest = Math.max(...charCounts);
  return { total, avgChars, avgWords, shortest, longest };
}

export default function ParagraphCountPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countParagraphs(text), [text]);

  const handleClear = () => {
    setText("");
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const statItems = [
    { label: "段落数", value: result.total, color: "text-violet-500" },
    { label: "平均字符", value: result.avgChars, color: "text-sky-500" },
    { label: "平均字数", value: result.avgWords, color: "text-emerald-500" },
    { label: "最短字符", value: result.shortest, color: "text-amber-500" },
    { label: "最长字符", value: result.longest, color: "text-rose-500" },
  ];

  return (
    <ToolLayout
      title="段落数统计"
      description="统计文本中的段落数量，自动识别空行分隔的段落，统计平均长度和最长最短段落"
      toolId="paragraph-count"
      icon={FileText}
      category="文本工具"
      slug="paragraph-count"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 复制</>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴要统计段落数的文本，段落之间用空行分隔..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                统计结果
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {statItems.map((item) => (
                <div
                  key={item.label}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                >
                  <div className={`text-2xl font-bold ${item.color} mb-1`}>
                    {item.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              统计说明
            </h3>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
            <ul className="text-violet-600 dark:text-violet-400 text-xs space-y-1.5">
              <li>• 段落：以空行（一行或多行空白）分隔的文本块</li>
              <li>• 平均字符：所有段落字符数的平均值</li>
              <li>• 平均字数：所有段落字数的平均值（中文按字+英文按词）</li>
              <li>• 空白段落不计算在内</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
