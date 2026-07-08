"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, AlertCircle, RefreshCw, Info, FileCode } from "lucide-react";

interface MatchInfo {
  match: string;
  index: number;
  groups: string[];
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [copied, setCopied] = useState(false);

  const flagString = useMemo(() => {
    return Object.entries(flags)
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join("");
  }, [flags]);

  const { matches, error, highlightedParts } = useMemo(() => {
    if (!pattern) {
      return {
        matches: [] as MatchInfo[],
        error: null,
        highlightedParts: testText
          ? [{ text: testText, isMatch: false }]
          : [],
      };
    }

    try {
      const regex = new RegExp(pattern, flagString);
      const matchList: MatchInfo[] = [];
      const parts: { text: string; isMatch: boolean }[] = [];

      if (flags.g) {
        let match;
        let lastIndex = 0;
        while ((match = regex.exec(testText)) !== null) {
          if (match.index > lastIndex) {
            parts.push({ text: testText.slice(lastIndex, match.index), isMatch: false });
          }
          parts.push({ text: match[0], isMatch: true });
          matchList.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
          lastIndex = match.index + match[0].length;
          // 防止零宽匹配导致的无限循环
          if (match[0].length === 0) {
            regex.lastIndex++;
          }
        }
        if (lastIndex < testText.length) {
          parts.push({ text: testText.slice(lastIndex), isMatch: false });
        }
      } else {
        const match = regex.exec(testText);
        if (match) {
          if (match.index > 0) {
            parts.push({ text: testText.slice(0, match.index), isMatch: false });
          }
          parts.push({ text: match[0], isMatch: true });
          if (match.index + match[0].length < testText.length) {
            parts.push({
              text: testText.slice(match.index + match[0].length),
              isMatch: false,
            });
          }
          matchList.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
          });
        } else {
          parts.push({ text: testText, isMatch: false });
        }
      }

      return { matches: matchList, error: null, highlightedParts: parts };
    } catch (e) {
      return {
        matches: [] as MatchInfo[],
        error: (e as Error).message,
        highlightedParts: testText ? [{ text: testText, isMatch: false }] : [],
      };
    }
  }, [pattern, testText, flagString, flags.g]);

  const toggleFlag = useCallback((flag: keyof typeof flags) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const copyMatches = useCallback(() => {
    const text = matches.map((m) => m.match).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [matches]);

  const clearAll = useCallback(() => {
    setPattern("");
    setTestText("");
  }, []);

  const flagOptions = [
    { key: "g" as const, label: "g", desc: "全局匹配" },
    { key: "i" as const, label: "i", desc: "忽略大小写" },
    { key: "m" as const, label: "m", desc: "多行模式" },
    { key: "s" as const, label: "s", desc: "点号匹配换行" },
  ];

  return (
    <ToolLayout
      title="正则表达式测试工具"
      description="实时测试正则表达式，高亮匹配结果，支持多种标志位和替换功能"
      icon={FileCode}
      category="开发工具"
      slug="regex-tester"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：输入区 */}
        <div className="space-y-6">
          {/* 正则表达式输入区*/}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                正则表达式
              </label>
              <button
                onClick={clearAll}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                清空
              </button>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg text-slate-400 font-mono">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式，如\d+"
                className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm"
              />
              <span className="text-lg text-slate-400 font-mono">/{flagString}</span>
            </div>

            {/* Flags 选项 */}
            <div className="flex flex-wrap gap-2">
              {flagOptions.map((flag) => (
                <button
                  key={flag.key}
                  onClick={() => toggleFlag(flag.key)}
                  title={flag.desc}
                  className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-all ${
                    flags[flag.key]
                      ? "bg-indigo-500 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {flag.label}
                  <span className="ml-1 font-sans opacity-70">{flag.desc}</span>
                </button>
              ))}
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
              </div>
            )}
          </div>

          {/* 测试文本输入 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                测试文本
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {testText.length} 字符
              </span>
            </div>
            <textarea
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              placeholder="在此输入要测试的文本..."
              rows={10}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y font-mono text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* 右侧：结果区 */}
        <div className="space-y-6">
          {/* 匹配高亮区*/}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  匹配结果高亮
                </label>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                  {matches.length} 个匹配
                </span>
              </div>
              {matches.length > 0 && (
                <button
                  onClick={copyMatches}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制全部
                    </>
                  )}
                </button>
              )}
            </div>
            <div className="min-h-[200px] max-h-[400px] overflow-auto p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap break-all">
              {testText ? (
                highlightedParts.length > 0 ? (
                  highlightedParts.map((part, i) =>
                    part.isMatch ? (
                      <mark
                        key={i}
                        className="bg-yellow-300/70 dark:bg-yellow-500/40 text-yellow-900 dark:text-yellow-100 rounded px-0.5"
                      >
                        {part.text}
                      </mark>
                    ) : (
                      <span key={i} className="text-slate-700 dark:text-slate-300">
                        {part.text}
                      </span>
                    )
                  )
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">无匹配结符</span>
                )
              ) : (
                <span className="text-slate-400 dark:text-slate-500">
                  请输入测试文本...
                </span>
              )}
            </div>
          </div>

          {/* 匹配详情列表 */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                匹配详情
              </label>
              <div className="group relative">
                <Info className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  显示每个匹配项及其位置和捕获组
                </div>
              </div>
            </div>
            <div className="max-h-[300px] overflow-auto space-y-2">
              {matches.length === 0 ? (
                <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
                  {pattern ? "暂无匹配结果" : "请输入正则表达式开始测试"}
                </div>
              ) : (
                matches.map((m, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        匹配 #{i + 1}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        索引: {m.index}
                      </span>
                    </div>
                    <code className="block px-2 py-1.5 bg-yellow-100/60 dark:bg-yellow-500/15 text-yellow-800 dark:text-yellow-200 rounded font-mono text-sm break-all">
                      {m.match || "(空字符串)"}
                    </code>
                    {m.groups.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {m.groups.map((g, gi) => (
                          <div key={gi} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 dark:text-slate-400">
                              组{gi + 1}:
                            </span>
                            <code className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded font-mono">
                              {g ?? "(undefined)"}
                            </code>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
