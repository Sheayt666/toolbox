"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AlignLeft, Copy, Check, Trash2, Info, FileText } from "lucide-react";

function countLines(text: string) {
  if (text.length === 0) return { total: 0, nonEmpty: 0, empty: 0, maxLength: 0, avgLength: 0 };
  const lines = text.split("\n");
  const total = lines.length;
  const nonEmpty = lines.filter(l => l.trim().length > 0).length;
  const empty = total - nonEmpty;
  const maxLength = Math.max(...lines.map(l => l.length));
  const avgLength = Math.round(lines.reduce((sum, l) => sum + l.length, 0) / total);
  return { total, nonEmpty, empty, maxLength, avgLength };
}

export default function LineCountPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countLines(text), [text]);

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
    { label: "总行数", value: result.total, color: "text-emerald-500" },
    { label: "非空行", value: result.nonEmpty, color: "text-teal-500" },
    { label: "空行", value: result.empty, color: "text-slate-500" },
    { label: "最长行字符", value: result.maxLength, color: "text-amber-500" },
    { label: "平均行字符", value: result.avgLength, color: "text-sky-500" },
  ];

  return (
    <ToolLayout
      title="行数统计"
      description="统计文本的行数，支持统计总行数、非空行数、空行数，以及最长行和平均行长度"
      toolId="line-count"
      icon={AlignLeft}
      category="文本工具"
      slug="line-count"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            placeholder="在此输入或粘贴要统计行数的文本..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
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
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <ul className="text-emerald-600 dark:text-emerald-400 text-xs space-y-1.5">
              <li>• 总行数：以换行符分隔的行数，空行也计算在内</li>
              <li>• 非空行：去掉首尾空白后仍有内容的行</li>
              <li>• 空行：空白或只有空白字符的行</li>
              <li>• 最长行：所有行中字符数最多的一行</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
