"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Droplets, Heart, Info } from "lucide-react";

export default function BloodTypeCalculatorPage() {
  const [fatherType, setFatherType] = useState("A");
  const [motherType, setMotherType] = useState("O");

  const bloodTypes = ["A", "B", "AB", "O"];

  const getPossibleGenotypes = (bloodType: string): string[] => {
    switch (bloodType) {
      case "A": return ["AA", "AO"];
      case "B": return ["BB", "BO"];
      case "AB": return ["AB"];
      case "O": return ["OO"];
      default: return [];
    }
  };

  const getPhenotype = (genotype: string): string => {
    const sorted = genotype.split("").sort().join("");
    if (sorted === "AA" || sorted === "AO") return "A";
    if (sorted === "BB" || sorted === "BO") return "B";
    if (sorted === "AB") return "AB";
    return "O";
  };

  const calculate = () => {
    const fatherGenos = getPossibleGenotypes(fatherType);
    const motherGenos = getPossibleGenotypes(motherType);

    const results: Record<string, number> = {};
    let total = 0;

    for (const fg of fatherGenos) {
      for (const mg of motherGenos) {
        const f1 = fg[0], f2 = fg[1];
        const m1 = mg[0], m2 = mg[1];
        const combos = [f1 + m1, f1 + m2, f2 + m1, f2 + m2];
        for (const combo of combos) {
          const pheno = getPhenotype(combo);
          results[pheno] = (results[pheno] || 0) + 1;
          total++;
        }
      }
    }

    return Object.entries(results)
      .map(([type, count]) => ({
        type,
        percent: ((count / total) * 100).toFixed(1),
        count,
      }))
      .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));
  };

  const results = calculate();

  const getBloodColor = (type: string) => {
    switch (type) {
      case "A": return "text-red-400";
      case "B": return "text-blue-400";
      case "AB": return "text-purple-400";
      case "O": return "text-emerald-400";
      default: return "text-zinc-400";
    }
  };

  const getBloodBg = (type: string) => {
    switch (type) {
      case "A": return "bg-red-500/10 border-red-500/20";
      case "B": return "bg-blue-500/10 border-blue-500/20";
      case "AB": return "bg-purple-500/10 border-purple-500/20";
      case "O": return "bg-emerald-500/10 border-emerald-500/20";
      default: return "bg-zinc-800 border-zinc-700";
    }
  };

  return (
    <ToolLayout
      title="血型遗传计算器"
      description="根据父母血型计算子女可能的血型及概率，ABO血型遗传规律查询"
      toolId="blood-type-calculator"
      icon={Droplets}
      category="生活工具"
      slug="blood-type-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Droplets className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-semibold">父母血型</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-zinc-400 text-center">父亲血型</div>
              <div className="grid grid-cols-2 gap-2">
                {bloodTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFatherType(type)}
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${
                      fatherType === type
                        ? `${getBloodBg(type)} ${getBloodColor(type)} border-2`
                        : "bg-zinc-900/50 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    {type}型
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-zinc-400 text-center">母亲血型</div>
              <div className="grid grid-cols-2 gap-2">
                {bloodTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => setMotherType(type)}
                    className={`py-3 rounded-lg font-bold text-lg transition-all ${
                      motherType === type
                        ? `${getBloodBg(type)} ${getBloodColor(type)} border-2`
                        : "bg-zinc-900/50 text-zinc-500 border border-zinc-700 hover:border-zinc-600"
                    }`}
                  >
                    {type}型
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 结果 */}
        <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl border border-red-500/20 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-red-400" />
            <h2 className="text-base font-semibold">子女可能血型</h2>
          </div>

          <div className="space-y-3">
            {results.map((r) => (
              <div key={r.type} className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl ${getBloodBg(r.type)} flex items-center justify-center`}>
                  <span className={`text-xl font-bold ${getBloodColor(r.type)}`}>{r.type}型</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-zinc-300">概率</span>
                    <span className={`text-sm font-bold ${getBloodColor(r.type)}`}>{r.percent}%</span>
                  </div>
                  <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        r.type === "A" ? "bg-gradient-to-r from-red-500 to-rose-500" :
                        r.type === "B" ? "bg-gradient-to-r from-blue-500 to-cyan-500" :
                        r.type === "AB" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
                        "bg-gradient-to-r from-emerald-500 to-teal-500"
                      }`}
                      style={{ width: `${r.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-red-400" />
            <h3 className="text-base font-semibold">血型遗传规律</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            ABO血型由IA、IB、i三种等位基因控制。A型血基因型为IAIA或IAi，
            B型为IBIB或IBi，AB型为IAIB，O型为ii。子女从父母各继承一个等位基因。
            本工具基于孟德尔遗传定律计算概率，仅供参考。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
