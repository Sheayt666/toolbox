"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check, Trash2, FileText, Info } from "lucide-react";

interface CountResult {
  totalChars: number;
  charsNoSpaces: number;
  chineseChars: number;
  englishChars: number;
  digits: number;
  punctuation: number;
  words: number;
  englishWords: number;
  lines: number;
  paragraphs: number;
  spaces: number;
}

function countText(text: string): CountResult {
  // 中文字符
  const chineseMatches = text.match(/[\u4e00-\u9fa5]/g);
  const chineseChars = chineseMatches ? chineseMatches.length : 0;

  // 英文字符
  const englishMatches = text.match(/[a-zA-Z]/g);
  const englishChars = englishMatches ? englishMatches.length : 0;

  // 数字
  const digitMatches = text.match(/[0-9]/g);
  const digits = digitMatches ? digitMatches.length : 0;

  // 标点符号（中英文标点）
  const punctuationMatches = text.match(/[，。！？、；：""''（）《》【】…—\-.,!?;:'"()\[\]{}<>]/g);
  const punctuation = punctuationMatches ? punctuationMatches.length : 0;

  // 空格
  const spaceMatches = text.match(/\s/g);
  const spaces = spaceMatches ? spaceMatches.length : 0;

  // 总字符数
  const totalChars = text.length;

  // 不含空格字符数
  const charsNoSpaces = totalChars - spaces;

  // 英文单词数
  const englishWordMatches = text.match(/[a-zA-Z]+/g);
  const englishWords = englishWordMatches ? englishWordMatches.length : 0;

  // 总字数（中文按字算，英文按单词算）
  const words = chineseChars + englishWords + digits;

  // 行数
  const lines = text.length === 0 ? 0 : text.split("\n").length;

  // 段落数（非空行的段落）
  const paragraphMatches = text.match(/[^\n]+/g);
  const nonEmptyLines = paragraphMatches ? paragraphMatches.filter(l => l.trim().length > 0).length : 0;
  const paragraphs = nonEmptyLines;

  return {
    totalChars,
    charsNoSpaces,
    chineseChars,
    englishChars,
    digits,
    punctuation,
    words,
    englishWords,
    lines,
    paragraphs,
    spaces,
  };
}

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => countText(text), [text]);

  const handleClear = () => {
    setText("");
  };

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const statItems = [
    { label: "总字符数", value: result.totalChars, icon: Type, color: "text-sky-500" },
    { label: "不含空格", value: result.charsNoSpaces, icon: FileText, color: "text-blue-500" },
    { label: "中文字符", value: result.chineseChars, icon: Type, color: "text-red-500" },
    { label: "英文字符", value: result.englishChars, icon: Type, color: "text-indigo-500" },
    { label: "数字字符", value: result.digits, icon: Type, color: "text-emerald-500" },
    { label: "标点符号", value: result.punctuation, icon: Type, color: "text-amber-500" },
    { label: "总字数", value: result.words, icon: Type, color: "text-violet-500" },
    { label: "英文单词", value: result.englishWords, icon: Type, color: "text-purple-500" },
    { label: "行数", value: result.lines, icon: Type, color: "text-pink-500" },
    { label: "段落数", value: result.paragraphs, icon: Type, color: "text-rose-500" },
    { label: "空格数", value: result.spaces, icon: Type, color: "text-slate-500" },
  ];

  return (
    <ToolLayout
      title="字数统计"
      description="在线统计文本的字符数、字数、行数、段落数，支持中英文分开统计"
      toolId="word-counter"
      icon={Type}
      category="文本工具"
      slug="word-counter"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Type className="w-5 h-5 text-sky-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  输入文本
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-sky-500 dark:hover:text-sky-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 复制</>
                  )}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  清空
                </button>
              </div>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="在此输入或粘贴要统计的文本..."
            className="w-full h-64 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
          />
        </div>

        {/* 统计结果 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                统计结果
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {statItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center"
                  >
                    <div className={`text-2xl font-bold ${item.color} mb-1`}>
                      {item.value.toLocaleString()}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {item.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              字数统计工具可以快速统计文本中的字符数、字数、行数、段落数等信息，
              支持中文字符和英文字符分开统计。无论是写作文、做文案还是编程，
              都可以用这个工具来掌握文本的长度信息。
            </p>
            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <p className="text-sky-700 dark:text-sky-300 font-medium mb-2">
                统计规则说明
              </p>
              <ul className="text-sky-600 dark:text-sky-400 text-xs space-y-1">
                <li>• 总字符数：包括所有字符（含空格、换行）</li>
                <li>• 总字数：中文字符数 + 英文单词数 + 数字字符数</li>
                <li>• 段落数：非空行的数量</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              常见问题
            </h3>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                字数和字符数有什么区别？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                字符数是每个字符都算一个，包括空格和标点。字数统计中，
                中文字符每个算一个字，英文连续字母算一个单词，数字也计入字数。
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
              <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2 text-sm">
                支持最大多少字的文本？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                本工具在浏览器本地运行，理论上支持非常大的文本。
                但为了保证流畅体验，建议单次统计不超过10万字。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
