"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Lock, Copy, Check, Trash2, Info, ArrowRightLeft } from "lucide-react";

type EncryptMode = "base64" | "url" | "caesar";

function encrypt(text: string, mode: EncryptMode, shift: number = 3): string {
  if (!text) return "";
  
  switch (mode) {
    case "base64":
      try {
        return btoa(unescape(encodeURIComponent(text)));
      } catch {
        return "编码失败";
      }
    case "url":
      return encodeURIComponent(text);
    case "caesar":
      return caesarCipher(text, shift);
    default:
      return text;
  }
}

function caesarCipher(text: string, shift: number): string {
  const s = shift % 26;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

export default function TextEncryptPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<EncryptMode>("base64");
  const [shift, setShift] = useState(3);
  const [copied, setCopied] = useState(false);

  const result = encrypt(input, mode, shift);

  const handleClear = () => {
    setInput("");
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const modes = [
    { value: "base64", label: "Base64 编码" },
    { value: "url", label: "URL 编码" },
    { value: "caesar", label: "凯撒密码" },
  ];

  return (
    <ToolLayout
      title="文本加密"
      description="对文本进行多种加密处理，支持 Base64 编码、URL 编码、凯撒密码等常见加密方式，纯前端安全加密"
      toolId="text-encrypt"
      icon={Lock}
      category="文本工具"
      slug="text-encrypt"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                加密方式
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {modes.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value as EncryptMode)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === m.value
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {mode === "caesar" && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400 w-20">偏移量</span>
                <input
                  type="range"
                  min="1"
                  max="25"
                  value={shift}
                  onChange={(e) => setShift(Number(e.target.value))}
                  className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <span className="text-sm font-medium text-rose-500 w-12 text-right">
                  {shift}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-rose-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    原始文本
                  </span>
                </div>
                <button
                  onClick={handleClear}
                  disabled={!input}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  清空
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入要加密的文本..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    加密结果
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {copied ? (
                    <><Check className="w-3.5 h-3.5 text-emerald-500" /> 已复制</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> 复制</>
                  )}
                </button>
              </div>
            </div>
            <textarea
              value={result}
              readOnly
              placeholder="加密结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              加密方式说明
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                Base64 编码
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                将文本转换为 Base64 格式，常用于数据传输和简单的文本混淆。支持中文等多字节字符。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                URL 编码
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                使用百分号编码对文本进行编码，用于 URL 传输特殊字符。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                凯撒密码
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                一种最简单的替换加密技术，将字母按一定偏移量替换。仅对英文字母有效。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
