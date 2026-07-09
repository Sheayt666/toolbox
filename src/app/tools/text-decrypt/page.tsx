"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Unlock, Copy, Check, Trash2, Info, ArrowRightLeft } from "lucide-react";

type DecryptMode = "base64" | "url" | "caesar";

function decrypt(text: string, mode: DecryptMode, shift: number = 3): string {
  if (!text) return "";
  
  switch (mode) {
    case "base64":
      try {
        return decodeURIComponent(escape(atob(text.trim())));
      } catch {
        return "解码失败，请检查输入是否为有效的 Base64 编码";
      }
    case "url":
      try {
        return decodeURIComponent(text);
      } catch {
        return "解码失败，请检查输入是否为有效的 URL 编码";
      }
    case "caesar":
      return caesarDecrypt(text, shift);
    default:
      return text;
  }
}

function caesarDecrypt(text: string, shift: number): string {
  const s = shift % 26;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base - s + 26) % 26) + base);
  });
}

export default function TextDecryptPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<DecryptMode>("base64");
  const [shift, setShift] = useState(3);
  const [copied, setCopied] = useState(false);

  const result = decrypt(input, mode, shift);

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
    { value: "base64", label: "Base64 解码" },
    { value: "url", label: "URL 解码" },
    { value: "caesar", label: "凯撒密码解密" },
  ];

  return (
    <ToolLayout
      title="文本解密"
      description="对加密的文本进行解密还原，支持 Base64 解码、URL 解码、凯撒密码解密等，纯前端本地处理"
      toolId="text-decrypt"
      icon={Unlock}
      category="文本工具"
      slug="text-decrypt"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Unlock className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                解密方式
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {modes.map(m => (
                <button
                  key={m.value}
                  onClick={() => setMode(m.value as DecryptMode)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === m.value
                      ? "bg-emerald-500 text-white shadow-sm"
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
                  className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-sm font-medium text-emerald-500 w-12 text-right">
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
                  <Unlock className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    加密文本
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
              placeholder="输入要解密的文本..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    解密结果
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  disabled={!result}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-500 hover:text-sky-500 dark:hover:text-sky-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              placeholder="解密结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              注意事项
            </h3>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <ul className="text-amber-700 dark:text-amber-400 text-xs space-y-1.5">
              <li>• 请确保输入的加密文本格式正确，否则可能解密失败</li>
              <li>• Base64 解码支持中文等多字节字符的还原</li>
              <li>• 凯撒密码仅对英文字母有效，需要知道正确的偏移量</li>
              <li>• 所有解密操作均在本地浏览器完成，不会上传数据</li>
            </ul>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
