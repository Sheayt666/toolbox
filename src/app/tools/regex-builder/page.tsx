"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Regex,
  Play,
  Copy,
  Check,
  Trash2,
  Type,
} from "lucide-react";

const patternGroups = [
  {
    name: "常用字符",
    patterns: [
      { label: "数字", value: "\\d", desc: "匹配数字[0-9]" },
      { label: "非数字", value: "\\D", desc: "匹配非数字" },
      { label: "字母数字", value: "\\w", desc: "匹配[a-zA-Z0-9_]" },
      { label: "空白", value: "\\s", desc: "匹配空白字符" },
      { label: "任意字符", value: ".", desc: "匹配任意字符" },
      { label: "单词边界", value: "\\b", desc: "匹配单词边界" },
    ],
  },
  {
    name: "量词",
    patterns: [
      { label: "零或多个", value: "*", desc: "匹配0次或多次" },
      { label: "一或多个", value: "+", desc: "匹配1次或多次" },
      { label: "零或一个", value: "?", desc: "匹配0次或1次" },
      { label: "精确n次", value: "{n}", desc: "精确匹配n次" },
      { label: "至少n次", value: "{n,}", desc: "至少匹配n次" },
      { label: "n到m次", value: "{n,m}", desc: "匹配n到m次" },
    ],
  },
  {
    name: "锚点",
    patterns: [
      { label: "开头", value: "^", desc: "匹配字符串开头" },
      { label: "结尾", value: "$", desc: "匹配字符串结尾" },
    ],
  },
];

export default function RegexBuilderPage() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [flags, setFlags] = useState({ g: true, i: false, m: false });

  const addPattern = useCallback((val: string) => {
    setPattern((prev) => prev + val);
  }, []);

  const handleTest = useCallback(() => {
    setError("");
    if (!pattern) {
      setError("请输入正则表达式");
      return;
    }
    try {
      const flagStr = Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join("");
      const regex = new RegExp(pattern, flagStr);
      const matches = testText.match(regex);
      
      if (!matches) {
        setResult("未找到匹配项");
      } else {
        setResult(`找到 ${matches.length} 个匹配项:\n\n` + matches.map((m, i) => `${i + 1}. ${m}`).join("\n"));
      }
    } catch (e) {
      setError("正则表达式错误: " + (e as Error).message);
    }
  }, [pattern, testText, flags]);

  const handleCopy = useCallback(async () => {
    if (!pattern) return;
    try {
      await navigator.clipboard.writeText(pattern);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [pattern]);

  const handleClear = useCallback(() => {
    setPattern("");
    setTestText("");
    setResult("");
    setError("");
  }, []);

  const toggleFlag = useCallback((flag: "g" | "i" | "m") => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  return (
    <ToolLayout
      title="正则表达式构建器"
      description="可视化构建正则表达式，支持常用模式选择，实时测试匹配结果"
      toolId="regex-builder"
      icon={Regex}
      category="开发工具"
      slug="regex-builder"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm text-zinc-400">正则表达式:</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入或点击下方构建正则表达式..."
                spellCheck={false}
                className="flex-1 px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-zinc-200 font-mono text-sm focus:outline-none focus:border-primary-500/50 placeholder-zinc-600"
              />
              <button
                onClick={handleCopy}
                disabled={!pattern}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">标志:</span>
              {(["g", "i", "m"] as const).map((f) => (
                <label key={f} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flags[f]}
                    onChange={() => toggleFlag(f)}
                    className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-primary-500 focus:ring-primary-500/50"
                  />
                  <span className="text-sm text-zinc-300 font-mono">{f}</span>
                  <span className="text-xs text-zinc-500">
                    {f === "g" ? "全局" : f === "i" ? "忽略大小写" : "多行"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Pattern builder */}
          <div className="p-4 border-b border-[#27272a] bg-[#09090b]/50">
            <div className="text-sm font-medium text-zinc-300 mb-3">点击添加模式</div>
            <div className="space-y-3">
              {patternGroups.map((group) => (
                <div key={group.name}>
                  <div className="text-xs text-zinc-500 mb-1.5">{group.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {group.patterns.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => addPattern(p.value)}
                        title={p.desc}
                        className="px-2.5 py-1.5 text-xs font-mono bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 rounded-lg transition-colors"
                      >
                        {p.label} <span className="text-zinc-500">({p.value})</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Type className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">测试文本</span>
              </div>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="在此输入要测试的文本...\n\n例如: hello@example.com\n电话: 13800138000"
                spellCheck={false}
                className="w-full h-48 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Regex className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">匹配结果</span>
              </div>
              <textarea
                value={result}
                readOnly
                placeholder="匹配结果将显示在这里..."
                className="w-full h-48 p-4 bg-transparent text-zinc-200 text-sm resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 px-4 pb-4">
            <button
              onClick={handleTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              测试匹配
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
            {error && (
              <span className="text-sm text-red-400">{error}</span>
            )}
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            可视化构建正则表达式，支持常用模式选择，实时测试匹配结果。支持全局匹配(g)、忽略大小写(i)、多行模式(m)等常用标志，
            点击常用模式即可快速构建正则表达式，实时测试匹配结果。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
