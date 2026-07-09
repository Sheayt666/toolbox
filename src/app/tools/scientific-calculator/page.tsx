"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Calculator, Copy, Check, RotateCcw, Delete } from "lucide-react";

type AngleMode = "deg" | "rad";

export default function ScientificCalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([]);
  const [angleMode, setAngleMode] = useState<AngleMode>("deg");
  const [memory, setMemory] = useState(0);
  const [copied, setCopied] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const toDegrees = (rad: number) => (rad * 180) / Math.PI;

  const evaluateExpression = useCallback((expr: string): number => {
    // 处理角度模式
    let processed = expr;

    // 安全计算 - 使用Function构造函数
    try {
      // 替换数学函数
      processed = processed
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/π/g, `(${Math.PI})`)
        .replace(/e(?![x])/g, `(${Math.E})`);

      // 处理三角函数（根据角度模式）
      if (angleMode === "deg") {
        processed = processed
          .replace(/sin\(/g, `Math.sin((Math.PI/180)*`)
          .replace(/cos\(/g, `Math.cos((Math.PI/180)*`)
          .replace(/tan\(/g, `Math.tan((Math.PI/180)*`);
      } else {
        processed = processed
          .replace(/sin\(/g, "Math.sin(")
          .replace(/cos\(/g, "Math.cos(")
          .replace(/tan\(/g, "Math.tan(");
      }

      processed = processed
        .replace(/asin\(/g, `Math.asin(`)
        .replace(/acos\(/g, `Math.acos(`)
        .replace(/atan\(/g, `Math.atan(`)
        .replace(/log\(/g, "Math.log10(")
        .replace(/ln\(/g, "Math.log(")
        .replace(/sqrt\(/g, "Math.sqrt(")
        .replace(/exp\(/g, "Math.exp(")
        .replace(/abs\(/g, "Math.abs(")
        .replace(/\^/g, "**");

      // 将结果转回角度如果是反三角函数且角度模式为deg
      let result = Function(`"use strict"; return (${processed})`)();

      // 反三角函数结果转换（简单处理）
      if (angleMode === "deg") {
        if (expr.includes("asin(") || expr.includes("acos(") || expr.includes("atan(")) {
          result = (result * 180) / Math.PI;
        }
      }

      return result;
    } catch {
      return NaN;
    }
  }, [angleMode]);

  const handleInput = (value: string) => {
    if (lastResult !== null && /[0-9.]/.test(value)) {
      setDisplay(value === "." ? "0." : value);
      setExpression(value === "." ? "0." : value);
      setLastResult(null);
      return;
    }

    setLastResult(null);

    if (display === "0" && /[0-9]/.test(value)) {
      setDisplay(value);
      setExpression(value);
    } else if (value === "." && display.includes(".")) {
      // 避免重复小数点
      return;
    } else {
      setDisplay(display === "0" && value !== "." ? value : display + value);
      setExpression(expression === "0" && value !== "." ? value : expression + value);
    }
  };

  const handleOperator = (op: string) => {
    setLastResult(null);
    setDisplay(op);
    setExpression(expression + op);
  };

  const handleFunction = (func: string) => {
    setLastResult(null);
    setDisplay(func + "(");
    setExpression(expression + func + "(");
  };

  const handleClear = () => {
    setDisplay("0");
    setExpression("");
    setLastResult(null);
  };

  const handleBackspace = () => {
    if (lastResult !== null) {
      setDisplay("0");
      setExpression("");
      setLastResult(null);
      return;
    }
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
      setExpression(expression.slice(0, -1));
    } else {
      setDisplay("0");
      setExpression(expression.slice(0, -1));
    }
  };

  const handleEquals = () => {
    const result = evaluateExpression(expression);
    if (!isNaN(result) && isFinite(result)) {
      const resultStr = Number.isInteger(result)
        ? result.toString()
        : result.toPrecision(12).replace(/\.?0+$/, "");
      setHistory([{ expr: expression, result: resultStr }, ...history].slice(0, 10));
      setDisplay(resultStr);
      setExpression(resultStr);
      setLastResult(resultStr);
    } else {
      setDisplay("Error");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMemory = (action: "MC" | "MR" | "M+" | "M-") => {
    const current = parseFloat(display) || 0;
    switch (action) {
      case "MC":
        setMemory(0);
        break;
      case "MR":
        setDisplay(memory.toString());
        setExpression(expression + memory.toString());
        break;
      case "M+":
        setMemory(memory + current);
        break;
      case "M-":
        setMemory(memory - current);
        break;
    }
  };

  const handlePercent = () => {
    const current = parseFloat(display) || 0;
    const result = current / 100;
    setDisplay(result.toString());
    setExpression(expression.replace(/[\d.]+$/, result.toString()));
  };

  const handleSquare = () => {
    const current = parseFloat(display) || 0;
    const result = current * current;
    setDisplay(result.toString());
    setExpression(expression + "^2");
  };

  const handleSqrt = () => {
    const current = parseFloat(display) || 0;
    if (current >= 0) {
      const result = Math.sqrt(current);
      setDisplay(result.toString());
      setExpression("sqrt(" + current + ")");
    }
  };

  const handleReciprocal = () => {
    const current = parseFloat(display) || 0;
    if (current !== 0) {
      const result = 1 / current;
      setDisplay(result.toString());
      setExpression("1/(" + current + ")");
    }
  };

  const handlePi = () => {
    setDisplay("π");
    setExpression(expression + "π");
  };

  const handleFactorial = () => {
    const current = parseInt(display) || 0;
    if (current >= 0 && current <= 170) {
      let result = 1;
      for (let i = 2; i <= current; i++) result *= i;
      setDisplay(result.toString());
      setExpression(current + "!");
    }
  };

  const Button = ({
    children,
    onClick,
    className = "",
    span = 1,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    className?: string;
    span?: number;
  }) => (
    <button
      onClick={onClick}
      className={`h-14 rounded-xl font-medium text-lg transition-all active:scale-95 ${
        span === 2 ? "col-span-2" : ""
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <ToolLayout
      title="科学计算器"
      description="功能强大的在线科学计算器，支持三角函数、对数、指数、阶乘、开方等多种科学计算功能"
      toolId="scientific-calculator"
      icon={Calculator}
      category="计算工具"
      slug="scientific-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* 显示区域 */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                <span className="text-sm font-medium">科学计算器</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAngleMode(angleMode === "deg" ? "rad" : "deg")}
                  className="px-3 py-1 text-xs font-medium bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  {angleMode === "deg" ? "DEG" : "RAD"}
                </button>
                {memory !== 0 && (
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/80 rounded-lg">
                    M: {memory}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/60 h-6 truncate">
                {expression || " "}
              </div>
              <div className="text-4xl font-bold truncate flex items-center justify-end gap-2">
                <span>{display}</span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
                  title="复制结果"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Copy className="w-5 h-5 text-white/60" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 按钮区域 */}
          <div className="p-4">
            {/* 第一行 - 记忆功能和科学函数 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleMemory("MC")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">MC</Button>
              <Button onClick={() => handleMemory("MR")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">MR</Button>
              <Button onClick={() => handleMemory("M+")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">M+</Button>
              <Button onClick={() => handleMemory("M-")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">M-</Button>
              <Button onClick={handleBackspace} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">
                <Delete className="w-5 h-5 mx-auto" />
              </Button>
            </div>

            {/* 第二行 - 科学函数 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleFunction("sin")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">sin</Button>
              <Button onClick={() => handleFunction("cos")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">cos</Button>
              <Button onClick={() => handleFunction("tan")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">tan</Button>
              <Button onClick={() => handleFunction("log")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">log</Button>
              <Button onClick={() => handleFunction("ln")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">ln</Button>
            </div>

            {/* 第三行 - 更多科学函数 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleFunction("sqrt")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">√</Button>
              <Button onClick={handleSquare} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">x²</Button>
              <Button onClick={() => handleOperator("^")} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">x^y</Button>
              <Button onClick={handleFactorial} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">n!</Button>
              <Button onClick={handlePi} className="bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm">π</Button>
            </div>

            {/* 第四行 - 数字键盘顶行 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={handleClear} className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/50">
                <RotateCcw className="w-5 h-5 mx-auto" />
              </Button>
              <Button onClick={() => handleInput("(")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">(</Button>
              <Button onClick={() => handleInput(")")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">)</Button>
              <Button onClick={handlePercent} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700">%</Button>
              <Button onClick={() => handleOperator("÷")} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50">÷</Button>
            </div>

            {/* 第五行 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleInput("7")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">7</Button>
              <Button onClick={() => handleInput("8")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">8</Button>
              <Button onClick={() => handleInput("9")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">9</Button>
              <Button onClick={handleReciprocal} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">1/x</Button>
              <Button onClick={() => handleOperator("×")} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50">×</Button>
            </div>

            {/* 第六行 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleInput("4")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">4</Button>
              <Button onClick={() => handleInput("5")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">5</Button>
              <Button onClick={() => handleInput("6")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">6</Button>
              <Button onClick={() => handleFunction("abs")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">|x|</Button>
              <Button onClick={() => handleOperator("−")} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50">−</Button>
            </div>

            {/* 第七行 */}
            <div className="grid grid-cols-5 gap-2 mb-2">
              <Button onClick={() => handleInput("1")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">1</Button>
              <Button onClick={() => handleInput("2")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">2</Button>
              <Button onClick={() => handleInput("3")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">3</Button>
              <Button onClick={() => handleFunction("exp")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">e^x</Button>
              <Button onClick={() => handleOperator("+")} className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50">+</Button>
            </div>

            {/* 第八行 */}
            <div className="grid grid-cols-5 gap-2">
              <Button onClick={() => handleInput("0")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700" span={2}>0</Button>
              <Button onClick={() => handleInput(".")} className="bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700">.</Button>
              <Button onClick={() => handleInput("e")} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm">e</Button>
              <Button onClick={handleEquals} className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600">=</Button>
            </div>
          </div>
        </div>

        {/* 计算历史 */}
        {history.length > 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                计算历史
              </h3>
            </div>
            <div className="p-4 max-h-60 overflow-y-auto space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  onClick={() => {
                    setExpression(item.result);
                    setDisplay(item.result);
                  }}
                >
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">{item.expr}</div>
                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    = {item.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
