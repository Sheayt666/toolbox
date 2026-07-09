"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ArrowRightLeft, Copy, Check, RefreshCw } from "lucide-react";

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
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

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default function RgbToHslPage() {
  const [r, setR] = useState(99);
  const [g, setG] = useState(102);
  const [b, setB] = useState(241);
  const [copied, setCopied] = useState(false);

  const hsl = rgbToHsl(r, g, b);
  const hexColor = rgbToHex(r, g, b);

  const handleCopy = () => {
    const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    navigator.clipboard.writeText(hslStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const randomColor = () => {
    setR(Math.floor(Math.random() * 256));
    setG(Math.floor(Math.random() * 256));
    setB(Math.floor(Math.random() * 256));
  };

  const isLight = hsl.l > 60;

  return (
    <ToolLayout
      title="RGB转HSL"
      description="快速将RGB颜色转换为HSL色彩空间，支持色相、饱和度、亮度可视化"
      icon={ArrowRightLeft}
      category="设计工具"
      slug="rgb-to-hsl"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 输入区域 */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25">
          <div className="flex items-center gap-2 mb-6">
            <ArrowRightLeft className="w-5 h-5" />
            <h2 className="text-base font-semibold">RGB 转 HSL</h2>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "R", value: r, setValue: setR, color: "red" },
              { label: "G", value: g, setValue: setG, color: "green" },
              { label: "B", value: b, setValue: setB, color: "blue" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={item.value}
                    onChange={(e) => {
                      const val = Math.min(255, Math.max(0, Number(e.target.value) || 0));
                      item.setValue(val);
                    }}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-mono text-right focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={item.value}
                  onChange={(e) => item.setValue(Number(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
                  style={{
                    background: item.color === "red"
                      ? `linear-gradient(to right, rgb(0, ${g}, ${b}), rgb(255, ${g}, ${b}))`
                      : item.color === "green"
                      ? `linear-gradient(to right, rgb(${r}, 0, ${b}), rgb(${r}, 255, ${b}))`
                      : `linear-gradient(to right, rgb(${r}, ${g}, 0), rgb(${r}, ${g}, 255))`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl border-2 border-white/30 shadow-lg"
              style={{ backgroundColor: hexColor }}
            />
            <div className="font-mono text-lg font-bold">{hexColor.toUpperCase()}</div>
            <button
              onClick={randomColor}
              className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              随机
            </button>
          </div>
        </div>

        {/* HSL 输出 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">HSL 结果</h3>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              复制
            </button>
          </div>

          <div className="p-6">
            <div className="text-center mb-6">
              <div
                className="text-2xl font-mono font-bold mb-2 p-4 rounded-xl inline-block"
                style={{ backgroundColor: hexColor, color: isLight ? "#1f2937" : "#fff" }}
              >
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#09090b] rounded-xl p-4 border border-[#27272a] text-center">
                <div className="text-2xl font-bold text-white mb-1">{hsl.h}°</div>
                <div className="text-xs text-slate-500">色相 Hue</div>
                <div
                  className="h-2 rounded-full mt-3"
                  style={{
                    background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full bg-white border-2 border-slate-700 -mt-0.5 shadow-md"
                    style={{ marginLeft: `calc(${hsl.h / 360 * 100}% - 6px)` }}
                  />
                </div>
              </div>

              <div className="bg-[#09090b] rounded-xl p-4 border border-[#27272a] text-center">
                <div className="text-2xl font-bold text-white mb-1">{hsl.s}%</div>
                <div className="text-xs text-slate-500">饱和度 Saturation</div>
                <div
                  className="h-2 rounded-full mt-3"
                  style={{
                    background: `linear-gradient(to right, hsl(${hsl.h}, 0%, ${hsl.l}%), hsl(${hsl.h}, 100%, ${hsl.l}%))`,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full bg-white border-2 border-slate-700 -mt-0.5 shadow-md"
                    style={{ marginLeft: `calc(${hsl.s}% - 6px)` }}
                  />
                </div>
              </div>

              <div className="bg-[#09090b] rounded-xl p-4 border border-[#27272a] text-center">
                <div className="text-2xl font-bold text-white mb-1">{hsl.l}%</div>
                <div className="text-xs text-slate-500">亮度 Lightness</div>
                <div
                  className="h-2 rounded-full mt-3"
                  style={{
                    background: `linear-gradient(to right, hsl(${hsl.h}, ${hsl.s}%, 0%), hsl(${hsl.h}, ${hsl.s}%, 100%))`,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-full bg-white border-2 border-slate-700 -mt-0.5 shadow-md"
                    style={{ marginLeft: `calc(${hsl.l}% - 6px)` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 反向转换 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">多种格式输出</h3>
          <div className="space-y-2">
            {[
              { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
              { label: "HSLA (alpha)", value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
              { label: "RGB", value: `rgb(${r}, ${g}, ${b})` },
              { label: "RGBA (alpha)", value: `rgba(${r}, ${g}, ${b}, 1)` },
              { label: "HEX", value: hexColor.toUpperCase() },
            ].map((fmt) => (
              <div
                key={fmt.label}
                className="flex items-center justify-between p-3 bg-[#09090b] rounded-lg border border-[#27272a] hover:border-violet-500/50 transition-colors cursor-pointer group"
                onClick={() => {
                  navigator.clipboard.writeText(fmt.value);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                <span className="text-xs text-slate-500 w-28">{fmt.label}</span>
                <span className="font-mono text-sm text-slate-300">{fmt.value}</span>
                <Copy className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
