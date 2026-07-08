"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileDiff, Copy, Check, Trash2, Info, ArrowLeftRight, AlignLeft, Type, FileText } from "lucide-react";

type DiffMode = "line" | "char";

// Diff result type
interface DiffSegment {
  type: "equal" | "added" | "removed";
  value: string;
}

// LCS-based diff algorithm
function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

function diffArrays(a: string[], b: string[]): DiffSegment[] {
  const dp = computeLCS(a, b);
  const result: DiffSegment[] = [];
  let i = a.length;
  let j = b.length;

  const temp: { type: "equal" | "added" | "removed"; value: string }[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      temp.push({ type: "equal", value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "added", value: b[j - 1] });
      j--;
    } else if (i > 0) {
      temp.push({ type: "removed", value: a[i - 1] });
      i--;
    }
  }

  temp.reverse();

  // Merge consecutive segments of the same type
  for (const seg of temp) {
    if (result.length > 0 && result[result.length - 1].type === seg.type) {
      result[result.length - 1].value += seg.value;
    } else {
      result.push({ ...seg });
    }
  }

  return result;
}

// Line-level diff: returns segments for left (with removed) and right (with added) sides
function lineDiff(oldText: string, newText: string): { left: DiffSegment[]; right: DiffSegment[] } {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const dp = computeLCS(oldLines, newLines);

  const leftSegments: DiffSegment[] = [];
  const rightSegments: DiffSegment[] = [];

  let i = oldLines.length;
  let j = newLines.length;

  const leftTemp: DiffSegment[] = [];
  const rightTemp: DiffSegment[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      leftTemp.push({ type: "equal", value: oldLines[i - 1] + "\n" });
      rightTemp.push({ type: "equal", value: newLines[j - 1] + "\n" });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightTemp.push({ type: "added", value: newLines[j - 1] + "\n" });
      leftTemp.push({ type: "equal", value: "" }); // placeholder for alignment
      j--;
    } else if (i > 0) {
      leftTemp.push({ type: "removed", value: oldLines[i - 1] + "\n" });
      rightTemp.push({ type: "equal", value: "" }); // placeholder for alignment
      i--;
    }
  }

  leftTemp.reverse();
  rightTemp.reverse();

  // Merge
  for (const seg of leftTemp) {
    if (leftSegments.length > 0 && leftSegments[leftSegments.length - 1].type === seg.type) {
      leftSegments[leftSegments.length - 1].value += seg.value;
    } else {
      leftSegments.push({ ...seg });
    }
  }

  for (const seg of rightTemp) {
    if (rightSegments.length > 0 && rightSegments[rightSegments.length - 1].type === seg.type) {
      rightSegments[rightSegments.length - 1].value += seg.value;
    } else {
      rightSegments.push({ ...seg });
    }
  }

  return { left: leftSegments, right: rightSegments };
}

function charDiff(oldText: string, newText: string): { left: DiffSegment[]; right: DiffSegment[] } {
  const oldChars = oldText.split("");
  const newChars = newText.split("");
  const dp = computeLCS(oldChars, newChars);

  const leftTemp: DiffSegment[] = [];
  const rightTemp: DiffSegment[] = [];

  let i = oldChars.length;
  let j = newChars.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldChars[i - 1] === newChars[j - 1]) {
      leftTemp.push({ type: "equal", value: oldChars[i - 1] });
      rightTemp.push({ type: "equal", value: newChars[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightTemp.push({ type: "added", value: newChars[j - 1] });
      j--;
    } else if (i > 0) {
      leftTemp.push({ type: "removed", value: oldChars[i - 1] });
      i--;
    }
  }

  leftTemp.reverse();
  rightTemp.reverse();

  // Merge
  const leftSegments: DiffSegment[] = [];
  const rightSegments: DiffSegment[] = [];

  for (const seg of leftTemp) {
    if (leftSegments.length > 0 && leftSegments[leftSegments.length - 1].type === seg.type) {
      leftSegments[leftSegments.length - 1].value += seg.value;
    } else {
      leftSegments.push({ ...seg });
    }
  }

  for (const seg of rightTemp) {
    if (rightSegments.length > 0 && rightSegments[rightSegments.length - 1].type === seg.type) {
      rightSegments[rightSegments.length - 1].value += seg.value;
    } else {
      rightSegments.push({ ...seg });
    }
  }

  return { left: leftSegments, right: rightSegments };
}

const exampleOld = `function hello(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob"];`;

const exampleNew = `function hello(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie"];
const count = users.length;`;

export default function TextDiffPage() {
  const [oldText, setOldText] = useState(exampleOld);
  const [newText, setNewText] = useState(exampleNew);
  const [mode, setMode] = useState<DiffMode>("line");
  const [copied, setCopied] = useState(false);

  const diffResult = useMemo(() => {
    if (mode === "line") {
      return lineDiff(oldText, newText);
    } else {
      return charDiff(oldText, newText);
    }
  }, [oldText, newText, mode]);

  // Statistics
  const stats = useMemo(() => {
    let addedCount = 0;
    let removedCount = 0;
    for (const seg of diffResult.right) {
      if (seg.type === "added") {
        addedCount += mode === "line" ? seg.value.split("\n").filter((l) => l.trim() !== "" || l === "\n").length - (seg.value.endsWith("\n") ? 1 : 0) : seg.value.length;
      }
    }
    for (const seg of diffResult.left) {
      if (seg.type === "removed") {
        removedCount += mode === "line" ? seg.value.split("\n").filter((l) => l.trim() !== "" || l === "\n").length - (seg.value.endsWith("\n") ? 1 : 0) : seg.value.length;
      }
    }
    // More accurate counting
    let addedLines = 0;
    let removedLines = 0;
    if (mode === "line") {
      for (const seg of diffResult.right) {
        if (seg.type === "added" && seg.value.trim()) {
          addedLines += seg.value.split("\n").filter((l) => l !== "" || seg.value.endsWith("\n")).length;
          if (seg.value.endsWith("\n")) addedLines--;
        }
      }
      for (const seg of diffResult.left) {
        if (seg.type === "removed" && seg.value.trim()) {
          removedLines += seg.value.split("\n").filter((l) => l !== "" || seg.value.endsWith("\n")).length;
          if (seg.value.endsWith("\n")) removedLines--;
        }
      }
    }
    return {
      added: mode === "line" ? addedLines : addedCount,
      removed: mode === "line" ? removedLines : removedCount,
    };
  }, [diffResult, mode]);

  const renderSegments = useCallback((segments: DiffSegment[], side: "left" | "right") => {
    return segments.map((seg, idx) => {
      if (seg.value === "") return null;

      let bgClass = "";
      let textClass = "text-zinc-900 dark:text-zinc-100";

      if (seg.type === "added") {
        bgClass = side === "right" ? "bg-emerald-100/60 dark:bg-emerald-900/30" : "";
        textClass = side === "right" ? "text-emerald-700 dark:text-emerald-300" : textClass;
      } else if (seg.type === "removed") {
        bgClass = side === "left" ? "bg-red-100/60 dark:bg-red-900/30" : "";
        textClass = side === "left" ? "text-red-700 dark:text-red-300 line-through" : textClass;
      }

      return (
        <span
          key={idx}
          className={`${bgClass} ${textClass} ${mode === "char" ? "rounded px-0.5" : ""}`}
        >
          {seg.value}
        </span>
      );
    });
  }, [mode]);

  const handleCopy = async () => {
    const result = `=== 原文 ===\n${oldText}\n\n=== 修改后 ===\n${newText}`;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setOldText("");
    setNewText("");
  };

  const handleLoadExample = () => {
    setOldText(exampleOld);
    setNewText(exampleNew);
  };

  return (
    <ToolLayout
      title="文本对比工具"
      description="在线对比两段文本的差异，支持逐字符和逐行对比，差异高亮显示，代码文章对比必备工具"
      toolId="text-diff"
      icon={FileDiff}
      category="文本工具"
      slug="text-diff"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 对比模式选择 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  对比模式
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLoadExample}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  加载示例
                </button>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
              <button
                onClick={() => setMode("line")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "line"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <AlignLeft className="w-4 h-4" />
                逐行对比
              </button>
              <button
                onClick={() => setMode("char")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  mode === "char"
                    ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Type className="w-4 h-4" />
                逐字符对比
              </button>
            </div>
          </div>
        </div>

        {/* 输入区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 原文 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    原文 / 旧版本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {oldText.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={oldText}
              onChange={(e) => setOldText(e.target.value)}
              placeholder="在此输入或粘贴原始文本..."
              spellCheck={false}
              className="w-full h-48 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          {/* 修改后 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    修改后 / 新版本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {newText.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="在此输入或粘贴修改后的文本..."
              spellCheck={false}
              className="w-full h-48 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        {/* 对比统计 */}
        <div className="flex flex-wrap items-center gap-4 px-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              新增: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.added}</span> {mode === "line" ? "行" : "字符"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              删除: <span className="font-semibold text-red-600 dark:text-red-400">{stats.removed}</span> {mode === "line" ? "行" : "字符"}
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" /> 已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> 复制两份文本
              </>
            )}
          </button>
        </div>

        {/* 对比结果 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 左侧结果 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  原文对比结果
                </span>
              </div>
            </div>
            <div className="p-4 h-64 overflow-auto font-mono text-sm leading-6 whitespace-pre-wrap break-all">
              {oldText || newText ? (
                renderSegments(diffResult.left, "left")
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600">对比结果将显示在这里...</span>
              )}
            </div>
          </div>

          {/* 右侧结果 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  新文对比结果
                </span>
              </div>
            </div>
            <div className="p-4 h-64 overflow-auto font-mono text-sm leading-6 whitespace-pre-wrap break-all">
              {oldText || newText ? (
                renderSegments(diffResult.right, "right")
              ) : (
                <span className="text-zinc-400 dark:text-zinc-600">对比结果将显示在这里...</span>
              )}
            </div>
          </div>
        </div>

        {/* 图例说明 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              颜色说明
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 font-bold line-through">删</span>
              </div>
              <div>
                <div className="text-sm font-medium text-red-700 dark:text-red-300">红色背景 / 删除线</div>
                <div className="text-xs text-red-600 dark:text-red-400">表示已删除的内容</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">增</span>
              </div>
              <div>
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">绿色背景</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400">表示新增的内容</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
