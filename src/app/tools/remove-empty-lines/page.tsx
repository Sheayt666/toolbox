"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Trash, Type } from "lucide-react";

function removeEmptyLines(text: string, removeWhitespaceOnly: boolean = true): { result: string; removed: number } {
  const lines = text.split("\n");
  const filtered = lines.filter((line) => {
    if (removeWhitespaceOnly) {
      return line.trim() !== "";
    }
    return line !== "";
  });
  return {
    result: filtered.join("\n"),
    removed: lines.length - filtered.length,
  };
}

export default function RemoveEmptyLinesPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removeWhitespaceOnly, setRemoveWhitespaceOnly] = useState(true);
  const [removedCount, setRemovedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleRemove = useCallback(() => {
    if (!input) {
      setOutput("");
      setRemovedCount(0);
      return;
    }
    const { result, removed } = removeEmptyLines(input, removeWhitespaceOnly);
    setOutput(result);
    setRemovedCount(removed);
  }, [input, removeWhitespaceOnly]);

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
    setInput(`第一行

第三行
   
第五行
   
第七行`);
  }, []);

  return (
    <ToolLayout
      title="删除空行"
      description="在线删除空行工具，一键移除文本中的空行和空白行，支持只含空格的行"
      icon={Type}
      category="开发工具"
      slug="remove-empty-lines"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Trash className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-white">删除空行</span>
          </div>

          <div className="flex-1" />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeWhitespaceOnly}
              onChange={(e) => setRemoveWhitespaceOnly(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-red-500 focus:ring-red-500/50"
            />
            <span className="text-sm text-slate-400">删除含空格的空白行</span>
          </label>

          <button
            onClick={handleRemove}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-red-500/25"
          >
            <Trash2 className="w-4 h-4" />
            删除空行
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
            placeholder="在此输入包含空行的文本..."
            spellCheck={false}
            className="w-full h-80 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">处理结果</label>
            <span className="text-xs text-slate-500">
              {output ? output.split("\n").length : 0} 行 · {output.length} 字符
              {removedCount > 0 && <span className="text-red-400 ml-2">移除 {removedCount} 行</span>}
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
          <li>• 一键删除文本中的空行，可选择是否删除只含空格的空白行</li>
          <li>• 适用于清理代码、日志、文档等各种文本中的多余空行</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
