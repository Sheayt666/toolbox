"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shield, Heart, AlertTriangle, Info } from "lucide-react";

export default function SafePeriodCalculatorPage() {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycle, setCycle] = useState(28);
  const [periodDays, setPeriodDays] = useState(5);

  const calculate = () => {
    if (!lastPeriod) return null;

    const lastDate = new Date(lastPeriod);
    // 排卵日 = 下次月经前14天
    const nextPeriod = new Date(lastDate);
    nextPeriod.setDate(nextPeriod.getDate() + cycle);

    const ovulationDay = new Date(nextPeriod);
    ovulationDay.setDate(ovulationDay.getDate() - 14);

    // 易孕期：排卵日前5天到后4天
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(fertileStart.getDate() - 5);

    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(fertileEnd.getDate() + 4);

    // 安全期
    // 经前安全期：月经结束后到易孕期前
    const periodEnd = new Date(lastDate);
    periodEnd.setDate(periodEnd.getDate() + periodDays - 1);

    const safeAfterPeriodEnd = new Date(periodEnd);
    safeAfterPeriodEnd.setDate(safeAfterPeriodEnd.getDate() + 1);

    const safeBeforeFertile = new Date(fertileStart);
    safeBeforeFertile.setDate(safeBeforeFertile.getDate() - 1);

    // 经后安全期：易孕期后到下次月经前
    const safeAfterFertile = new Date(fertileEnd);
    safeAfterFertile.setDate(safeAfterFertile.getDate() + 1);

    const safeBeforeNextPeriod = new Date(nextPeriod);
    safeBeforeNextPeriod.setDate(safeBeforeNextPeriod.getDate() - 1);

    const formatDate = (d: Date) => d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });

    return {
      nextPeriod: formatDate(nextPeriod),
      ovulationDay: formatDate(ovulationDay),
      fertilePeriod: `${formatDate(fertileStart)} - ${formatDate(fertileEnd)}`,
      safeBefore: `${formatDate(safeAfterPeriodEnd)} - ${formatDate(safeBeforeFertile)}`,
      safeAfter: `${formatDate(safeAfterFertile)} - ${formatDate(safeBeforeNextPeriod)}`,
      periodEnd: formatDate(periodEnd),
    };
  };

  const result = calculate();

  return (
    <ToolLayout
      title="安全期计算器"
      description="女性安全期计算工具，根据月经周期计算排卵期和安全期，仅供参考"
      toolId="safe-period-calculator"
      icon={Shield}
      category="生活工具"
      slug="safe-period-calculator"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-semibold">基本信息</h2>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">末次月经日期</label>
            <input
              type="date"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-teal-500 font-mono text-lg"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">月经周期：{cycle} 天</label>
            <input
              type="range"
              min="21"
              max="35"
              step="1"
              value={cycle}
              onChange={(e) => setCycle(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zinc-400">经期持续：{periodDays} 天</label>
            <input
              type="range"
              min="3"
              max="10"
              step="1"
              value={periodDays}
              onChange={(e) => setPeriodDays(parseInt(e.target.value))}
              className="w-full accent-teal-500"
            />
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            {/* 排卵期 */}
            <div className="bg-gradient-to-br from-red-500/10 to-rose-500/10 rounded-xl border border-red-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-red-400" />
                <h3 className="font-semibold">危险期（易孕期）</h3>
              </div>
              <div className="text-2xl font-bold text-red-400 mb-1">{result.fertilePeriod}</div>
              <div className="text-sm text-zinc-500">排卵日：{result.ovulationDay}</div>
            </div>

            {/* 安全期 */}
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-xl border border-teal-500/20 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold">安全期</h3>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-zinc-500">经后安全期</div>
                  <div className="text-xl font-bold text-teal-400">{result.safeBefore}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-500">经前安全期</div>
                  <div className="text-xl font-bold text-teal-400">{result.safeAfter}</div>
                </div>
              </div>
            </div>

            {/* 下次月经 */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">下次月经预计</span>
                <span className="text-lg font-bold text-zinc-300">{result.nextPeriod}</span>
              </div>
            </div>

            {/* 警告 */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-300/80">
                安全期计算仅作参考，受情绪、环境、健康等因素影响，排卵可能提前或推迟。
                不建议将安全期作为可靠的避孕方式。
              </p>
            </div>
          </div>
        )}

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-teal-400" />
            <h3 className="text-base font-semibold">计算原理</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed">
            女性的排卵日期一般在下次月经来潮前的14天左右。从下次月经来潮的第1天算起，
            倒数14天或减去14天就是排卵日，排卵日及其前5天和后4天加在一起称为排卵期（易孕期）。
            除了月经期和排卵期，其余时间均为安全期。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
