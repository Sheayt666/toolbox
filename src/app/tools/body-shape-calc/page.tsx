"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PersonStanding } from "lucide-react";

export default function BodyShapeCalcPage() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [waist, setWaist] = useState(75);
  const [hip, setHip] = useState(95);

  const result = useMemo(() => {
    const h = height / 100;
    const bmi = weight / (h * h);
    const whr = hip > 0 ? waist / hip : 0; // 腰臀比
    const whtr = height > 0 ? waist / height : 0; // 腰高比
    const bodyFat = gender === "male" ? 1.2 * bmi + 0.23 * 30 - 16.2 : 1.2 * bmi + 0.23 * 30 - 5.4; // 简化体脂估算(假设年龄30)

    let whrStatus = "正常", whrColor = "text-emerald-400";
    if (gender === "male" && whr > 0.9) { whrStatus = "苹果型(内脏脂肪偏高)"; whrColor = "text-rose-400"; }
    else if (gender === "female" && whr > 0.85) { whrStatus = "苹果型(内脏脂肪偏高)"; whrColor = "text-rose-400"; }
    else if (whr > 0) { whrStatus = "梨型(脂肪分布正常)"; whrColor = "text-emerald-400"; }

    let whtrStatus = "正常", whtrColor = "text-emerald-400";
    if (whtr > 0.5) { whtrStatus = "偏高(心血管风险)"; whtrColor = "text-rose-400"; }

    let bmiCat = "正常", bmiColor = "text-emerald-400";
    if (bmi < 18.5) { bmiCat = "偏瘦"; bmiColor = "text-sky-400"; }
    else if (bmi < 24) { bmiCat = "正常"; bmiColor = "text-emerald-400"; }
    else if (bmi < 28) { bmiCat = "偏胖"; bmiColor = "text-amber-400"; }
    else { bmiCat = "肥胖"; bmiColor = "text-rose-400"; }

    return { bmi, whr, whtr, bodyFat, whrStatus, whrColor, whtrStatus, whtrColor, bmiCat, bmiColor };
  }, [gender, height, weight, waist, hip]);

  return (
    <ToolLayout title="身材比例计算" description="计算腰臀比、腰高比等身材指标，评估体型" toolId="body-shape-calc" icon={PersonStanding} category="健康医疗" slug="body-shape-calc">
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
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体重 (kg)</label><input type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">腰围 (cm)</label><input type="number" value={waist} onChange={(e) => setWaist(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">臀围 (cm)</label><input type="number" value={hip} onChange={(e) => setHip(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">BMI</div><div className={`text-xl font-bold ${result.bmiColor}`}>{result.bmi.toFixed(1)}</div><div className={`text-xs ${result.bmiColor}`}>{result.bmiCat}</div></div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4"><div className="text-xs text-slate-400 mb-1">腰臀比 WHR</div><div className="text-xl font-bold text-sky-400">{result.whr.toFixed(2)}</div><div className={`text-xs ${result.whrColor}`}>{result.whrStatus}</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">腰高比 WHtR</div><div className="text-xl font-bold text-emerald-400">{result.whtr.toFixed(2)}</div><div className={`text-xs ${result.whtrColor}`}>{result.whtrStatus}</div></div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">体脂率估算</div><div className="text-xl font-bold text-orange-400">{result.bodyFat.toFixed(1)}%</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">标准参考</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">腰臀比标准</span><span className="text-slate-300">男 &lt; 0.9 / 女 &lt; 0.85</span></div>
            <div className="flex justify-between"><span className="text-slate-400">腰高比标准</span><span className="text-slate-300">&lt; 0.5 为健康</span></div>
            <div className="flex justify-between"><span className="text-slate-400">BMI标准</span><span className="text-slate-300">18.5-24 正常 / 24-28 偏胖 / &gt;28 肥胖</span></div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
