"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Droplets } from "lucide-react";

const BLOOD_TYPES = ["A", "B", "AB", "O"];

const COMPATIBILITY: Record<string, { canDonateTo: string[]; canReceiveFrom: string[] }> = {
  "A": { canDonateTo: ["A", "AB"], canReceiveFrom: ["A", "O"] },
  "B": { canDonateTo: ["B", "AB"], canReceiveFrom: ["B", "O"] },
  "AB": { canDonateTo: ["AB"], canReceiveFrom: ["A", "B", "AB", "O"] },
  "O": { canDonateTo: ["A", "B", "AB", "O"], canReceiveFrom: ["O"] },
};

const PERSONALITY: Record<string, string> = {
  "A": "严谨认真、细心负责、追求完美，但有时容易焦虑和过于谨慎。适合需要精确和耐心的工作。",
  "B": "自由奔放、富有创意、乐观开朗，具有强烈的好奇心，但有时显得不够稳重。",
  "AB": "理性冷静、思维敏捷、具有双重性格，既有A型的细致又有B型的灵活，是天生的协调者。",
  "O": "热情大方、领导力强、有正义感，善于社交，但有时过于自信和强势。",
};

const GENETICS: Record<string, string[]> = {
  "A+A": ["A", "O"], "A+B": ["A", "B", "AB", "O"], "A+AB": ["A", "B", "AB"], "A+O": ["A", "O"],
  "B+B": ["B", "O"], "B+AB": ["A", "B", "AB"], "B+O": ["B", "O"],
  "AB+AB": ["A", "B", "AB"], "AB+O": ["A", "B"],
  "O+O": ["O"],
};

export default function BloodTypeInfoPage() {
  const [selected, setSelected] = useState("A");
  const [father, setFather] = useState("A");
  const [mother, setMother] = useState("B");

  const compat = COMPATIBILITY[selected];
  const geneticsKey = [father, mother].sort().join("+");
  const childTypes = GENETICS[geneticsKey] || [];

  return (
    <ToolLayout title="血型信息查询" description="查询血型配对、遗传规律和性格特点分析" icon={Droplets} category="查询工具" slug="blood-type-info">
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">选择血型查看详情</h3>
          <div className="flex gap-3 flex-wrap">
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                onClick={() => setSelected(bt)}
                className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                  selected === bt
                    ? "bg-red-500/20 text-red-400 border-2 border-red-500/40"
                    : "bg-[#09090b] text-slate-400 border-2 border-[#27272a] hover:border-[#3f3f46]"
                }`}
              >
                {bt}型
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
            <h4 className="text-sm font-medium text-slate-400 mb-3">可以输血给</h4>
            <div className="flex gap-2 flex-wrap">
              {compat.canDonateTo.map((t) => (
                <span key={t} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-lg font-mono font-bold">{t}型</span>
              ))}
            </div>
          </div>
          <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
            <h4 className="text-sm font-medium text-slate-400 mb-3">可以接受输血</h4>
            <div className="flex gap-2 flex-wrap">
              {compat.canReceiveFrom.map((t) => (
                <span key={t} className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg font-mono font-bold">{t}型</span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
          <h4 className="text-sm font-medium text-slate-400 mb-3">{selected}型血性格特点</h4>
          <p className="text-slate-300 leading-relaxed">{PERSONALITY[selected]}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">血型遗传查询</h3>
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">父亲血型:</span>
              <select value={father} onChange={(e) => setFather(e.target.value)} className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-white">
                {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}型</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">母亲血型:</span>
              <select value={mother} onChange={(e) => setMother(e.target.value)} className="bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-white">
                {BLOOD_TYPES.map((bt) => <option key={bt} value={bt}>{bt}型</option>)}
              </select>
            </div>
          </div>
          <div className="p-5 bg-[#09090b] border border-[#27272a] rounded-xl">
            <h4 className="text-sm font-medium text-slate-400 mb-3">子女可能的血型</h4>
            <div className="flex gap-2 flex-wrap">
              {childTypes.length > 0 ? childTypes.map((t) => (
                <span key={t} className="px-4 py-2 bg-primary-500/10 text-primary-400 rounded-lg font-mono font-bold">{t}型</span>
              )) : <span className="text-slate-500">数据不足</span>}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
