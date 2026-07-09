"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  FileCode,
  Copy,
  Check,
  Trash2,
  Download,
} from "lucide-react";

function simpleFormat(code: string, indentSize: number): string {
  const lines = code.split("\n");
  let indentLevel = 0;
  const indentStr = " ".repeat(indentSize);
  const result: string[] = [];
  
  for (let line of lines) {
    line = line.trim();
    if (!line) {
      result.push("");
      continue;
    }
    
    const startsWithClose = /^[\)\]\}]/.test(line);
    if (startsWithClose) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    result.push(indentStr.repeat(indentLevel) + line);
    
    const openCount = (line.match(/[\{\(\[]/g) || []).length;
    const closeCount = (line.match(/[\}\)\]]/g) || []).length;
    
    const netOpen = openCount - closeCount;
    if (!startsWithClose && netOpen > 0) {
      indentLevel += netOpen;
    } else if (startsWithClose) {
      const remaining = openCount - (closeCount - 1);
      if (remaining > 0) indentLevel += remaining;
      else indentLevel = Math.max(0, indentLevel + remaining);
    } else {
      indentLevel = Math.max(0, indentLevel + netOpen);
    }
  }
  
  return result.join("\n");
}

export default function TypescriptFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [error, setError] = useState("");

  const handleFormat = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入TYPESCRIPT代码");
      return;
    }
    try {
      setOutput(simpleFormat(input, indentSize));
    } catch (e) {
      setError("格式化失败: " + (e as Error).message);
    }
  }, [input, indentSize]);

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
    setError("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.ts";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="TypeScript格式化"
      description="TypeScript代码格式化工具，美化TS代码，统一代码风格，一键格式化"
      toolId="typescript-formatter"
      icon={FileCode}
      category="开发工具"
      slug="typescript-formatter"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleFormat}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <FileCode className="w-4 h-4" />
              格式化TYPESCRIPT
            </button>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">缩进:</span>
              <select
                value={indentSize}
                onChange={(e) => setIndentSize(parseInt(e.target.value) as 2 | 4)}
                className="bg-transparent text-zinc-300 text-sm outline-none cursor-pointer"
              >
                <option value={2} className="bg-[#18181b]">2 空格</option>
                <option value={4} className="bg-[#18181b]">4 空格</option>
              </select>
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">TYPESCRIPT代码（输入）</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`在此粘贴TypeScript代码...

interface User {
  name: string;
  age: number;
}`}
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">格式化结果（输出）</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="格式化后的代码将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            TypeScript代码格式化工具，美化TS代码，统一代码风格，一键格式化。支持自定义缩进大小，一键美化代码，提升代码可读性。
            所有处理在浏览器本地完成，数据不会上传，安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
