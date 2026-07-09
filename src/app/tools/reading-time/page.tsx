"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Clock, Copy, Check, Trash2, Info, BookOpen } from "lucide-react";

interface ReadingResult {
  minutes: number;
  seconds: number;
  totalWords: number;
  chineseChars: number;
  englishWords: number;
  formatted: string;
}

function calculateReadingTime(text: string, speed: number): ReadingResult {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const digits = (text.match(/[0-9]+/g) || []).length;
  const totalWords = chineseChars + englishWords + digits;
  
  const totalSeconds = Math.ceil((totalWords / speed) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  let formatted = "";
  if (minutes > 0) {
    formatted += `${minutes} 分钟`;
    if (seconds > 0) formatted += ` ${seconds} 秒`;
  } else {
    formatted = `${seconds} 秒`;
  }
  
  return { minutes, seconds, totalWords, chineseChars, englishWords, formatted };
}

export default function ReadingTimePage() {
  const [text, setText] = useState("");
  const [speed, setSpeed] = useState(300);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => calculateReadingTime(text, speed), [text, speed]);

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

  const speedPresets = [
    { value: 200, label: "慢速" },
    { value: 300, label: "正常" },
    { value: 500, label: "快速" },
    { value: 800, label: "极速" },
  ];

  return (
    <ToolLayout
      title="阅读时间估算"
      description="估算阅读文本所需的时间，支持自定义阅读速度，中英文自适应，实时计算更新"
      toolId="reading-time"
      icon={Clock}
      category="文本工具"
      slug="reading-time"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                阅读速度设置
              </h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              {speedPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => setSpeed(preset.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    speed === preset.value
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {preset.label} ({preset.value} 字/分)
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 w-20">自定义</span>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-sm font-medium text-pink-500 w-20 text-right">
                {speed} 字/分
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-pink-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    输入文本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {text.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="在此输入或粘贴要估算阅读时间的文本..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleClear}
                disabled={!text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  估算结果
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-pink-500 mb-2">
                  {result.formatted || "0 秒"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  预计阅读时间
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                  <div className="text-xl font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    {result.totalWords.toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">总字数</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
                  <div className="text-xl font-bold text-red-500 mb-1">
                    {result.chineseChars.toLocaleString()}
                  </div>
                  <div className="text-xs text-red-500 dark:text-red-400">中文字</div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center">
                  <div className="text-xl font-bold text-blue-500 mb-1">
                    {result.englishWords.toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-500 dark:text-blue-400">英文词</div>
                </div>
              </div>
            </div>
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-pink-500 dark:hover:text-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                ) : (
                  <><Copy className="w-4 h-4" /> 复制文本</>
                )}
              </button>
            </div>
          </div>
        </div>

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
                阅读速度多少合适？
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                普通人的阅读速度约为 300-500 字/分钟。慢速阅读适合精读学习，
                快速阅读适合浏览信息。您可以根据自己的习惯调整速度。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
