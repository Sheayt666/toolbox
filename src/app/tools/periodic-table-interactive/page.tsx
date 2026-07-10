"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Atom, X } from "lucide-react";

interface Element {
  num: number;
  symbol: string;
  name: string;
  mass: string;
  category: string;
  period: number;
  group: number;
  electronConfig: string;
}

const ELEMENTS: Element[] = [
  { num: 1, symbol: "H", name: "氢", mass: "1.008", category: "非金属", period: 1, group: 1, electronConfig: "1s1" },
  { num: 2, symbol: "He", name: "氦", mass: "4.003", category: "稀有气体", period: 1, group: 18, electronConfig: "1s2" },
  { num: 3, symbol: "Li", name: "锂", mass: "6.941", category: "碱金属", period: 2, group: 1, electronConfig: "[He]2s1" },
  { num: 4, symbol: "Be", name: "铍", mass: "9.012", category: "碱土金属", period: 2, group: 2, electronConfig: "[He]2s2" },
  { num: 5, symbol: "B", name: "硼", mass: "10.811", category: "类金属", period: 2, group: 13, electronConfig: "[He]2s2 2p1" },
  { num: 6, symbol: "C", name: "碳", mass: "12.011", category: "非金属", period: 2, group: 14, electronConfig: "[He]2s2 2p2" },
  { num: 7, symbol: "N", name: "氮", mass: "14.007", category: "非金属", period: 2, group: 15, electronConfig: "[He]2s2 2p3" },
  { num: 8, symbol: "O", name: "氧", mass: "15.999", category: "非金属", period: 2, group: 16, electronConfig: "[He]2s2 2p4" },
  { num: 9, symbol: "F", name: "氟", mass: "18.998", category: "卤素", period: 2, group: 17, electronConfig: "[He]2s2 2p5" },
  { num: 10, symbol: "Ne", name: "氖", mass: "20.180", category: "稀有气体", period: 2, group: 18, electronConfig: "[He]2s2 2p6" },
  { num: 11, symbol: "Na", name: "钠", mass: "22.990", category: "碱金属", period: 3, group: 1, electronConfig: "[Ne]3s1" },
  { num: 12, symbol: "Mg", name: "镁", mass: "24.305", category: "碱土金属", period: 3, group: 2, electronConfig: "[Ne]3s2" },
  { num: 13, symbol: "Al", name: "铝", mass: "26.982", category: "后过渡金属", period: 3, group: 13, electronConfig: "[Ne]3s2 3p1" },
  { num: 14, symbol: "Si", name: "硅", mass: "28.086", category: "类金属", period: 3, group: 14, electronConfig: "[Ne]3s2 3p2" },
  { num: 15, symbol: "P", name: "磷", mass: "30.974", category: "非金属", period: 3, group: 15, electronConfig: "[Ne]3s2 3p3" },
  { num: 16, symbol: "S", name: "硫", mass: "32.065", category: "非金属", period: 3, group: 16, electronConfig: "[Ne]3s2 3p4" },
  { num: 17, symbol: "Cl", name: "氯", mass: "35.453", category: "卤素", period: 3, group: 17, electronConfig: "[Ne]3s2 3p5" },
  { num: 18, symbol: "Ar", name: "氩", mass: "39.948", category: "稀有气体", period: 3, group: 18, electronConfig: "[Ne]3s2 3p6" },
  { num: 19, symbol: "K", name: "钾", mass: "39.098", category: "碱金属", period: 4, group: 1, electronConfig: "[Ar]4s1" },
  { num: 20, symbol: "Ca", name: "钙", mass: "40.078", category: "碱土金属", period: 4, group: 2, electronConfig: "[Ar]4s2" },
  { num: 26, symbol: "Fe", name: "铁", mass: "55.845", category: "过渡金属", period: 4, group: 8, electronConfig: "[Ar]3d6 4s2" },
  { num: 29, symbol: "Cu", name: "铜", mass: "63.546", category: "过渡金属", period: 4, group: 11, electronConfig: "[Ar]3d10 4s1" },
  { num: 30, symbol: "Zn", name: "锌", mass: "65.38", category: "过渡金属", period: 4, group: 12, electronConfig: "[Ar]3d10 4s2" },
  { num: 35, symbol: "Br", name: "溴", mass: "79.904", category: "卤素", period: 4, group: 17, electronConfig: "[Ar]3d10 4s2 4p5" },
  { num: 47, symbol: "Ag", name: "银", mass: "107.868", category: "过渡金属", period: 5, group: 11, electronConfig: "[Kr]4d10 5s1" },
  { num: 53, symbol: "I", name: "碘", mass: "126.904", category: "卤素", period: 5, group: 17, electronConfig: "[Kr]4d10 5s2 5p5" },
  { num: 79, symbol: "Au", name: "金", mass: "196.967", category: "过渡金属", period: 6, group: 11, electronConfig: "[Xe]4f14 5d10 6s1" },
  { num: 80, symbol: "Hg", name: "汞", mass: "200.59", category: "过渡金属", period: 6, group: 12, electronConfig: "[Xe]4f14 5d10 6s2" },
  { num: 82, symbol: "Pb", name: "铅", mass: "207.2", category: "后过渡金属", period: 6, group: 14, electronConfig: "[Xe]4f14 5d10 6s2 6p2" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "非金属": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "稀有气体": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "碱金属": "bg-red-500/20 text-red-400 border-red-500/30",
  "碱土金属": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "类金属": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "卤素": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "过渡金属": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "后过渡金属": "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function PeriodicTableInteractivePage() {
  const [selected, setSelected] = useState<Element | null>(null);

  return (
    <ToolLayout title="元素周期表" description="交互式化学元素周期表" icon={Atom} category="教育学习" slug="periodic-table-interactive">
      <div className="p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className={`px-2 py-1 rounded text-xs border ${color}`}>{cat}</span>
          ))}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 lg:grid-cols-10 gap-1.5 mb-6">
          {ELEMENTS.map((el) => (
            <button
              key={el.num}
              onClick={() => setSelected(el)}
              className={`aspect-square p-1 rounded-lg border transition-all hover:scale-110 ${CATEGORY_COLORS[el.category] || "bg-slate-500/20 text-slate-400 border-slate-500/30"}`}
            >
              <div className="text-xs text-slate-400">{el.num}</div>
              <div className="text-xl font-bold">{el.symbol}</div>
              <div className="text-xs truncate">{el.name}</div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <div className="bg-[#09090b] border border-[#27272a] rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-xl border ${CATEGORY_COLORS[selected.category]}`}>
                  <div className="text-xs">{selected.num}</div>
                  <div className="text-4xl font-bold">{selected.symbol}</div>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{selected.name}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">原子序数</span><span className="text-slate-300">{selected.num}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">相对原子质量</span><span className="text-slate-300">{selected.mass}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">分类</span><span className="text-slate-300">{selected.category}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">周期</span><span className="text-slate-300">第{selected.period}周期</span></div>
                <div className="flex justify-between"><span className="text-slate-500">族</span><span className="text-slate-300">第{selected.group}族</span></div>
                <div className="flex justify-between"><span className="text-slate-500">电子排布</span><span className="text-slate-300 font-mono text-xs">{selected.electronConfig}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
