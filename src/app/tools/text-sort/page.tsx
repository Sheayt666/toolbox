"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, ArrowUpDown, Type } from "lucide-react";

type SortOrder = "asc" | "desc";
type SortType = "text" | "number" | "length";

function sortLines(text: string, order: SortOrder, type: SortType, unique: boolean): string {
  let lines = text.split("\n");

  if (unique) {
    lines = [...new Set(lines)];
  }

  lines.sort((a, b) => {
    let comparison = 0;

    if (type === "number") {
      const numA = parseFloat(a) || 0;
      const numB = parseFloat(b) || 0;
      comparison = numA - numB;
    } else if (type === "length") {
      comparison = a.length - b.length;
    } else {
      comparison = a.localeCompare(b, "zh-CN");
    }

    return order === "asc" ? comparison : -comparison;
  });

  return lines.join("\n");
}

export default function TextSortPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [type, setType] = useState<SortType>("text");
  const [unique, setUnique] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSort = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(sortLines(input, order, type, unique));
  }, [input, order, type, unique]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput("banana\napple\ncherry\ndate\napple\nelderberry\n10\n2\n100\n30");
  }, []);

  return (
    <ToolLayout
      title="文本行排序"
      description="在线文本行排序工具，支持升序降序、文本数字排序、去重等多种功能"
      icon={Type}
      category="开发工具"
      slug="text-sort"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">文本行排序</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">类型:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {[
                { value: "text", label: "文本" },
                { value: "number", label: "数字" },
                { value: "length", label: "长度" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setType(opt.value as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    type === opt.value
                      ? "bg-[#27272a] text-indigo-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">顺序:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setOrder("asc")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  order === "asc"
                    ? "bg-[#27272a] text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                升序
              </button>
              <button
                onClick={() => setOrder("desc")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  order === "desc"
                    ? "bg-[#27272a] text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                降序
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-indigo-500 focus:ring-indigo-500/50"
            />
            <span className="text-sm text-slate-400">去重</span>
          </label>

          <button
            onClick={handleSort}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            <ArrowUpDown className="w-4 h-4" />
            排序
          </button>

          <button
            onClick={handleLoadExample}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors"
          >
            示例
          </button>

          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <span className="text-xs text-slate-500">
              {input.split("\n").length} 行 · {input.length} 字符
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="每行一条数据，例如：
banana
apple
cherry"
            spellCheck={false}
            className="w-full h-[400px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">排序结果</label>
            <span className="text-xs text-slate-500">
              {output ? output.split("\n").length : 0} 行 · {output.length} 字符
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="排序结果将显示在这里..."
            spellCheck={false}
            className="w-full h-[400px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制结果
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持文本排序（按字典序）、数字排序（按数值大小）、长度排序（按字符数）</li>
          <li>• 可选择升序或降序排列，支持去重功能</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
