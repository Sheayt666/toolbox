"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Waves } from "lucide-react";

export default function HydrationCalculatorPage() {
  const [weight, setWeight] = useState(65);
  const [activity, setActivity] = useState("moderate");
  const [climate, setClimate] = useState("normal");

  const result = useMemo(() => {
    // 基础饮水量: 体重 * 30ml
    let base = weight * 30;
    // 活动量调整
    const activityAdd: Record<string, number> = { sedentary: 0, light: 350, moderate: 500, active: 700, veryActive: 1000 };
    base += activityAdd[activity] || 0;
    // 气候调整
    if (climate === "hot") base *= 1.15;
    if (climate === "dry") base *= 1.1;

    const liters = base / 1000;
    const glasses = Math.round(base / 250); // 每杯250ml

    return { ml: Math.round(base), liters: liters.toFixed(1), glasses };
  }, [weight, activity, climate]);

  return (
    <ToolLayout title="补水计算器" description="根据体重活动量计算每日所需饮水量建议" toolId="hydration-calculator" icon={Waves} category="健康医疗" slug="hydration-calculator">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">活动量</label>
            <select value={activity} onChange={(e) => setActivity(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              <option value="sedentary">久坐不动</option>
              <option value="light">轻度活动</option>
              <option value="moderate">中度活动</option>
              <option value="active">高度活动</option>
              <option value="veryActive">极高活动</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">气候环境</label>
            <select value={climate} onChange={(e) => setClimate(e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
              <option value="normal">正常环境</option>
              <option value="hot">炎热环境</option>
              <option value="dry">干燥环境</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4 text-center">
            <div className="text-xs text-slate-400 mb-2">每日建议饮水量</div>
            <div className="text-4xl font-bold text-sky-400">{result.liters}</div>
            <div className="text-sm text-slate-500">升 (L)</div>
            <div className="text-xs text-slate-400 mt-1">约 {result.ml} 毫升</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4 text-center">
            <div className="text-xs text-slate-400 mb-2">建议杯数 (250ml/杯)</div>
            <div className="text-4xl font-bold text-primary-400">{result.glasses}</div>
            <div className="text-sm text-slate-500">杯</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4 text-center">
            <div className="text-xs text-slate-400 mb-2">每小时建议</div>
            <div className="text-4xl font-bold text-emerald-400">{Math.round(result.ml / 16)}</div>
            <div className="text-sm text-slate-500">毫升 (醒着约16小时)</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">饮水提醒时间表</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
            {["07:00 起床", "09:00 上午", "11:00 午前", "13:00 午后", "15:00 下午", "17:00 傍晚", "19:00 晚间", "21:00 睡前"].map((t) => (
              <div key={t} className="flex items-center gap-2 bg-[#0d0d0f] rounded-lg px-3 py-2">
                <div className="w-2 h-2 rounded-full bg-sky-400" />
                <span className="text-slate-300 text-xs">{t}</span>
                <span className="text-sky-400 text-xs ml-auto">{Math.round(result.ml / 8)}ml</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
