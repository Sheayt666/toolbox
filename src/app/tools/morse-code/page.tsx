"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Radio, Copy, Check, Trash2, Info, ArrowRightLeft, ArrowRight, ArrowLeft } from "lucide-react";

type MorseMode = "encode" | "decode";

const MORSE_CODE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
  G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
  M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
  S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.", "!": "-.-.--",
  "/": "-..-.", "(": "-.--.", ")": "-.--.-", "&": ".-...", ":": "---...",
  ";": "-.-.-.", "=": "-...-", "+": ".-.-.", "-": "-....-", "_": "..--.-",
  "\"": ".-..-.", "$": "...-..-", "@": ".--.-.",
};

const REVERSE_MORSE = Object.fromEntries(
  Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
);

function toMorse(text: string): string {
  if (!text) return "";
  return text
    .toUpperCase()
    .split("")
    .map(char => {
      if (char === " ") return "/";
      return MORSE_CODE[char] || char;
    })
    .join(" ");
}

function fromMorse(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .split(" ")
    .filter(c => c.length > 0)
    .map(code => {
      if (code === "/") return " ";
      return REVERSE_MORSE[code] || code;
    })
    .join("");
}

export default function MorseCodePage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<MorseMode>("encode");
  const [copied, setCopied] = useState(false);

  const result = mode === "encode" ? toMorse(input) : fromMorse(input);

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

  return (
    <ToolLayout
      title="摩斯电码"
      description="摩斯电码编码和解码工具，支持文本转摩斯电码和摩斯电码转文本，使用标准摩斯电码表，纯前端实时转换"
      toolId="morse-code"
      icon={Radio}
      category="文本工具"
      slug="morse-code"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                转换模式
              </h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex gap-2">
              <button
                onClick={() => setMode("encode")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === "encode"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                文本转摩斯电码
              </button>
              <button
                onClick={() => setMode("decode")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  mode === "decode"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                摩斯电码转文本
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "encode" ? "输入文本" : "输入摩斯电码"}
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
              placeholder={mode === "encode" ? "输入要转换为摩斯电码的英文文本..." : "输入摩斯电码，字母间用空格分隔，单词间用 / 分隔..."}
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none font-mono text-sm"
            />
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {mode === "encode" ? "摩斯电码" : "文本结果"}
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
              摩斯电码说明
            </h3>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
            <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed mb-4">
              摩尔斯电码是一种时通时断的信号代码，通过不同的排列顺序来表达不同的英文字母、数字和标点符号。
              点（.）读作 "滴"，划（-）读作 "嗒"。字母之间用空格分隔，单词之间用斜杠 / 分隔。
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
              {Object.entries(MORSE_CODE).slice(0, 26).map(([letter, code]) => (
                <div key={letter} className="bg-white/60 dark:bg-black/20 rounded-lg p-2 text-center">
                  <div className="text-amber-800 dark:text-amber-300 font-bold text-sm">{letter}</div>
                  <div className="text-amber-600 dark:text-amber-400 text-xs font-mono">{code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
