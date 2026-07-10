"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FlaskConical, Search } from "lucide-react";

interface Formula {
  name: string;
  equation: string;
  type: string;
  description: string;
}

const FORMULAS: Formula[] = [
  { name: "氢气燃烧", equation: "2H₂ + O₂ → 2H₂O", type: "化合反应", description: "氢气在氧气中燃烧生成水，放出大量热" },
  { name: "碳燃烧", equation: "C + O₂ → CO₂", type: "化合反应", description: "碳在充足氧气中燃烧生成二氧化碳" },
  { name: "不完全燃烧", equation: "2C + O₂ → 2CO", type: "化合反应", description: "碳在氧气不足时燃烧生成一氧化碳" },
  { name: "二氧化碳溶于水", equation: "CO₂ + H₂O → H₂CO₃", type: "化合反应", description: "二氧化碳溶于水生成碳酸" },
  { name: "高温煅烧石灰石", equation: "CaCO₃ → CaO + CO₂↑", type: "分解反应", description: "高温条件下碳酸钙分解为氧化钙和二氧化碳" },
  { name: "电解水", equation: "2H₂O → 2H₂↑ + O₂↑", type: "分解反应", description: "通直流电使水分解为氢气和氧气" },
  { name: "过氧化氢分解", equation: "2H₂O₂ → 2H₂O + O₂↑", type: "分解反应", description: "二氧化锰催化下过氧化氢分解" },
  { name: "铁与硫酸铜", equation: "Fe + CuSO₄ → FeSO₄ + Cu", type: "置换反应", description: "铁置换硫酸铜中的铜" },
  { name: "锌与稀硫酸", equation: "Zn + H₂SO₄ → ZnSO₄ + H₂↑", type: "置换反应", description: "锌与稀硫酸反应生成氢气" },
  { name: "盐酸与氢氧化钠", equation: "HCl + NaOH → NaCl + H₂O", type: "复分解反应", description: "酸碱中和反应" },
  { name: "盐酸与碳酸钙", equation: "2HCl + CaCO₃ → CaCl₂ + H₂O + CO₂↑", type: "复分解反应", description: "实验室制取二氧化碳" },
  { name: "硫酸铜与氢氧化钠", equation: "CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄", type: "复分解反应", description: "生成蓝色氢氧化铜沉淀" },
  { name: "氯化钡与硫酸", equation: "BaCl₂ + H₂SO₄ → BaSO₄↓ + 2HCl", type: "复分解反应", description: "生成不溶于酸的白色沉淀" },
  { name: "硝酸银与盐酸", equation: "AgNO₃ + HCl → AgCl↓ + HNO₃", type: "复分解反应", description: "生成不溶于酸的白色沉淀" },
  { name: "甲烷燃烧", equation: "CH₄ + 2O₂ → CO₂ + 2H₂O", type: "燃烧反应", description: "甲烷在氧气中燃烧" },
  { name: "乙醇燃烧", equation: "C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O", type: "燃烧反应", description: "酒精燃烧生成二氧化碳和水" },
  { name: "一氧化碳还原氧化铁", equation: "3CO + Fe₂O₃ → 2Fe + 3CO₂", type: "氧化还原", description: "工业炼铁原理" },
  { name: "碳还原氧化铜", equation: "C + 2CuO → 2Cu + CO₂↑", type: "氧化还原", description: "碳在高温下还原氧化铜" },
  { name: "氢气还原氧化铜", equation: "H₂ + CuO → Cu + H₂O", type: "氧化还原", description: "氢气还原氧化铜" },
  { name: "生石灰遇水", equation: "CaO + H₂O → Ca(OH)₂", type: "化合反应", description: "生石灰变成熟石灰，放出大量热" },
];

export default function ChemistryFormulaSheetPage() {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("全部");

  const types = useMemo(() => ["全部", ...Array.from(new Set(FORMULAS.map((f) => f.type)))], []);
  const filtered = useMemo(() => {
    let r = FORMULAS;
    if (typeFilter !== "全部") r = r.filter((f) => f.type === typeFilter);
    if (query.trim()) r = r.filter((f) => f.name.includes(query) || f.equation.includes(query) || f.description.includes(query));
    return r;
  }, [query, typeFilter]);

  return (
    <ToolLayout title="化学方程式" description="常用化学反应方程式速查" icon={FlaskConical} category="教育学习" slug="chemistry-formula-sheet">
      <div className="p-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索反应名称、方程式或描述..." className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors" />
        </div>
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((f, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{f.name}</h4>
                <span className="text-xs px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded">{f.type}</span>
              </div>
              <div className="text-lg font-mono text-emerald-400 mb-2">{f.equation}</div>
              <p className="text-sm text-slate-400">{f.description}</p>
            </div>
          ))}
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
