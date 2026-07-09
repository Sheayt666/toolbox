"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Code2, Copy, Check, Trash2, Info } from "lucide-react";

function removeHtmlTags(text: string, keepLineBreaks: boolean): string {
  let result = text.replace(/<br\s*\/?>/gi, "\n");
  result = result.replace(/<\/p>/gi, "\n\n");
  result = result.replace(/<\/div>/gi, "\n");
  result = result.replace(/<\/li>/gi, "\n");
  result = result.replace(/<[^>]*>/g, "");
  result = result.replace(/&nbsp;/gi, " ");
  result = result.replace(/&amp;/gi, "&");
  result = result.replace(/&lt;/gi, "<");
  result = result.replace(/&gt;/gi, ">");
  result = result.replace(/&quot;/gi, '"');
  result = result.replace(/&#39;/gi, "'");

  if (!keepLineBreaks) {
    result = result.replace(/\n+/g, " ");
  } else {
    result = result.replace(/\n{3,}/g, "\n\n");
  }

  return result.trim();
}

export default function RemoveHtmlTagsPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [keepLineBreaks, setKeepLineBreaks] = useState(true);

  const output = useMemo(() => removeHtmlTags(input, keepLineBreaks), [input, keepLineBreaks]);

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
      title="去除HTML标签"
      description="一键去除文本中的所有HTML标签，提取纯文本内容，支持保留换行和HTML实体解码"
      toolId="remove-html-tags"
      icon={Code2}
      category="文本工具"
      slug="remove-html-tags"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Code2 className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                选项设置
              </h2>
            </div>
          </div>
          <div className="p-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepLineBreaks}
                onChange={(e) => setKeepLineBreaks(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-pink-500 focus:ring-pink-500"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">保留换行结构</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    HTML 代码
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
              placeholder="在此输入或粘贴包含HTML标签的文本..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
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
                  <Check className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    纯文本结果
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
              placeholder="纯文本结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                支持哪些 HTML 实体？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                支持常见的 HTML 实体解码，包括 &amp;nbsp;、&amp;amp;、&amp;lt;、&amp;gt;、&amp;quot; 等。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
