"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Copy, Check, Trash2, Info, Calculator } from "lucide-react";

interface ExtractOptions {
  includeDecimals: boolean;
  includeNegatives: boolean;
  includeCommas: boolean;
  dedupe: boolean;
}

function extractNumbers(text: string, options: ExtractOptions): string[] {
  let pattern: RegExp;
  
  if (options.includeDecimals && options.includeNegatives) {
    pattern = /-?\d[\d,]*(?:\.\d+)?/g;
  } else if (options.includeDecimals) {
    pattern = /\d[\d,]*(?:\.\d+)?/g;
  } else if (options.includeNegatives) {
    pattern = /-?\d[\d,]*/g;
  } else {
    pattern = /\d[\d,]*/g;
  }

  const matchResult = text.match(pattern);
  let matches: string[] = matchResult ? [...matchResult] : [];
  
  if (!options.includeCommas) {
    matches = matches.map(m => m.replace(/,/g, ""));
  }

  if (options.dedupe) {
    matches = [...new Set(matches)];
  }

  return matches;
}

export default function ExtractNumbersPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ExtractOptions>({
    includeDecimals: true,
    includeNegatives: true,
    includeCommas: false,
    dedupe: false,
  });

  const numbers = useMemo(() => extractNumbers(input, options), [input, options]);
  const output = numbers.join("\n");

  const sum = useMemo(() => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((acc, n) => acc + parseFloat(n.replace(/,/g, "")) || 0, 0);
  }, [numbers]);

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

  const toggleOption = (key: keyof ExtractOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout
      title="提取数字"
      description="从文本中提取所有数字，支持整数、小数和负数，自动求和统计，快速提取数值数据"
      toolId="extract-numbers"
      icon={Hash}
      category="文本工具"
      slug="extract-numbers"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                提取选项
              </h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: "includeDecimals" as const, label: "包含小数" },
                { key: "includeNegatives" as const, label: "包含负数" },
                { key: "includeCommas" as const, label: "保留千分位" },
                { key: "dedupe" as const, label: "去重" },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => toggleOption(item.key)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    options[item.key]
                      ? "bg-violet-500 text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">
              {numbers.length}
            </div>
            <div className="text-xs text-violet-600 dark:text-violet-400">
              数字个数
            </div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {sum.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              求和
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    输入文本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {input.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入或粘贴包含数字的文本..."
              className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
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

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    提取结果
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {numbers.length} 个数字
                </span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="提取的数字将显示在这里..."
              className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none font-mono text-sm"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-violet-500 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                什么是千分位？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                千分位是数字中每隔三位添加的逗号分隔符，例如 1,234,567。
                开启保留千分位后，数字中的逗号会被保留。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
