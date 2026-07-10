"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Activity } from "lucide-react";

export default function BasalMetabolicRatePage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);

  const result = useMemo(() => {
    // Mifflin-St Jeor
    const mifflin = gender === "male" ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
    // Harris-Benedict
    const harris = gender === "male" ? 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age : 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age;
    // Katch-McArdle (假设体脂率20%)
    const bodyFat = 0.2;
    const leanMass = weight * (1 - bodyFat);
    const katch = 370 + 21.6 * leanMass;
    return { mifflin, harris, katch, avg: (mifflin + harris) / 2 };
  }, [gender, age, height, weight]);

  return (
    <ToolLayout title="基础代谢率" description="计算基础代谢率BMR，了解静息状态能量消耗" toolId="basal-metabolic-rate" icon={Activity} category="健康医疗" slug="basal-metabolic-rate">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">性别</label>
            <div className="flex gap-2">
              <button onClick={() => setGender("male")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${gender === "male" ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>男</button>
              <button onClick={() => setGender("female")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${gender === "female" ? "bg-pink-500/20 border-pink-500 text-pink-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>女</button>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">年龄</label><input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">身高 (cm)</label><input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">Mifflin-St Jeor</div><div className="text-xl font-bold text-emerald-400">{Math.round(result.mifflin)}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">Harris-Benedict</div><div className="text-xl font-bold text-sky-400">{Math.round(result.harris)}</div></div>
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20 p-4"><div className="text-xs text-slate-400 mb-1">Katch-McArdle</div><div className="text-xl font-bold text-purple-400">{Math.round(result.katch)}</div></div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">平均BMR</div><div className="text-xl font-bold text-primary-400">{Math.round(result.avg)}</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">不同活动水平下的每日热量需求</h3>
          <div className="space-y-2 text-sm">
            {[{ l: "久坐不动", f: 1.2 }, { l: "轻度活动", f: 1.375 }, { l: "中度活动", f: 1.55 }, { l: "高度活动", f: 1.725 }, { l: "极高活动", f: 1.9 }].map((a) => (
              <div key={a.l} className="flex justify-between"><span className="text-slate-400">{a.l}</span><span className="text-white font-medium">{Math.round(result.avg * a.f)} 千卡/天</span></div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
