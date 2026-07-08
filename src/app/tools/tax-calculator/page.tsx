"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Wallet,
  DollarSign,
  Percent,
  Info,
  Briefcase,
  Home,
  GraduationCap,
  Heart,
  Baby,
  Stethoscope,
} from "lucide-react";

// 2026年个税税率表（综合所得）
const TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 },
];

// 年终奖税率表
const BONUS_TAX_BRACKETS = [
  { min: 0, max: 3000, rate: 0.03, deduction: 0 },
  { min: 3000, max: 12000, rate: 0.1, deduction: 210 },
  { min: 12000, max: 25000, rate: 0.2, deduction: 1410 },
  { min: 25000, max: 35000, rate: 0.25, deduction: 2660 },
  { min: 35000, max: 55000, rate: 0.3, deduction: 4410 },
  { min: 55000, max: 80000, rate: 0.35, deduction: 7160 },
  { min: 80000, max: Infinity, rate: 0.45, deduction: 15160 },
];

interface SpecialDeductions {
  childrenEducation: number;
  continuingEducation: number;
  housingLoan: number;
  housingRent: number;
  elderlySupport: number;
  infantCare: number;
  seriousIllness: number;
}

interface TaxResult {
  monthlySalary: number;
  annualSalary: number;
  monthlyTax: number[];
  annualTax: number;
  monthlyAfterTax: number[];
  annualAfterTax: number;
  monthlyTaxableIncome: number;
  annualTaxableIncome: number;
  socialInsurance: number;
  specialDeductions: number;
  bonusTax?: number;
  bonusAfterTax?: number;
}

function calculateTax(taxableIncome: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      return Math.max(0, taxableIncome * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

function calculateBonusTax(bonus: number): number {
  if (bonus <= 0) return 0;
  const monthlyBonus = bonus / 12;
  for (const bracket of BONUS_TAX_BRACKETS) {
    if (monthlyBonus <= bracket.max) {
      return Math.max(0, bonus * bracket.rate - bracket.deduction);
    }
  }
  return 0;
}

function formatCurrency(num: number): string {
  return num.toLocaleString("zh-CN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function TaxCalculatorPage() {
  const [monthlySalary, setMonthlySalary] = useState(15000);
  const [socialInsurance, setSocialInsurance] = useState(2000);
  const [bonus, setBonus] = useState(30000);
  const [includeBonus, setIncludeBonus] = useState(true);
  const [specialDeductions, setSpecialDeductions] = useState<SpecialDeductions>({
    childrenEducation: 0,
    continuingEducation: 0,
    housingLoan: 1000,
    housingRent: 0,
    elderlySupport: 0,
    infantCare: 0,
    seriousIllness: 0,
  });

  const totalSpecialDeductions = useMemo(() => {
    return Object.values(specialDeductions).reduce((sum, val) => sum + val, 0);
  }, [specialDeductions]);

  const result = useMemo((): TaxResult => {
    const monthlyBasicDeduction = 5000;
    const monthlyTaxable =
      monthlySalary -
      socialInsurance -
      monthlyBasicDeduction -
      totalSpecialDeductions;
    const annualTaxable = Math.max(0, monthlyTaxable * 12);
    const annualTax = calculateTax(annualTaxable);
    const monthlyTax: number[] = [];
    const monthlyAfterTax: number[] = [];

    // 累计预扣法
    let cumulativeTax = 0;
    for (let i = 1; i <= 12; i++) {
      const cumulativeTaxable = Math.max(0, monthlyTaxable * i);
      const cumulativeTaxShould = calculateTax(cumulativeTaxable);
      const monthTax = Math.max(0, cumulativeTaxShould - cumulativeTax);
      cumulativeTax = cumulativeTaxShould;
      monthlyTax.push(monthTax);
      monthlyAfterTax.push(monthlySalary - socialInsurance - monthTax);
    }

    const bonusTax = includeBonus ? calculateBonusTax(bonus) : 0;

    return {
      monthlySalary,
      annualSalary: monthlySalary * 12 + (includeBonus ? bonus : 0),
      monthlyTax,
      annualTax,
      monthlyAfterTax,
      annualAfterTax:
        monthlySalary * 12 -
        socialInsurance * 12 -
        annualTax +
        (includeBonus ? bonus - bonusTax : 0),
      monthlyTaxableIncome: Math.max(0, monthlyTaxable),
      annualTaxableIncome: annualTaxable,
      socialInsurance,
      specialDeductions: totalSpecialDeductions,
      bonusTax: includeBonus ? bonusTax : undefined,
      bonusAfterTax: includeBonus ? bonus - bonusTax : undefined,
    };
  }, [monthlySalary, socialInsurance, bonus, includeBonus, totalSpecialDeductions]);

  const deductionItems = [
    {
      key: "childrenEducation" as const,
      label: "子女教育",
      icon: GraduationCap,
      amount: 2000,
      description: "每个子女每月2000元",
      color: "text-blue-500",
    },
    {
      key: "infantCare" as const,
      label: "3岁以下婴幼儿照护",
      icon: Baby,
      amount: 2000,
      description: "每个婴幼儿每月2000元",
      color: "text-pink-500",
    },
    {
      key: "continuingEducation" as const,
      label: "继续教育",
      icon: Briefcase,
      amount: 400,
      description: "学历教育每月400元",
      color: "text-purple-500",
    },
    {
      key: "housingLoan" as const,
      label: "住房贷款利息",
      icon: Home,
      amount: 1000,
      description: "首套房每月1000元",
      color: "text-rose-500",
    },
    {
      key: "housingRent" as const,
      label: "住房租金",
      icon: Home,
      amount: 1500,
      description: "根据城市800-1500元",
      color: "text-orange-500",
    },
    {
      key: "elderlySupport" as const,
      label: "赡养老人",
      icon: Heart,
      amount: 3000,
      description: "独生子女每月3000元",
      color: "text-emerald-500",
    },
    {
      key: "seriousIllness" as const,
      label: "大病医疗",
      icon: Stethoscope,
      amount: 0,
      description: "按实际支出扣除",
      color: "text-red-500",
    },
  ];

  return (
    <ToolLayout
      title="个税计算器"
      description="2026年最新个人所得税计算器，支持专项附加扣除、年终奖单独计税，精确计算税后工资"
      toolId="tax-calculator"
      icon={Wallet}
      category="计算工具"
      slug="tax-calculator"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 基本信息 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                基本信息
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 月工资 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  税前月工资
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  ¥ {formatCurrency(monthlySalary)}
                </span>
              </div>
              <input
                type="range"
                min={3000}
                max={100000}
                step={100}
                value={monthlySalary}
                onChange={(e) => setMonthlySalary(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                <span>3,000</span>
                <span>100,000</span>
              </div>
            </div>

            {/* 五险一金 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Percent className="w-4 h-4 text-emerald-500" />
                  五险一金（个人缴纳）
                </label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  ¥ {formatCurrency(socialInsurance)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={50}
                value={socialInsurance}
                onChange={(e) => setSocialInsurance(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* 年终奖 */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  <Wallet className="w-4 h-4 text-emerald-500" />
                  年终奖
                </label>
                <button
                  onClick={() => setIncludeBonus(!includeBonus)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    includeBonus ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      includeBonus ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
              {includeBonus && (
                <div className="space-y-2">
                  <input
                    type="range"
                    min={0}
                    max={500000}
                    step={1000}
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ¥ {formatCurrency(bonus)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 专项附加扣除 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  专项附加扣除
                </h2>
              </div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                每月合计: ¥{formatCurrency(totalSpecialDeductions)}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {deductionItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-700 flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {item.label}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setSpecialDeductions((prev) => ({
                            ...prev,
                            [item.key]: Math.max(0, prev[item.key] - item.amount),
                          }))
                        }
                        className="w-8 h-8 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-16 text-center text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                        ¥{specialDeductions[item.key]}
                      </span>
                      <button
                        onClick={() =>
                          setSpecialDeductions((prev) => ({
                            ...prev,
                            [item.key]: prev[item.key] + item.amount,
                          }))
                        }
                        className="w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 计算结果 */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Wallet className="w-5 h-5" />
            <h2 className="text-base font-semibold">计算结果</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-xs text-emerald-100 mb-1">税后年薪</div>
              <div className="text-xl font-bold">
                ¥{formatCurrency(result.annualAfterTax / 10000)}万
              </div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-xs text-emerald-100 mb-1">年缴个税</div>
              <div className="text-xl font-bold">
                ¥{formatCurrency(result.annualTax + (result.bonusTax || 0))}
              </div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-xs text-emerald-100 mb-1">月均税后</div>
              <div className="text-xl font-bold">
                ¥{formatCurrency(result.monthlyAfterTax[result.monthlyAfterTax.length - 1])}
              </div>
            </div>
            <div className="text-center p-4 bg-white/10 rounded-xl">
              <div className="text-xs text-emerald-100 mb-1">年终奖税后</div>
              <div className="text-xl font-bold">
                ¥{formatCurrency(result.bonusAfterTax || 0)}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white/10 rounded-xl">
            <div className="text-sm text-emerald-100 mb-3">收入构成</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>年工资收入</span>
                <span className="font-mono">¥{formatCurrency(monthlySalary * 12)}</span>
              </div>
              {includeBonus && (
                <div className="flex items-center justify-between text-sm">
                  <span>年终奖</span>
                  <span className="font-mono">¥{formatCurrency(bonus)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span>五险一金（年）</span>
                <span className="font-mono text-rose-200">
                  -¥{formatCurrency(socialInsurance * 12)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>个人所得税（年）</span>
                <span className="font-mono text-rose-200">
                  -¥{formatCurrency(result.annualTax + (result.bonusTax || 0))}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20 font-semibold">
                <span>实际到手</span>
                <span className="font-mono">¥{formatCurrency(result.annualAfterTax)}</span>
              </div>
            </div>
          </div>
        </div>

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
              个税计算器基于2026年最新个人所得税法，采用累计预扣法计算每月应缴个税，
              支持7项专项附加扣除，年终奖单独计税。输入税前工资、五险一金和专项扣除信息，
              即可快速得出税后收入和应缴税款，帮助您合理规划个人财务。
            </p>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <p className="text-emerald-700 dark:text-emerald-300 font-medium mb-2">
                个税计算公式
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                应纳税所得额 = 工资收入 - 5000元（起征点）- 五险一金 - 专项附加扣除
                <br />
                应纳税额 = 应纳税所得额 × 适用税率 - 速算扣除数
              </p>
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
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                个税起征点是多少？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                目前个人所得税起征点为每月5000元，即年收入6万元以下无需缴纳个税。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                年终奖如何计税？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                年终奖可以选择单独计税或并入综合所得计税。本计算器采用单独计税方式，
                将年终奖除以12个月后的金额对应税率表计算税额。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                专项附加扣除有哪些项目？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                共7项：子女教育、3岁以下婴幼儿照护、继续教育、住房贷款利息、
                住房租金、赡养老人、大病医疗。具体扣除标准根据个人实际情况确定。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
