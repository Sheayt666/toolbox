"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  MoveHorizontal,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
} from "lucide-react";

function addLetterSpacing(text: string, spacer: string, count: number): string {
  const spacerStr = spacer.repeat(count);
  return text.split("").map((ch, i) => {
    if (i === 0) return ch;
    if (ch === "\n") return ch;
    return spacerStr + ch;
  }).join("");
}

export default function LetterSpacingPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [spacer, setSpacer] = useState(" ");
  const [count, setCount] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;
    setOutput(addLetterSpacing(input, spacer || " ", count));
  }, [input, spacer, count]);

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
    a.download = "spaced-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="字间距生成器"
      description="在文本字符之间添加空格或自定义字符，生成带间距的文字效果"
      toolId="letter-spacing"
      icon={MoveHorizontal}
      category="文本工具"
      slug="letter-spacing"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">间距字符:</span>
              <input
                type="text"
                value={spacer}
                onChange={(e) => setSpacer(e.target.value)}
                maxLength={3}
                className="w-12 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">数量:</span>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                min={1}
                max={10}
                className="w-16 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <MoveHorizontal className="w-4 h-4" />
              生成
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
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"在此输入文本...\n\n例如：你好世界"}
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <MoveHorizontal className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">带间距文本</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="生成的带间距文本将显示在这里..."
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
          
          {output && (
            <div className="px-4 pb-4">
              <div className="p-4 bg-gradient-to-r from-cyan-500 to-teal-500/10 border border-[#27272a] rounded-xl text-center">
                <div className="text-zinc-200 text-lg tracking-widest font-medium break-all">
                  {output.slice(0, 100)}{output.length > 100 ? "..." : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在文本字符之间添加空格或自定义字符，生成带间距的文字效果。支持自定义间距字符和间距数量，
            可生成各种创意文字效果。常用于社交媒体、设计排版、
            创意文案等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
