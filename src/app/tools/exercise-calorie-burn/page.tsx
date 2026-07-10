"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Dumbbell } from "lucide-react";

// MET values for various exercises
const EXERCISES: Record<string, { name: string; met: number }> = {
  walking: { name: "步行(5km/h)", met: 3.5 },
  jogging: { name: "慢跑(8km/h)", met: 8.0 },
  running: { name: "快跑(12km/h)", met: 12.0 },
  cycling: { name: "骑行(中等)", met: 7.0 },
  swimming: { name: "游泳(自由泳)", met: 8.0 },
  basketball: { name: "篮球", met: 6.5 },
  badminton: { name: "羽毛球", met: 5.5 },
  rope: { name: "跳绳", met: 12.0 },
  yoga: { name: "瑜伽", met: 3.0 },
  dance: { name: "舞蹈", met: 5.0 },
  hiking: { name: "登山", met: 6.0 },
  pushup: { name: "力量训练", met: 6.0 },
  taekwondo: { name: "跆拳道", met: 10.0 },
  tableTennis: { name: "乒乓球", met: 4.0 },
  football: { name: "足球", met: 7.0 },
};

export default function ExerciseCalorieBurnPage() {
  const [weight, setWeight] = useState(65);
  const [duration, setDuration] = useState(30);
  const [exercise, setExercise] = useState("jogging");

  const result = useMemo(() => {
    const met = EXERCISES[exercise].met;
    // 卡路里 = MET * 体重(kg) * 时间(小时)
    const calories = met * weight * (duration / 60);
    return { calories: Math.round(calories), met };
  }, [weight, duration, exercise]);

  return (
    <ToolLayout title="运动消耗计算" description="计算各种运动的热量消耗，支持运动时长调整" toolId="exercise-calorie-burn" icon={Dumbbell} category="健康医疗" slug="exercise-calorie-burn">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">运动时长 (分钟)</label><input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">运动项目</label><select value={exercise} onChange={(e) => setExercise(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">{Object.entries(EXERCISES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}</select></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">消耗热量</div><div className="text-2xl font-bold text-orange-400">{result.calories}</div><div className="text-xs text-slate-500">千卡 (kcal)</div></div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">MET值</div><div className="text-2xl font-bold text-white">{result.met}</div><div className="text-xs text-slate-500">代谢当量</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">每小时消耗</div><div className="text-2xl font-bold text-emerald-400">{Math.round(result.met * weight)}</div><div className="text-xs text-slate-500">千卡/小时</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">不同运动对比 (30分钟)</h3>
          <div className="space-y-2">
            {Object.entries(EXERCISES).sort((a, b) => b[1].met - a[1].met).map(([k, v]) => {
              const cal = Math.round(v.met * weight * 0.5);
              const maxCal = Math.round(12 * weight * 0.5);
              return (
                <div key={k} className="flex items-center gap-3 text-xs">
                  <span className="text-slate-300 w-28">{v.name}</span>
                  <div className="flex-1 bg-[#0d0d0f] rounded-full h-4 overflow-hidden"><div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full" style={{ width: `${(cal / maxCal) * 100}%` }} /></div>
                  <span className="text-slate-400 w-16 text-right">{cal} kcal</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
