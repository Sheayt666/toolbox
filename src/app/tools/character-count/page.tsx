"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check, Trash2, Info, FileText } from "lucide-react";

function countCharacters(text: string) {
  const total = text.length;
  const noSpaces = text.replace(/\s/g, "").length;
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const english = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const punctuation = (text.match(/[，。！？、；：""''（）《》【】…—\-.,!?;:'"()\[\]{}<>]/g) || []).length;
  return { total, noSpaces, chinese, english, digits, spaces, punctuation };
}

export default function CharacterCountPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countCharacters(text), [text]);

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
    { label: "总字符数", value: result.total, color: "text-sky-500" },
    { label: "不含空格", value: result.noSpaces, color: "text-blue-500" },
    { label: "中文字符", value: result.chinese, color: "text-red-500" },
    { label: "英文字符", value: result.english, color: "text-indigo-500" },
    { label: "数字字符", value: result.digits, color: "text-emerald-500" },
    { label: "空格换行", value: result.spaces, color: "text-slate-500" },
    { label: "标点符号", value: result.punctuation, color: "text-amber-500" },
  ];

  return (
    <ToolLayout
      title="字符数统计"
      description="统计文本的字符数量，支持含空格和不含空格统计，中英文数字分类统计，实时计算"
      toolId="character-count"
      icon={Type}
      category="文本工具"
      slug="character-count"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            placeholder="在此输入或粘贴要统计的文本..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                统计结果
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                总字符数和不含空格有什么区别？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                总字符数包括所有字符（空格、换行、制表符等）。不含空格是移除了所有空白字符后的字符数量。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
