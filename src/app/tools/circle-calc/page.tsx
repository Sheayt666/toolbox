"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Circle } from "lucide-react";

export default function CircleCalcPage() {
  const [radius, setRadius] = useState(5);
  const [centralAngle, setCentralAngle] = useState(90);

  const result = useMemo(() => {
    const r = radius;
    const area = Math.PI * r * r;
    const circumference = 2 * Math.PI * r;
    const diameter = 2 * r;
    const arcLength = (centralAngle / 360) * circumference;
    const sectorArea = (centralAngle / 360) * area;
    const chordLength = 2 * r * Math.sin((centralAngle * Math.PI / 180) / 2);
    return { area, circumference, diameter, arcLength, sectorArea, chordLength };
  }, [radius, centralAngle]);

  const fmt = (n: number) => n.toFixed(4);

  return (
    <ToolLayout title="圆计算器" description="计算圆的面积周长弧长扇形面积等参数" toolId="circle-calc" icon={Circle} category="计算工具" slug="circle-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">半径 (r)</label><input type="number" step="0.01" value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">圆心角 (度)</label><input type="number" value={centralAngle} onChange={(e) => setCentralAngle(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">面积 S = πr²</div><div className="text-xl font-bold text-white">{fmt(result.area)}</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">周长 C = 2πr</div><div className="text-xl font-bold text-emerald-400">{fmt(result.circumference)}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">直径 d = 2r</div><div className="text-xl font-bold text-sky-400">{fmt(result.diameter)}</div></div>
          <div className="bg-gradient-to-br from-amber-500/10 to-transparent rounded-xl border border-amber-500/20 p-4"><div className="text-xs text-slate-400 mb-1">弧长 L = nπr/180</div><div className="text-xl font-bold text-amber-400">{fmt(result.arcLength)}</div></div>
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">扇形面积 S = nπr²/360</div><div className="text-xl font-bold text-purple-400">{fmt(result.sectorArea)}</div></div>
          <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">弦长 = 2r·sin(n/2)</div><div className="text-xl font-bold text-rose-400">{fmt(result.chordLength)}</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">公式说明</h3>
          <div className="space-y-1 text-sm text-slate-400">
            <div>圆面积：S = π × r²</div>
            <div>圆周长：C = 2 × π × r</div>
            <div>弧长：L = (n / 360) × 2πr （n为圆心角度数）</div>
            <div>扇形面积：S = (n / 360) × πr²</div>
            <div>弦长：= 2r × sin(n/2)</div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
