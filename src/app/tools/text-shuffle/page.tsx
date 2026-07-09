"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Shuffle,
  Copy,
  Check,
  Trash2,
  Download,
  Type,
} from "lucide-react";

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleText(text: string, mode: "char" | "word" | "line"): string {
  if (mode === "char") {
    return shuffleArray(text.split("")).join("");
  } else if (mode === "word") {
    // 保留换行符
    const lines = text.split("\n");
    return lines.map(line => {
      const words = line.split(/(\s+)/);
      const wordList = words.filter(w => w.trim());
      const shuffled = shuffleArray(wordList);
      let idx = 0;
      return words.map(w => w.trim() ? shuffled[idx++] : w).join("");
    }).join("\n");
  } else {
    const lines = text.split("\n");
    return shuffleArray(lines).join("\n");
  }
}

export default function TextShufflePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"char" | "word" | "line">("word");
  const [copied, setCopied] = useState(false);

  const handleShuffle = useCallback(() => {
    if (!input.trim()) return;
    setOutput(shuffleText(input, mode));
  }, [input, mode]);

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

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shuffled.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <ToolLayout
      title="文本打乱顺序"
      description="随机打乱文本中的字符、单词或行的顺序，支持多种打乱模式"
      toolId="text-shuffle"
      icon={Shuffle}
      category="文本工具"
      slug="text-shuffle"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-1 bg-[#27272a] rounded-xl p-1">
              {(["char", "word", "line"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    mode === m
                      ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m === "char" ? "按字符" : m === "word" ? "按单词" : "按行"}
                </button>
              ))}
            </div>
            <button
              onClick={handleShuffle}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Shuffle className="w-4 h-4" />
              随机打乱
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
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              下载
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
                placeholder={"在此输入文本...\n\n例如：The quick brown fox jumps over the lazy dog."}
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Shuffle className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">打乱结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="打乱后的文本将显示在这里..."
                className="w-full h-72 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            随机打乱文本中的字符、单词或行的顺序，支持多种打乱模式。支持按字符、按单词、按行三种打乱模式，
            使用Fisher-Yates洗牌算法保证随机性。可用于随机抽奖、随机排序、
            密码学实验等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
