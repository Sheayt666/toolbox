"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Eraser, Type } from "lucide-react";

type RemoveMode = "all" | "leading" | "trailing" | "both" | "excess";

function removeSpaces(text: string, mode: RemoveMode, removeTabs: boolean = true): { result: string; removed: number } {
  let result = "";
  let removed = 0;

  const originalLength = text.length;

  if (mode === "all") {
    result = text.replace(/\s/g, "");
    removed = originalLength - result.length;
  } else if (mode === "leading") {
    const lines = text.split("\n");
    result = lines.map((line) => {
      const trimmed = line.trimStart();
      return trimmed;
    }).join("\n");
    removed = originalLength - result.length;
  } else if (mode === "trailing") {
    const lines = text.split("\n");
    result = lines.map((line) => line.trimEnd()).join("\n");
    removed = originalLength - result.length;
  } else if (mode === "both") {
    const lines = text.split("\n");
    result = lines.map((line) => line.trim()).join("\n");
    removed = originalLength - result.length;
  } else {
    // excess - replace multiple spaces with single space
    result = text.replace(/[ \t]+/g, " ");
    // Also clean up leading/trailing on each line
    const lines = result.split("\n");
    result = lines.map((line) => line.trim()).join("\n");
    removed = originalLength - result.length;
  }

  if (removeTabs && mode !== "all" && mode !== "excess") {
    // tabs already handled by \s in all mode and excess mode
  }

  return { result, removed: Math.abs(removed) };
}

export default function RemoveSpacesPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<RemoveMode>("excess");
  const [removedCount, setRemovedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleRemove = useCallback(() => {
    if (!input) {
      setOutput("");
      setRemovedCount(0);
      return;
    }
    const { result, removed } = removeSpaces(input, mode);
    setOutput(result);
    setRemovedCount(removed);
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
    setRemovedCount(0);
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput("  Hello    World!  \n  这是   一段   测试文本  \n    包含多余的   空格和制表符   ");
  }, []);

  const modeOptions = [
    { value: "excess", label: "去除多余空格" },
    { value: "all", label: "删除所有空格" },
    { value: "leading", label: "删除行首空格" },
    { value: "trailing", label: "删除行尾空格" },
    { value: "both", label: "删除首尾空格" },
  ];

  return (
    <ToolLayout
      title="去除多余空格"
      description="在线去除多余空格工具，支持多种空格清理模式，快速清理文本中的空白字符"
      icon={Type}
      category="开发工具"
      slug="remove-spaces"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Eraser className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-white">去除多余空格</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">模式:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as RemoveMode)}
              className="px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none transition-all"
            >
              {modeOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#18181b]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-sky-500/25"
          >
            <Eraser className="w-4 h-4" />
            去除空格
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
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入要处理的文本..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">处理结果</label>
            <span className="text-xs text-slate-500">
              {output.length} 字符
              {removedCount > 0 && <span className="text-sky-400 ml-2">减少 {removedCount} 字符</span>}
            </span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="处理结果将显示在这里..."
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
          <li>• 支持五种空格清理模式：去除多余、全部删除、行首、行尾、首尾</li>
          <li>• 去除多余空格模式会将连续的多个空格替换为单个空格</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
