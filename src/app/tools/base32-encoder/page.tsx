"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Binary, ArrowLeftRight, Copy, Check } from "lucide-react";

export default function Base32EncoderPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === "encode" ? "decode" : "encode");
    setError("");
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const encode = (str: string): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let result = "";
    let buffer = 0;
    let bitsLeft = 0;
    for (let i = 0; i < str.length; i++) {
      buffer = (buffer << 8) | str.charCodeAt(i);
      bitsLeft += 8;
      while (bitsLeft >= 5) {
        bitsLeft -= 5;
        result += alphabet[(buffer >> bitsLeft) & 31];
      }
    }
    if (bitsLeft > 0) {
      buffer <<= (5 - bitsLeft);
      result += alphabet[buffer & 31];
    }
    // 添加填充
    while (result.length % 8 !== 0) {
      result += "=";
    }
    return result;
  };

  const decode = (str: string): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const upperStr = str.toUpperCase().replace(/=+$/, "");
    let result = "";
    let buffer = 0;
    let bitsLeft = 0;
    for (let i = 0; i < upperStr.length; i++) {
      const idx = alphabet.indexOf(upperStr[i]);
      if (idx === -1) throw new Error("无效的Base32字符");
      buffer = (buffer << 5) | idx;
      bitsLeft += 5;
      if (bitsLeft >= 8) {
        bitsLeft -= 8;
        result += String.fromCharCode((buffer >> bitsLeft) & 255);
      }
    }
    return result;
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    setError("");
    try {
      if (mode === "encode") {
        setOutput(encode(value));
      } else {
        setOutput(decode(value));
      }
    } catch (e) {
      setOutput("");
    }
  };

  return (
    <ToolLayout
      title="Base32编解码"
      description="Base32编码和解码工具，支持文本和字符串的Base32转换，实时转换"
      toolId="base32-encoder"
      icon={Binary}
      category="开发工具"
      slug="base32-encoder"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 模式切换 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => { setMode("encode"); setError(""); }}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              mode === "encode"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-700"
            }`}
          >
            编码
          </button>
          <button
            onClick={handleSwap}
            className="p-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="交换"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setMode("decode"); setError(""); }}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              mode === "decode"
                ? "bg-teal-600 text-white shadow-lg shadow-teal-500/25"
                : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 border border-zinc-700"
            }`}
          >
            解码
          </button>
        </div>

        {/* 输入输出 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-semibold">
                  {mode === "encode" ? "原始文本" : "编码文本"}
                </h2>
              </div>
              <button
                onClick={handleClear}
                className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                清空
              </button>
            </div>
            <div className="p-4">
              <textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={mode === "encode" ? "输入要编码的文本..." : "输入要解码的文本..."}
                className="w-full h-64 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-teal-500 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-teal-400" />
                <h2 className="text-base font-semibold">
                  {mode === "encode" ? "编码结果" : "解码结果"}
                </h2>
              </div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-teal-400 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="p-4">
              <div className="w-full h-64 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 font-mono text-sm overflow-auto">
                {error ? (
                  <span className="text-red-400">{error}</span>
                ) : output ? (
                  output
                ) : (
                  <span className="text-zinc-600">结果将显示在这里...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-teal-500/10 rounded-xl">
              <div className="text-sm font-medium text-teal-300">实时转换</div>
              <p className="text-xs text-teal-400/70 mt-1">输入即转换，实时查看结果</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">本地处理</div>
              <p className="text-xs text-emerald-400/70 mt-1">所有转换在浏览器本地完成</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">双向转换</div>
              <p className="text-xs text-blue-400/70 mt-1">支持编码和解码双向转换</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
