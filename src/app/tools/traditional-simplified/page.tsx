"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Languages, Copy, Check, Trash2, Info, ArrowLeftRight, Type, FileText } from "lucide-react";
import { simplifiedToTraditional, traditionalToSimplified, getCharCount } from "./chineseChars";

type ConvertDirection = "simp-to-trad" | "trad-to-simp";

const sampleText = `中华文化博大精深，源远流长。汉字是中华文明的瑰宝，承载着几千年的历史与智慧。简体字和繁体字同属汉字体系，在两岸三地都有广泛的使用。

学习中文，不仅是学习一门语言，更是了解一种文化。无论是简体还是繁体，都是中华文化的重要组成部分。`;

export default function TraditionalSimplifiedPage() {
  const [direction, setDirection] = useState<ConvertDirection>("simp-to-trad");
  const [input, setInput] = useState(sampleText);
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    if (direction === "simp-to-trad") {
      return simplifiedToTraditional(input);
    } else {
      return traditionalToSimplified(input);
    }
  }, [input, direction]);

  // 字数统计
  const stats = useMemo(() => {
    const totalChars = input.length;
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const lines = input ? input.split("\n").length : 0;
    return { totalChars, chineseChars, lines };
  }, [input]);

  const charCount = getCharCount();

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const handleLoadExample = () => {
    setInput(sampleText);
  };

  const handleSwap = () => {
    const newDirection = direction === "simp-to-trad" ? "trad-to-simp" : "simp-to-trad";
    setDirection(newDirection);
    // Swap input and output
    if (output) {
      setInput(output);
    }
  };

  return (
    <ToolLayout
      title="繁简转换"
      description="简体中文和繁体中文互转，实时转换，常用字全覆盖，两岸三地文字转换必备工具"
      toolId="traditional-simplified"
      icon={Languages}
      category="文本工具"
      slug="traditional-simplified"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 转换模式选择 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-rose-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  转换方向
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  加载示例
                </button>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
              <button
                onClick={() => {
                  if (direction !== "simp-to-trad") {
                    setDirection("simp-to-trad");
                    if (output) setInput(output);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  direction === "simp-to-trad"
                    ? "bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Type className="w-4 h-4" />
                简体 → 繁体
              </button>
              <button
                onClick={handleSwap}
                className="p-2 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="交换方向"
              >
                <ArrowLeftRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (direction !== "trad-to-simp") {
                    setDirection("trad-to-simp");
                    if (output) setInput(output);
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  direction === "trad-to-simp"
                    ? "bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Type className="w-4 h-4" />
                繁体 → 简体
              </button>
            </div>

            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
              内置 {charCount.toLocaleString()}+ 常用汉字对照表，实时转换，数据不上传服务器
            </div>
          </div>
        </div>

        {/* 输入输出区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 输入 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {direction === "simp-to-trad" ? "简体中文" : "繁体中文"}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {stats.totalChars} 字符
                </span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "simp-to-trad" ? "在此输入简体中文..." : "在此输入繁体中文..."}
              className="w-full h-80 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* 输出 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {direction === "simp-to-trad" ? "繁体中文" : "简体中文"}
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5" /> 已复制</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> 复制</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="w-full h-80 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 字数统计 */}
        <div className="flex flex-wrap gap-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              总字符数: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{stats.totalChars}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              中文字数: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{stats.chineseChars}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              行数: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{stats.lines}</span>
            </span>
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              繁简转换工具可以快速进行简体中文和繁体中文的互相转换。
              工具内置 {charCount.toLocaleString()}+ 常用汉字对照表，覆盖日常使用中的绝大多数汉字。
              所有转换在浏览器本地完成，文本数据不会上传到服务器，保护您的隐私安全。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <div className="text-sm font-medium text-rose-700 dark:text-rose-300">双向转换</div>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">简转繁 / 繁转简</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">实时转换</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">输入即时显示结果</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">字数统计</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">中英文分开统计</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
