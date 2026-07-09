"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, ArrowLeftRight, Type } from "lucide-react";

function reverseText(text: string, mode: "characters" | "words" | "lines"): string {
  if (mode === "characters") {
    return text.split("").reverse().join("");
  } else if (mode === "words") {
    return text.split(/(\s+)/).reverse().join("");
  } else {
    // lines
    const lines = text.split("\n");
    return lines.reverse().join("\n");
  }
}

export default function TextReversePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"characters" | "words" | "lines">("characters");
  const [copied, setCopied] = useState(false);

  const handleReverse = useCallback(() => {
    if (!input) {
      setOutput("");
      return;
    }
    setOutput(reverseText(input, mode));
  }, [input, mode]);

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
    setInput("Hello, World!\n这是一段测试文本\n用于测试文本反转功能");
  }, []);

  return (
    <ToolLayout
      title="文本反转"
      description="在线文本反转工具，支持字符反转、单词反转、行反转多种模式"
      icon={Type}
      category="开发工具"
      slug="text-reverse"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-white">文本反转</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {[
                { value: "characters", label: "字符" },
                { value: "words", label: "单词" },
                { value: "lines", label: "行" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMode(opt.value as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    mode === opt.value
                      ? "bg-[#27272a] text-rose-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              示例
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入文本</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入要反转的文本..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleReverse}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-500/25"
            >
              反转
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">反转结果</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="反转结果将显示在这里..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
          <li>• 支持三种反转模式：字符反转、单词反转、行反转</li>
          <li>• 字符反转将每个字符的顺序颠倒，单词反转保持字符顺序不变</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
