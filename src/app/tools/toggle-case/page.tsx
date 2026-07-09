"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ArrowUpDown, Copy, Check, Trash2, Info } from "lucide-react";

function transformText(text: string): string {
  return text.split("").map(char => {
    if (char === char.toUpperCase() && char !== char.toLowerCase()) {
      return char.toLowerCase();
    }
    if (char === char.toLowerCase() && char !== char.toUpperCase()) {
      return char.toUpperCase();
    }
    return char;
  }).join("");
}

export default function ToggleCasePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = transformText(input);

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

  return (
    <ToolLayout
      title="大小写反转"
      description="反转文本中每个字母的大小写，大写字母变小写，小写字母变大写，数字符号保持不变"
      toolId="toggle-case"
      icon={ArrowUpDown}
      category="文本工具"
      slug="toggle-case"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-fuchsia-500" />
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
              placeholder="在此输入或粘贴文本，例如：Hello World"
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
                  <Check className="w-4 h-4 text-fuchsia-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    反转结果
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {output.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="反转结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              工具说明
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            反转文本中每个字母的大小写，大写字母变小写，小写字母变大写，数字符号保持不变，纯前端本地处理，数据不会上传到服务器。
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
