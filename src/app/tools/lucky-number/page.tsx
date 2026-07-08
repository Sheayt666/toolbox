"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ticket, Shuffle, RefreshCw, Copy, CheckCircle } from "lucide-react";

interface LotteryRule {
  id: string;
  name: string;
  redRange: [number, number];
  redCount: number;
  blueRange: [number, number];
  blueCount: number;
}

const lotteryRules: LotteryRule[] = [
  { id: "ssq", name: "双色球", redRange: [1, 33], redCount: 6, blueRange: [1, 16], blueCount: 1 },
  { id: "dlt", name: "大乐透", redRange: [1, 35], redCount: 5, blueRange: [1, 12], blueCount: 2 },
  { id: "custom", name: "自定义", redRange: [1, 10], redCount: 3, blueRange: [1, 5], blueCount: 1 },
];

function generateNumbers(min: number, max: number, count: number): number[] {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

export default function LuckyNumberPage() {
  const [selectedRule, setSelectedRule] = useState<string>("ssq");
  const [groupCount, setGroupCount] = useState<number>(1);
  const [results, setResults] = useState<{ red: number[]; blue: number[] }[]>([]);
  const [copied, setCopied] = useState(false);

  const rule = lotteryRules.find((r) => r.id === selectedRule) || lotteryRules[0];

  const handleGenerate = () => {
    const newResults: { red: number[]; blue: number[] }[] = [];
    for (let i = 0; i < groupCount; i++) {
      newResults.push({
        red: generateNumbers(rule.redRange[0], rule.redRange[1], rule.redCount),
        blue: generateNumbers(rule.blueRange[0], rule.blueRange[1], rule.blueCount),
      });
    }
    setResults(newResults);
  };

  const handleCopy = async () => {
    if (results.length === 0) return;
    const text = results
      .map(
        (r, i) =>
          `第${i + 1}注：红球 ${r.red.join(", ")} | 蓝球 ${r.blue.join(", ")}`
      )
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <ToolLayout
      title="幸运数字生成器"
      description="在线随机生成彩票号码和幸运数字，支持双色球、大乐透等多种彩种，自定义范围和数量"
      toolId="lucky-number"
    >
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
        {/* 彩种选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            选择彩种
          </label>
          <div className="flex flex-wrap gap-2">
            {lotteryRules.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRule(r.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedRule === r.id
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* 组数选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            生成组数: {groupCount} 组
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* 生成按钮 */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={handleGenerate}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium rounded-xl transition-colors shadow-lg shadow-orange-500/25"
          >
            <Shuffle className="w-5 h-5" />
            生成幸运号码
          </button>
          <button
            onClick={handleCopy}
            disabled={results.length === 0}
            className="px-6 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* 结果展示 */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-500" />
              生成结果
            </h3>
            <div className="space-y-3">
              {results.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 w-16">
                    第{idx + 1}注
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.red.map((num) => (
                      <span
                        key={`r-${num}`}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-sm font-bold flex items-center justify-center shadow-sm"
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                    <span className="text-zinc-400 flex items-center mx-1">|</span>
                    {result.blue.map((num) => (
                      <span
                        key={`b-${num}`}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shadow-sm"
                      >
                        {num.toString().padStart(2, "0")}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 温馨提示 */}
        <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong>温馨提示：</strong>
            彩票中奖完全是随机事件，概率极低。本工具仅供娱乐使用，不构成任何购彩建议。彩票有风险，购彩需理性，请量力而行。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
