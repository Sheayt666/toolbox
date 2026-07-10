"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Receipt } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TAX_BRACKETS = [
  { level: 1, max: 36000, rate: 0.03, deduction: 0, label: "不超过36,000元" },
  { level: 2, max: 144000, rate: 0.1, deduction: 2520, label: "36,000-144,000元" },
  { level: 3, max: 300000, rate: 0.2, deduction: 16920, label: "144,000-300,000元" },
  { level: 4, max: 420000, rate: 0.25, deduction: 31920, label: "300,000-420,000元" },
  { level: 5, max: 660000, rate: 0.3, deduction: 52920, label: "420,000-660,000元" },
  { level: 6, max: 960000, rate: 0.35, deduction: 85920, label: "660,000-960,000元" },
  { level: 7, max: Infinity, rate: 0.45, deduction: 181920, label: "超过960,000元" },
];

export default function TaxBracketCalcPage() {
  const [income, setIncome] = useState(200000);

  const result = useMemo(() => {
    let tax = 0;
    let currentBracket = TAX_BRACKETS[0];
    for (const b of TAX_BRACKETS) {
      if (income <= b.max) { tax = Math.max(0, income * b.rate - b.deduction); currentBracket = b; break; }
    }
    const afterTax = income - tax;
    const effectiveRate = income > 0 ? (tax / income) * 100 : 0;
    return { tax, afterTax, effectiveRate, currentBracket };
  }, [income]);

  return (
    <ToolLayout title="个税税率表" description="个人所得税税率表速查，计算各档位税额" toolId="tax-bracket-calc" icon={Receipt} category="金融理财" slug="tax-bracket-calc">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">应纳税所得额 (元/年)</label>
          <input type="number" value={income} onChange={(e) => setIncome(+e.target.value)} className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4"><div className="text-xs text-slate-400 mb-1">应缴税额</div><div className="text-xl font-bold text-orange-400">{fmt(result.tax)}</div></div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4"><div className="text-xs text-slate-400 mb-1">税后收入</div><div className="text-xl font-bold text-emerald-400">{fmt(result.afterTax)}</div></div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4"><div className="text-xs text-slate-400 mb-1">实际税率</div><div className="text-xl font-bold text-primary-400">{result.effectiveRate.toFixed(2)}%</div></div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46]"><h3 className="text-sm font-semibold text-white">个人所得税税率表（综合所得）</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0d0d0f] text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">级数</th>
                  <th className="px-4 py-2 text-left">全年应纳税所得额</th>
                  <th className="px-4 py-2 text-right">税率</th>
                  <th className="px-4 py-2 text-right">速算扣除数</th>
                </tr>
              </thead>
              <tbody>
                {TAX_BRACKETS.map((b) => (
                  <tr key={b.level} className={`border-t border-[#3f3f46] ${result.currentBracket.level === b.level ? "bg-primary-500/10" : ""}`}>
                    <td className="px-4 py-2 text-slate-300">{b.level}</td>
                    <td className="px-4 py-2 text-slate-300">{b.label}</td>
                    <td className="px-4 py-2 text-right text-white font-medium">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="px-4 py-2 text-right text-slate-300">{b.deduction.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
