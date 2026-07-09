"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AlignLeft, Copy, Check, Trash2, Info, FileText } from "lucide-react";

function countSentences(text: string) {
  if (!text.trim()) return { total: 0, chinese: 0, english: 0, avgChars: 0, avgWords: 0 };
  
  const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0);
  const total = sentences.length;
  
  const chineseCount = (text.match(/[。！？]/g) || []).length;
  const englishCount = (text.match(/[.!?]/g) || []).length;
  
  const avgChars = total > 0 ? Math.round(sentences.reduce((sum, s) => sum + s.trim().length, 0) / total) : 0;
  
  const totalWords = sentences.reduce((sum, s) => {
    const chinese = (s.match(/[\u4e00-\u9fa5]/g) || []).length;
    const english = (s.match(/[a-zA-Z]+/g) || []).length;
    return sum + chinese + english;
  }, 0);
  const avgWords = total > 0 ? Math.round(totalWords / total) : 0;
  
  return { total, chinese: chineseCount, english: englishCount, avgChars, avgWords };
}

export default function SentenceCountPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countSentences(text), [text]);

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
    { label: "句子总数", value: result.total, color: "text-amber-500" },
    { label: "中文句数", value: result.chinese, color: "text-red-500" },
    { label: "英文句数", value: result.english, color: "text-blue-500" },
    { label: "平均字符", value: result.avgChars, color: "text-sky-500" },
    { label: "平均字数", value: result.avgWords, color: "text-emerald-500" },
  ];

  return (
    <ToolLayout
      title="句子数统计"
      description="统计文本中的句子数量，支持中英文标点识别，统计平均句子长度，实时计算更新"
      toolId="sentence-count"
      icon={AlignLeft}
      category="文本工具"
      slug="sentence-count"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlignLeft className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            placeholder="在此输入或粘贴要统计句子数的文本..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
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
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <ul className="text-amber-600 dark:text-amber-400 text-xs space-y-1.5">
              <li>• 句子以句号、问号、感叹号等结束标点分隔</li>
              <li>• 支持中英文标点：. ! ? 。 ！ ？</li>
              <li>• 连续多个结束标点只算一个句子</li>
              <li>• 平均字数 = 总字数 / 句子数</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
