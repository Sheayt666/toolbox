"use client";

import { useState, useEffect, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Timer, RotateCcw, Check, X } from "lucide-react";

// 求解24点
function solve24(nums: number[]): string | null {
  const EPS = 1e-6;
  function helper(arr: { val: number; expr: string }[]): { val: number; expr: string } | null {
    if (arr.length === 1) {
      return Math.abs(arr[0].val - 24) < EPS ? arr[0] : null;
    }
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length; j++) {
        if (i === j) continue;
        const rest = arr.filter((_, k) => k !== i && k !== j);
        const a = arr[i], b = arr[j];
        const ops: { val: number; expr: string }[] = [
          { val: a.val + b.val, expr: `(${a.expr}+${b.expr})` },
          { val: a.val - b.val, expr: `(${a.expr}-${b.expr})` },
          { val: a.val * b.val, expr: `(${a.expr}×${b.expr})` },
        ];
        if (Math.abs(b.val) > EPS) ops.push({ val: a.val / b.val, expr: `(${a.expr}÷${b.expr})` });
        for (const op of ops) {
          const result = helper([...rest, op]);
          if (result) return result;
        }
      }
    }
    return null;
  }
  const init = nums.map((n) => ({ val: n, expr: n.toString() }));
  return helper(init)?.expr || null;
}

function genNumbers(): number[] {
  while (true) {
    const nums = Array(4).fill(0).map(() => Math.floor(Math.random() * 9) + 1);
    if (solve24(nums)) return nums;
  }
}

export default function CountdownMathPage() {
  const [nums, setNums] = useState<number[]>([3, 8, 3, 8]);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"none" | "correct" | "wrong">("none");
  const [showSolution, setShowSolution] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [running, setRunning] = useState(false);

  const solution = useMemo(() => solve24(nums), [nums]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setRunning(false); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [running]);

  const startGame = () => {
    setNums(genNumbers()); setScore(0); setAttempts(0); setTimeLeft(60); setRunning(true); setAnswer(""); setFeedback("none"); setShowSolution(false);
  };

  const newRound = () => {
    setNums(genNumbers()); setAnswer(""); setFeedback("none"); setShowSolution(false);
  };

  const check = () => {
    setAttempts(attempts + 1);
    try {
      const expr = answer.replace(/×/g, "*").replace(/÷/g, "/");
      // 验证是否使用了所有4个数字
      const usedNums = answer.match(/\d+/g)?.map(Number) || [];
      const sortedUsed = [...usedNums].sort();
      const sortedNums = [...nums].sort();
      const allUsed = sortedUsed.length >= 4 && sortedUsed.every((n, i) => sortedNums.includes(n));
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${expr})`)();
      if (Math.abs(result - 24) < 0.001 && allUsed) {
        setFeedback("correct"); setScore(score + 1);
      } else {
        setFeedback("wrong");
      }
    } catch {
      setFeedback("wrong");
    }
  };

  return (
    <ToolLayout title="24点游戏" description="经典24点数学游戏，用四则运算算出24" toolId="countdown-math" icon={Timer} category="教育学习" slug="countdown-math">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <div className="bg-[#27272a] rounded-lg px-4 py-2"><span className="text-xs text-slate-400">得分</span><span className="ml-2 text-lg font-bold text-emerald-400">{score}</span></div>
            <div className="bg-[#27272a] rounded-lg px-4 py-2"><span className="text-xs text-slate-400">尝试</span><span className="ml-2 text-lg font-bold text-white">{attempts}</span></div>
            <div className={`rounded-lg px-4 py-2 ${timeLeft <= 10 ? "bg-rose-500/20" : "bg-[#27272a]"}`}><span className="text-xs text-slate-400">倒计时</span><span className={`ml-2 text-lg font-bold ${timeLeft <= 10 ? "text-rose-400" : "text-amber-400"}`}>{timeLeft}s</span></div>
          </div>
          <button onClick={startGame} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm">{running ? "重新开始" : "开始游戏"}</button>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-8">
          <div className="text-center text-sm text-slate-400 mb-4">用以下4个数字和 + - × ÷ 运算，使结果等于 24</div>
          <div className="flex items-center justify-center gap-4 mb-6">
            {nums.map((n, i) => (
              <div key={i} className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-transparent border-2 border-primary-500/30 flex items-center justify-center text-4xl font-bold text-primary-400">{n}</div>
            ))}
          </div>

          <div className="flex gap-2 max-w-md mx-auto">
            <input type="text" value={answer} onChange={(e) => { setAnswer(e.target.value); setFeedback("none"); }} onKeyDown={(e) => e.key === "Enter" && check()} placeholder="如: (8-6)×(3+9)" className="flex-1 bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-primary-500" />
            <button onClick={check} disabled={!running} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50">验证</button>
          </div>

          {feedback === "correct" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400"><Check className="w-5 h-5" /><span className="font-bold">正确！+1分</span></div>
          )}
          {feedback === "wrong" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-rose-400"><X className="w-5 h-5" /><span className="font-bold">不正确，再试试</span></div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4">
            <button onClick={newRound} className="px-4 py-2 bg-[#3f3f46] hover:bg-[#52525b] text-white rounded-lg text-sm flex items-center gap-1"><RotateCcw className="w-4 h-4" />换一题</button>
            <button onClick={() => setShowSolution(!showSolution)} className="px-4 py-2 bg-[#3f3f46] hover:bg-[#52525b] text-white rounded-lg text-sm">查看答案</button>
          </div>

          {showSolution && solution && (
            <div className="mt-4 bg-primary-500/5 border border-primary-500/20 rounded-lg p-4 text-center">
              <span className="text-sm text-slate-400">参考答案：</span><span className="text-primary-400 font-bold font-mono">{solution} = 24</span>
            </div>
          )}
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">规则：使用全部4个数字，每个数字只能用一次，通过加、减、乘、除运算得到24。可以使用括号改变运算顺序。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
