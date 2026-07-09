"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Info, Copy, Check, Plus, Trash2 } from "lucide-react";

function gcd(a: number, b: number): number {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function gcdMultiple(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((acc, num) => gcd(acc, num));
}

function lcmMultiple(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.some((n) => n === 0)) return 0;
  return numbers.reduce((acc, num) => lcm(acc, num));
}

function primeFactors(n: number): { prime: number; exponent: number }[] {
  n = Math.abs(Math.floor(n));
  const factors: { prime: number; exponent: number }[] = [];
  if (n === 0 || n === 1) return factors;

  let count = 0;
  while (n % 2 === 0) {
    count++;
    n = Math.floor(n / 2);
  }
  if (count > 0) factors.push({ prime: 2, exponent: count });

  for (let i = 3; i * i <= n; i += 2) {
    count = 0;
    while (n % i === 0) {
      count++;
      n = Math.floor(n / i);
    }
    if (count > 0) factors.push({ prime: i, exponent: count });
  }

  if (n > 2) factors.push({ prime: n, exponent: 1 });

  return factors;
}

function formatFactors(factors: { prime: number; exponent: number }[]): string {
  if (factors.length === 0) return "—";
  return factors
    .map((f) => (f.exponent === 1 ? f.prime.toString() : `${f.prime}^${f.exponent}`))
    .join(" × ");
}

export default function GcdLcmCalculatorPage() {
  const [numbers, setNumbers] = useState<string[]>(["12", "18", "24"]);
  const [copied, setCopied] = useState<"gcd" | "lcm" | null>(null);

  const parsedNumbers = useMemo(() => {
    return numbers
      .map((n) => parseInt(n))
      .filter((n) => !isNaN(n) && n > 0 && isFinite(n));
  }, [numbers]);

  const result = useMemo(() => {
    if (parsedNumbers.length < 2) return null;

    const gcdResult = gcdMultiple(parsedNumbers);
    const lcmResult = lcmMultiple(parsedNumbers);

    const factorizations = parsedNumbers.map((n) => ({
      number: n,
      factors: primeFactors(n),
    }));

    // GCD的质因数分解（取各质因数的最小指数）
    const allPrimes = new Set<number>();
    factorizations.forEach((f) => {
      f.factors.forEach((factor) => allPrimes.add(factor.prime));
    });

    const gcdFactors: { prime: number; exponent: number }[] = [];
    const lcmFactors: { prime: number; exponent: number }[] = [];

    allPrimes.forEach((prime) => {
      const exponents = factorizations.map((f) => {
        const factor = f.factors.find((p) => p.prime === prime);
        return factor ? factor.exponent : 0;
      });
      const minExp = Math.min(...exponents);
      const maxExp = Math.max(...exponents);
      if (minExp > 0) gcdFactors.push({ prime, exponent: minExp });
      if (maxExp > 0) lcmFactors.push({ prime, exponent: maxExp });
    });

    gcdFactors.sort((a, b) => a.prime - b.prime);
    lcmFactors.sort((a, b) => a.prime - b.prime);

    return {
      gcd: gcdResult,
      lcm: lcmResult,
      factorizations,
      gcdFactors,
      lcmFactors,
    };
  }, [parsedNumbers]);

  const addNumber = () => {
    if (numbers.length < 10) {
      setNumbers([...numbers, ""]);
    }
  };

  const removeNumber = (index: number) => {
    if (numbers.length > 2) {
      setNumbers(numbers.filter((_, i) => i !== index));
    }
  };

  const updateNumber = (index: number, value: string) => {
    const newNumbers = [...numbers];
    newNumbers[index] = value;
    setNumbers(newNumbers);
  };

  const handleCopy = async (type: "gcd" | "lcm", value: number) => {
    await navigator.clipboard.writeText(value.toString());
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="最大公约数/最小公倍数计算器"
      description="支持多位数的最大公约数(GCD)和最小公倍数(LCM)计算，展示质因数分解过程"
      toolId="gcd-lcm-calculator"
      icon={Hash}
      category="计算工具"
      slug="gcd-lcm-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                输入数字（2-10个）
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {numbers.map((num, index) => (
                <div key={index} className="relative">
                  <input
                    type="number"
                    value={num}
                    onChange={(e) => updateNumber(index, e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-lg font-medium text-zinc-900 dark:text-zinc-100 text-center focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500"
                    placeholder={`数${index + 1}`}
                  />
                  {numbers.length > 2 && (
                    <button
                      onClick={() => removeNumber(index)}
                      className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {numbers.length < 10 && (
                <button
                  onClick={addNumber}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500 dark:text-zinc-400 hover:border-sky-400 hover:text-sky-500 dark:hover:border-sky-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">添加</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 结果 */}
        {result && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GCD */}
              <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-sm text-white/80 mb-2">最大公约数 (GCD)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{result.gcd}</span>
                  <button
                    onClick={() => handleCopy("gcd", result.gcd)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {copied === "gcd" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5 text-white/60" />
                    )}
                  </button>
                </div>
                <div className="mt-3 text-sm text-white/70">
                  质因数: {formatFactors(result.gcdFactors)}
                </div>
              </div>

              {/* LCM */}
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="text-sm text-white/80 mb-2">最小公倍数 (LCM)</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{result.lcm}</span>
                  <button
                    onClick={() => handleCopy("lcm", result.lcm)}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    {copied === "lcm" ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5 text-white/60" />
                    )}
                  </button>
                </div>
                <div className="mt-3 text-sm text-white/70">
                  质因数: {formatFactors(result.lcmFactors)}
                </div>
              </div>
            </div>

            {/* 质因数分解 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  质因数分解过程
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {result.factorizations.map((f, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl"
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-sky-100 dark:bg-sky-900/30 rounded-xl">
                        <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                          {f.number}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                          质因数分解
                        </div>
                        <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                          {formatFactors(f.factors)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 计算说明 */}
                <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-sky-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">GCD</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        最大公约数计算方法
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        取所有数字共有的质因数，每个质因数取出现的最小次数，然后相乘。
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">LCM</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        最小公倍数计算方法
                      </div>
                      <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                        取所有数字出现过的质因数，每个质因数取出现的最大次数，然后相乘。
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 应用场景 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  应用场景
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl border border-sky-200 dark:border-sky-800">
                  <div className="font-medium text-sky-700 dark:text-sky-300 mb-1">最大公约数的应用</div>
                  <ul className="text-sm text-sky-600 dark:text-sky-400 space-y-1">
                    <li>• 分数约分（化简为最简分数）</li>
                    <li>• 物品分组（最多分几组）</li>
                    <li>• 工程问题（最大边长）</li>
                    <li>• 算法中的模运算</li>
                  </ul>
                </div>
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                  <div className="font-medium text-violet-700 dark:text-violet-300 mb-1">最小公倍数的应用</div>
                  <ul className="text-sm text-violet-600 dark:text-violet-400 space-y-1">
                    <li>• 分数通分（找公分母）</li>
                    <li>• 周期问题（多久相遇一次）</li>
                    <li>• 工程问题（最短时间）</li>
                    <li>• 调度算法</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {parsedNumbers.length < 2 && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            请输入至少2个正整数
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
