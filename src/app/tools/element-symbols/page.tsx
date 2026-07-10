"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Atom, Search } from "lucide-react";

interface Element {
  number: number;
  symbol: string;
  name: string;
  enName: string;
  atomicMass: string;
  category: string;
}

const ELEMENTS: Element[] = [
  { number: 1, symbol: "H", name: "氢", enName: "Hydrogen", atomicMass: "1.008", category: "非金属" },
  { number: 2, symbol: "He", name: "氦", enName: "Helium", atomicMass: "4.003", category: "稀有气体" },
  { number: 3, symbol: "Li", name: "锂", enName: "Lithium", atomicMass: "6.941", category: "碱金属" },
  { number: 4, symbol: "Be", name: "铍", enName: "Beryllium", atomicMass: "9.012", category: "碱土金属" },
  { number: 5, symbol: "B", name: "硼", enName: "Boron", atomicMass: "10.811", category: "类金属" },
  { number: 6, symbol: "C", name: "碳", enName: "Carbon", atomicMass: "12.011", category: "非金属" },
  { number: 7, symbol: "N", name: "氮", enName: "Nitrogen", atomicMass: "14.007", category: "非金属" },
  { number: 8, symbol: "O", name: "氧", enName: "Oxygen", atomicMass: "15.999", category: "非金属" },
  { number: 9, symbol: "F", name: "氟", enName: "Fluorine", atomicMass: "18.998", category: "卤素" },
  { number: 10, symbol: "Ne", name: "氖", enName: "Neon", atomicMass: "20.180", category: "稀有气体" },
  { number: 11, symbol: "Na", name: "钠", enName: "Sodium", atomicMass: "22.990", category: "碱金属" },
  { number: 12, symbol: "Mg", name: "镁", enName: "Magnesium", atomicMass: "24.305", category: "碱土金属" },
  { number: 13, symbol: "Al", name: "铝", enName: "Aluminum", atomicMass: "26.982", category: "后过渡金属" },
  { number: 14, symbol: "Si", name: "硅", enName: "Silicon", atomicMass: "28.086", category: "类金属" },
  { number: 15, symbol: "P", name: "磷", enName: "Phosphorus", atomicMass: "30.974", category: "非金属" },
  { number: 16, symbol: "S", name: "硫", enName: "Sulfur", atomicMass: "32.065", category: "非金属" },
  { number: 17, symbol: "Cl", name: "氯", enName: "Chlorine", atomicMass: "35.453", category: "卤素" },
  { number: 18, symbol: "Ar", name: "氩", enName: "Argon", atomicMass: "39.948", category: "稀有气体" },
  { number: 19, symbol: "K", name: "钾", enName: "Potassium", atomicMass: "39.098", category: "碱金属" },
  { number: 20, symbol: "Ca", name: "钙", enName: "Calcium", atomicMass: "40.078", category: "碱土金属" },
  { number: 26, symbol: "Fe", name: "铁", enName: "Iron", atomicMass: "55.845", category: "过渡金属" },
  { number: 29, symbol: "Cu", name: "铜", enName: "Copper", atomicMass: "63.546", category: "过渡金属" },
  { number: 30, symbol: "Zn", name: "锌", enName: "Zinc", atomicMass: "65.38", category: "过渡金属" },
  { number: 47, symbol: "Ag", name: "银", enName: "Silver", atomicMass: "107.868", category: "过渡金属" },
  { number: 79, symbol: "Au", name: "金", enName: "Gold", atomicMass: "196.967", category: "过渡金属" },
  { number: 80, symbol: "Hg", name: "汞", enName: "Mercury", atomicMass: "200.59", category: "过渡金属" },
  { number: 82, symbol: "Pb", name: "铅", enName: "Lead", atomicMass: "207.2", category: "后过渡金属" },
  { number: 92, symbol: "U", name: "铀", enName: "Uranium", atomicMass: "238.029", category: "锕系元素" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "非金属": "text-emerald-400 bg-emerald-500/10",
  "稀有气体": "text-purple-400 bg-purple-500/10",
  "碱金属": "text-red-400 bg-red-500/10",
  "碱土金属": "text-orange-400 bg-orange-500/10",
  "类金属": "text-blue-400 bg-blue-500/10",
  "卤素": "text-yellow-400 bg-yellow-500/10",
  "过渡金属": "text-cyan-400 bg-cyan-500/10",
  "后过渡金属": "text-gray-400 bg-gray-500/10",
  "锕系元素": "text-pink-400 bg-pink-500/10",
};

export default function ElementSymbolsPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return ELEMENTS;
    const q = query.toLowerCase();
    return ELEMENTS.filter(
      (e) => e.symbol.toLowerCase().includes(q) || e.name.includes(query) || e.enName.toLowerCase().includes(q) || String(e.number).includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="元素符号查询" description="查询化学元素符号、原子序数、原子量等信息" icon={Atom} category="查询工具" slug="element-symbols">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索元素符号、名称或原子序数..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 种元素</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((el) => (
            <div key={el.number} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors text-center">
              <div className="text-xs text-slate-500 mb-1">{el.number}</div>
              <div className="text-3xl font-bold text-primary-400 mb-1">{el.symbol}</div>
              <div className="text-sm text-white">{el.name}</div>
              <div className="text-xs text-slate-500 mt-1">{el.atomicMass}</div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${CATEGORY_COLORS[el.category] || "text-slate-400 bg-slate-500/10"}`}>{el.category}</span>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配元素</div>
        )}
      </div>
    </ToolLayout>
  );
}
