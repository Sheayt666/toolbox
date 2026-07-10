"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { PawPrint } from "lucide-react";

export default function PetAgeCalculatorPage() {
  const [petType, setPetType] = useState<"dog" | "cat">("dog");
  const [petAge, setPetAge] = useState(3);
  const [petSize, setPetSize] = useState<"small" | "medium" | "large">("medium");

  const result = useMemo(() => {
    let humanAge = 0;
    let lifeStage = "";

    if (petType === "dog") {
      // 狗的年龄换算（按体型）
      const sizeMultiplier: Record<string, number> = { small: 1, medium: 1.1, large: 1.3 };
      const mult = sizeMultiplier[petSize];
      if (petAge <= 0) humanAge = 0;
      else if (petAge <= 1) humanAge = 15 * petAge;
      else if (petAge <= 2) humanAge = 15 + 9 * (petAge - 1);
      else humanAge = Math.round(24 + (petAge - 2) * 4 * mult);

      if (petAge <= 0.5) lifeStage = "幼犬期";
      else if (petAge <= 2) lifeStage = "少年期";
      else if (petAge <= 7) lifeStage = "成年期";
      else lifeStage = "老年期";
    } else {
      // 猫的年龄换算
      if (petAge <= 0) humanAge = 0;
      else if (petAge <= 1) humanAge = 15 * petAge;
      else if (petAge <= 2) humanAge = 15 + 9 * (petAge - 1);
      else humanAge = Math.round(24 + (petAge - 2) * 4);

      if (petAge <= 0.5) lifeStage = "幼猫期";
      else if (petAge <= 2) lifeStage = "少年期";
      else if (petAge <= 7) lifeStage = "成年期";
      else lifeStage = "老年期";
    }

    // 相当于人类的阶段
    let humanStage = "";
    if (humanAge <= 2) humanStage = "婴儿期";
    else if (humanAge <= 12) humanStage = "儿童期";
    else if (humanAge <= 20) humanStage = "青少年";
    else if (humanAge <= 40) humanStage = "青年";
    else if (humanAge <= 60) humanStage = "中年";
    else humanStage = "老年";

    return { humanAge, lifeStage, humanStage };
  }, [petType, petAge, petSize]);

  return (
    <ToolLayout title="宠物年龄换算" description="猫狗年龄换算为人类年龄，了解宠物成长阶段" toolId="pet-age-calculator" icon={PawPrint} category="生活工具" slug="pet-age-calculator">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">宠物类型</label>
          <div className="flex gap-2">
            <button onClick={() => setPetType("dog")} className={`flex-1 px-4 py-3 rounded-lg text-sm border transition-all ${petType === "dog" ? "bg-amber-500/20 border-amber-500 text-amber-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>🐶 狗狗</button>
            <button onClick={() => setPetType("cat")} className={`flex-1 px-4 py-3 rounded-lg text-sm border transition-all ${petType === "cat" ? "bg-purple-500/20 border-purple-500 text-purple-400" : "bg-[#27272a] border-[#3f3f46] text-slate-400"}`}>🐱 猫咪</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">宠物年龄 (岁)</label><input type="number" step="0.1" value={petAge} onChange={(e) => setPetAge(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" /></div>
          {petType === "dog" && (
            <div><label className="block text-sm font-medium text-slate-300 mb-1.5">体型</label>
              <select value={petSize} onChange={(e) => setPetSize(e.target.value as "small" | "medium" | "large")} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
                <option value="small">小型犬 (&lt;10kg)</option>
                <option value="medium">中型犬 (10-25kg)</option>
                <option value="large">大型犬 (&gt;25kg)</option>
              </select>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-6 text-center">
          <div className="text-6xl mb-3">{petType === "dog" ? "🐶" : "🐱"}</div>
          <div className="text-sm text-slate-400 mb-2">相当于人类年龄</div>
          <div className="text-5xl font-bold text-primary-400">{result.humanAge}<span className="text-2xl text-slate-500"> 岁</span></div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs px-3 py-1 bg-amber-500/20 text-amber-400 rounded">{result.lifeStage}</span>
            <span className="text-xs px-3 py-1 bg-sky-500/20 text-sky-400 rounded">人类{result.humanStage}</span>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-3">{petType === "dog" ? "狗狗" : "猫咪"}年龄对照表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-slate-400 border-b border-[#3f3f46]">
                <tr>
                  <th className="px-3 py-2 text-left">宠物年龄</th>
                  <th className="px-3 py-2 text-right">人类年龄</th>
                  <th className="px-3 py-2 text-left">阶段</th>
                </tr>
              </thead>
              <tbody>
                {[0.5, 1, 2, 3, 5, 7, 10, 15, 20].map((a) => {
                  let h = 0;
                  if (a <= 1) h = 15 * a;
                  else if (a <= 2) h = 15 + 9 * (a - 1);
                  else h = 24 + (a - 2) * 4;
                  let st = a <= 0.5 ? "幼年期" : a <= 2 ? "少年期" : a <= 7 ? "成年期" : "老年期";
                  return (
                    <tr key={a} className="border-b border-[#3f3f46]">
                      <td className="px-3 py-2 text-slate-300">{a} 岁</td>
                      <td className="px-3 py-2 text-right text-primary-400 font-bold">{Math.round(h)} 岁</td>
                      <td className="px-3 py-2 text-slate-400">{st}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
