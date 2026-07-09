"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Blend, Copy, Check, Shuffle } from "lucide-react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function mixColors(color1: string, color2: string, ratio: number): string {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);
  if (!c1 || !c2) return "#000000";
  const r = Math.round(c1.r * (1 - ratio) + c2.r * ratio);
  const g = Math.round(c1.g * (1 - ratio) + c2.g * ratio);
  const b = Math.round(c1.b * (1 - ratio) + c2.b * ratio);
  return rgbToHex(r, g, b);
}

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export default function ColorMixerPage() {
  const [color1, setColor1] = useState("#ff0000");
  const [color2, setColor2] = useState("#0000ff");
  const [steps, setSteps] = useState(9);
  const [copied, setCopied] = useState<string | null>(null);

  const mixedColors = Array.from({ length: steps }, (_, i) => {
    const ratio = steps === 1 ? 0.5 : i / (steps - 1);
    return mixColors(color1, color2, ratio);
  });

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const swapColors = () => {
    setColor1(color2);
    setColor2(color1);
  };

  const randomColors = () => {
    const randomHex = () =>
      "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setColor1(randomHex());
    setColor2(randomHex());
  };

  return (
    <ToolLayout
      title="颜色混合器"
      description="混合两种颜色生成渐变色阶，自定义混合步数，获取中间过渡色"
      icon={Blend}
      category="设计工具"
      slug="color-mixer"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 颜色选择 */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Blend className="w-5 h-5" />
            <h2 className="text-base font-semibold">颜色混合器</h2>
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-end">
            <div>
              <label className="text-sm text-white/70 mb-2 block">颜色 A</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color1}
                  onChange={(e) => setColor1(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-3 border-white/30 shadow-lg bg-transparent p-0"
                />
                <input
                  type="text"
                  value={color1}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor1(e.target.value);
                  }}
                  className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            <button
              onClick={swapColors}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors mb-0.5"
              title="交换颜色"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <div>
              <label className="text-sm text-white/70 mb-2 block">颜色 B</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={color2}
                  onChange={(e) => setColor2(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border-3 border-white/30 shadow-lg bg-transparent p-0"
                />
                <input
                  type="text"
                  value={color2}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setColor2(e.target.value);
                  }}
                  className="flex-1 px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-white/70">混合步数:</span>
              <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
                {[3, 5, 7, 9, 11, 13].map((n) => (
                  <button
                    key={n}
                    onClick={() => setSteps(n)}
                    className={`px-3 py-1 text-sm rounded-md transition-all ${
                      steps === n
                        ? "bg-white text-teal-600 font-medium"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={randomColors}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <Shuffle className="w-4 h-4" />
              随机
            </button>
          </div>
        </div>

        {/* 混合结果 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
            <h3 className="text-base font-semibold text-white">混合结果</h3>
          </div>

          <div className="flex h-24">
            {mixedColors.map((color, i) => (
              <div
                key={i}
                className="flex-1 cursor-pointer transition-all hover:scale-y-110 hover:z-10 relative group"
                style={{ backgroundColor: color }}
                onClick={() => handleCopy(color)}
              >
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                  isLightColor(color) ? "text-slate-700" : "text-white"
                }`}>
                  {color}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
            {mixedColors.map((color, i) => (
              <div
                key={i}
                className="group rounded-lg overflow-hidden border border-[#27272a] hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleCopy(color)}
              >
                <div className="h-14" style={{ backgroundColor: color }} />
                <div className="p-2 bg-[#09090b] flex items-center justify-between">
                  <span className="text-xs text-slate-400">#{i + 1}</span>
                  {copied === color ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600 group-hover:text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 选择两种颜色作为混合的起始色和结束色</p>
            <p>2. 调整混合步数，生成更多或更少的中间色</p>
            <p>3. 点击任意颜色块可复制对应的HEX颜色代码</p>
            <p>4. 使用随机按钮快速生成不同的配色组合</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
