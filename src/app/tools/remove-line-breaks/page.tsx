"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AlignLeft, Copy, Check, Trash2, Info } from "lucide-react";

function removeLineBreaks(text: string, separator: string, preserveParagraphs: boolean): string {
  if (preserveParagraphs) {
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map(p => p.replace(/\n+/g, separator)).join("\n\n");
  }
  return text.replace(/\n+/g, separator);
}

export default function RemoveLineBreaksPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [separator, setSeparator] = useState(" ");
  const [preserveParagraphs, setPreserveParagraphs] = useState(true);

  const output = useMemo(() => removeLineBreaks(input, separator, preserveParagraphs), [input, separator, preserveParagraphs]);

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
      title="去除换行符"
      description="去除文本中的换行符，将多行文本合并为一行，支持自定义分隔符和保留段落"
      toolId="remove-line-breaks"
      icon={AlignLeft}
      category="文本工具"
      slug="remove-line-breaks"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <AlignLeft className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                设置选项
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                分隔符
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: " ", label: "空格" },
                  { value: "", label: "无" },
                  { value: ", ", label: "逗号" },
                  { value: "; ", label: "分号" },
                  { value: " / ", label: "斜杠" },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={() => setSeparator(item.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      separator === item.value
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveParagraphs}
                onChange={(e) => setPreserveParagraphs(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">保留段落（空行分隔）</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-orange-500" />
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
              placeholder="在此输入或粘贴多行文本..."
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
                  <Check className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    处理结果
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
              placeholder="处理结果将显示在这里..."
              className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                保留段落是什么意思？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                开启保留段落后，空行分隔的段落会被保留，只有段落内部的换行会被移除。
                适合处理文章、段落文本等。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
