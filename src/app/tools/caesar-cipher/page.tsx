"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shield, Copy, Check, Trash2, Info, ArrowRightLeft, ArrowRight, ArrowLeft } from "lucide-react";

type CipherMode = "encrypt" | "decrypt";

function caesarCipher(text: string, shift: number, mode: CipherMode): string {
  if (!text) return "";
  const s = mode === "encrypt" ? shift % 26 : (26 - (shift % 26)) % 26;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base);
  });
}

export default function CaesarCipherPage() {
  const [input, setInput] = useState("");
  const [shift, setShift] = useState(3);
  const [mode, setMode] = useState<CipherMode>("encrypt");
  const [copied, setCopied] = useState(false);

  const result = caesarCipher(input, shift, mode);

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

  const shiftPresets = [3, 5, 7, 13, 18, 25];

  return (
    <ToolLayout
      title="凯撒密码"
      description="使用凯撒密码对文本进行加密和解密，可自定义偏移量，支持所有英文字母，是最简单的替换加密算法"
      toolId="caesar-cipher"
      icon={Shield}
      category="文本工具"
      slug="caesar-cipher"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                凯撒密码设置
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("encrypt")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === "encrypt"
                    ? "bg-violet-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                加密
              </button>
              <button
                onClick={() => setMode("decrypt")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === "decrypt"
                    ? "bg-violet-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                解密
              </button>
            </div>
            <div>
              <label className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 block">
                偏移量: <span className="font-semibold text-violet-500">{shift}</span>
              </label>
              <input
                type="range"
                min="1"
                max="25"
                value={shift}
                onChange={(e) => setShift(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {shiftPresets.map(s => (
                  <button
                    key={s}
                    onClick={() => setShift(s)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      shift === s
                        ? "bg-violet-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "encrypt" ? "原始文本" : "加密文本"}
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
              placeholder={mode === "encrypt" ? "输入要加密的英文文本..." : "输入要解密的文本..."}
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "encrypt" ? "加密结果" : "解密结果"}
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
              placeholder="结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              什么是凯撒密码？
            </h3>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
            <p className="text-violet-700 dark:text-violet-400 text-sm leading-relaxed">
              凯撒密码是一种最简单且最广为人知的加密技术，据传由古罗马凯撒大帝发明。
              它是一种替换加密技术，将明文中的所有字母都在字母表上向后（或向前）
              按照一个固定数目进行偏移后被替换成密文。例如，当偏移量是 3 的时候，
              字母 A 将被替换成 D，B 变成 E，以此类推。
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  偏移量 3 加密
                </span>
                <div className="font-mono text-violet-800 dark:text-violet-300 mt-1">
                  HELLO → KHOOR
                </div>
              </div>
              <div className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                <span className="text-violet-600 dark:text-violet-400 font-medium">
                  偏移量 3 解密
                </span>
                <div className="font-mono text-violet-800 dark:text-violet-300 mt-1">
                  KHOOR → HELLO
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
