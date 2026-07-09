"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sun, Copy, Check, Shuffle, Palette } from "lucide-react";

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
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
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateShades(baseHex: string, count: number): string[] {
  const { h, s } = hexToHsl(baseHex);
  const shades: string[] = [];
  for (let i = 0; i < count; i++) {
    const lightness = Math.round(10 + (80 * i) / (count - 1));
    shades.push(hslToHex(h, s, lightness));
  }
  return shades;
}

function isLightColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  return hsl.l > 60;
}

export default function ColorShadesGeneratorPage() {
  const [baseColor, setBaseColor] = useState("#ec4899");
  const [shadeCount, setShadeCount] = useState(11);
  const [copied, setCopied] = useState<string | null>(null);

  const shades = generateShades(baseColor, shadeCount);

  const randomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 30);
    const l = 50;
    setBaseColor(hslToHex(h, s, l));
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout
      title="颜色明度渐变生成器"
      description="从基础色生成不同明度的色阶，用于UI设计的颜色系统"
      icon={Sun}
      category="设计工具"
      slug="color-shades-generator"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 控制面板 */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-pink-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5" />
            <h2 className="text-base font-semibold">颜色明度渐变</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                className="w-14 h-14 rounded-xl cursor-pointer border-4 border-white/30 shadow-lg bg-transparent p-0"
              />
              <div>
                <div className="text-xs text-white/70 mb-1">基础色</div>
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setBaseColor(e.target.value);
                  }}
                  className="w-28 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
            </div>

            <div className="flex gap-2 ml-auto">
              <button
                onClick={randomColor}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <Shuffle className="w-4 h-4" />
                随机
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-white/70">色阶数量:</span>
            <div className="flex gap-1 bg-white/10 p-1 rounded-lg">
              {[5, 7, 9, 11, 13, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setShadeCount(n)}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    shadeCount === n
                      ? "bg-white text-pink-600 font-medium"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 色阶展示 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">色阶 ({shadeCount}级)</h3>
            <span className="text-xs text-slate-500">点击复制 HEX</span>
          </div>

          <div className="flex h-32">
            {shades.map((color, i) => (
              <div
                key={i}
                className="flex-1 cursor-pointer transition-all hover:flex-[1.3] hover:z-10 relative group"
                style={{ backgroundColor: color }}
                onClick={() => handleCopy(color)}
              >
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap font-medium ${
                  isLightColor(color) ? "text-slate-800" : "text-white"
                }`}>
                  {copied === color ? "✓ 已复制" : color}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
            {shades.map((color, i) => (
              <div
                key={i}
                className="group rounded-lg overflow-hidden border border-[#27272a] hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleCopy(color)}
              >
                <div className="h-16" style={{ backgroundColor: color }} />
                <div className="p-2 bg-[#09090b] text-center">
                  <div className="text-xs text-slate-500 mb-0.5">
                    {Math.round(10 + (80 * i) / (shadeCount - 1))}%
                  </div>
                  <div className={`font-mono text-xs ${
                    copied === color ? "text-emerald-400" : "text-slate-300"
                  }`}>
                    {copied === color ? "已复制" : color}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">应用场景</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-400">
            <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="text-white font-medium mb-1">UI 设计</div>
              <p className="text-xs leading-relaxed">
                为按钮、卡片、背景等元素提供统一的颜色深浅变化
              </p>
            </div>
            <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="text-white font-medium mb-1">数据可视化</div>
              <p className="text-xs leading-relaxed">
                图表中的同一色系数据系列使用不同明度区分
              </p>
            </div>
            <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="text-white font-medium mb-1">悬停效果</div>
              <p className="text-xs leading-relaxed">
                按钮 hover 和 active 状态使用相邻色阶实现
              </p>
            </div>
            <div className="p-4 bg-[#09090b] rounded-xl border border-[#27272a]">
              <div className="text-white font-medium mb-1">渐变背景</div>
              <p className="text-xs leading-relaxed">
                用首尾两色创建柔和的同色系渐变效果
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
