"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Check, Trash2, Info, Type } from "lucide-react";

function countWords(text: string) {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const digits = (text.match(/[0-9]+/g) || []).length;
  const totalWords = chineseChars + englishWords + digits;
  return { totalWords, chineseChars, englishWords, digits };
}

export default function WordCountPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countWords(text), [text]);

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

  return (
    <ToolLayout
      title="词数统计"
      description="统计文本中的单词数量，支持中英文混合统计，中文按字计算，英文按单词计算，实时更新"
      toolId="word-count"
      icon={FileText}
      category="文本工具"
      slug="word-count"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            placeholder="在此输入或粘贴要统计词数的文本..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                统计结果
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-center">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {result.totalWords.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  总字数
                </div>
                <div className="text-xs text-blue-500 dark:text-blue-500 mt-1">
                  中文按字 + 英文按词
                </div>
              </div>
              <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {result.chineseChars.toLocaleString()}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  中文字符
                </div>
                <div className="text-xs text-red-500 dark:text-red-500 mt-1">
                  汉字数量
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                <div className="text-2xl font-bold text-indigo-500 mb-1">
                  {result.englishWords.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  英文单词
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-500 mb-1">
                  {result.digits.toLocaleString()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  数字组数
                </div>
              </div>
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
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <ul className="text-blue-600 dark:text-blue-400 text-xs space-y-1.5">
              <li>• 总字数 = 中文字符数 + 英文单词数 + 数字组数</li>
              <li>• 中文字符：每个汉字算一个字</li>
              <li>• 英文单词：连续英文字母算一个单词</li>
              <li>• 数字组数：连续数字算一组</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
