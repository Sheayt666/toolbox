"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { CircleDot, RotateCcw, Trophy } from "lucide-react";

type Result = "heads" | "tails" | null;

export default function FlipCoinPage() {
  const [result, setResult] = useState<Result>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState<Result[]>([]);
  const [stats, setStats] = useState({ heads: 0, tails: 0 });

  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setResult(null);

    setTimeout(() => {
      const newResult: Result = Math.random() < 0.5 ? "heads" : "tails";
      setResult(newResult);
      setHistory((prev) => [newResult, ...prev].slice(0, 20));
      setStats((prev) => ({
        ...prev,
        [newResult as "heads" | "tails"]: prev[newResult as "heads" | "tails"] + 1,
      }));
      setIsFlipping(false);
    }, 1000);
  };

  const resetStats = () => {
    setResult(null);
    setHistory([]);
    setStats({ heads: 0, tails: 0 });
  };

  const total = stats.heads + stats.tails;
  const headsPercent = total > 0 ? ((stats.heads / total) * 100).toFixed(1) : "0";
  const tailsPercent = total > 0 ? ((stats.tails / total) * 100).toFixed(1) : "0";

  return (
    <ToolLayout
      title="抛硬币"
      description="在线抛硬币工具，随机正反面，帮你做决定，支持历史记录和统计"
      icon={CircleDot}
      category="生活工具"
      slug="flip-coin"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 硬币区域 */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg shadow-amber-500/25">
          <div className="flex flex-col items-center">
            {/* 硬币 */}
            <div className="relative w-40 h-40 mb-8" style={{ perspective: "1000px" }}>
              <div
                className={`w-full h-full relative transition-transform duration-1000 ${isFlipping ? "animate-spin" : ""}`}
                style={{
                  transformStyle: "preserve-3d",
                  animation: isFlipping ? "coinFlip 1s ease-in-out" : "none",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-amber-600 flex items-center justify-center shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-4xl font-bold text-amber-900">正</span>
                </div>
              </div>
            </div>

            {/* 结果显示 */}
            <div className="h-12 mb-6">
              {result && !isFlipping && (
                <div className="flex items-center gap-2 text-2xl font-bold">
                  <Trophy className="w-6 h-6" />
                  {result === "heads" ? "正面！" : "反面！"}
                </div>
              )}
              {isFlipping && (
                <div className="text-xl font-medium text-white/80">翻转中...</div>
              )}
              {!result && !isFlipping && (
                <div className="text-xl font-medium text-white/80">点击按钮开始</div>
              )}
            </div>

            {/* 按钮 */}
            <div className="flex gap-4">
              <button
                onClick={flipCoin}
                disabled={isFlipping}
                className="px-8 py-3 bg-white text-amber-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFlipping ? "翻转中..." : "抛硬币"}
              </button>
              {total > 0 && (
                <button
                  onClick={resetStats}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  title="重置"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 统计 */}
        {total > 0 && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              统计数据
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-amber-400">正面</span>
                  <span className="text-slate-400">{stats.heads} 次 ({headsPercent}%)</span>
                </div>
                <div className="h-3 bg-[#09090b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full transition-all duration-500"
                    style={{ width: `${headsPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-400">反面</span>
                  <span className="text-slate-400">{stats.tails} 次 ({tailsPercent}%)</span>
                </div>
                <div className="h-3 bg-[#09090b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${tailsPercent}%` }}
                  />
                </div>
              </div>
              <div className="text-center text-sm text-slate-500 pt-2 border-t border-[#27272a]">
                总共抛掷 <span className="text-white font-semibold">{total}</span> 次
              </div>
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
            <h3 className="text-base font-semibold text-white mb-4">历史记录</h3>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    h === "heads"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  }`}
                >
                  {h === "heads" ? "正" : "反"}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">关于抛硬币</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>抛硬币是一种简单的随机决策方法，常用于二选一的场景。</p>
            <p>本工具使用 JavaScript 的 Math.random() 函数生成随机结果，理论上正反面概率各为50%。</p>
            <p>实际抛掷次数越多，正反面比例越接近50%，这就是大数定律。</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes coinFlip {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(1800deg); }
        }
      `}</style>
    </ToolLayout>
  );
}
