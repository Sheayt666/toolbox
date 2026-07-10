"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Briefcase } from "lucide-react";

interface Asset {
  name: string;
  amount: number;
  expectedReturn: number;
}

const DEFAULT_ASSETS: Asset[] = [
  { name: "股票", amount: 100000, expectedReturn: 12 },
  { name: "债券", amount: 80000, expectedReturn: 5 },
  { name: "基金", amount: 60000, expectedReturn: 8 },
  { name: "现金", amount: 30000, expectedReturn: 2 },
];

export default function InvestmentPortfolioPage() {
  const [assets, setAssets] = useState<Asset[]>(DEFAULT_ASSETS);

  const updateAsset = (i: number, field: keyof Asset, value: number | string) => {
    setAssets((prev) => prev.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  };

  const result = useMemo(() => {
    const total = assets.reduce((s, a) => s + a.amount, 0);
    const weightedReturn = total > 0 ? assets.reduce((s, a) => s + (a.amount / total) * a.expectedReturn, 0) : 0;

    // 简化风险评分（股票类高风险权重）
    const highRiskPct = total > 0 ? assets.filter(a => a.expectedReturn >= 10).reduce((s, a) => s + a.amount, 0) / total * 100 : 0;
    const riskLevel = highRiskPct > 60 ? "高风险" : highRiskPct > 30 ? "中风险" : "低风险";
    const riskColor = highRiskPct > 60 ? "text-rose-400" : highRiskPct > 30 ? "text-amber-400" : "text-emerald-400";

    return { total, weightedReturn, highRiskPct, riskLevel, riskColor, allocations: assets.map(a => ({ ...a, pct: total > 0 ? (a.amount / total) * 100 : 0 })) };
  }, [assets]);

  const colors = ["from-rose-500 to-red-500", "from-sky-500 to-blue-500", "from-emerald-500 to-green-500", "from-amber-500 to-orange-500", "from-purple-500 to-violet-500"];

  return (
    <ToolLayout title="投资组合分析" description="分析投资组合的资产配置比例和风险分散度" toolId="investment-portfolio" icon={Briefcase} category="金融理财" slug="investment-portfolio">
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        <div className="space-y-3">
          {assets.map((a, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-3">
              <input type="text" value={a.name} onChange={(e) => updateAsset(i, "name", e.target.value)} placeholder="资产名称" className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
              <input type="number" value={a.amount} onChange={(e) => updateAsset(i, "amount", +e.target.value)} placeholder="金额" className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
              <input type="number" step="0.1" value={a.expectedReturn} onChange={(e) => updateAsset(i, "expectedReturn", +e.target.value)} placeholder="预期收益率%" className="bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">总资产</div>
            <div className="text-xl font-bold text-white">{result.total.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">加权收益率</div>
            <div className="text-xl font-bold text-emerald-400">{result.weightedReturn.toFixed(2)}%</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">高风险资产占比</div>
            <div className="text-xl font-bold text-orange-400">{result.highRiskPct.toFixed(1)}%</div>
          </div>
          <div className="bg-gradient-to-br from-sky-500/10 to-transparent rounded-xl border border-sky-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">风险等级</div>
            <div className={`text-xl font-bold ${result.riskColor}`}>{result.riskLevel}</div>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-5">
          <h3 className="text-sm font-semibold text-white mb-4">资产配置比例</h3>
          <div className="space-y-3">
            {result.allocations.map((a, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{a.name} ({a.expectedReturn}%)</span>
                  <span className="text-slate-400">{a.amount.toLocaleString()} ({a.pct.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-[#0d0d0f] rounded-full h-3 overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${colors[i % colors.length]} rounded-full`} style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
