"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Beaker, RotateCcw } from "lucide-react";

// 算盘珠子表示：每档上珠1颗(值5)，下珠4颗(值0-4)
interface Rod {
  upper: boolean; // 上珠是否拨到靠梁
  lower: number;  // 下珠靠梁数量 (0-4)
}

const initialRods: Rod[] = Array(7).fill(null).map(() => ({ upper: false, lower: 0 }));

export default function AbacusPracticePage() {
  const [rods, setRods] = useState<Rod[]>(initialRods);
  const [showValue, setShowValue] = useState(true);

  const value = useMemo(() => {
    let total = 0;
    rods.forEach((rod, i) => {
      const placeValue = Math.pow(10, rods.length - 1 - i);
      const digit = (rod.upper ? 5 : 0) + rod.lower;
      total += digit * placeValue;
    });
    return total;
  }, [rods]);

  const toggleUpper = (i: number) => {
    setRods(rods.map((r, idx) => idx === i ? { ...r, upper: !r.upper } : r));
  };
  const adjustLower = (i: number, delta: number) => {
    setRods(rods.map((r, idx) => {
      if (idx !== i) return r;
      const v = Math.max(0, Math.min(4, r.lower + delta));
      return { ...r, lower: v };
    }));
  };
  const reset = () => setRods(initialRods);

  const digits = rods.map(r => (r.upper ? 5 : 0) + r.lower);

  return (
    <ToolLayout title="珠算练习" description="在线虚拟算盘学习，了解珠算基础知识和运算方法" toolId="abacus-practice" icon={Beaker} category="教育学习" slug="abacus-practice">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">点击上珠切换状态(每颗值5)，点击 +/- 调整下珠数量(每颗值1)。算盘从左到右为高位到低位。</p>
        </div>

        {/* 算盘 */}
        <div className="bg-gradient-to-b from-amber-900/20 to-amber-950/20 rounded-xl border-2 border-amber-700/30 p-6">
          <div className="bg-amber-950/40 rounded-lg p-4">
            {/* 上珠区 */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {rods.map((rod, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-12 flex items-end justify-center">
                    <button onClick={() => toggleUpper(i)} className={`w-8 h-4 rounded transition-all ${rod.upper ? "bg-amber-400 translate-y-6" : "bg-amber-600/50"}`} style={{ marginBottom: rod.upper ? "0" : "32px" }} />
                  </div>
                </div>
              ))}
            </div>
            {/* 横梁 */}
            <div className="h-1 bg-amber-600/50 rounded my-1" />
            {/* 下珠区 */}
            <div className="grid grid-cols-7 gap-2 mt-2">
              {rods.map((rod, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="flex flex-col-reverse gap-0.5 h-20 justify-start">
                    {[0, 1, 2, 3].map((b) => (
                      <button key={b} onClick={() => adjustLower(i, b === rod.lower - 1 ? -1 : b === rod.lower ? 1 : 0)} className={`w-8 h-4 rounded transition-all ${b < rod.lower ? "bg-sky-400" : "bg-sky-600/30"}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <button onClick={() => adjustLower(i, -1)} className="w-5 h-5 bg-[#0d0d0f] border border-[#3f3f46] text-slate-400 rounded text-xs">-</button>
                    <span className="text-xs text-amber-400 w-4 text-center">{digits[i]}</span>
                    <button onClick={() => adjustLower(i, 1)} className="w-5 h-5 bg-[#0d0d0f] border border-[#3f3f46] text-slate-400 rounded text-xs">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 数值显示 */}
        <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-6 text-center">
          <div className="text-sm text-slate-400 mb-2">算盘当前数值</div>
          <div className="text-4xl font-bold text-primary-400 font-mono">{showValue ? value.toLocaleString() : "???????"}</div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <button onClick={() => setShowValue(!showValue)} className="px-4 py-2 bg-[#27272a] border border-[#3f3f46] text-slate-300 rounded-lg text-sm">{showValue ? "隐藏" : "显示"}</button>
            <button onClick={reset} className="px-4 py-2 bg-[#27272a] border border-[#3f3f46] text-slate-300 rounded-lg text-sm flex items-center gap-1"><RotateCcw className="w-4 h-4" />清零</button>
          </div>
        </div>

        {/* 各位数值 */}
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">各位数值</h3>
          <div className="grid grid-cols-7 gap-2 text-center">
            {["百万","十万","万","千","百","十","个"].map((label, i) => (
              <div key={i} className="bg-[#0d0d0f] rounded-lg p-2">
                <div className="text-xs text-slate-500">{label}位</div>
                <div className="text-xl font-bold text-amber-400">{digits[i]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
