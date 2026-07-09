"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Sparkles,
  Copy,
  Check,
  Trash2,
  Type,
  Sliders,
} from "lucide-react";

const zalgoUp = [
  "\u030d", "\u030e", "\u0304", "\u0305", "\u033f", "\u0311", "\u0306",
  "\u0310", "\u0352", "\u0357", "\u0351", "\u0307", "\u0308", "\u030a",
  "\u0342", "\u0343", "\u0344", "\u034a", "\u034b", "\u034c", "\u0303",
  "\u0302", "\u030c", "\u0350", "\u0300", "\u0301", "\u030b", "\u030f",
  "\u0312", "\u0313", "\u0314", "\u033d", "\u0309", "\u0363", "\u0364",
  "\u0365", "\u0366", "\u0367", "\u0368", "\u0369", "\u036a", "\u036b",
  "\u036c", "\u036d", "\u036e", "\u036f", "\u033e", "\u035b", "\u0346",
  "\u031a",
];

const zalgoDown = [
  "\u0316", "\u0317", "\u0318", "\u0319", "\u031c", "\u031d", "\u031e",
  "\u031f", "\u0320", "\u0324", "\u0325", "\u0326", "\u0329", "\u032a",
  "\u032b", "\u032c", "\u032d", "\u032e", "\u032f", "\u0330", "\u0331",
  "\u0332", "\u0333", "\u0339", "\u033a", "\u033b", "\u033c", "\u0345",
  "\u0347", "\u0348", "\u0349", "\u034d", "\u034e", "\u0353", "\u0354",
  "\u0355", "\u0356", "\u0359", "\u035a", "\u0323",
];

const zalgoMid = [
  "\u0315", "\u031b", "\u0340", "\u0341", "\u0358", "\u0321", "\u0322",
  "\u0327", "\u0328", "\u0334", "\u0335", "\u0336", "\u034f", "\u035c",
  "\u035d", "\u035e", "\u035f", "\u0360", "\u0362", "\u0338", "\u0337",
  "\u0361",
];

function randomFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateZalgo(text: string, intensity: number = 5): string {
  let result = "";
  for (const ch of text) {
    if (ch === " " || ch === "\n" || ch === "\t") {
      result += ch;
      continue;
    }
    result += ch;
    // 上方
    const upCount = Math.floor(Math.random() * intensity) + 1;
    for (let i = 0; i < upCount; i++) {
      result += randomFrom(zalgoUp);
    }
    // 中间
    const midCount = Math.floor(Math.random() * Math.ceil(intensity / 2));
    for (let i = 0; i < midCount; i++) {
      result += randomFrom(zalgoMid);
    }
    // 下方
    const downCount = Math.floor(Math.random() * intensity) + 1;
    for (let i = 0; i < downCount; i++) {
      result += randomFrom(zalgoDown);
    }
  }
  return result;
}

export default function ZalgoTextPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [intensity, setIntensity] = useState(5);
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!input.trim()) return;
    setOutput(generateZalgo(input, intensity));
  }, [input, intensity]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  return (
    <ToolLayout
      title="Zalgo文字生成"
      description="生成Zalgo/乱码文字效果，自定义恐怖风格文字，社交媒体创意文字"
      toolId="zalgo-text"
      icon={Sparkles}
      category="文本工具"
      slug="zalgo-text"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#27272a] rounded-xl">
              <Sliders className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">强度:</span>
              <input
                type="range"
                value={intensity}
                onChange={(e) => setIntensity(parseInt(e.target.value))}
                min={1}
                max={15}
                className="w-24 accent-primary-500"
              />
              <span className="text-sm text-zinc-300 w-6 text-center">{intensity}</span>
            </div>
            <button
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              生成Zalgo
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">原始文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"在此输入文字...\n\n例如：Hello World"}
                className="w-full h-40 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">Zalgo效果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Zalgo文字将显示在这里..."
                className="w-full h-40 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>

          {output && (
            <div className="px-4 pb-4">
              <div className="p-8 bg-[#09090b] border border-[#27272a] rounded-xl text-center overflow-hidden">
                <div className="text-4xl text-zinc-100 break-all leading-tight">
                  {output.slice(0, 50)}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            生成Zalgo/乱码文字效果，自定义恐怖风格文字，社交媒体创意文字。使用Unicode组合字符实现Zalgo/乱码效果，
            可调节恐怖程度强度。常用于万圣节主题、恐怖游戏、
            社交媒体创意文案等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
