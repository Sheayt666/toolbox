"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Divide, Plus, Minus, X, Equal, Copy, Check, Info } from "lucide-react";

interface Fraction {
  numerator: number;
  denominator: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

function simplify(f: Fraction): Fraction {
  const g = gcd(f.numerator, f.denominator);
  let num = f.numerator / g;
  let den = f.denominator / g;
  if (den < 0) {
    num = -num;
    den = -den;
  }
  return { numerator: num, denominator: den };
}

function addFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({
    numerator: a.numerator * b.denominator + b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function subtractFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({
    numerator: a.numerator * b.denominator - b.numerator * a.denominator,
    denominator: a.denominator * b.denominator,
  });
}

function multiplyFractions(a: Fraction, b: Fraction): Fraction {
  return simplify({
    numerator: a.numerator * b.numerator,
    denominator: a.denominator * b.denominator,
  });
}

function divideFractions(a: Fraction, b: Fraction): Fraction {
  if (b.numerator === 0) return { numerator: 0, denominator: 1 };
  return simplify({
    numerator: a.numerator * b.denominator,
    denominator: a.denominator * b.numerator,
  });
}

function toDecimal(f: Fraction): number {
  return f.numerator / f.denominator;
}

function FractionDisplay({ numerator, denominator, size = "md" }: { numerator: number; denominator: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const isNegative = numerator < 0;
  const absNum = Math.abs(numerator);

  return (
    <div className={`inline-flex flex-col items-center ${sizeClasses[size]} font-semibold text-zinc-900 dark:text-zinc-100`}>
      {isNegative && <span className="text-sm">−</span>}
      <span>{absNum}</span>
      <div className="w-full h-0.5 bg-zinc-900 dark:bg-zinc-100 my-1" />
      <span>{denominator}</span>
    </div>
  );
}

type Operation = "add" | "subtract" | "multiply" | "divide";

export default function FractionCalculatorPage() {
  const [num1, setNum1] = useState("1");
  const [den1, setDen1] = useState("2");
  const [num2, setNum2] = useState("1");
  const [den2, setDen2] = useState("3");
  const [operation, setOperation] = useState<Operation>("add");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const n1 = parseInt(num1) || 0;
    const d1 = parseInt(den1) || 1;
    const n2 = parseInt(num2) || 0;
    const d2 = parseInt(den2) || 1;

    if (d1 === 0 || d2 === 0) return null;

    const f1: Fraction = { numerator: n1, denominator: d1 };
    const f2: Fraction = { numerator: n2, denominator: d2 };

    let resultFraction: Fraction;
    switch (operation) {
      case "add":
        resultFraction = addFractions(f1, f2);
        break;
      case "subtract":
        resultFraction = subtractFractions(f1, f2);
        break;
      case "multiply":
        resultFraction = multiplyFractions(f1, f2);
        break;
      case "divide":
        resultFraction = divideFractions(f1, f2);
        break;
    }

    return {
      fraction: resultFraction,
      decimal: toDecimal(resultFraction),
      simplified1: simplify(f1),
      simplified2: simplify(f2),
    };
  }, [num1, den1, num2, den2, operation]);

  const handleCopy = async () => {
    if (result) {
      const text = `${result.fraction.numerator}/${result.fraction.denominator}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const operations: { value: Operation; label: string; icon: React.ReactNode }[] = [
    { value: "add", label: "加法", icon: <Plus className="w-5 h-5" /> },
    { value: "subtract", label: "减法", icon: <Minus className="w-5 h-5" /> },
    { value: "multiply", label: "乘法", icon: <X className="w-5 h-5" /> },
    { value: "divide", label: "除法", icon: <Divide className="w-5 h-5" /> },
  ];

  const FractionInput = ({
    numValue,
    denValue,
    onNumChange,
    onDenChange,
    label,
  }: {
    numValue: string;
    denValue: string;
    onNumChange: (v: string) => void;
    onDenChange: (v: string) => void;
    label: string;
  }) => (
    <div className="flex flex-col items-center">
      <span className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{label}</span>
      <div className="flex flex-col items-center">
        <input
          type="number"
          value={numValue}
          onChange={(e) => onNumChange(e.target.value)}
          className="w-20 px-3 py-2 text-center text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
        />
        <div className="w-20 h-0.5 bg-zinc-900 dark:bg-zinc-100 my-1" />
        <input
          type="number"
          value={denValue}
          onChange={(e) => onDenChange(e.target.value)}
          className="w-20 px-3 py-2 text-center text-xl font-semibold bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500"
        />
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="分数计算器"
      description="支持分数的加减乘除运算，自动约分，显示最简分数和小数结果"
      toolId="fraction-calculator"
      icon={Divide}
      category="计算工具"
      slug="fraction-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Divide className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                分数计算器
              </h2>
            </div>
          </div>

          <div className="p-6">
            {/* 运算选择 */}
            <div className="flex justify-center gap-2 mb-8">
              {operations.map((op) => (
                <button
                  key={op.value}
                  onClick={() => setOperation(op.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    operation === op.value
                      ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {op.icon}
                  <span className="text-sm">{op.label}</span>
                </button>
              ))}
            </div>

            {/* 分数输入 */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <FractionInput
                numValue={num1}
                denValue={den1}
                onNumChange={setNum1}
                onDenChange={setDen1}
                label="分数 A"
              />

              <div className="text-3xl text-pink-500 font-bold">
                {operation === "add" && "+"}
                {operation === "subtract" && "−"}
                {operation === "multiply" && "×"}
                {operation === "divide" && "÷"}
              </div>

              <FractionInput
                numValue={num2}
                denValue={den2}
                onNumChange={setNum2}
                onDenChange={setDen2}
                label="分数 B"
              />

              <div className="text-3xl text-pink-500 font-bold">
                <Equal className="w-8 h-8 inline" />
              </div>

              {/* 结果 */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">结果</span>
                {result && (
                  <div className="relative">
                    <FractionDisplay
                      numerator={result.fraction.numerator}
                      denominator={result.fraction.denominator}
                      size="lg"
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="复制分数"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 小数结果 */}
            {result && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl">
                  <span className="text-sm text-pink-600 dark:text-pink-400">小数形式</span>
                  <span className="text-2xl font-bold text-pink-700 dark:text-pink-300">
                    {result.decimal.toFixed(8).replace(/\.?0+$/, "")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 计算过程 */}
        {result && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                计算过程
              </h3>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="text-center">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">约分后</div>
                  <FractionDisplay
                    numerator={result.simplified1.numerator}
                    denominator={result.simplified1.denominator}
                    size="sm"
                  />
                </div>

                <div className="text-2xl text-pink-500 font-bold">
                  {operation === "add" && "+"}
                  {operation === "subtract" && "−"}
                  {operation === "multiply" && "×"}
                  {operation === "divide" && "÷"}
                </div>

                <div className="text-center">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">约分后</div>
                  <FractionDisplay
                    numerator={result.simplified2.numerator}
                    denominator={result.simplified2.denominator}
                    size="sm"
                  />
                </div>

                <div className="text-2xl text-pink-500 font-bold">=</div>

                <div className="text-center">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">最简分数</div>
                  <FractionDisplay
                    numerator={result.fraction.numerator}
                    denominator={result.fraction.denominator}
                    size="sm"
                  />
                </div>
              </div>

              {/* 步骤说明 */}
              <div className="mt-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                  {operation === "add" && (
                    <>
                      <p>• 通分：找到两个分母的最小公倍数作为新分母</p>
                      <p>• 分子相加：分子 = 分子₁ × 分母₂ + 分子₂ × 分母₁</p>
                      <p>• 约分：将结果约分为最简分数</p>
                    </>
                  )}
                  {operation === "subtract" && (
                    <>
                      <p>• 通分：找到两个分母的最小公倍数作为新分母</p>
                      <p>• 分子相减：分子 = 分子₁ × 分母₂ - 分子₂ × 分母₁</p>
                      <p>• 约分：将结果约分为最简分数</p>
                    </>
                  )}
                  {operation === "multiply" && (
                    <>
                      <p>• 分子相乘：新分子 = 分子₁ × 分子₂</p>
                      <p>• 分母相乘：新分母 = 分母₁ × 分母₂</p>
                      <p>• 约分：将结果约分为最简分数</p>
                    </>
                  )}
                  {operation === "divide" && (
                    <>
                      <p>• 颠倒相乘：除以一个分数等于乘以它的倒数</p>
                      <p>• 分子相乘：新分子 = 分子₁ × 分母₂</p>
                      <p>• 分母相乘：新分母 = 分母₁ × 分子₂</p>
                      <p>• 约分：将结果约分为最简分数</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 常用分数参考 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常用分数与小数对照表
            </h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { num: 1, den: 2 },
              { num: 1, den: 3 },
              { num: 1, den: 4 },
              { num: 1, den: 5 },
              { num: 1, den: 8 },
              { num: 2, den: 3 },
              { num: 3, den: 4 },
              { num: 2, den: 5 },
              { num: 3, den: 5 },
              { num: 3, den: 8 },
              { num: 5, den: 8 },
              { num: 7, den: 8 },
            ].map((f, i) => (
              <div
                key={i}
                className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                onClick={() => {
                  setNum1(f.num.toString());
                  setDen1(f.den.toString());
                }}
              >
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {f.num}/{f.den}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  = {(f.num / f.den).toFixed(4).replace(/\.?0+$/, "")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
