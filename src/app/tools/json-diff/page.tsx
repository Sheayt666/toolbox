"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  GitCompare,
  Copy,
  Check,
  Trash2,
  ArrowLeftRight,
  FileCode,
} from "lucide-react";

interface DiffLine {
  type: "same" | "add" | "remove";
  content: string;
  leftNum?: number;
  rightNum?: number;
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");
  const result: DiffLine[] = [];
  
  const maxLen = Math.max(leftLines.length, rightLines.length);
  for (let i = 0; i < maxLen; i++) {
    const l = leftLines[i] ?? "";
    const r = rightLines[i] ?? "";
    
    if (i >= leftLines.length) {
      result.push({ type: "add", content: r, rightNum: i + 1 });
    } else if (i >= rightLines.length) {
      result.push({ type: "remove", content: l, leftNum: i + 1 });
    } else if (l === r) {
      result.push({ type: "same", content: l, leftNum: i + 1, rightNum: i + 1 });
    } else {
      result.push({ type: "remove", content: l, leftNum: i + 1 });
      result.push({ type: "add", content: r, rightNum: i + 1 });
    }
  }
  
  return result;
}

export default function JsonDiffPage() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  const handleCompare = useCallback(() => {
    const result = computeDiff(leftText, rightText);
    setDiffResult(result);
    setHasCompared(true);
  }, [leftText, rightText]);

  const handleClear = useCallback(() => {
    setLeftText("");
    setRightText("");
    setDiffResult([]);
    setHasCompared(false);
  }, []);

  const handleSwap = useCallback(() => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
  }, [leftText, rightText]);

  const addedCount = diffResult.filter(l => l.type === "add").length;
  const removedCount = diffResult.filter(l => l.type === "remove").length;

  return (
    <ToolLayout
      title="JSON对比差异"
      description="在线对比两个JSON数据的差异，高亮显示新增、删除、修改的内容"
      toolId="json-diff"
      icon={GitCompare}
      category="开发工具"
      slug="json-diff"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <button
              onClick={handleCompare}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <GitCompare className="w-4 h-4" />
              对比差异
            </button>
            <button
              onClick={handleSwap}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
              交换
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          {hasCompared && (
            <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-emerald-500"></div>
                  <span className="text-zinc-400">新增:</span>
                  <span className="text-emerald-400 font-semibold">{addedCount} 行</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500"></div>
                  <span className="text-zinc-400">删除:</span>
                  <span className="text-red-400 font-semibold">{removedCount} 行</span>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">原始JSON（左侧）</span>
              </div>
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                placeholder={`{
  "name": "test",
  "value": 123
}"
                spellCheck={false}
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600`}
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <GitCompare className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">新JSON（右侧）</span>
              </div>
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                placeholder={`{
  "name": "test",
  "value": 123
}"
                spellCheck={false}
                className="w-full h-64 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600`}
              />
            </div>
          </div>

          {hasCompared && (
            <div className="px-4 pb-4">
              <div className="border border-[#27272a] rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                  <GitCompare className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-zinc-300">对比结果</span>
                </div>
                <div className="h-64 overflow-auto font-mono text-sm">
                  {diffResult.map((line, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        line.type === "add"
                          ? "bg-emerald-500/10 text-emerald-300"
                          : line.type === "remove"
                          ? "bg-red-500/10 text-red-300"
                          : "text-zinc-400"
                      }`}
                    >
                      <span className="w-12 px-2 text-right text-zinc-600 border-r border-[#27272a] select-none">
                        {line.leftNum ?? ""}
                      </span>
                      <span className="w-12 px-2 text-right text-zinc-600 border-r border-[#27272a] select-none">
                        {line.rightNum ?? ""}
                      </span>
                      <span className="w-6 text-center">
                        {line.type === "add" ? "+" : line.type === "remove" ? "-" : " "}
                      </span>
                      <span className="flex-1 px-2 whitespace-pre">{line.content || " "}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在线对比两个JSON数据的差异，高亮显示新增、删除、修改的内容。绿色标记表示新增内容，红色标记表示删除内容。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
