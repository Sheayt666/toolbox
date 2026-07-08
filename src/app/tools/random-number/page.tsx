"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shuffle, Copy, Check, RotateCcw, Info, Hash } from "lucide-react";

export default function RandomNumberPage() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [allowDuplicates, setAllowDuplicates] = useState(true);
  const [sortResult, setSortResult] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const minVal = Math.min(min, max);
    const maxVal = Math.max(min, max);
    const range = maxVal - minVal + 1;
    const actualCount = Math.min(count, allowDuplicates ? 1000 : Math.max(0, range));

    if (actualCount <= 0 || range <= 0) {
      setResults([]);
      return;
    }

    const nums: number[] = [];

    if (allowDuplicates) {
      for (let i = 0; i < actualCount; i++) {
        nums.push(Math.floor(Math.random() * range) + minVal);
      }
    } else {
      const pool: number[] = [];
      for (let i = minVal; i <= maxVal; i++) {
        pool.push(i);
      }
      // Fisher-Yates shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      nums.push(...pool.slice(0, actualCount));
    }

    if (sortResult) {
      nums.sort((a, b) => a - b);
    }

    setResults(nums);
  }, [min, max, count, allowDuplicates, sortResult]);

  const handleCopy = async () => {
    if (results.length === 0) return;
    try {
      await navigator.clipboard.writeText(results.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setMin(1);
    setMax(100);
    setCount(5);
    setAllowDuplicates(true);
    setSortResult(false);
    setResults([]);
  };

  return (
    <ToolLayout
      title="随机数生成器"
      description="在线生成指定范围的随机数，支持批量生成、去重、排序等功能"
      toolId="random-number"
      icon={Shuffle}
      category="生成工具"
      slug="random-number"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 参数设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-purple-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  参数设置
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-purple-500 dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  最小值
                </label>
                <input
                  type="number"
                  value={min}
                  onChange={(e) => setMin(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                  最大值
                </label>
                <input
                  type="number"
                  value={max}
                  onChange={(e) => setMax(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2 block">
                生成数量：{count} 个
              </label>
              <input
                type="range"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!allowDuplicates}
                  onChange={(e) => setAllowDuplicates(!e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">不重复</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sortResult}
                  onChange={(e) => setSortResult(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-purple-500 focus:ring-purple-500"
                />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">排序输出</span>
              </label>
            </div>

            <button
              onClick={generate}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium rounded-xl transition-all shadow-sm"
            >
              生成随机数
            </button>
          </div>
        </div>

        {/* 结果 */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    生成结果
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    共 {results.length} 个
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 复制</>
                  )}
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {results.map((num, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-mono font-medium"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                随机数是真随机吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具使用JavaScript的Math.random()生成伪随机数，对于一般用途如抽奖、分组等足够使用。
                如需密码学安全的随机数，请使用专门的加密工具。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                不重复模式有数量限制吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                不重复模式下，生成数量不能超过数值范围的大小。例如1-100之间最多生成100个不重复的数。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
