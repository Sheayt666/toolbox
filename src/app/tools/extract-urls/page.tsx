"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Link, Copy, Check, Trash2, Info } from "lucide-react";

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches.map(u => u.replace(/[.,;:!?]+$/, "")))];
}

export default function ExtractUrlsPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const urls = useMemo(() => extractUrls(input), [input]);
  const output = urls.join("\n");

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
      title="提取URL链接"
      description="从文本中提取所有URL链接，自动去重，支持HTTP和HTTPS，快速收集网址列表"
      toolId="extract-urls"
      icon={Link}
      category="文本工具"
      slug="extract-urls"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
              {urls.length}
            </div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400">
              链接数量
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link className="w-4 h-4 text-emerald-500" />
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
              placeholder="在此输入或粘贴包含URL链接的文本..."
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
                    提取结果
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {urls.length} 个链接
                </span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="提取的URL链接将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none font-mono text-sm"
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
                支持哪些URL格式？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                支持 HTTP 和 HTTPS 协议的链接，包括带路径、查询参数的完整URL。
                不带协议的链接（如 www.example.com）暂不支持。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
