"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Palette, Copy, Check, Shuffle, Sliders } from "lucide-react";

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

function generateTailwindPalette(baseHex: string): Record<string, string> {
  const { h, s } = hexToHsl(baseHex);
  const shades: Record<string, string> = {};
  const lightnessMap: Record<string, number> = {
    "50": 97, "100": 93, "200": 86, "300": 76, "400": 63,
    "500": 50, "600": 40, "700": 32, "800": 25, "900": 18, "950": 10,
  };
  for (const [shade, lightness] of Object.entries(lightnessMap)) {
    shades[shade] = hslToHex(h, s, lightness);
  }
  return shades;
}

const shadeNames = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

function isLightColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  return hsl.l > 60;
}

export default function TailwindPalettePage() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const palette = generateTailwindPalette(baseColor);

  const randomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 60 + Math.floor(Math.random() * 30);
    const l = 45 + Math.floor(Math.random() * 15);
    setBaseColor(hslToHex(h, s, l));
  };

  const handleCopy = (shade: string) => {
    navigator.clipboard.writeText(palette[shade]);
    setCopied(shade);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAllCSS = () => {
    const css = Object.entries(palette)
      .map(([shade, hex]) => `  --color-${shade}: ${hex};`)
      .join("\n");
    navigator.clipboard.writeText(`:root {\n${css}\n}`);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <ToolLayout
      title="Tailwind调色板生成器"
      description="从一个基础色生成完整的Tailwind风格调色板，50-950共11个色阶"
      icon={Palette}
      category="设计工具"
      slug="tailwind-palette"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 颜色选择 */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5" />
            <h2 className="text-base font-semibold">Tailwind 调色板生成器</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={baseColor}
                  onChange={(e) => setBaseColor(e.target.value)}
                  className="w-14 h-14 rounded-xl cursor-pointer border-4 border-white/30 shadow-lg bg-transparent p-0"
                />
              </div>
              <div>
                <div className="text-xs text-white/70 mb-1">基础色</div>
                <input
                  type="text"
                  value={baseColor}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(val)) setBaseColor(val);
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
              <button
                onClick={copyAllCSS}
                className="px-4 py-2.5 bg-white text-violet-600 font-medium rounded-lg shadow-md hover:shadow-lg transition-all text-sm flex items-center gap-2"
              >
                {copied === "all" ? (
                  <><Check className="w-4 h-4" /> 已复制</>
                ) : (
                  <><Copy className="w-4 h-4" /> 复制CSS</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 调色板展示 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-violet-400" />
              调色板 (11色阶)
            </h3>
          </div>

          {/* 横向色带 */}
          <div className="flex h-24">
            {shadeNames.map((shade) => (
              <div
                key={shade}
                className="flex-1 relative group cursor-pointer transition-all hover:flex-[1.2] hover:z-10"
                style={{ backgroundColor: palette[shade] }}
                onClick={() => handleCopy(shade)}
              >
                <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ${
                  isLightColor(palette[shade]) ? "text-slate-700" : "text-white"
                }`}>
                  {copied === shade ? "✓" : palette[shade]}
                </div>
              </div>
            ))}
          </div>

          {/* 详细列表 */}
          <div className="divide-y divide-[#27272a]">
            {shadeNames.map((shade) => (
              <div
                key={shade}
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#09090b] transition-colors cursor-pointer group"
                onClick={() => handleCopy(shade)}
              >
                <div
                  className="w-12 h-12 rounded-lg border border-[#27272a] shadow-sm"
                  style={{ backgroundColor: palette[shade] }}
                />
                <div className="w-16 text-sm font-medium text-slate-400">
                  {shade}
                </div>
                <div className="flex-1 font-mono text-sm text-white">
                  {palette[shade].toUpperCase()}
                </div>
                <button
                  className="p-1.5 text-slate-600 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  {copied === shade ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* CSS变量代码 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">CSS 变量代码</h3>
          <pre className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] text-sm text-emerald-400 overflow-x-auto">
{`:root {
${Object.entries(palette).map(([shade, hex]) => `  --color-${shade}: ${hex};`).join("\n")}
}`}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
