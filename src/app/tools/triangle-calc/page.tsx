"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Triangle } from "lucide-react";

export default function TriangleCalcPage() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [c, setC] = useState(5);

  const result = useMemo(() => {
    // 三角形有效性检查
    const valid = a + b > c && a + c > b && b + c > a && a > 0 && b > 0 && c > 0;
    if (!valid) return { valid: false };

    const s = (a + b + c) / 2; // 半周长
    const area = Math.sqrt(s * (s - a) * (s - b) * (s - c)); // 海伦公式
    const perimeter = a + b + c;
    // 高 (对a边)
    const heightA = (2 * area) / a;
    // 内切圆半径 r = area / s
    const inradius = area / s;
    // 外接圆半径 R = abc / (4 * area)
    const circumradius = (a * b * c) / (4 * area);

    // 角度 (余弦定理)
    const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
    const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
    const angleC = 180 - angleA - angleB;

    let type = "锐角三角形";
    if (Math.abs(angleA - 90) < 0.01 || Math.abs(angleB - 90) < 0.01 || Math.abs(angleC - 90) < 0.01) type = "直角三角形";
    else if (angleA > 90 || angleB > 90 || angleC > 90) type = "钝角三角形";

    let equalType = "不等边三角形";
    if (a === b && b === c) equalType = "等边三角形";
    else if (a === b || b === c || a === c) equalType = "等腰三角形";

    return { valid: true, area, perimeter, heightA, inradius, circumradius, angleA, angleB, angleC, type, equalType };
  }, [a, b, c]);

  const fmt = (n: number | undefined) => (n ?? 0).toFixed(4);

  return (
    <ToolLayout title="三角形计算器" description="已知边角计算三角形面积周长和其他参数" toolId="triangle-calc" icon={Triangle} category="计算工具" slug="triangle-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">边 a</label><input type="number" step="0.01" value={a} onChange={(e) => setA(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">边 b</label><input type="number" step="0.01" value={b} onChange={(e) => setB(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">边 c</label><input type="number" step="0.01" value={c} onChange={(e) => setC(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        {!result.valid ? (
          <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center text-sm text-rose-400">这三条边无法构成有效三角形（三角形两边之和必须大于第三边）</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">面积 (海伦公式)</div><div className="text-xl font-bold text-emerald-400">{fmt(result.area)}</div></div>
              <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">周长</div><div className="text-xl font-bold text-white">{fmt(result.perimeter)}</div></div>
              <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">a边上的高</div><div className="text-xl font-bold text-sky-400">{fmt(result.heightA)}</div></div>
              <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">内切圆半径</div><div className="text-xl font-bold text-purple-400">{fmt(result.inradius)}</div></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">角A</div><div className="text-lg font-bold text-white">{(result.angleA ?? 0).toFixed(2)}°</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">角B</div><div className="text-lg font-bold text-white">{(result.angleB ?? 0).toFixed(2)}°</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">角C</div><div className="text-lg font-bold text-white">{(result.angleC ?? 0).toFixed(2)}°</div></div>
              <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">外接圆半径</div><div className="text-lg font-bold text-white">{fmt(result.circumradius)}</div></div>
            </div>

            <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
              <p className="text-sm text-slate-300">三角形类型：<span className="text-primary-400 font-bold">{result.type}</span> · <span className="text-primary-400 font-bold">{result.equalType}</span></p>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
