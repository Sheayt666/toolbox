"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check, Trash2, Info } from "lucide-react";

function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

export default function TitleCasePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = toTitleCase(input);

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
      title="标题大小写转换"
      description="将文本转换为标题格式，每个单词首字母大写，其余字母小写，支持中英文混合文本"
      toolId="title-case"
      icon={Type}
      category="文本工具"
      slug="title-case"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-emerald-500" />
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
              placeholder="在此输入或粘贴文本，例如：hello world"
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
                    转换结果
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
              placeholder="标题格式结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
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
                什么是标题格式？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                标题格式（Title Case）是指每个单词的首字母大写，其余字母小写的格式。
                例如 &quot;hello world&quot; 转换后为 &quot;Hello World&quot;。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                中文字符会被转换吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                中文字符没有大小写之分，工具只会转换英文字母，中文字符会保持原样不变。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
