"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Wallet as WalletIcon, Copy, Check, Trash2, Info, Banknote, Sparkles } from "lucide-react";

// 数字大写转换函数
function amountToChinese(numStr: string): string {
  if (!numStr || numStr.trim() === "") return "";

  const num = parseFloat(numStr);
  if (isNaN(num)) return "请输入有效的数字金额";
  if (!isFinite(num)) return "数字过大，无法转换";

  const digits = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const units = ["", "拾", "佰", "仟"];
  const bigUnits = ["", "万", "亿", "万亿"];

  // 处理负数
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // 分离整数和小数部分，保留两位小数
  const fixed = absNum.toFixed(2);
  const [intPartStr, decPartStr] = fixed.split(".");

  // 整数部分超过16位（万亿级以上）
  if (intPartStr.length > 16) {
    return "金额过大，最大支持到万亿级别";
  }

  let result = "";

  // 处理整数部分
  if (parseInt(intPartStr) === 0) {
    result = "零";
  } else {
    // 从右往左每4位一组
    const groups: string[] = [];
    let remaining = intPartStr;
    while (remaining.length > 0) {
      groups.unshift(remaining.slice(-4));
      remaining = remaining.slice(0, -4);
    }

    let allResult = "";
    let prevGroupZero = false;

    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const bigUnitIndex = groups.length - 1 - i;
      let groupResult = "";
      let groupZero = false;

      for (let j = 0; j < group.length; j++) {
        const digit = parseInt(group[j]);
        const unitIndex = group.length - 1 - j;

        if (digit === 0) {
          groupZero = true;
        } else {
          if (groupZero && groupResult !== "") {
            groupResult += "零";
          }
          groupResult += digits[digit] + units[unitIndex];
          groupZero = false;
        }
      }

      if (groupResult !== "") {
        if (prevGroupZero && allResult !== "") {
          allResult += "零";
        }
        allResult += groupResult + bigUnits[bigUnitIndex];
        prevGroupZero = false;
      } else {
        prevGroupZero = true;
      }
    }

    result = allResult;
  }

  // 添加"元"
  result += "元";

  // 处理小数部分
  const jiao = parseInt(decPartStr[0]);
  const fen = parseInt(decPartStr[1]);

  if (jiao === 0 && fen === 0) {
    result += "整";
  } else {
    if (jiao === 0) {
      result += "零";
    } else {
      result += digits[jiao] + "角";
    }
    if (fen !== 0) {
      result += digits[fen] + "分";
    }
  }

  // 负数处理
  if (isNegative) {
    result = "负" + result;
  }

  return result;
}

const examples = [
  { value: "1234.56", label: "千元示例" },
  { value: "10000", label: "万元整" },
  { value: "10086.05", label: "含零示例" },
  { value: "99999999.99", label: "大额示例" },
];

export default function AmountToChinesePage() {
  const [input, setInput] = useState("1234.56");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => amountToChinese(input), [input]);

  const handleCopy = async () => {
    if (!result || result.startsWith("请输入") || result.startsWith("数字") || result.startsWith("金额")) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const handleExample = (value: string) => {
    setInput(value);
  };

  return (
    <ToolLayout
      title="金额大写转换"
      description="数字金额转换为中文大写金额，支持整数小数，最大到万亿级别，财务报销合同填写必备工具"
      toolId="amount-to-chinese"
      icon={WalletIcon}
      category="文本工具"
      slug="amount-to-chinese"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                输入金额
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-amber-500">
                ¥
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={input}
                onChange={(e) => {
                  const val = e.target.value;
                  // 允许数字、小数点、负号
                  if (/^-?\d*\.?\d*$/.test(val) || val === "") {
                    setInput(val);
                  }
                }}
                placeholder="请输入数字金额，如：1234.56"
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
            </div>

            {/* 快捷示例 */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  快捷示例
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {examples.map((ex) => (
                  <button
                    key={ex.value}
                    onClick={() => handleExample(ex.value)}
                    className="px-3 py-1.5 text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  清空
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 转换结果 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  大写金额
                </h2>
              </div>
              <button
                onClick={handleCopy}
                disabled={!result || result.startsWith("请输入") || result.startsWith("数字") || result.startsWith("金额")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="min-h-[80px] flex items-center">
              {result && !result.startsWith("请输入") && !result.startsWith("数字") && !result.startsWith("金额") ? (
                <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-relaxed break-all">
                  {result}
                </div>
              ) : result ? (
                <div className="text-base text-zinc-500 dark:text-zinc-400">
                  {result}
                </div>
              ) : (
                <div className="text-base text-zinc-400 dark:text-zinc-600">
                  输入数字后将显示大写金额...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 大写数字对照表 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              大写数字对照表
            </h3>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {[
              ["0", "零"],
              ["1", "壹"],
              ["2", "贰"],
              ["3", "叁"],
              ["4", "肆"],
              ["5", "伍"],
              ["6", "陆"],
              ["7", "柒"],
              ["8", "捌"],
              ["9", "玖"],
            ].map(([num, ch]) => (
              <div
                key={num}
                className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl text-center"
              >
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {ch}
                </div>
                <div className="text-xs text-amber-500 dark:text-amber-500/80 mt-1">
                  {num}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              ["拾", "十位"],
              ["佰", "百位"],
              ["仟", "千位"],
              ["万", "万位"],
              ["亿", "亿位"],
              ["元", "元"],
              ["角", "角"],
              ["分", "分"],
            ].map(([ch, desc]) => (
              <div
                key={ch}
                className="p-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-center"
              >
                <div className="text-base font-bold text-zinc-700 dark:text-zinc-300">
                  {ch}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-500">
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 常见问题 */}
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
                金额大写有什么规范要求？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                根据《会计基础工作规范》，金额大写应使用壹、贰、叁、肆、伍、陆、柒、捌、玖、拾、佰、仟、万、亿、元、角、分、零、整等字样。
                金额到元为止的，在元之后应写"整"字；有角分的不写"整"字。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                为什么要使用金额大写？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                中文大写数字笔画繁多，不易涂改，主要用于防止篡改金额。在发票、支票、合同、报销单等正式财务单据中，
                必须同时使用阿拉伯数字和中文大写数字标注金额，确保数据安全。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
