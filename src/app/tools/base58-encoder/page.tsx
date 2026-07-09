"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Binary, ArrowLeftRight, Copy, Check } from "lucide-react";

export default function Base58EncoderPage() {
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
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    if (str.length === 0) return "";
    // 转换为字节数组
    const bytes = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
      bytes[i] = str.charCodeAt(i);
    }
    // 计算前导零的数量
    let zeros = 0;
    while (zeros < bytes.length && bytes[zeros] === 0) zeros++;
    // 转换为Base58
    let result = "";
    let num = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
      num = num * BigInt(256) + BigInt(bytes[i]);
    }
    while (num > BigInt(0)) {
      const remainder = Number(num % BigInt(58));
      result = alphabet[remainder] + result;
      num = num / BigInt(58);
    }
    // 添加前导1
    for (let i = 0; i < zeros; i++) {
      result = "1" + result;
    }
    return result;
  };

  const decode = (str: string): string => {
    const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    if (str.length === 0) return "";
    // 计算前导1的数量
    let ones = 0;
    while (ones < str.length && str[ones] === "1") ones++;
    // 转换为数字
    let num = BigInt(0);
    for (let i = 0; i < str.length; i++) {
      const idx = alphabet.indexOf(str[i]);
      if (idx === -1) throw new Error("无效的Base58字符");
      num = num * BigInt(58) + BigInt(idx);
    }
    // 转换为字节
    const bytes: number[] = [];
    while (num > BigInt(0)) {
      bytes.unshift(Number(num % BigInt(256)));
      num = num / BigInt(256);
    }
    // 添加前导零
    for (let i = 0; i < ones; i++) {
      bytes.unshift(0);
    }
    // 转换为字符串
    let result = "";
    for (const b of bytes) {
      result += String.fromCharCode(b);
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
      title="Base58编解码"
      description="Base58编码和解码工具，比特币地址编码，支持编码解码双向转换"
      toolId="base58-encoder"
      icon={Binary}
      category="开发工具"
      slug="base58-encoder"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 模式切换 */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => { setMode("encode"); setError(""); }}
            className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
              mode === "encode"
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25"
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
                ? "bg-amber-600 text-white shadow-lg shadow-amber-500/25"
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
                <Binary className="w-5 h-5 text-amber-400" />
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
                className="w-full h-64 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500 resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Binary className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-semibold">
                  {mode === "encode" ? "编码结果" : "解码结果"}
                </h2>
              </div>
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-amber-400 transition-colors disabled:opacity-50"
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
            <div className="p-4 bg-amber-500/10 rounded-xl">
              <div className="text-sm font-medium text-amber-300">实时转换</div>
              <p className="text-xs text-amber-400/70 mt-1">输入即转换，实时查看结果</p>
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
