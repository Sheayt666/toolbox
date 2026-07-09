"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Palette, Copy, Check, RefreshCw, Lock, Unlock, Shuffle } from "lucide-react";

function randomHexColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

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

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let { r, g, b } = hexToRgb(hex);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function generateHarmoniousPalette(): string[] {
  const baseHue = Math.floor(Math.random() * 360);
  const palette: string[] = [];
  const schemes = [
    [0, 30, 60, 180, 210], // analogous + complement
    [0, 60, 120, 180, 240], // pentadic
    [0, 45, 90, 180, 225], // split complement variant
    [0, 20, 40, 160, 200], // warm + cool accent
  ];
  const scheme = schemes[Math.floor(Math.random() * schemes.length)];
  const saturation = 60 + Math.floor(Math.random() * 30);
  const baseLightness = 45 + Math.floor(Math.random() * 20);

  for (const offset of scheme) {
    const hue = (baseHue + offset) % 360;
    const lightness = baseLightness + (Math.random() * 20 - 10);
    const hsl = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    // Convert hsl to hex
    const elem = document.createElement("div");
    elem.style.color = hsl;
    document.body.appendChild(elem);
    const rgb = getComputedStyle(elem).color;
    document.body.removeChild(elem);
    const match = rgb.match(/\d+/g);
    if (match) {
      const hex =
        "#" +
        match
          .map((n) => parseInt(n).toString(16).padStart(2, "0"))
          .join("");
      palette.push(hex);
    } else {
      palette.push(randomHexColor());
    }
  }
  return palette;
}

export default function ColorPaletteGeneratorPage() {
  const [colors, setColors] = useState<string[]>([]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [format, setFormat] = useState<"hex" | "rgb" | "hsl">("hex");

  const generatePalette = useCallback(() => {
    const newColors = [...colors];
    for (let i = 0; i < 5; i++) {
      if (!locked[i]) {
        newColors[i] = randomHexColor();
      }
    }
    setColors(newColors);
  }, [colors, locked]);

  const generateHarmonious = useCallback(() => {
    // Keep locked colors, generate new harmonious palette for unlocked
    const palette = generateHarmoniousPalette();
    const newColors = [...colors];
    let paletteIdx = 0;
    for (let i = 0; i < 5; i++) {
      if (!locked[i]) {
        newColors[i] = palette[paletteIdx % palette.length];
        paletteIdx++;
      }
    }
    setColors(newColors);
  }, [colors, locked]);

  useEffect(() => {
    setColors(generateHarmoniousPalette());
  }, []);

  const copyColor = useCallback(
    (color: string, index: number) => {
      let value = color;
      if (format === "rgb") {
        const { r, g, b } = hexToRgb(color);
        value = `rgb(${r}, ${g}, ${b})`;
      } else if (format === "hsl") {
        const { h, s, l } = hexToHsl(color);
        value = `hsl(${h}, ${s}%, ${l}%)`;
      }
      navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    },
    [format]
  );

  const toggleLock = (index: number) => {
    const newLocked = [...locked];
    newLocked[index] = !newLocked[index];
    setLocked(newLocked);
  };

  const getTextColor = (bgColor: string): string => {
    const { r, g, b } = hexToRgb(bgColor);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const formatColor = (color: string): string => {
    if (format === "hex") return color.toUpperCase();
    if (format === "rgb") {
      const { r, g, b } = hexToRgb(color);
      return `rgb(${r}, ${g}, ${b})`;
    }
    const { h, s, l } = hexToHsl(color);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  const copyAllColors = () => {
    const allColors = colors.map((c) => formatColor(c)).join("\n");
    navigator.clipboard.writeText(allColors);
    setCopiedIndex(-1);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <ToolLayout
      title="调色板生成器"
      description="随机生成5色配色方案，支持锁定颜色、多种格式导出，快速获取设计灵感"
      icon={Palette}
      category="生成工具"
      slug="color-palette-generator"
      toolId="color-palette-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">调色板生成</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
            {(["hex", "rgb", "hsl"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all uppercase ${
                  format === f
                    ? "bg-[#27272a] text-violet-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={generateHarmonious}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            <Shuffle className="w-4 h-4" />
            和谐配色
          </button>

          <button
            onClick={generatePalette}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            <RefreshCw className="w-4 h-4" />
            随机生成
          </button>
        </div>
      </div>

      {/* 颜色展示区 */}
      <div className="p-6">
        <div className="grid grid-cols-5 gap-2 h-80 rounded-2xl overflow-hidden">
          {colors.map((color, index) => (
            <div
              key={index}
              className="relative group cursor-pointer flex flex-col"
              style={{ backgroundColor: color }}
              onClick={() => copyColor(color, index)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(index);
                }}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/30 transition-colors opacity-0 group-hover:opacity-100"
                style={{ color: getTextColor(color) }}
              >
                {locked[index] ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Unlock className="w-4 h-4 opacity-60" />
                )}
              </button>

              <div className="flex-1" />

              <div
                className="p-4 bg-black/10 backdrop-blur-sm"
                style={{ color: getTextColor(color) }}
              >
                <div className="text-xs opacity-70 mb-1">颜色 {index + 1}</div>
                <div className="font-mono text-sm font-semibold">
                  {formatColor(color)}
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      点击复制
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 颜色详情列表 */}
        <div className="mt-6 space-y-2">
          {colors.map((color, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-[#3f3f46] transition-colors"
            >
              <div
                className="w-12 h-12 rounded-lg border border-[#27272a] flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">颜色 {index + 1}</div>
                <div className="font-mono text-xs text-slate-400">
                  {formatColor(color)}
                </div>
              </div>
              <button
                onClick={() => copyColor(color, index)}
                className="p-2 text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              >
                {copiedIndex === index ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={copyAllColors}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
          >
            {copiedIndex === -1 ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                已复制全部
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制全部颜色
              </>
            )}
          </button>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 点击颜色块可快速复制颜色值，支持 HEX / RGB / HSL 三种格式</li>
          <li>• 点击锁定图标可锁定当前颜色，重新生成时保持不变</li>
          <li>• 「和谐配色」基于色彩理论生成协调的配色方案</li>
          <li>• 所有生成都在浏览器本地完成，无需网络请求</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
