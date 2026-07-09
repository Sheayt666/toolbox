"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  KeyRound,
  Copy,
  Check,
  Trash2,
  Type,
  BarChart2,
} from "lucide-react";

interface Keyword {
  word: string;
  count: number;
  weight: number;
}

// 停用词列表（中英文）
const stopWords = new Set([
  // 中文停用词
  "的", "了", "在", "是", "我", "有", "和", "就", "不", "人",
  "都", "一", "一个", "上", "也", "很", "到", "说", "要", "去",
  "你", "会", "着", "没有", "看", "好", "自己", "这", "那", "他",
  "她", "它", "们", "这个", "那个", "什么", "怎么", "如何", "为什么",
  "可以", "能", "能够", "应该", "需要", "因为", "所以", "但是", "而且",
  "或者", "如果", "虽然", "然而", "已经", "正在", "将", "被", "把",
  "让", "给", "从", "向", "对", "与", "及", "等", "等等", "之",
  "中", "内", "外", "前", "后", "里", "上", "下", "左", "右",
  // 英文停用词
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "and", "but", "or", "nor", "not", "so", "yet", "both",
  "either", "neither", "each", "every", "all", "any", "few", "more",
  "most", "other", "some", "such", "no", "only", "own", "same",
  "than", "too", "very", "just", "because", "if", "when", "where",
  "how", "what", "which", "who", "whom", "this", "that", "these",
  "those", "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
  "you", "your", "yours", "yourself", "yourselves", "he", "him", "his",
  "himself", "she", "her", "hers", "herself", "it", "its", "itself",
  "they", "them", "their", "theirs", "themselves", "about", "up", "down",
]);

function extractKeywords(text: string, topN: number = 20): Keyword[] {
  const words = text.toLowerCase().match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [];
  
  const wordCount = new Map<string, number>();
  for (const word of words) {
    if (word.length < 2) continue; // 过滤单字
    if (stopWords.has(word)) continue;
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  }
  
  const totalWords = words.length;
  const result: Keyword[] = Array.from(wordCount.entries())
    .map(([word, count]) => ({
      word,
      count,
      weight: count / totalWords,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
  
  return result;
}

export default function KeywordExtractorPage() {
  const [input, setInput] = useState("");
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [topN, setTopN] = useState(20);
  const [copied, setCopied] = useState(false);

  const handleExtract = useCallback(() => {
    if (!input.trim()) return;
    const result = extractKeywords(input, topN);
    setKeywords(result);
  }, [input, topN]);

  const handleCopy = useCallback(async () => {
    if (keywords.length === 0) return;
    const text = keywords.map((k, i) => `${i + 1}. ${k.word} (${k.count}次)`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }, [keywords]);

  const handleClear = useCallback(() => {
    setInput("");
    setKeywords([]);
  }, []);

  const maxCount = keywords.length > 0 ? keywords[0].count : 1;

  return (
    <ToolLayout
      title="关键词提取"
      description="从文本中自动提取关键词和高频词汇，支持中英文，快速获取文章核心词汇"
      toolId="keyword-extractor"
      icon={KeyRound}
      category="文本工具"
      slug="keyword-extractor"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-xl">
              <span className="text-sm text-zinc-400">Top:</span>
              <input
                type="number"
                value={topN}
                onChange={(e) => setTopN(Math.max(5, Math.min(100, parseInt(e.target.value) || 20)))}
                min={5}
                max={100}
                className="w-16 px-2 py-1 bg-[#09090b] border border-[#3f3f46] rounded-lg text-zinc-200 text-sm text-center font-mono focus:outline-none focus:border-primary-500/50"
              />
            </div>
            <button
              onClick={handleExtract}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <KeyRound className="w-4 h-4" />
              提取关键词
            </button>
            <button
              onClick={handleCopy}
              disabled={keywords.length === 0}
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-4">
            <div className="lg:col-span-2 border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">输入文本</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="在此输入或粘贴文本...\n\n支持中英文混合文本，自动过滤停用词，提取高频关键词。"
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="lg:col-span-3 border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-zinc-300">关键词排行</span>
                </div>
                {keywords.length > 0 && (
                  <span className="text-xs text-zinc-500">共 {keywords.length} 个关键词</span>
                )}
              </div>
              <div className="h-80 overflow-y-auto p-2">
                {keywords.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-600 text-sm">
                    提取的关键词将显示在这里...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {keywords.map((kw, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 hover:bg-[#27272a]/50 rounded-lg">
                        <span className={`w-6 h-6 flex items-center justify-center text-xs font-bold rounded ${
                          i < 3 ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white" : "bg-[#27272a] text-zinc-500"
                        }`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-zinc-200 min-w-[100px] font-medium">
                          {kw.word}
                        </span>
                        <div className="flex-1 h-2 bg-[#27272a] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                            style={{ width: `${(kw.count / maxCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-zinc-400 w-12 text-right">
                          {kw.count} 次
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            从文本中自动提取关键词和高频词汇，支持中英文，快速获取文章核心词汇。基于词频统计算法，自动过滤中英文停用词，
            支持自定义提取数量。常用于SEO优化、文章摘要、内容分析、
            标签生成等场景。所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
