"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Dices } from "lucide-react";

function factorial(n: number): number {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function permutation(n: number, r: number): number {
  if (r > n || n < 0 || r < 0) return 0;
  return factorial(n) / factorial(n - r);
}

function combination(n: number, r: number): number {
  if (r > n || n < 0 || r < 0) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export default function ProbabilityCalcPage() {
  const [n, setN] = useState(10);
  const [r, setR] = useState(3);
  const [fav, setFav] = useState(4);
  const [total, setTotal] = useState(10);

  const result = useMemo(() => {
    const perm = permutation(n, r);
    const comb = combination(n, r);
    // 古典概率 P = m/n
    const prob = total > 0 ? fav / total : 0;
    const probPct = prob * 100;
    // 至少发生一次 P = 1 - (1-p)^n
    const atLeastOnce = 1 - Math.pow(1 - prob, r);

    return { perm, comb, prob, probPct, atLeastOnce };
  }, [n, r, fav, total]);

  return (
    <ToolLayout title="概率计算器" description="计算排列组合概率，支持多种概率公式" toolId="probability-calc" icon={Dices} category="计算工具" slug="probability-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">排列组合</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">总数 n</label><input type="number" value={n} onChange={(e) => setN(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">选取 r</label><input type="number" value={r} onChange={(e) => setR(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0d0d0f] rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">排列 A(n,r) = n!/(n-r)!</div><div className="text-lg font-bold text-primary-400">{result.perm.toLocaleString()}</div></div>
            <div className="bg-[#0d0d0f] rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">组合 C(n,r) = n!/(r!(n-r)!)</div><div className="text-lg font-bold text-emerald-400">{result.comb.toLocaleString()}</div></div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">古典概率</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">有利事件数 m</label><input type="number" value={fav} onChange={(e) => setFav(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">总事件数 n</label><input type="number" value={total} onChange={(e) => setTotal(+e.target.value)} className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0d0d0f] rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">概率 P = m/n</div><div className="text-lg font-bold text-sky-400">{result.prob.toFixed(4)} ({result.probPct.toFixed(2)}%)</div></div>
            <div className="bg-[#0d0d0f] rounded-lg p-3"><div className="text-xs text-slate-400 mb-1">重复{r}次至少发生一次</div><div className="text-lg font-bold text-amber-400">{(result.atLeastOnce * 100).toFixed(2)}%</div></div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">常用概率公式</h3>
          <div className="space-y-1.5 text-sm text-slate-400">
            <div>排列：A(n,r) = n! / (n-r)!</div>
            <div>组合：C(n,r) = n! / (r! × (n-r)!)</div>
            <div>古典概率：P(A) = 有利事件数 / 总事件数</div>
            <div>对立事件：P(Ā) = 1 - P(A)</div>
            <div>独立重复至少一次：P = 1 - (1-p)^n</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
