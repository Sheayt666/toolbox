"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Home, TrendingUp, Calendar, Info } from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 等额本息月供
function monthlyPaymentEqual(P: number, r: number, n: number) {
  if (r === 0) return P / n;
  return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function AdvancedMortgageCalcPage() {
  const [price, setPrice] = useState(2000000);
  const [downPct, setDownPct] = useState(30);
  const [rate, setRate] = useState(4.1);
  const [years, setYears] = useState(30);
  const [prepayMonth, setPrepayMonth] = useState(60);
  const [prepayAmount, setPrepayAmount] = useState(200000);
  const [prepayMode, setPrepayMode] = useState<"reduceTerm" | "reducePayment">("reduceTerm");

  const result = useMemo(() => {
    const downPayment = (price * downPct) / 100;
    const loan = price - downPayment;
    const r = rate / 100 / 12;
    const n = years * 12;

    const monthly = monthlyPaymentEqual(loan, r, n);
    const totalPayment = monthly * n;
    const totalInterest = totalPayment - loan;

    // 提前还款计算
    let schedule: { month: number; balance: number; interest: number; principal: number }[] = [];
    let balance = loan;
    let totalInt = 0;
    let prepayInfo: { newTerm?: number; newPayment?: number; savedInterest?: number; originalTerm: number } | null = null;

    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      let principal = monthly - interest;
      balance -= principal;
      totalInt += interest;
      if (i <= 12 || i % 12 === 0) {
        schedule.push({ month: i, balance: Math.max(0, balance), interest, principal });
      }
      if (i === prepayMonth) {
        const balanceBefore = balance + principal;
        const balanceAfter = Math.max(0, balanceBefore - prepayAmount);
        const remainingBalance = balanceAfter;
        if (prepayMode === "reduceTerm") {
          // 保持月供不变，缩短年限
          const newMonthly = monthly;
          let b = remainingBalance;
          let extraMonths = 0;
          let extraInt = 0;
          while (b > 0 && extraMonths < n) {
            const int = b * r;
            let p = newMonthly - int;
            if (p >= b) p = b;
            b -= p;
            extraInt += int;
            extraMonths++;
          }
          const newTerm = i + extraMonths;
          const savedInterest = totalInterest - (totalInt + extraInt);
          prepayInfo = { newTerm, savedInterest, originalTerm: n };
        } else {
          // 保持年限不变，减少月供
          const remainingMonths = n - i;
          const newPayment = monthlyPaymentEqual(remainingBalance, r, remainingMonths);
          let b = remainingBalance;
          let extraInt = 0;
          for (let j = 0; j < remainingMonths; j++) {
            const int = b * r;
            const p = newPayment - int;
            b -= p;
            extraInt += int;
          }
          const savedInterest = totalInterest - (totalInt + extraInt);
          prepayInfo = { newPayment, savedInterest, originalTerm: n };
        }
      }
    }

    return {
      downPayment,
      loan,
      monthly,
      totalPayment,
      totalInterest,
      schedule,
      prepayInfo,
    };
  }, [price, downPct, rate, years, prepayMonth, prepayAmount, prepayMode]);

  return (
    <ToolLayout
      title="房贷计算器进阶"
      description="等额本息等额本金对比，支持提前还款计算分析"
      toolId="advanced-mortgage-calc"
      icon={Home}
      category="金融理财"
      slug="advanced-mortgage-calc"
    >
      <div className="p-5 sm:p-6 space-y-6 text-slate-200">
        {/* 输入 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">房屋总价 (元)</label>
            <input type="number" value={price} onChange={(e) => setPrice(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">首付比例 (%)</label>
            <input type="number" value={downPct} onChange={(e) => setDownPct(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">贷款利率 (%)</label>
            <input type="number" step="0.01" value={rate} onChange={(e) => setRate(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">贷款年限 (年)</label>
            <input type="number" value={years} onChange={(e) => setYears(+e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
          </div>
        </div>

        {/* 提前还款 */}
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">提前还款分析</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">提前还款月份</label>
              <input type="number" value={prepayMonth} onChange={(e) => setPrepayMonth(+e.target.value)}
                className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">提前还款金额 (元)</label>
              <input type="number" value={prepayAmount} onChange={(e) => setPrepayAmount(+e.target.value)}
                className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">还款方式</label>
              <select value={prepayMode} onChange={(e) => setPrepayMode(e.target.value as "reduceTerm" | "reducePayment")}
                className="w-full bg-[#0d0d0f] border border-[#3f3f46] text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary-500">
                <option value="reduceTerm">缩短年限（月供不变）</option>
                <option value="reducePayment">减少月供（年限不变）</option>
              </select>
            </div>
          </div>
        </div>

        {/* 结果 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">首付金额</div>
            <div className="text-xl font-bold text-white">{fmt(result.downPayment)}</div>
          </div>
          <div className="bg-gradient-to-br from-primary-500/10 to-transparent rounded-xl border border-primary-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">贷款总额</div>
            <div className="text-xl font-bold text-white">{fmt(result.loan)}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">每月还款</div>
            <div className="text-xl font-bold text-emerald-400">{fmt(result.monthly)}</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-transparent rounded-xl border border-orange-500/20 p-4">
            <div className="text-xs text-slate-400 mb-1">总利息</div>
            <div className="text-xl font-bold text-orange-400">{fmt(result.totalInterest)}</div>
          </div>
        </div>

        {result.prepayInfo && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-emerald-400">提前还款后结果</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {result.prepayInfo.newTerm !== undefined && (
                <div>
                  <div className="text-slate-400 mb-1">新还款期限</div>
                  <div className="text-lg font-bold text-white">{Math.floor(result.prepayInfo.newTerm / 12)}年{result.prepayInfo.newTerm % 12}月</div>
                  <div className="text-xs text-slate-500">原期限 {Math.floor(result.prepayInfo.originalTerm / 12)}年</div>
                </div>
              )}
              {result.prepayInfo.newPayment !== undefined && (
                <div>
                  <div className="text-slate-400 mb-1">新月供</div>
                  <div className="text-lg font-bold text-white">{fmt(result.prepayInfo.newPayment)}</div>
                </div>
              )}
              <div>
                <div className="text-slate-400 mb-1">节省利息</div>
                <div className="text-lg font-bold text-emerald-400">{fmt(result.prepayInfo.savedInterest || 0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* 还款计划表 */}
        <div className="bg-[#27272a] rounded-xl border border-[#3f3f46] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#3f3f46] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-400" />
            <h3 className="text-sm font-semibold text-white">还款计划摘要</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0d0d0f] text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">期数</th>
                  <th className="px-4 py-2 text-right">月供本金</th>
                  <th className="px-4 py-2 text-right">月供利息</th>
                  <th className="px-4 py-2 text-right">剩余本金</th>
                </tr>
              </thead>
              <tbody>
                {result.schedule.slice(0, 15).map((s) => (
                  <tr key={s.month} className="border-t border-[#3f3f46]">
                    <td className="px-4 py-2 text-slate-300">第{s.month}期</td>
                    <td className="px-4 py-2 text-right text-slate-300">{fmt(s.principal)}</td>
                    <td className="px-4 py-2 text-right text-orange-400">{fmt(s.interest)}</td>
                    <td className="px-4 py-2 text-right text-slate-300">{fmt(s.balance)}</td>
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
