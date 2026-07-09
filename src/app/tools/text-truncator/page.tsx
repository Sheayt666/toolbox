"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Scissors,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
} from "lucide-react";

export default function TextTruncatorPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [maxLength, setMaxLength] = useState(100);
  const [addEllipsis, setAddEllipsis] = useState(true);
  const [mode, setMode] = useState<"char" | "word">("char");

  const handleTruncate = useCallback(() => {
    if (!input.trim()) return;
    
    if (mode === "char") {
      if (input.length <= maxLength) {
        setOutput(input);
        return;
      }
      let result = input.substring(0, maxLength);
      if (addEllipsis) result += "...";
      setOutput(result);
    } else {
      const words = input.split(/\s+/);
      if (words.length <= maxLength) {
        setOutput(input);
        return;
      }
      let result = words.slice(0, maxLength).join(" ");
      if (addEllipsis) result += "...";
      setOutput(result);
    }
  }, [input, maxLength, addEllipsis, mode]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "truncated.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="文本截断工具"
      description="按字符数或字数截断文本，支持添加省略号，多种截断模式"
      toolId="text-truncator"
      icon={Scissors}
      category="文本工具"
      slug="text-truncator"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1 bg-[#27272a] rounded-xl p-1">
              <button
                onClick={() => setMode("char")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "char" ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                按字符
              </button>
              <button
                onClick={() => setMode("word")}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  mode === "word" ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                按单词
              </button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">长度:</span>
              <input
                type="number"
                value={maxLength}
                onChange={(e) => setMaxLength(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <label className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={addEllipsis}
                onChange={(e) => setAddEllipsis(e.target.checked)}
                className="w-4 h-4 rounded border-[#3f3f46] bg-[#09090b] text-primary-500 focus:ring-primary-500/50"
              />
              <span className="text-sm text-zinc-300">添加省略号</span>
            </label>
            <button
              onClick={handleTruncate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Scissors className="w-4 h-4" />
              截断文本
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">原始文本</span>
                <span className="ml-auto text-xs text-zinc-500">
                  {mode === "char" ? `${input.length} 字符` : `${input.split(/\s+/).filter(Boolean).length} 词`}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入或粘贴文本..."
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Scissors className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">截断结果</span>
                <span className="ml-auto text-xs text-zinc-500">
                  {mode === "char" ? `${output.length} 字符` : `${output.split(/\s+/).filter(Boolean).length} 词`}
                </span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="截断后的文本将显示在这里..."
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            按字符数或字数截断文本，支持添加省略号，多种截断模式。支持按字符数和按单词数两种截断方式，
            可选择是否添加省略号（...）。常用于摘要生成、标题截断、
            预览文本等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
