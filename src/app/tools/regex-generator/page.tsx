"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Code, Copy, Check, Play } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Preset { label: string; pattern: string; desc: string; }

const PRESETS: Preset[] = [
  { label: "邮箱地址", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", desc: "匹配标准邮箱格式" },
  { label: "手机号(中国)", pattern: "^1[3-9]\\d{9}$", desc: "匹配中国大陆手机号" },
  { label: "URL网址", pattern: "^https?://[\\w.-]+(?:\\.[\\w.-]+)+(?:/[\\w._~:/?#@!$&'()*+,;=%-]*)?$", desc: "匹配 http/https 网址" },
  { label: "IPv4地址", pattern: "^((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d)$", desc: "匹配标准IPv4地址" },
  { label: "身份证号", pattern: "^\\d{17}[\\dXx]$", desc: "匹配18位身份证号" },
  { label: "日期 YYYY-MM-DD", pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$", desc: "匹配标准日期格式" },
  { label: "整数", pattern: "^-?\\d+$", desc: "匹配正负整数" },
  { label: "小数", pattern: "^-?\\d+\\.\\d+$", desc: "匹配正负小数" },
  { label: "邮编", pattern: "^\\d{6}$", desc: "匹配6位邮政编码" },
  { label: "字母数字下划线", pattern: "^\\w+$", desc: "匹配单词字符" },
  { label: "强密码", pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*]).{8,}$", desc: "至少8位含大小写数字特殊字符" },
  { label: "中文字符", pattern: "[\\u4e00-\\u9fa5]+", desc: "匹配中文字符" },
];

export default function RegexGeneratorPage() {
  const [pattern, setPattern] = useState(PRESETS[0].pattern);
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("hello@example.com, 测试13800138000, https://example.com");
  const [copied, setCopied] = useState(false);

  const { error, matches, highlighted } = useMemo(() => {
    try {
      const re = new RegExp(pattern, flags);
      const found: string[] = [];
      if (flags.includes("g")) {
        let m: RegExpExecArray | null;
        const reG = new RegExp(pattern, flags);
        while ((m = reG.exec(testText)) !== null) {
          found.push(m[0]);
          if (m.index === reG.lastIndex) reG.lastIndex++;
        }
      } else {
        const m = re.exec(testText);
        if (m) found.push(m[0]);
      }
      // 高亮
      const esc = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\\/g, "\\");
      const reG = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const html = testText.replace(reG, (m) => `<mark class="bg-primary-500/30 text-primary-300 rounded px-0.5">${m}</mark>`);
      return { error: null, matches: found, highlighted: html };
    } catch (e) {
      return { error: (e as Error).message, matches: [], highlighted: testText };
    }
  }, [pattern, flags, testText]);

  const copy = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="正则表达式生成"
      description="通过描述生成正则表达式"
      icon={Code}
      category="开发工具"
      slug="regex-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">常用预设</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPattern(p.pattern)}
                className={`px-3 py-2 text-xs rounded-lg border text-left transition-colors ${
                  pattern === p.pattern
                    ? "border-primary-500/50 bg-primary-500/10 text-primary-400"
                    : "border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:border-[#3f3f46]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">正则表达式</label>
          <div className="flex gap-2">
            <div className="flex items-center bg-[#0a0a0b] border border-[#27272a] rounded-lg flex-1">
              <span className="text-slate-500 pl-3 font-mono">/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="bg-transparent flex-1 px-2 py-2 text-sm text-white font-mono focus:outline-none"
              />
              <span className="text-slate-500 font-mono">/</span>
              <input
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="gim"
                className="w-14 bg-transparent px-2 py-2 text-sm text-white font-mono focus:outline-none"
              />
            </div>
            <button onClick={copy} className="inline-flex items-center gap-1 px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm rounded-lg">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">测试文本</label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={3}
            className={inputClass + " resize-y"}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">高亮匹配</label>
            <div
              className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 text-sm text-slate-300 min-h-[80px] break-all"
              dangerouslySetInnerHTML={{ __html: highlighted || '<span class="text-slate-600">无</span>' }}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">匹配结果（{matches.length}）</label>
            </div>
            <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-3 min-h-[80px] max-h-[160px] overflow-y-auto space-y-1">
              {matches.length === 0 ? (
                <p className="text-xs text-slate-600">无匹配项</p>
              ) : (
                matches.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">{i + 1}.</span>
                    <span className="text-primary-300 font-mono break-all">{m}</span>
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
