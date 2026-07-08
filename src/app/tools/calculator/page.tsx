"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Calculator, RotateCcw, Delete, Equal, Divide, X, Minus, Plus } from "lucide-react";

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const inputDigit = useCallback(
    (digit: string) => {
      if (waitingForOperand) {
        setDisplay(digit);
        setWaitingForOperand(false);
      } else {
        setDisplay(display === "0" ? digit : display + digit);
      }
    },
    [display, waitingForOperand]
  );

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearLastChar = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith("-"))) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const toggleSign = useCallback(() => {
    if (display === "0") return;
    setDisplay(display.startsWith("-") ? display.slice(1) : "-" + display);
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback(
    (nextOperation: string) => {
      const inputValue = parseFloat(display);

      if (previousValue === null) {
        setPreviousValue(display);
      } else if (operation) {
        const currentValue = parseFloat(previousValue);
        let result: number;

        switch (operation) {
          case "+":
            result = currentValue + inputValue;
            break;
          case "-":
            result = currentValue - inputValue;
            break;
          case "×":
            result = currentValue * inputValue;
            break;
          case "÷":
            result = inputValue !== 0 ? currentValue / inputValue : 0;
            break;
          default:
            result = inputValue;
        }

        const resultStr = String(parseFloat(result.toFixed(10)));
        setDisplay(resultStr);
        setPreviousValue(resultStr);
      }

      setWaitingForOperand(true);
      setOperation(nextOperation);
    },
    [display, previousValue, operation]
  );

  const calculate = useCallback(() => {
    if (!operation || previousValue === null) return;

    const inputValue = parseFloat(display);
    const currentValue = parseFloat(previousValue);
    let result: number;

    switch (operation) {
      case "+":
        result = currentValue + inputValue;
        break;
      case "-":
        result = currentValue - inputValue;
        break;
      case "×":
        result = currentValue * inputValue;
        break;
      case "÷":
        result = inputValue !== 0 ? currentValue / inputValue : 0;
        break;
      default:
        result = inputValue;
    }

    const resultStr = String(parseFloat(result.toFixed(10)));
    const expression = `${previousValue} ${operation} ${display} = ${resultStr}`;
    setHistory((prev) => [expression, ...prev].slice(0, 10));
    setDisplay(resultStr);
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operation]);

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        inputDigit(e.key);
      } else if (e.key === ".") {
        inputDecimal();
      } else if (e.key === "+") {
        performOperation("+");
      } else if (e.key === "-") {
        performOperation("-");
      } else if (e.key === "*") {
        performOperation("×");
      } else if (e.key === "/") {
        e.preventDefault();
        performOperation("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        calculate();
      } else if (e.key === "Escape") {
        clearAll();
      } else if (e.key === "Backspace") {
        clearLastChar();
      } else if (e.key === "%") {
        inputPercent();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputDigit, inputDecimal, performOperation, calculate, clearAll, clearLastChar, inputPercent]);

  const Button = ({
    onClick,
    className = "",
    children,
    colSpan = 1,
  }: {
    onClick: () => void;
    className?: string;
    children: React.ReactNode;
    colSpan?: number;
  }) => (
    <button
      onClick={onClick}
      className={`h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
        colSpan === 2 ? "col-span-2" : ""
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <ToolLayout
      title="科学计算器"
      description="功能强大的科学计算器，支持复杂运算、历史记录和键盘操作"
      icon={Calculator}
      category="实用工具"
      slug="calculator"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 计算器主区*/}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm">
            {/* 显示区*/}
            <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 mb-6">
              <div className="text-right text-slate-500 text-sm h-6 mb-2 font-mono">
                {previousValue && operation && `${previousValue} ${operation}`}
              </div>
              <div className="text-right text-white text-4xl sm:text-5xl font-light font-mono overflow-x-auto whitespace-nowrap">
                {display}
              </div>
            </div>

            {/* 按键 */}
            <div className="grid grid-cols-4 gap-3">
              <Button
                onClick={clearAll}
                className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
              >
                AC
              </Button>
              <Button
                onClick={clearLastChar}
                className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <Delete className="w-5 h-5 mx-auto" />
              </Button>
              <Button
                onClick={inputPercent}
                className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                %
              </Button>
              <Button
                onClick={() => performOperation("÷")}
                className={`${
                  operation === "÷"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                }`}
              >
                <Divide className="w-5 h-5 mx-auto" />
              </Button>

              <Button
                onClick={() => inputDigit("7")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                7
              </Button>
              <Button
                onClick={() => inputDigit("8")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                8
              </Button>
              <Button
                onClick={() => inputDigit("9")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                9
              </Button>
              <Button
                onClick={() => performOperation("×")}
                className={`${
                  operation === "×"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                }`}
              >
                <X className="w-5 h-5 mx-auto" />
              </Button>

              <Button
                onClick={() => inputDigit("4")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                4
              </Button>
              <Button
                onClick={() => inputDigit("5")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                5
              </Button>
              <Button
                onClick={() => inputDigit("6")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                6
              </Button>
              <Button
                onClick={() => performOperation("-")}
                className={`${
                  operation === "-"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                }`}
              >
                <Minus className="w-5 h-5 mx-auto" />
              </Button>

              <Button
                onClick={() => inputDigit("1")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                1
              </Button>
              <Button
                onClick={() => inputDigit("2")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                2
              </Button>
              <Button
                onClick={() => inputDigit("3")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                3
              </Button>
              <Button
                onClick={() => performOperation("+")}
                className={`${
                  operation === "+"
                    ? "bg-amber-500 text-white"
                    : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50"
                }`}
              >
                <Plus className="w-5 h-5 mx-auto" />
              </Button>

              <Button
                onClick={toggleSign}
                className="bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                +/-
              </Button>
              <Button
                onClick={() => inputDigit("0")}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                0
              </Button>
              <Button
                onClick={inputDecimal}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
              >
                .
              </Button>
              <Button
                onClick={calculate}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
              >
                <Equal className="w-5 h-5 mx-auto" />
              </Button>
            </div>
          </div>
        </div>

        {/* 历史记录 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-700/50 shadow-sm h-full">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                计算历史
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="ml-auto text-xs text-slate-500 hover:text-red-500 transition-colors"
                >
                  清空
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-500">
                <RotateCcw className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">暂无计算记录</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-sm font-mono text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => {
                      const result = item.split(" = ")[1];
                      if (result) {
                        setDisplay(result);
                        setWaitingForOperand(true);
                      }
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium mb-2">
                键盘快捷键
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                <span>数字键 - 输入数字</span>
                <span>Enter - 等于</span>
                <span>+-*/ - 运算符</span>
                <span>Esc - 清除</span>
                <span>. - 小数点</span>
                <span>Backspace - 退格</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
