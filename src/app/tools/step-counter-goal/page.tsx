"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Footprints } from "lucide-react";

export default function StepCounterGoalPage() {
  const [weight, setWeight] = useState(65);
  const [height, setHeight] = useState(170);
  const [goal, setGoal] = useState(10000);
  const [actualSteps, setActualSteps] = useState(6500);

  const result = useMemo(() => {
    // 步幅 = 身高 * 0.45 (男) 或 0.413 (女)，这里用平均0.43
    const stride = height * 0.0043; // km per step
    const distance = actualSteps * stride;
    // 热量消耗 = 体重 * 距离(km) * 0.5 (约)
    const calories = Math.round(weight * distance * 0.55);
    const goalPct = goal > 0 ? (actualSteps / goal) * 100 : 0;
    const remaining = Math.max(0, goal - actualSteps);
    const remainingDistance = remaining * stride;
    const remainingCalories = Math.round(weight * remainingDistance * 0.55);

    // 推荐步数: 基于体重和身高
    const recommended = Math.round(8000 + (weight - 60) * 20);

    return { distance: (distance).toFixed(2), calories, goalPct, remaining, remainingDistance: remainingDistance.toFixed(2), remainingCalories, recommended };
  }, [weight, height, goal, actualSteps]);

  return (
    <ToolLayout title="步数目标计算" description="根据身高体重计算每日推荐步数和消耗热量" toolId="step-counter-goal" icon={Footprints} category="健康医疗" slug="step-counter-goal">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">身高 (cm)</label><input type="number" value={height} onChange={(e) => setHeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">每日目标步数</label><input type="number" value={goal} onChange={(e) => setGoal(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">今日已走步数</label><input type="number" value={actualSteps} onChange={(e) => setActualSteps(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">目标完成度</span>
            <span className="text-sm text-white font-bold">{result.goalPct.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-[#0d0d0f] rounded-full h-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, result.goalPct)}%` }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
            <span>{actualSteps.toLocaleString()} 步</span>
            <span>{goal.toLocaleString()} 步</span>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">行走距离</div><div className="text-xl font-bold text-sky-400">{result.distance} <span className="text-xs text-slate-500">km</span></div></div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">消耗热量</div><div className="text-xl font-bold text-orange-400">{result.calories} <span className="text-xs text-slate-500">kcal</span></div></div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">距目标还差</div><div className="text-xl font-bold text-amber-400">{result.remaining} <span className="text-xs text-slate-500">步</span></div></div>
          <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4"><div className="text-xs text-slate-400 mb-1">推荐步数</div><div className="text-xl font-bold text-emerald-400">{result.recommended}</div></div>
        </div>

        <div className="bg-primary-500/5 border border-primary-500/20 rounded-xl p-4">
          <p className="text-sm text-slate-300">还需走 <span className="text-primary-400 font-bold">{result.remaining}</span> 步（约 {result.remainingDistance} km），可额外消耗 <span className="text-orange-400 font-bold">{result.remainingCalories}</span> 千卡热量。</p>
        </div>
      </div>
    </ToolLayout>
  );
}
