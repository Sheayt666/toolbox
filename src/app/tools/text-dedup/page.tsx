"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Trash2, Copy, Check, Type, Info, FileText, Filter } from "lucide-react";

interface DedupOptions {
  removeDuplicates: boolean;
  removeEmptyLines: boolean;
  trimLines: boolean;
  ignoreCase: boolean;
}

function dedupText(text: string, options: DedupOptions): { result: string; removedCount: number; originalLines: number } {
  let lines = text.split("\n");
  const originalLines = lines.length;
  let removedCount = 0;

  // 去除空白行
  if (options.removeEmptyLines) {
    const before = lines.length;
    lines = lines.filter(line => line.trim().length > 0);
    removedCount += before - lines.length;
  }

  // 去除首尾空格
  if (options.trimLines) {
    lines = lines.map(line => line.trim());
  }

  // 去除重复行
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    const before = lines.length;
    lines = lines.filter(line => {
      const key = options.ignoreCase ? line.toLowerCase() : line;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
    removedCount += before - lines.length;
  }

  return {
    result: lines.join("\n"),
    removedCount,
    originalLines,
  };
}

export default function TextDedupPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<DedupOptions>({
    removeDuplicates: true,
    removeEmptyLines: true,
    trimLines: true,
    ignoreCase: false,
  });

  const { result, removedCount, originalLines } = useMemo(() => {
    if (!input) return { result: "", removedCount: 0, originalLines: 0 };
    return dedupText(input, options);
  }, [input, options]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const toggleOption = (key: keyof DedupOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout
      title="文字去重"
      description="在线去除重复行、空白行，支持忽略大小写、去除首尾空格等功能"
      toolId="text-dedup"
      icon={Trash2}
      category="文本工具"
      slug="text-dedup"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 选项 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-red-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                去重选项
              </h2>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: "removeDuplicates" as const, label: "去除重复行", icon: Trash2 },
                { key: "removeEmptyLines" as const, label: "去除空白行", icon: FileText },
                { key: "trimLines" as const, label: "去除首尾空格", icon: Type },
                { key: "ignoreCase" as const, label: "忽略大小写", icon: Type },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => toggleOption(item.key)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                      options[item.key]
                        ? "bg-red-500 text-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 输入输出 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 输入 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    原始文本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {originalLines} 行
                </span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入或粘贴要去重的文本，每行一条..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleClear}
                disabled={!input}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          {/* 输出 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    去重结果
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {result ? result.split("\n").filter(l => l.trim().length > 0).length : 0} 行
                  {removedCount > 0 && (
                    <span className="ml-2 text-emerald-500">
                      移除 {removedCount} 行
                    </span>
                  )}
                </span>
              </div>
            </div>
            <textarea
              value={result}
              readOnly
              placeholder="去重结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!result}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                ) : (
                  <><Copy className="w-4 h-4" /> 复制结果</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
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
                忽略大小写是什么意思？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                开启忽略大小写后，"Hello" 和 "hello" 会被视为相同的内容，只保留第一行。
                关闭时则严格区分大小写。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                最多支持多少行文本？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具在浏览器本地运行，理论上支持大量文本。但为了保证性能，
                建议单次处理不超过10万行。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
