"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  AlignCenter,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
} from "lucide-react";

export default function TextPadderPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState(50);
  const [padChar, setPadChar] = useState(" ");
  const [align, setAlign] = useState<"left" | "right" | "center">("left");

  const handlePad = useCallback(() => {
    if (!input.trim()) return;
    
    const lines = input.split("\n");
    const result = lines.map(line => {
      if (line.length >= width) return line;
      const padLen = width - line.length;
      
      if (align === "left") {
        return line + padChar.repeat(padLen);
      } else if (align === "right") {
        return padChar.repeat(padLen) + line;
      } else {
        const leftPad = Math.floor(padLen / 2);
        const rightPad = padLen - leftPad;
        return padChar.repeat(leftPad) + line + padChar.repeat(rightPad);
      }
    });
    
    setOutput(result.join("\n"));
  }, [input, width, padChar, align]);

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
    a.download = "padded.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="文本填充对齐"
      description="在文本前后填充字符使文本对齐，支持左对齐、右对齐、居中对齐"
      toolId="text-padder"
      icon={AlignCenter}
      category="文本工具"
      slug="text-padder"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1 bg-[#27272a] rounded-xl p-1">
              {(["left", "center", "right"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    align === a ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {a === "left" ? "左对齐" : a === "right" ? "右对齐" : "居中"}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">宽度:</span>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">填充:</span>
              <input
                type="text"
                value={padChar}
                onChange={(e) => setPadChar(e.target.value.charAt(0) || " ")}
                maxLength={1}
                className="w-10 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <button
              onClick={handlePad}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <AlignCenter className="w-4 h-4" />
              填充对齐
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
                placeholder="在此输入或粘贴文本..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <AlignCenter className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">对齐结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="填充对齐结果将显示在这里..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在文本前后填充字符使文本对齐，支持左对齐、右对齐、居中对齐。支持左对齐、右对齐、居中对齐三种方式，
            可自定义目标宽度和填充字符。常用于代码格式化、表格排版、
            终端输出美化等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
