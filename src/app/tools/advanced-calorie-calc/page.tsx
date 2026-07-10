"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Flame } from "lucide-react";

const ACTIVITY_FACTORS: Record<string, { label: string; factor: number }> = {
  sedentary: { label: "久坐不动", factor: 1.2 },
  light: { label: "轻度活动(1-3天/周)", factor: 1.375 },
  moderate: { label: "中度活动(3-5天/周)", factor: 1.55 },
  active: { label: "高度活动(6-7天/周)", factor: 1.725 },
  veryActive: { label: "极高活动(体力工作)", factor: 1.9 },
};

export default function AdvancedCalorieCalcPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [age, setAge] = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [activity, setActivity] = useState("moderate");
  const [goal, setGoal] = useState<"lose" | "maintain" | "gain">("maintain");

  const result = useMemo(() => {
    // Mifflin-St Jeor 公式
    const bmr = gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * ACTIVITY_FACTORS[activity].factor;
    let targetCalorie = tdee;
    if (goal === "lose") targetCalorie = tdee - 500;
    if (goal === "gain") targetCalorie = tdee + 500;

    // 宏量营养素分配
    const protein = (targetCalorie * 0.3) / 4;
    const carb = (targetCalorie * 0.5) / 4;
    const fat = (targetCalorie * 0.2) / 9;

    return { bmr, tdee, targetCalorie, protein, carb, fat };
  }, [gender, age, height, weight, activity, goal]);

  return (
    <ToolLayout title="卡路里计算进阶" description="详细计算每日热量需求，基于活动水平和目标" toolId="advanced-calorie-calc" icon={Flame} category="健康医疗" slug="advanced-calorie-calc">
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

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">活动水平</label>
          <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
            {Object.entries(ACTIVITY_FACTORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">目标</label>
          <div className="flex gap-2">
            <button onClick={() => setGoal("lose")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${goal === "lose" ? "bg-rose-500/20 border-rose-500 text-rose-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>减脂</button>
            <button onClick={() => setGoal("maintain")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${goal === "maintain" ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>维持</button>
            <button onClick={() => setGoal("gain")} className={`flex-1 px-4 py-2.5 rounded-lg text-sm border transition-all ${goal === "gain" ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>增肌</button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">基础代谢率 BMR</div><div className="text-xl font-bold text-white">{Math.round(result.bmr)}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">每日总消耗 TDEE</div><div className="text-xl font-bold text-sky-400">{Math.round(result.tdee)}</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">目标热量/天</div><div className="text-xl font-bold text-emerald-400">{Math.round(result.targetCalorie)}</div></div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">目标热量/周</div><div className="text-xl font-bold text-orange-400">{Math.round(result.targetCalorie * 7)}</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">宏量营养素建议 (克/天)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">蛋白质 (30%)</span><span className="text-blue-400 font-bold">{Math.round(result.protein)} g</span></div>
            <div className="flex justify-between"><span className="text-slate-400">碳水化合物 (50%)</span><span className="text-emerald-400 font-bold">{Math.round(result.carb)} g</span></div>
            <div className="flex justify-between"><span className="text-slate-400">脂肪 (20%)</span><span className="text-amber-400 font-bold">{Math.round(result.fat)} g</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
