"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, FileText, Sparkles } from "lucide-react";

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
  "dolore", "magna", "aliqua", "ut", "enim", "ad", "minim", "veniam",
  "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut",
  "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure",
  "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse",
  "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "in",
  "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est",
  "laborum",
];

function generateLoremIpsum(
  count: number,
  unit: "words" | "paragraphs" | "sentences",
  startWithLorem: boolean
): string {
  const getRandomWord = (): string => {
    return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
  };

  const generateSentence = (wordCount: number, capitalize: boolean = true): string => {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
      words.push(getRandomWord());
    }
    let sentence = words.join(" ");
    if (capitalize) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
    }
    return sentence;
  };

  const generateParagraph = (sentenceCount: number, startWithLoremIpsum: boolean): string => {
    const sentences: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      const wordCount = Math.floor(Math.random() * 15) + 5;
      if (i === 0 && startWithLoremIpsum) {
        sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + generateSentence(wordCount - 8, false));
      } else {
        sentences.push(generateSentence(wordCount));
      }
    }
    return sentences.join(" ");
  };

  if (unit === "words") {
    const words: string[] = [];
    if (startWithLorem) {
      words.push("Lorem");
      words.push("ipsum");
    }
    while (words.length < count) {
      words.push(getRandomWord());
    }
    let result = words.slice(0, count).join(" ");
    result = result.charAt(0).toUpperCase() + result.slice(1);
    return result;
  }

  if (unit === "sentences") {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      const wordCount = Math.floor(Math.random() * 15) + 5;
      if (i === 0 && startWithLorem) {
        sentences.push("Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
      } else {
        sentences.push(generateSentence(wordCount));
      }
    }
    return sentences.join(" ");
  }

  // paragraphs
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = Math.floor(Math.random() * 5) + 3;
    paragraphs.push(generateParagraph(sentenceCount, i === 0 && startWithLorem));
  }
  return paragraphs.join("\n\n");
}

export default function LoremIpsumPage() {
  const [count, setCount] = useState(5);
  const [unit, setUnit] = useState<"words" | "paragraphs" | "sentences">("paragraphs");
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = useCallback(() => {
    const result = generateLoremIpsum(count, unit, startWithLorem);
    setOutput(result);
  }, [count, unit, startWithLorem]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const unitLabel = {
    words: "字",
    sentences: "句",
    paragraphs: "段",
  };

  return (
    <ToolLayout
      title="Lorem Ipsum 生成器"
      description="在线 Lorem Ipsum 占位文本生成器，快速生成假文本用于设计和开发测试"
      icon={FileText}
      category="开发工具"
      slug="lorem-ipsum"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Lorem Ipsum 生成</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
              min={1}
              max={1000}
              className="w-20 px-3 py-1.5 bg-[#09090b] border border-[#27272a] rounded-lg text-white text-sm text-center focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all"
            />
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              {["paragraphs", "sentences", "words"].map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    unit === u
                      ? "bg-[#27272a] text-violet-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {unitLabel[u as keyof typeof unitLabel]}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithLorem}
              onChange={(e) => setStartWithLorem(e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-violet-500 focus:ring-violet-500/50"
            />
            <span className="text-sm text-slate-400">以 Lorem ipsum 开头</span>
          </label>

          <button
            onClick={handleGenerate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            <Sparkles className="w-4 h-4" />
            生成
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-slate-300">生成结果</label>
          <span className="text-xs text-slate-500">
            {output.length} 字符 · {output ? output.split(/\s+/).filter(Boolean).length : 0} 词
          </span>
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="点击生成按钮生成 Lorem Ipsum 占位文本..."
          spellCheck={false}
          className="w-full h-[400px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCopy}
            disabled={!output}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制文本
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• Lorem Ipsum 是印刷和排版行业常用的占位文本</li>
          <li>• 支持按字数、句子数、段落数三种生成方式</li>
          <li>• 所有生成都在浏览器本地完成，无需网络请求</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
