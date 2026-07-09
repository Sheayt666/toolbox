"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check, Settings } from "lucide-react";

export default function PlaceholderTextGeneratorPage() {
  const [count, setCount] = useState(5);
  const [unit, setUnit] = useState<"paragraph" | "sentence" | "word">("paragraph");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [startWithLorem, setStartWithLorem] = useState(true);

  const loremWords = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
    "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
    "est", "laborum", "pellentesque", "habitant", "morbi", "tristique", "senectus",
    "et", "netus", "malesuada", "fames", "ac", "turpis", "egestas", "praesent",
    "semper", "feugiat", "nibh", "sed", "pulvinar", "proin", "gravida", "hendrerit",
  ];

  const generateWords = (numWords: number, startWithL: boolean): string => {
    let words: string[] = [];
    if (startWithL) {
      words = ["Lorem", "ipsum", "dolor", "sit", "amet"];
      numWords = Math.max(0, numWords - 5);
    }
    for (let i = 0; i < numWords; i++) {
      words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
    }
    return words.join(" ");
  };

  const generateSentence = (startWithL: boolean): string => {
    const numWords = Math.floor(Math.random() * 15) + 8;
    let sentence = generateWords(numWords, startWithL);
    sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1).toLowerCase();
    return sentence + ".";
  };

  const generateParagraph = (startWithL: boolean): string => {
    const numSentences = Math.floor(Math.random() * 4) + 4;
    const sentences: string[] = [];
    for (let i = 0; i < numSentences; i++) {
      sentences.push(generateSentence(i === 0 && startWithL));
    }
    return sentences.join(" ");
  };

  const generate = () => {
    const n = Math.max(1, Math.min(100, count));
    let text = "";

    if (unit === "word") {
      text = generateWords(n, startWithLorem);
      if (startWithLorem) {
        text = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() + ".";
      }
    } else if (unit === "sentence") {
      const sentences: string[] = [];
      for (let i = 0; i < n; i++) {
        sentences.push(generateSentence(i === 0 && startWithLorem));
      }
      text = sentences.join(" ");
    } else {
      const paragraphs: string[] = [];
      for (let i = 0; i < n; i++) {
        paragraphs.push(generateParagraph(i === 0 && startWithLorem));
      }
      text = paragraphs.join("\n\n");
    }

    setOutput(text);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="占位文本生成器"
      description="Lorem Ipsum占位文本生成工具，支持段落、句子、单词三种模式，快速生成填充文本"
      toolId="placeholder-text-generator"
      icon={Type}
      category="生成工具"
      slug="placeholder-text-generator"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 设置区 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-semibold">生成设置</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">生成数量</label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">单位</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-2.5 text-zinc-300 focus:outline-none focus:border-violet-500"
              >
                <option value="paragraph">段落</option>
                <option value="sentence">句子</option>
                <option value="word">单词</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">开头</label>
              <button
                onClick={() => setStartWithLorem(!startWithLorem)}
                className={`w-full px-4 py-2.5 rounded-lg font-medium transition-all ${
                  startWithLorem
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                    : "bg-zinc-900/50 text-zinc-400 border border-zinc-700 hover:border-zinc-600"
                }`}
              >
                {startWithLorem ? "以Lorem开头" : "随机开头"}
              </button>
            </div>
          </div>

          <button
            onClick={generate}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-medium hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg shadow-violet-500/25"
          >
            生成占位文本
          </button>
        </div>

        {/* 输出区 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-violet-400" />
              <h3 className="text-base font-semibold">生成结果</h3>
            </div>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 transition-colors disabled:opacity-50"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <div className="p-4">
            <div className="w-full min-h-64 max-h-96 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-400 text-sm leading-relaxed overflow-auto whitespace-pre-wrap">
              {output || <span className="text-zinc-600">点击生成按钮查看结果...</span>}
            </div>
          </div>
        </div>

        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-violet-500/10 rounded-xl">
              <div className="text-sm font-medium text-violet-300">多种模式</div>
              <p className="text-xs text-violet-400/70 mt-1">支持段落、句子、单词三种模式</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">数量可调</div>
              <p className="text-xs text-emerald-400/70 mt-1">自由调整生成数量1-100</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">一键复制</div>
              <p className="text-xs text-blue-400/70 mt-1">生成后一键复制到剪贴板</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
