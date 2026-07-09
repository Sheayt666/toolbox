"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Dices, Plus, Minus, RotateCcw } from "lucide-react";

export default function RollDicePage() {
  const [diceCount, setDiceCount] = useState(1);
  const [results, setResults] = useState<number[]>([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<number[][]>([]);

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);

    let count = 0;
    const interval = setInterval(() => {
      setResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      count++;
      if (count >= 15) {
        clearInterval(interval);
        const finalResults = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
        setResults(finalResults);
        setHistory((prev) => [finalResults, ...prev].slice(0, 10));
        setIsRolling(false);
      }
    }, 80);
  };

  const total = results.reduce((sum, r) => sum + r, 0);

  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  const resetAll = () => {
    setResults(Array(diceCount).fill(1));
    setHistory([]);
  };

  return (
    <ToolLayout
      title="掷骰子"
      description="在线掷骰子工具，支持多颗骰子同时投掷，随机点数生成，桌游必备"
      icon={Dices}
      category="生活工具"
      slug="roll-dice"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 主区域 */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg shadow-violet-500/25">
          {/* 骰子数量选择 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className="text-sm text-white/70">骰子数量:</span>
            <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1">
              <button
                onClick={() => {
                  const newCount = Math.max(1, diceCount - 1);
                  setDiceCount(newCount);
                  if (!isRolling) setResults(Array(newCount).fill(1));
                }}
                disabled={diceCount <= 1}
                className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{diceCount}</span>
              <button
                onClick={() => {
                  const newCount = Math.min(6, diceCount + 1);
                  setDiceCount(newCount);
                  if (!isRolling) setResults(Array(newCount).fill(1));
                }}
                disabled={diceCount >= 6}
                className="p-2 hover:bg-white/10 rounded-md transition-colors disabled:opacity-30"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 骰子显示 */}
          <div className="flex flex-wrap justify-center gap-4 mb-8 min-h-[100px] items-center">
            {results.map((result, i) => (
              <div
                key={i}
                className={`w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-5xl text-violet-700 transition-transform ${
                  isRolling ? "animate-bounce" : ""
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {diceFaces[result - 1]}
              </div>
            ))}
          </div>

          {/* 总和 */}
          {diceCount > 1 && (
            <div className="text-center mb-6">
              <span className="text-white/70 text-sm">总和: </span>
              <span className="text-3xl font-bold">{total}</span>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-center gap-4">
            <button
              onClick={rollDice}
              disabled={isRolling}
              className="px-8 py-3 bg-white text-violet-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
            >
              {isRolling ? "投掷中..." : "掷骰子"}
            </button>
            {history.length > 0 && (
              <button
                onClick={resetAll}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 快捷选择 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">快捷选择</h3>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setDiceCount(n);
                  if (!isRolling) setResults(Array(n).fill(1));
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  diceCount === n
                    ? "bg-violet-500 text-white"
                    : "bg-[#09090b] text-slate-400 hover:text-white hover:bg-[#27272a] border border-[#27272a]"
                }`}
              >
                {n}颗骰子
              </button>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
            <h3 className="text-base font-semibold text-white mb-4">历史记录</h3>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 px-3 bg-[#09090b] rounded-lg border border-[#27272a]"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-8">#{i + 1}</span>
                    <div className="flex gap-1">
                      {h.map((r, j) => (
                        <span key={j} className="text-xl">{diceFaces[r - 1]}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-mono text-violet-400">
                    = {h.reduce((s, n) => s + n, 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">骰子小知识</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>标准六面骰子每面点数为1到6，对面点数之和为7。</p>
            <p>单颗骰子每个点数出现的概率为 1/6 ≈ 16.67%。</p>
            <p>两颗骰子总和为7的概率最高（6/36 = 1/6），总和为2或12的概率最低（1/36）。</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
