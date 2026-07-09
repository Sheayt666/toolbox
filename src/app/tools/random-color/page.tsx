"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Shuffle, Copy, Check, Zap } from "lucide-react";

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

function generateRelatedColors(baseColor: string): { name: string; color: string }[] {
  const { h, s, l } = hexToHsl(baseColor);
  const result: { name: string; color: string }[] = [];

  // Complement
  const compH = (h + 180) % 360;
  result.push({ name: "互补色", color: hslToHex(compH, s, l) });

  // Analogous
  result.push({ name: "邻近色1", color: hslToHex((h + 30) % 360, s, l) });
  result.push({ name: "邻近色2", color: hslToHex((h + 330) % 360, s, l) });

  // Triadic
  result.push({ name: "三角色1", color: hslToHex((h + 120) % 360, s, l) });
  result.push({ name: "三角色2", color: hslToHex((h + 240) % 360, s, l) });

  // Lighter/Darker
  result.push({ name: "亮色", color: hslToHex(h, s, Math.min(90, l + 20)) });
  result.push({ name: "暗色", color: hslToHex(h, s, Math.max(10, l - 20)) });

  return result;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default function RandomColorPage() {
  const [color, setColor] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const generate = useCallback(() => {
    const newColor = randomHexColor();
    setColor(newColor);
    setHistory((prev) => [newColor, ...prev.slice(0, 9)]);
  }, []);

  useEffect(() => {
    generate();
  }, [generate]);

  const copyColor = useCallback(
    (c: string, format: "hex" | "rgb" | "hsl") => {
      let value = c.toUpperCase();
      if (format === "rgb") {
        const { r, g, b } = hexToRgb(c);
        value = `rgb(${r}, ${g}, ${b})`;
      } else if (format === "hsl") {
        const { h, s, l } = hexToHsl(c);
        value = `hsl(${h}, ${s}%, ${l}%)`;
      }
      navigator.clipboard.writeText(value);
      setCopied(format);
      setTimeout(() => setCopied(null), 1500);
    },
    []
  );

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);
  const relatedColors = generateRelatedColors(color);

  const getTextColor = (hex: string): string => {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  return (
    <ToolLayout
      title="随机颜色生成器"
      description="一键生成随机颜色，查看 HEX/RGB/HSL 多种格式，自动生成配色方案"
      icon={Zap}
      category="生成工具"
      slug="random-color"
      toolId="random-color"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">随机颜色</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-amber-500/25"
          >
            <Shuffle className="w-4 h-4" />
            生成新颜色
          </button>
        </div>
      </div>

      {/* 主预览 */}
      <div
        className="h-72 flex items-center justify-center cursor-pointer transition-colors"
        style={{ backgroundColor: color, color: getTextColor(color) }}
        onClick={generate}
      >
        <div className="text-center">
          <div className="text-5xl font-mono font-bold mb-2">{color.toUpperCase()}</div>
          <div className="text-sm opacity-70">点击生成新颜色</div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 颜色信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-2">HEX</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-white">
                {color.toUpperCase()}
              </span>
              <button
                onClick={() => copyColor(color, "hex")}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              >
                {copied === "hex" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-2">RGB</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-white">
                rgb({rgb.r}, {rgb.g}, {rgb.b})
              </span>
              <button
                onClick={() => copyColor(color, "rgb")}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              >
                {copied === "rgb" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <div className="text-xs text-slate-500 mb-2">HSL</div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-white">
                hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
              <button
                onClick={() => copyColor(color, "hsl")}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
              >
                {copied === "hsl" ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 配色方案 */}
        <div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">配色方案</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {relatedColors.map((item, idx) => (
              <div
                key={idx}
                className="cursor-pointer group"
                onClick={() => setColor(item.color)}
              >
                <div
                  className="h-20 rounded-xl border border-[#27272a] group-hover:border-[#3f3f46] transition-colors flex items-end p-2"
                  style={{ backgroundColor: item.color }}
                >
                  <span
                    className="text-xs font-mono opacity-80"
                    style={{ color: getTextColor(item.color) }}
                  >
                    {item.color.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1.5 text-center">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-3">历史记录</h3>
            <div className="flex gap-2 flex-wrap">
              {history.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => setColor(c)}
                  className="w-12 h-12 rounded-lg border border-[#27272a] hover:border-[#3f3f46] hover:scale-110 transition-all"
                  style={{ backgroundColor: c }}
                  title={c.toUpperCase()}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 点击大色块或「生成新颜色」按钮随机生成颜色</li>
          <li>• 支持 HEX、RGB、HSL 三种格式，点击复制按钮快速复制</li>
          <li>• 自动生成互补色、邻近色、三角色等配色方案</li>
          <li>• 历史记录保留最近 10 个生成的颜色</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
