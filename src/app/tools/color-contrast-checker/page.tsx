"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Contrast, Copy, Check, AlertCircle, CheckCircle } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

interface WCAGResult {
  level: string;
  pass: boolean;
  label: string;
}

function getWCAGLevels(ratio: number, size: "normal" | "large"): WCAGResult[] {
  const thresholds = size === "large"
    ? { AA: 3, AAA: 4.5 }
    : { AA: 4.5, AAA: 7 };

  return [
    { level: "AA", pass: ratio >= thresholds.AA, label: "AA 合格" },
    { level: "AAA", pass: ratio >= thresholds.AAA, label: "AAA 优秀" },
  ];
}

const presetPairs = [
  { fg: "#ffffff", bg: "#000000", name: "黑白经典" },
  { fg: "#1f2937", bg: "#f3f4f6", name: "深灰/浅灰" },
  { fg: "#4f46e5", bg: "#eef2ff", name: "靛蓝/浅靛" },
  { fg: "#dc2626", bg: "#fef2f2", name: "红色/浅红" },
  { fg: "#059669", bg: "#ecfdf5", name: "绿色/浅绿" },
  { fg: "#ffffff", bg: "#6366f1", name: "白/靛蓝" },
];

export default function ColorContrastCheckerPage() {
  const [foreground, setForeground] = useState("#ffffff");
  const [background, setBackground] = useState("#18181b");
  const [copied, setCopied] = useState(false);
  const [textSize, setTextSize] = useState<"normal" | "large">("normal");

  const ratio = getContrastRatio(foreground, background);
  const wcagResults = getWCAGLevels(ratio, textSize);

  const swapColors = () => {
    const temp = foreground;
    setForeground(background);
    setBackground(temp);
  };

  const applyPreset = (preset: typeof presetPairs[0]) => {
    setForeground(preset.fg);
    setBackground(preset.bg);
  };

  const copyRatio = useCallback(() => {
    navigator.clipboard.writeText(ratio.toFixed(2) + ":1");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [ratio]);

  const overallPass = wcagResults.every((r) => r.pass);

  return (
    <ToolLayout
      title="颜色对比度检测"
      description="检测两种颜色的对比度是否符合 WCAG 无障碍标准，支持 AA/AAA 级别评估"
      icon={Contrast}
      category="生成工具"
      slug="color-contrast-checker"
      toolId="color-contrast-checker"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Contrast className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-medium text-white">对比度检测</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">文字大小：</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setTextSize("normal")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  textSize === "normal"
                    ? "bg-[#27272a] text-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                普通
              </button>
              <button
                onClick={() => setTextSize("large")}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  textSize === "large"
                    ? "bg-[#27272a] text-cyan-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                大号
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div
          className="rounded-2xl p-8 border border-[#27272a] transition-colors"
          style={{ backgroundColor: background }}
        >
          <div style={{ color: foreground }}>
            <div className="text-3xl font-bold mb-3">颜色对比度测试</div>
            <p className="text-base mb-2">
              这是一段测试文字，用于检测前景色与背景色的对比度。
            </p>
            <p className="text-sm opacity-80">
              Color contrast test text sample for accessibility evaluation.
            </p>
          </div>
        </div>

        {/* 颜色选择器 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-3">前景色（文字）</div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={foreground}
                onChange={(e) => setForeground(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none"
              />
            </div>
          </div>

          <button
            onClick={swapColors}
            className="w-10 h-10 flex items-center justify-center bg-[#27272a] hover:bg-[#3f3f46] rounded-xl text-slate-400 hover:text-white transition-colors mx-auto"
            title="交换颜色"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 16V4M7 4L3 8M7 4l4 4" />
              <path d="M17 8v12M17 20l-4-4M17 20l4-4" />
            </svg>
          </button>

          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-3">背景色</div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="w-12 h-12 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                className="flex-1 px-3 py-2 bg-transparent border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 对比度结果 */}
        <div
          className={`rounded-2xl p-6 border transition-all ${
            overallPass
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-red-500/5 border-red-500/20"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {overallPass ? (
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <div className="text-lg font-bold text-white">
                  对比度：{ratio.toFixed(2)} : 1
                </div>
                <div className="text-sm text-slate-400">
                  {overallPass ? "符合无障碍标准" : "对比度不足，建议调整"}
                </div>
              </div>
            </div>
            <button
              onClick={copyRatio}
              className="p-2 text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              {copied ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {wcagResults.map((result) => (
              <div
                key={result.level}
                className={`p-4 rounded-xl border ${
                  result.pass
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.pass ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span
                    className={`font-bold ${
                      result.pass ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    WCAG {result.level}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  {result.pass ? "通过" : "未通过"} · {result.label}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  最低要求 {textSize === "large" ? (result.level === "AA" ? "3:1" : "4.5:1") : (result.level === "AA" ? "4.5:1" : "7:1")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 预设方案 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">预设配色</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {presetPairs.map((preset, idx) => {
              const presetRatio = getContrastRatio(preset.fg, preset.bg);
              const presetPass = presetRatio >= (textSize === "large" ? 3 : 4.5);
              return (
                <button
                  key={idx}
                  onClick={() => applyPreset(preset)}
                  className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors text-left"
                >
                  <div className="flex -space-x-1">
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-[#18181b]"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-[#18181b]"
                      style={{ backgroundColor: preset.bg }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{preset.name}</div>
                    <div
                      className={`text-xs ${
                        presetPass ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {presetRatio.toFixed(2)}:1
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">WCAG 标准说明</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• AA 级（合格）：普通文字对比度 ≥ 4.5:1，大号文字 ≥ 3:1</li>
          <li>• AAA 级（优秀）：普通文字对比度 ≥ 7:1，大号文字 ≥ 4.5:1</li>
          <li>• 大号文字指 18pt 以上或加粗 14pt 以上的文字</li>
          <li>• 对比度基于 WCAG 2.1 标准的相对亮度算法计算</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
