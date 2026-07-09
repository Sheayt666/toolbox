"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Trash2, Copy, Check, Info, Filter } from "lucide-react";

interface Options {
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  removeEmptyLines: boolean;
}

function removeDuplicateLines(text: string, options: Options): { result: string; removed: number; original: number } {
  let lines = text.split("\n");
  const original = lines.length;

  if (options.removeEmptyLines) {
    lines = lines.filter(line => line.trim().length > 0);
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    let key = line;
    if (options.ignoreCase) key = key.toLowerCase();
    if (options.ignoreWhitespace) key = key.trim();

    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  const removed = original - result.length;
  return { result: result.join("\n"), removed, original };
}

export default function RemoveDuplicateLinesPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<Options>({
    ignoreCase: false,
    ignoreWhitespace: false,
    removeEmptyLines: false,
  });

  const { result, removed, original } = useMemo(() => {
    if (!input) return { result: "", removed: 0, original: 0 };
    return removeDuplicateLines(input, options);
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

  const toggleOption = (key: keyof Options) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <ToolLayout
      title="去除重复行"
      description="一键去除文本中的重复行，支持忽略大小写、忽略首尾空白、去除空行等多种选项"
      toolId="remove-duplicate-lines"
      icon={Trash2}
      category="文本工具"
      slug="remove-duplicate-lines"
    >
      <div className="max-w-4xl mx-auto space-y-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { key: "ignoreCase" as const, label: "忽略大小写" },
                { key: "ignoreWhitespace" as const, label: "忽略首尾空白" },
                { key: "removeEmptyLines" as const, label: "去除空行" },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => toggleOption(item.key)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    options[item.key]
                      ? "bg-red-500 text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    原始文本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {original} 行
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
                  {result ? result.split("\n").length : 0} 行
                  {removed > 0 && (
                    <span className="ml-2 text-emerald-500">移除 {removed} 行</span>
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
                去重后保留哪一行？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                默认保留首次出现的行，后续重复的行会被移除。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
