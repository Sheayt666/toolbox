"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Palette,
  Copy,
  Check,
  Pipette,
  Sun,
  Moon,
  RefreshCw,
} from "lucide-react";

// HEX 转RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// RGB 转HEX
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

// RGB 转HSL
function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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

// HSL 转RGB
function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

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

// 计算互补色
function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#000000";
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const newH = (hsl.h + 180) % 360;
  const newRgb = hslToRgb(newH, hsl.s, hsl.l);
  return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// 计算类似色（左右30度）
function getAnalogous(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return ["#000000", "#000000"];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const h1 = (hsl.h - 30 + 360) % 360;
  const h2 = (hsl.h + 30) % 360;

  const rgb1 = hslToRgb(h1, hsl.s, hsl.l);
  const rgb2 = hslToRgb(h2, hsl.s, hsl.l);

  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)];
}

// 计算三色配色
function getTriadic(hex: string): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return ["#000000", "#000000"];
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const h1 = (hsl.h + 120) % 360;
  const h2 = (hsl.h + 240) % 360;

  const rgb1 = hslToRgb(h1, hsl.s, hsl.l);
  const rgb2 = hslToRgb(h2, hsl.s, hsl.l);

  return [rgbToHex(rgb1.r, rgb1.g, rgb1.b), rgbToHex(rgb2.r, rgb2.g, rgb2.b)];
}

// 判断颜色是否为浅色
function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5;
}

export default function ColorPickerPage() {
  const [color, setColor] = useState("#6366f1");
  const [hexInput, setHexInput] = useState("#6366f1");
  const [rgbInput, setRgbInput] = useState({ r: 99, g: 102, b: 241 });
  const [hslInput, setHslInput] = useState({ h: 239, s: 84, l: 67 });
  const [copied, setCopied] = useState<string | null>(null);
  const [invalidInput, setInvalidInput] = useState<string | null>(null);

  // 转HEX 更新颜色
  const updateFromHex = useCallback((hex: string) => {
    let normalizedHex = hex.trim();
    if (!normalizedHex.startsWith("#")) {
      normalizedHex = "#" + normalizedHex;
    }

    // 支持 3 转HEX
    if (/^#([a-f\d])([a-f\d])([a-f\d])$/i.test(normalizedHex)) {
      normalizedHex =
        "#" +
        normalizedHex[1] +
        normalizedHex[1] +
        normalizedHex[2] +
        normalizedHex[2] +
        normalizedHex[3] +
        normalizedHex[3];
    }

    const rgb = hexToRgb(normalizedHex);
    if (rgb) {
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setColor(normalizedHex.toLowerCase());
      setHexInput(normalizedHex.toLowerCase());
      setRgbInput(rgb);
      setHslInput(hsl);
      setInvalidInput(null);
    } else {
      setInvalidInput("hex");
    }
  }, []);

  // 转RGB 更新颜色
  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      setInvalidInput("rgb");
      return;
    }
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);
    setColor(hex);
    setHexInput(hex);
    setRgbInput({ r, g, b });
    setHslInput(hsl);
    setInvalidInput(null);
  }, []);

  // 转HSL 更新颜色
  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
      setInvalidInput("hsl");
      return;
    }
    const rgb = hslToRgb(h, s, l);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setColor(hex);
    setHexInput(hex);
    setRgbInput(rgb);
    setHslInput({ h, s, l });
    setInvalidInput(null);
  }, []);

  const handleCopy = useCallback((value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFromHex(e.target.value);
  };

  const complementary = getComplementary(color);
  const analogous = getAnalogous(color);
  const triadic = getTriadic(color);

  // 随机颜色
  const randomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    updateFromRgb(r, g, b);
  };

  const hexString = hexInput;
  const rgbString = `rgb(${rgbInput.r}, ${rgbInput.g}, ${rgbInput.b})`;
  const hslString = `hsl(${hslInput.h}, ${hslInput.s}%, ${hslInput.l}%)`;

  return (
    <ToolLayout
      title="颜色转换器"
      description="HEX、RGB、HSL颜色格式互转，调色板工具，设计师必备"
      icon={Palette}
      category="设计工具"
      slug="color-picker"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 颜色预览和选择器*/}
        <div
          className="rounded-2xl shadow-lg overflow-hidden transition-colors duration-300"
          style={{ backgroundColor: color }}
        >
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <div
                  className={`text-3xl md:text-4xl font-mono font-bold mb-2 ${
                    isLightColor(color) ? "text-slate-800" : "text-white"
                  }`}
                >
                  {hexString.toUpperCase()}
                </div>
                <div
                  className={`text-sm font-mono ${
                    isLightColor(color) ? "text-slate-600" : "text-white/70"
                  }`}
                >
                  {rgbString}
                </div>
                <div
                  className={`text-sm font-mono ${
                    isLightColor(color) ? "text-slate-600" : "text-white/70"
                  }`}
                >
                  {hslString}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={handleColorPickerChange}
                    className="w-16 h-16 rounded-xl cursor-pointer border-4 border-white/30 shadow-lg bg-transparent"
                    style={{ padding: 0 }}
                  />
                </div>
                <button
                  onClick={randomColor}
                  className={`p-3 rounded-xl transition-all ${
                    isLightColor(color)
                      ? "bg-slate-800/10 hover:bg-slate-800/20 text-slate-800"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                  title="随机颜色"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 颜色格式转换 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                颜色格式转换
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* HEX */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  HEX
                </label>
                <button
                  onClick={() => handleCopy(hexString, "hex")}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  {copied === "hex" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </>
                  )}
                </button>
              </div>
              <div className="flex gap-2">
                <div
                  className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => {
                    setHexInput(e.target.value);
                    setInvalidInput(null);
                  }}
                  onBlur={(e) => updateFromHex(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="#000000"
                  className={`flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-lg ${
                    invalidInput === "hex"
                      ? "border-red-300 dark:border-red-700"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                />
              </div>
              {invalidInput === "hex" && (
                <p className="mt-1.5 text-xs text-red-500">
                  无效的HEX 颜色值
                </p>
              )}
            </div>

            {/* RGB */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  RGB
                </label>
                <button
                  onClick={() => handleCopy(rgbString, "rgb")}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  {copied === "rgb" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">R</div>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbInput.r}
                    onChange={(e) => {
                      setRgbInput({ ...rgbInput, r: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromRgb(
                        Number(e.target.value),
                        rgbInput.g,
                        rgbInput.b
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">G</div>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbInput.g}
                    onChange={(e) => {
                      setRgbInput({ ...rgbInput, g: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromRgb(
                        rgbInput.r,
                        Number(e.target.value),
                        rgbInput.b
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">B</div>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={rgbInput.b}
                    onChange={(e) => {
                      setRgbInput({ ...rgbInput, b: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromRgb(
                        rgbInput.r,
                        rgbInput.g,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* HSL */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  HSL
                </label>
                <button
                  onClick={() => handleCopy(hslString, "hsl")}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-500 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors"
                >
                  {copied === "hsl" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制
                    </>
                  )}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">H</div>
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={hslInput.h}
                    onChange={(e) => {
                      setHslInput({ ...hslInput, h: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromHsl(
                        Number(e.target.value),
                        hslInput.s,
                        hslInput.l
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">S</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hslInput.s}
                    onChange={(e) => {
                      setHslInput({ ...hslInput, s: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromHsl(
                        hslInput.h,
                        Number(e.target.value),
                        hslInput.l
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1 text-center">L</div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={hslInput.l}
                    onChange={(e) => {
                      setHslInput({ ...hslInput, l: Number(e.target.value) });
                      setInvalidInput(null);
                    }}
                    onBlur={(e) =>
                      updateFromHsl(
                        hslInput.h,
                        hslInput.s,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-center font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* 滑块调节 */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    色相 (H)
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {hslInput.h}°
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hslInput.h}
                  onChange={(e) =>
                    updateFromHsl(
                      Number(e.target.value),
                      hslInput.s,
                      hslInput.l
                    )
                  }
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                  }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    饱和度(S)
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {hslInput.s}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslInput.s}
                  onChange={(e) =>
                    updateFromHsl(
                      hslInput.h,
                      Number(e.target.value),
                      hslInput.l
                    )
                  }
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  style={{
                    background: `linear-gradient(to right, hsl(${hslInput.h}, 0%, ${hslInput.l}%), hsl(${hslInput.h}, 100%, ${hslInput.l}%))`,
                  }}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    亮度 (L)
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-300">
                    {hslInput.l}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hslInput.l}
                  onChange={(e) =>
                    updateFromHsl(
                      hslInput.h,
                      hslInput.s,
                      Number(e.target.value)
                    )
                  }
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  style={{
                    background: `linear-gradient(to right, #000, hsl(${hslInput.h}, ${hslInput.s}%, 50%), #fff)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 配色方案 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Pipette className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                配色方案
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 互补色*/}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                互补色
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <ColorCard
                  hex={color}
                  label="原色"
                  onCopy={handleCopy}
                  copiedKey="comp-base"
                  isCopied={copied === "comp-base"}
                />
                <ColorCard
                  hex={complementary}
                  label="互补色"
                  onCopy={handleCopy}
                  copiedKey="comp"
                  isCopied={copied === "comp"}
                />
              </div>
            </div>

            {/* 类似色*/}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-500" />
                类似色(±30°)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ColorCard
                  hex={analogous[0]}
                  label="-30°"
                  onCopy={handleCopy}
                  copiedKey="analogous-1"
                  isCopied={copied === "analogous-1"}
                />
                <ColorCard
                  hex={color}
                  label="原色"
                  onCopy={handleCopy}
                  copiedKey="analogous-base"
                  isCopied={copied === "analogous-base"}
                />
                <ColorCard
                  hex={analogous[1]}
                  label="+30°"
                  onCopy={handleCopy}
                  copiedKey="analogous-2"
                  isCopied={copied === "analogous-2"}
                />
              </div>
            </div>

            {/* 三色配色 */}
            <div>
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-500" />
                三色配色 (±120°)
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <ColorCard
                  hex={triadic[0]}
                  label="+120°"
                  onCopy={handleCopy}
                  copiedKey="triadic-1"
                  isCopied={copied === "triadic-1"}
                />
                <ColorCard
                  hex={color}
                  label="原色"
                  onCopy={handleCopy}
                  copiedKey="triadic-base"
                  isCopied={copied === "triadic-base"}
                />
                <ColorCard
                  hex={triadic[1]}
                  label="+240°"
                  onCopy={handleCopy}
                  copiedKey="triadic-2"
                  isCopied={copied === "triadic-2"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 颜色知识 */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            颜色格式说明
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                HEX
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                十六进制颜色表示，以 # 开头，6位数字（0-9, A-F），如
                #FF5733。是 Web 设计中最常用的格式
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                RGB
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                红绿蓝三原色，每个通道取值0-255，如 rgb(255, 87,
                51)。常用于屏幕显示颜色值
              </p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="font-medium text-slate-800 dark:text-slate-200 mb-2">
                HSL
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                色相、饱和度、亮度，如hsl(9, 100%, 60%)。更直观，易于调整颜色明暗和饱和度。
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

// 颜色卡片组件
function ColorCard({
  hex,
  label,
  onCopy,
  copiedKey,
  isCopied,
}: {
  hex: string;
  label: string;
  onCopy: (value: string, key: string) => void;
  copiedKey: string;
  isCopied: boolean;
}) {
  const light = isLightColor(hex);

  return (
    <div
      className="group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all hover:shadow-md"
      style={{ backgroundColor: hex }}
    >
      <div
        className={`p-4 flex items-center justify-between ${
          light ? "text-slate-800" : "text-white"
        }`}
      >
        <div>
          <div className="text-xs opacity-70 mb-1">{label}</div>
          <div className="font-mono text-sm font-semibold uppercase">
            {hex}
          </div>
        </div>
        <button
          onClick={() => onCopy(hex, copiedKey)}
          className={`p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
            light
              ? "hover:bg-slate-800/10 text-slate-700"
              : "hover:bg-white/20 text-white"
          }`}
          title="复制 HEX"
        >
          {isCopied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}
