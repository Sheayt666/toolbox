"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Home,
  DollarSign,
  Percent,
  Calendar,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface MortgageResult {
  monthlyPayment: number;
  firstMonthPayment: number;
  lastMonthPayment: number;
  totalPayment: number;
  totalInterest: number;
  totalPrincipal: number;
  schedule: {
    month: number;
    payment: number;
    principal: number;
    interest: number;
    remainingPrincipal: number;
  }[];
}

function calculateEqualPayment(
  principal: number,
  annualRate: number,
  months: number
): MortgageResult {
  const monthlyRate = annualRate / 100 / 12;
  let monthlyPayment: number;

  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  const schedule: MortgageResult["schedule"] = [];
  let remainingPrincipal = principal;

  for (let i = 1; i <= months; i++) {
    const interest = remainingPrincipal * monthlyRate;
    const principalPart = monthlyPayment - interest;
    remainingPrincipal -= principalPart;

    schedule.push({
      month: i,
      payment: monthlyPayment,
      principal: principalPart,
      interest: interest,
      remainingPrincipal: Math.max(0, remainingPrincipal),
    });
  }

  return {
    monthlyPayment,
    firstMonthPayment: monthlyPayment,
    lastMonthPayment: monthlyPayment,
    totalPayment,
    totalInterest,
    totalPrincipal: principal,
    schedule,
  };
}

function calculateEqualPrincipal(
  principal: number,
  annualRate: number,
  months: number
): MortgageResult {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPrincipal = principal / months;

  const schedule: MortgageResult["schedule"] = [];
  let remainingPrincipal = principal;
  let totalPayment = 0;
  let totalInterest = 0;

  for (let i = 1; i <= months; i++) {
    const interest = remainingPrincipal * monthlyRate;
    const payment = monthlyPrincipal + interest;
    remainingPrincipal -= monthlyPrincipal;
    totalPayment += payment;
    totalInterest += interest;

    schedule.push({
      month: i,
      payment,
      principal: monthlyPrincipal,
      interest,
      remainingPrincipal: Math.max(0, remainingPrincipal),
    });
  }

  return {
    monthlyPayment: schedule[0]?.payment || 0,
    firstMonthPayment: schedule[0]?.payment || 0,
    lastMonthPayment: schedule[schedule.length - 1]?.payment || 0,
    totalPayment,
    totalInterest,
    totalPrincipal: principal,
    schedule,
  };
}

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MortgageCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(100);
  const [loanYears, setLoanYears] = useState(30);
  const [interestRate, setInterestRate] = useState(3.1);
  const [repaymentType, setRepaymentType] = useState<"equal-payment" | "equal-principal">(
    "equal-payment"
  );
  const [showSchedule, setShowSchedule] = useState(false);

  const result = useMemo(() => {
    const principal = loanAmount * 10000;
    const months = loanYears * 12;

    if (principal <= 0 || months <= 0 || interestRate < 0) {
      return null;
    }

    if (repaymentType === "equal-payment") {
      return calculateEqualPayment(principal, interestRate, months);
    } else {
      return calculateEqualPrincipal(principal, interestRate, months);
    }
  }, [loanAmount, loanYears, interestRate, repaymentType]);

  const commonLoanAmounts = [50, 100, 150, 200, 300, 500];
  const commonLoanYears = [5, 10, 15, 20, 25, 30];

  return (
    <ToolLayout
      title="房贷计算器"
      description="支持等额本息、等额本金两种还款方式，精确计算月供、总利息和还款总额，助您轻松规划购房贷款"
      toolId="mortgage-calculator"
      icon={Home}
      category="计算工具"
      slug="mortgage-calculator"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                贷款信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 贷款金额 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-rose-500" />
                  贷款金额
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                  {loanAmount} 万元
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={1000}
                step={1}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>10万</span>
                <span>1000万</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-4">
                {commonLoanAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setLoanAmount(amount)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      loanAmount === amount
                        ? "bg-rose-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                    }`}
                  >
                    {amount}万
                  </button>
                ))}
              </div>
            </div>

            {/* 贷款年限 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Calendar className="w-4 h-4 text-rose-500" />
                  贷款年限
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                  {loanYears} 年（{loanYears * 12}期）
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                step={1}
                value={loanYears}
                onChange={(e) => setLoanYears(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1年</span>
                <span>30年</span>
              </div>
              <div className="grid grid-cols-6 gap-2 mt-4">
                {commonLoanYears.map((year) => (
                  <button
                    key={year}
                    onClick={() => setLoanYears(year)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      loanYears === year
                        ? "bg-rose-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                    }`}
                  >
                    {year}年
                  </button>
                ))}
              </div>
            </div>

            {/* 年利率 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-rose-500" />
                  年利率
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                  {interestRate} %
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.01}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>1%</span>
                <span>10%</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[2.85, 3.1, 3.55, 4.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setInterestRate(rate)}
                    className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      interestRate === rate
                        ? "bg-rose-500 text-white"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* 还款方式 */}
            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                还款方式
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRepaymentType("equal-payment")}
                  className={`flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                    repaymentType === "equal-payment"
                      ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                  }`}
                >
                  <div className="text-left">
                    <div
                      className={`text-sm font-medium ${
                        repaymentType === "equal-payment"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      等额本息
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      每月还款金额相同
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setRepaymentType("equal-principal")}
                  className={`flex items-center justify-between px-4 py-4 rounded-xl border transition-all ${
                    repaymentType === "equal-principal"
                      ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700"
                      : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                  }`}
                >
                  <div className="text-left">
                    <div
                      className={`text-sm font-medium ${
                        repaymentType === "equal-principal"
                          ? "text-rose-700 dark:text-rose-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      等额本金
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      每月本金相同，利息递减
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        {result && (
          <>
            <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/25">
              <div className="flex items-center gap-2 mb-6">
                <PiggyBank className="w-5 h-5" />
                <h2 className="text-base font-semibold">计算结果</h2>
              </div>

              <div className="text-center mb-6">
                <div className="text-sm text-rose-100 mb-1">
                  {repaymentType === "equal-payment" ? "每月还款" : "首月还款"}
                </div>
                <div className="text-4xl font-bold">
                  ¥ {formatCurrency(result.monthlyPayment)}
                </div>
                {repaymentType === "equal-principal" && (
                  <div className="text-sm text-rose-100 mt-1">
                    末月还款: ¥ {formatCurrency(result.lastMonthPayment)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-rose-100 mb-1">贷款总额</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(result.totalPrincipal / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-rose-100 mb-1">支付利息</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(result.totalInterest / 10000)}万
                  </div>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-xl">
                  <div className="text-xs text-rose-100 mb-1">还款总额</div>
                  <div className="text-lg font-semibold">
                    {formatCurrency(result.totalPayment / 10000)}万
                  </div>
                </div>
              </div>
            </div>

            {/* 还款明细 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full p-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    还款明细
                  </h2>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    共{result.schedule.length}期
                  </span>
                </div>
                {showSchedule ? (
                  <ChevronUp className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                )}
              </button>

              {showSchedule && (
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">
                          期数
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                          月供
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                          本金
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                          利息
                        </th>
                        <th className="px-4 py-3 text-right font-medium text-zinc-600 dark:text-zinc-400">
                          剩余本金
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {result.schedule.map((item) => (
                        <tr
                          key={item.month}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
                        >
                          <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">
                            第{item.month}期
                          </td>
                          <td className="px-4 py-2.5 text-right text-zinc-900 dark:text-white font-mono">
                            {formatCurrency(item.payment)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                            {formatCurrency(item.principal)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-rose-600 dark:text-rose-400 font-mono">
                            {formatCurrency(item.interest)}
                          </td>
                          <td className="px-4 py-2.5 text-right text-zinc-600 dark:text-zinc-400 font-mono">
                            {formatCurrency(item.remainingPrincipal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              房贷计算器是一款专业的购房贷款计算工具，支持等额本息和等额本金两种主流还款方式。
              只需输入贷款金额、贷款年限和年利率，即可快速计算出每月还款金额、总利息和还款总额，
              帮助您在购房前做好财务规划。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <TrendingDown className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    等额本息
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    每月还款额固定，前期利息占比高，适合收入稳定的人群。
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <TrendingUp className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">
                    等额本金
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    每月本金固定，月供递减，总利息更少，适合前期还款能力强的人群。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                等额本息和等额本金哪个更划算？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                等额本金总利息更少，但前期还款压力大；等额本息每月还款固定，便于规划。
                如果资金充裕且计划提前还款，等额本金更划算；如果追求还款稳定，选择等额本息。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                房贷利率是固定的吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                目前大多数房贷采用LPR浮动利率，每年会根据最新LPR调整一次。
                具体利率政策请咨询您的贷款银行，本计算器仅作为参考。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                提前还款可以节省多少利息？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                提前还款可以减少剩余本金，从而减少后续利息支出。
                具体节省金额取决于提前还款的时间和金额，越早提前还款节省的利息越多。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
