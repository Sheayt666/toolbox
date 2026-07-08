"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  AlignLeft,
  Copy,
  Check,
  Trash2,
  Info,
  Sparkles,
  Type,
} from "lucide-react";
import { textToPinyin, getPinyinCount } from "./pinyinData";

type SeparatorType = "space" | "comma" | "hyphen" | "none";

const sampleText = `中华文化博大精深，源远流长。汉字是中华文明的瑰宝，承载着几千年的历史与智慧。

学习中文拼音是入门的第一步，它可以帮助我们正确地发音和识字。无论是简体还是繁体，拼音都是学习汉语的重要工具。`;

const separatorMap: Record<SeparatorType, string> = {
  space: " ",
  comma: ",",
  hyphen: "-",
  none: "",
};

export default function TextToPinyinPage() {
  const [input, setInput] = useState(sampleText);
  const [withTone, setWithTone] = useState(true);
  const [firstLetterOnly, setFirstLetterOnly] = useState(false);
  const [separator, setSeparator] = useState<SeparatorType>("space");
  const [copied, setCopied] = useState(false);

  // 实时转换
  const output = useMemo(() => {
    if (!input) return "";
    return textToPinyin(input, withTone, firstLetterOnly, separatorMap[separator]);
  }, [input, withTone, firstLetterOnly, separator]);

  // 字数统计
  const stats = useMemo(() => {
    const totalChars = input.length;
    const chineseChars = (input.match(/[\u4e00-\u9fa5]/g) || []).length;
    const lines = input ? input.split("\n").length : 0;
    return { totalChars, chineseChars, lines };
  }, [input]);

  const pinyinCount = getPinyinCount();

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

  return (
    <ToolLayout
      title="文字转拼音"
      description="中文汉字转换为拼音，支持带声调、首字母模式，多种分隔符选择，实时转换"
      toolId="text-to-pinyin"
      icon={AlignLeft}
      category="文本工具"
      slug="text-to-pinyin"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 选项设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  转换设置
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
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

          <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 声调设置 */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                声调显示
              </label>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setWithTone(true)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    withTone
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  带声调
                </button>
                <button
                  onClick={() => setWithTone(false)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    !withTone
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  无声调
                </button>
              </div>
            </div>

            {/* 模式设置 */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                输出模式
              </label>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                <button
                  onClick={() => setFirstLetterOnly(false)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    !firstLetterOnly
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  完整拼音
                </button>
                <button
                  onClick={() => setFirstLetterOnly(true)}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    firstLetterOnly
                      ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  首字母
                </button>
              </div>
            </div>

            {/* 分隔符设置 */}
            <div>
              <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                分隔符
              </label>
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                {(Object.keys(separatorMap) as SeparatorType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSeparator(type)}
                    className={`flex-1 px-2 py-2 text-sm font-medium rounded-md transition-all ${
                      separator === type
                        ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    {type === "space" && "空格"}
                    {type === "comma" && "逗号"}
                    {type === "hyphen" && "连字符"}
                    {type === "none" && "无"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-4 pb-3 text-xs text-zinc-500 dark:text-zinc-500">
            内置 {pinyinCount.toLocaleString()}+ 常用汉字拼音对照表，实时转换，数据不上传服务器
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
                    输入文本
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
              placeholder="在此输入中文文本..."
              className="w-full h-80 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* 输出 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    拼音结果
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
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              总字符数: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{stats.totalChars}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              汉字数: <span className="font-semibold text-zinc-900 dark:text-zinc-200">{stats.chineseChars}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
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
              文字转拼音工具可以快速将中文汉字转换为拼音。
              工具内置 {pinyinCount.toLocaleString()}+ 常用汉字拼音对照表，覆盖日常使用中的绝大多数汉字。
              所有转换在浏览器本地完成，文本数据不会上传到服务器，保护您的隐私安全。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">多种模式</div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">带声调/无声调/首字母</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">实时转换</div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">输入即时显示结果</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">字数统计</div>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">中英文分开统计</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
