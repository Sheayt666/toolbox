"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { HeartPulse } from "lucide-react";

export default function HeartRateZonesPage() {
  const [age, setAge] = useState(25);
  const [restingHR, setRestingHR] = useState(65);
  const [method, setMethod] = useState<"simple" | "karvonen">("karvonen");

  const result = useMemo(() => {
    const maxHR = 220 - age;
    const reserve = maxHR - restingHR;

    const zones = method === "simple"
      ? [
          { name: "热身区", range: [0.5, 0.6], desc: "50-60% 最大心率", color: "from-sky-500 to-blue-500" },
          { name: "燃脂区", range: [0.6, 0.7], desc: "60-70% 最大心率", color: "from-emerald-500 to-green-500" },
          { name: "有氧区", range: [0.7, 0.8], desc: "70-80% 最大心率", color: "from-amber-500 to-orange-500" },
          { name: "无氧区", range: [0.8, 0.9], desc: "80-90% 最大心率", color: "from-orange-500 to-red-500" },
          { name: "极限区", range: [0.9, 1.0], desc: "90-100% 最大心率", color: "from-rose-500 to-red-600" },
        ].map((z) => ({ ...z, low: Math.round(maxHR * z.range[0]), high: Math.round(maxHR * z.range[1]) }))
      : [
          { name: "热身区", range: [0.5, 0.6], desc: "50-60% 储备心率", color: "from-sky-500 to-blue-500" },
          { name: "燃脂区", range: [0.6, 0.7], desc: "60-70% 储备心率", color: "from-emerald-500 to-green-500" },
          { name: "有氧区", range: [0.7, 0.8], desc: "70-80% 储备心率", color: "from-amber-500 to-orange-500" },
          { name: "无氧区", range: [0.8, 0.9], desc: "80-90% 储备心率", color: "from-orange-500 to-red-500" },
          { name: "极限区", range: [0.9, 1.0], desc: "90-100% 储备心率", color: "from-rose-500 to-red-600" },
        ].map((z) => ({ ...z, low: Math.round(reserve * z.range[0] + restingHR), high: Math.round(reserve * z.range[1] + restingHR) }));

    return { maxHR, reserve, zones };
  }, [age, restingHR, method]);

  return (
    <ToolLayout title="心率区间计算" description="计算运动心率区间，帮助科学锻炼控制强度" toolId="heart-rate-zones" icon={HeartPulse} category="健康医疗" slug="heart-rate-zones">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">年龄</label><input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">静息心率</label><input type="number" value={restingHR} onChange={(e) => setRestingHR(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">计算方法</label><select value={method} onChange={(e) => setMethod(e.target.value as "simple" | "karvonen")} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500"><option value="karvonen">卡氏公式(推荐)</option><option value="simple">最大心率百分比</option></select></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-rose-500/10 to-transparent rounded-xl border border-rose-500/20 p-4"><div className="text-xs text-slate-400 mb-1">最大心率</div><div className="text-2xl font-bold text-rose-400">{result.maxHR}</div><div className="text-xs text-slate-500">bpm</div></div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">心率储备</div><div className="text-2xl font-bold text-primary-400">{result.reserve}</div><div className="text-xs text-slate-500">bpm</div></div>
        </div>

        <div className="space-y-3">
          {result.zones.map((z, i) => (
            <div key={i} className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4 overflow-hidden relative">
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${z.color}`} />
              <div className="flex items-center justify-between pl-2">
                <div>
                  <div className="text-sm font-semibold text-white">{z.name}</div>
                  <div className="text-xs text-slate-500">{z.desc}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">{z.low} - {z.high}</div>
                  <div className="text-xs text-slate-500">bpm</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
