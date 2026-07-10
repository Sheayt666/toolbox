"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Lightbulb, Search } from "lucide-react";

interface Formula {
  name: string;
  formula: string;
  category: string;
  description: string;
  variables: string;
}

const FORMULAS: Formula[] = [
  { name: "速度", formula: "v = s / t", category: "运动学", description: "速度等于路程除以时间", variables: "v:速度(m/s), s:路程(m), t:时间(s)" },
  { name: "加速度", formula: "a = (v - v₀) / t", category: "运动学", description: "速度变化量与时间的比值", variables: "a:加速度(m/s²), v:末速度, v₀:初速度, t:时间" },
  { name: "位移公式", formula: "s = v₀t + ½at²", category: "运动学", description: "匀加速运动的位移", variables: "s:位移, v₀:初速度, t:时间, a:加速度" },
  { name: "牛顿第二定律", formula: "F = ma", category: "力学", description: "力等于质量乘以加速度", variables: "F:力(N), m:质量(kg), a:加速度(m/s²)" },
  { name: "重力", formula: "G = mg", category: "力学", description: "重力等于质量乘以重力加速度", variables: "G:重力(N), m:质量(kg), g:9.8m/s²" },
  { name: "摩擦力", formula: "f = μN", category: "力学", description: "滑动摩擦力等于摩擦系数乘以正压力", variables: "f:摩擦力(N), μ:摩擦系数, N:正压力(N)" },
  { name: "功", formula: "W = Fs cosθ", category: "功和能", description: "功等于力乘以位移乘以夹角余弦", variables: "W:功(J), F:力(N), s:位移(m), θ:力与位移夹角" },
  { name: "功率", formula: "P = W / t", category: "功和能", description: "功率等于功除以时间", variables: "P:功率(W), W:功(J), t:时间(s)" },
  { name: "动能", formula: "Eₖ = ½mv²", category: "功和能", description: "动能等于质量乘以速度平方的一半", variables: "Eₖ:动能(J), m:质量(kg), v:速度(m/s)" },
  { name: "重力势能", formula: "Eₚ = mgh", category: "功和能", description: "重力势能等于质量乘以重力加速度乘以高度", variables: "Eₚ:势能(J), m:质量, g:9.8, h:高度(m)" },
  { name: "机械能守恒", formula: "Eₖ₁ + Eₚ₁ = Eₖ₂ + Eₚ₂", category: "功和能", description: "只有重力做功时机械能守恒", variables: "Eₖ:动能, Eₚ:势能" },
  { name: "动量", formula: "p = mv", category: "动量", description: "动量等于质量乘以速度", variables: "p:动量(kg·m/s), m:质量, v:速度" },
  { name: "动量守恒", formula: "m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'", category: "动量", description: "系统不受外力时动量守恒", variables: "m:质量, v:速度, ':碰后" },
  { name: "压强", formula: "P = F / S", category: "压强", description: "压强等于压力除以受力面积", variables: "P:压强(Pa), F:压力(N), S:面积(m²)" },
  { name: "液体压强", formula: "P = ρgh", category: "压强", description: "液体压强等于密度乘以重力加速度乘以深度", variables: "P:压强, ρ:密度(kg/m³), g:9.8, h:深度(m)" },
  { name: "浮力", formula: "F浮 = ρ液gV排", category: "压强", description: "浮力等于液体密度乘以g乘以排开体积", variables: "F浮:浮力(N), ρ液:液体密度, V排:排开体积" },
  { name: "欧姆定律", formula: "I = U / R", category: "电学", description: "电流等于电压除以电阻", variables: "I:电流(A), U:电压(V), R:电阻(Ω)" },
  { name: "电功率", formula: "P = UI", category: "电学", description: "电功率等于电压乘以电流", variables: "P:功率(W), U:电压(V), I:电流(A)" },
  { name: "焦耳定律", formula: "Q = I²Rt", category: "电学", description: "热量等于电流平方乘以电阻乘以时间", variables: "Q:热量(J), I:电流, R:电阻, t:时间" },
  { name: "串联电阻", formula: "R = R₁ + R₂", category: "电学", description: "串联电路总电阻等于各电阻之和", variables: "R:总电阻, R₁,R₂:分电阻" },
  { name: "并联电阻", formula: "1/R = 1/R₁ + 1/R₂", category: "电学", description: "并联电路总电阻的倒数等于各电阻倒数之和", variables: "R:总电阻, R₁,R₂:分电阻" },
];

export default function PhysicsFormulaSheetPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");

  const categories = useMemo(() => ["全部", ...Array.from(new Set(FORMULAS.map((f) => f.category)))], []);
  const filtered = useMemo(() => {
    let r = FORMULAS;
    if (category !== "全部") r = r.filter((f) => f.category === category);
    if (query.trim()) r = r.filter((f) => f.name.includes(query) || f.formula.includes(query) || f.description.includes(query));
    return r;
  }, [query, category]);

  return (
    <ToolLayout title="物理公式大全" description="中学物理公式速查表" icon={Lightbulb} category="教育学习" slug="physics-formula-sheet">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索公式名称或内容..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${category === c ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{c}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((f, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{f.name}</h4>
                <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded">{f.category}</span>
              </div>
              <div className="text-xl font-mono text-emerald-400 mb-2">{f.formula}</div>
              <p className="text-sm text-slate-400 mb-1">{f.description}</p>
              <div className="text-xs text-slate-500">{f.variables}</div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
