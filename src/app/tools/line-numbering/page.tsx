"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  ListOrdered,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
} from "lucide-react";

export default function LineNumberingPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [startNum, setStartNum] = useState(1);
  const [separator, setSeparator] = useState(". ");
  const [padZero, setPadZero] = useState(true);

  const handleNumber = useCallback(() => {
    if (!input.trim()) return;
    
    const lines = input.split("\n");
    const totalDigits = String(startNum + lines.length - 1).length;
    
    const result = lines.map((line, index) => {
      const num = startNum + index;
      let numStr = String(num);
      if (padZero) {
        numStr = numStr.padStart(totalDigits, "0");
      }
      return numStr + separator + line;
    });
    
    setOutput(result.join("\n"));
  }, [input, startNum, separator, padZero]);

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
    a.download = "numbered.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="文本加行号"
      description="为文本每行添加行号，支持自定义行号格式和起始行号"
      toolId="line-numbering"
      icon={ListOrdered}
      category="文本工具"
      slug="line-numbering"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">起始:</span>
              <input
                type="number"
                value={startNum}
                onChange={(e) => setStartNum(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">分隔符:</span>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="w-14 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <label className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={padZero}
                onChange={(e) => setPadZero(e.target.checked)}
                className="w-4 h-4 rounded border-[#3f3f46] bg-[#09090b] text-primary-500 focus:ring-primary-500/50"
              />
              <span className="text-sm text-zinc-300">补零对齐</span>
            </label>
            <button
              onClick={handleNumber}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <ListOrdered className="w-4 h-4" />
              添加行号
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
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">带行号文本</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="添加行号后的文本将显示在这里..."
                spellCheck={false}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            为文本每行添加行号，支持自定义行号格式和起始行号。支持自定义起始行号、分隔符样式，
            可选补零对齐功能。常用于代码引用、文档排版、
            日志分析等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
