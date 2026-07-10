"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Scale } from "lucide-react";

export default function IdealWeightRangePage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(25);
  const [frame, setFrame] = useState<"small" | "medium" | "large">("medium");

  const result = useMemo(() => {
    const h = height / 100;

    // BMI法: 18.5-24
    const bmiLow = 18.5 * h * h;
    const bmiHigh = 24 * h * h;

    // Broca法: 身高-105(男)/110(女)
    const broca = (gender === "male" ? height - 105 : height - 110);

    // Devine公式
    const devine = gender === "male" ? 50 + 2.3 * ((height - 152.4) / 2.54) : 45.5 + 2.3 * ((height - 152.4) / 2.54);

    // Robinson公式
    const robinson = gender === "male" ? 52 + 1.9 * ((height - 152.4) / 2.54) : 49 + 1.7 * ((height - 152.4) / 2.54);

    // Hamwi公式
    const hamwi = gender === "male" ? 48 + 2.7 * ((height - 152.4) / 2.54) : 45.5 + 2.2 * ((height - 152.4) / 2.54);

    // 体型调整
    const frameAdjust: Record<string, number> = { small: -0.1, medium: 0, large: 0.1 };
    const adjustedLow = bmiLow * (1 + frameAdjust[frame]);
    const adjustedHigh = bmiHigh * (1 + frameAdjust[frame]);

    return { bmiLow, bmiHigh, broca, devine, robinson, hamwi, adjustedLow, adjustedHigh };
  }, [gender, height, age, frame]);

  return (
    <ToolLayout title="标准体重范围" description="根据身高性别年龄计算标准体重范围和建议" toolId="ideal-weight-range" icon={Scale} category="健康医疗" slug="ideal-weight-range">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">性别</label>
            <div className="flex gap-2">
              <button onClick={() => setGender("male")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${gender === "male" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>男</button>
              <button onClick={() => setGender("female")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${gender === "female" ? "bg-pink-500/20 border-pink-500 text-pink-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>女</button>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">身高 (cm)</label><input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">年龄</label><input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体型</label><select value={frame} onChange={(e) => setFrame(e.target.value as "small" | "medium" | "large")} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500"><option value="small">小骨架</option><option value="medium">中骨架</option><option value="large">大骨架</option></select></div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-5 text-center">
          <div className="text-sm text-slate-400 mb-2">理想体重范围 (BMI 18.5-24，已按体型调整)</div>
          <div className="text-4xl font-bold text-emerald-400">{result.adjustedLow.toFixed(1)} - {result.adjustedHigh.toFixed(1)}</div>
          <div className="text-sm text-slate-500 mt-1">公斤 (kg)</div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">多种公式对比</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Broca公式 (身高-105/110)</span><span className="text-white">{result.broca.toFixed(1)} kg</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Devine公式</span><span className="text-white">{result.devine.toFixed(1)} kg</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Robinson公式</span><span className="text-white">{result.robinson.toFixed(1)} kg</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Hamwi公式</span><span className="text-white">{result.hamwi.toFixed(1)} kg</span></div>
            <div className="flex justify-between border-t border-[#3f3f46] pt-2"><span className="text-slate-400">BMI法范围</span><span className="text-emerald-400 font-bold">{result.bmiLow.toFixed(1)} - {result.bmiHigh.toFixed(1)} kg</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
