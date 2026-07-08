"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Repeat, Copy, Check, Info, RotateCcw } from "lucide-react";

type BaseType = "binary" | "octal" | "decimal" | "hex";

const baseInfo: Record<BaseType, { name: string; radix: number; prefix: string; chars: string }> = {
  binary: { name: "二进制", radix: 2, prefix: "0b", chars: "0-1" },
  octal: { name: "八进制", radix: 8, prefix: "0o", chars: "0-7" },
  decimal: { name: "十进制", radix: 10, prefix: "", chars: "0-9" },
  hex: { name: "十六进制", radix: 16, prefix: "0x", chars: "0-9, A-F" },
};

export default function BaseConverterPage() {
  const [values, setValues] = useState<Record<BaseType, string>>({
    binary: "1010",
    octal: "12",
    decimal: "10",
    hex: "a",
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const convertFrom = useCallback((fromBase: BaseType, value: string) => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) {
      setValues({ binary: "", octal: "", decimal: "", hex: "" });
      setError(null);
      return;
    }

    // 去除前缀
    let cleanValue = trimmed;
    if (fromBase === "binary" && cleanValue.startsWith("0b")) cleanValue = cleanValue.slice(2);
    if (fromBase === "octal" && cleanValue.startsWith("0o")) cleanValue = cleanValue.slice(2);
    if (fromBase === "hex" && cleanValue.startsWith("0x")) cleanValue = cleanValue.slice(2);

    // 验证输入
    const validChars: Record<BaseType, RegExp> = {
      binary: /^[01]+$/,
      octal: /^[0-7]+$/,
      decimal: /^[0-9]+$/,
      hex: /^[0-9a-f]+$/,
    };

    if (!validChars[fromBase].test(cleanValue)) {
      setError(`无效的${baseInfo[fromBase].name}数字，只允许 ${baseInfo[fromBase].chars}`);
      const newValues = { ...values };
      newValues[fromBase] = value;
      setValues(newValues);
      return;
    }

    setError(null);

    try {
      const decimalValue = parseInt(cleanValue, baseInfo[fromBase].radix);

      if (isNaN(decimalValue)) {
        setError("转换失败，请检查输入");
        return;
      }

      // 检查是否超出安全整数范围
      if (decimalValue > Number.MAX_SAFE_INTEGER) {
        setError("数值过大，可能存在精度问题");
      }

      setValues({
        binary: decimalValue.toString(2),
        octal: decimalValue.toString(8),
        decimal: decimalValue.toString(10),
        hex: decimalValue.toString(16),
      });
    } catch {
      setError("转换失败");
    }
  }, [values]);

  const handleCopy = async (base: BaseType) => {
    try {
      await navigator.clipboard.writeText(values[base]);
      setCopied(base);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    setValues({ binary: "", octal: "", decimal: "", hex: "" });
    setError(null);
  };

  const bases: BaseType[] = ["binary", "octal", "decimal", "hex"];

  return (
    <ToolLayout
      title="进制转换"
      description="二进制、八进制、十进制、十六进制互相转换，实时计算，支持前缀识别"
      toolId="base-converter"
      icon={Repeat}
      category="计算工具"
      slug="base-converter"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 转换区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  进制转换
                </h2>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-violet-500 dark:hover:text-violet-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {bases.map((base) => {
              const info = baseInfo[base];
              return (
                <div key={base}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                        base === "binary" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                        base === "octal" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" :
                        base === "decimal" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      }`}>
                        {info.name}
                      </span>
                      <span className="text-xs text-zinc-500 dark:text-zinc-500">
                        {info.prefix || "无前缀"}
                      </span>
                    </label>
                    <button
                      onClick={() => handleCopy(base)}
                      disabled={!values[base]}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-violet-500 dark:hover:text-violet-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {copied === base ? (
                        <><Check className="w-3.5 h-3.5 text-emerald-500" /> 已复制</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5" /> 复制</>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={values[base]}
                    onChange={(e) => convertFrom(base, e.target.value)}
                    placeholder={`输入${info.name}数值...`}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all font-mono text-lg"
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <div className="px-6 pb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                {error}
              </div>
            </div>
          )}
        </div>

        {/* 常用对照表 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                常用对照表
              </h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">十进制</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">二进制</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">八进制</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-600 dark:text-zinc-400">十六进制</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {[0, 1, 2, 4, 8, 10, 16, 32, 64, 100, 128, 255, 256, 1024, 2048].map((num) => (
                  <tr key={num} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="px-4 py-2.5 font-mono text-zinc-900 dark:text-white">{num}</td>
                    <td className="px-4 py-2.5 font-mono text-blue-600 dark:text-blue-400">{num.toString(2)}</td>
                    <td className="px-4 py-2.5 font-mono text-green-600 dark:text-green-400">{num.toString(8)}</td>
                    <td className="px-4 py-2.5 font-mono text-purple-600 dark:text-purple-400">{num.toString(16).toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                什么是进制？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                进制也就是进位计数制，是人为定义的带进位的计数方法。
                二进制是逢二进一，八进制逢八进一，十进制逢十进一，十六进制逢十六进一。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                为什么十六进制用A-F表示？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                十六进制需要16个数字符号，但阿拉伯数字只有0-9共10个，
                所以用A到F来表示10到15这六个数值，这样就能用单个字符表示所有位。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                转换结果有精度限制吗？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具基于JavaScript的Number类型实现，安全整数范围是正负2的53次方。
                超出这个范围的数值可能会有精度损失。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
