"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Circle, Copy, Check, Sliders } from "lucide-react";

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

function isLightColor(hex: string): boolean {
  const hsl = hexToHsl(hex);
  return hsl.l > 60;
}

export default function ColorWheelPage() {
  const [hue, setHue] = useState(200);
  const [saturation, setSaturation] = useState(80);
  const [lightness, setLightness] = useState(50);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLCanvasElement>(null);

  const currentColor = hslToHex(hue, saturation, lightness);

  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 280;
    const center = size / 2;
    const radius = size / 2 - 10;

    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * (Math.PI / 180);
      const endAngle = (angle + 1) * (Math.PI / 180);

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      gradient.addColorStop(0, `hsl(${angle}, 0%, 100%)`);
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);

      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 中心白色圆
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.15, 0, 2 * Math.PI);
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 选中标注
    const markerAngle = (hue - 90) * (Math.PI / 180);
    const markerRadius = radius * (1 - saturation / 100 * 0.85);
    const markerX = center + markerRadius * Math.cos(markerAngle);
    const markerY = center + markerRadius * Math.sin(markerAngle);

    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = currentColor;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [hue, saturation, currentColor]);

  const handleWheelClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
    const newHue = ((angle % 360) + 360) % 360;

    const distance = Math.sqrt(x * x + y * y);
    const radius = rect.width / 2 - 10;
    const newSat = Math.min(100, Math.max(0, Math.round((distance / (radius * 0.85)) * 100)));

    setHue(Math.round(newHue));
    setSaturation(newSat);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentColor);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 互补色、三色配色
  const complementary = hslToHex((hue + 180) % 360, saturation, lightness);
  const triadic1 = hslToHex((hue + 120) % 360, saturation, lightness);
  const triadic2 = hslToHex((hue + 240) % 360, saturation, lightness);
  const analogous1 = hslToHex((hue + 30) % 360, saturation, lightness);
  const analogous2 = hslToHex((hue - 30 + 360) % 360, saturation, lightness);

  return (
    <ToolLayout
      title="色轮/色环"
      description="交互式色轮工具，点击色轮选择颜色，查看互补色、类似色、三色配色"
      icon={Circle}
      category="设计工具"
      slug="color-wheel"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 色轮区域 */}
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Circle className="w-5 h-5" />
            <h2 className="text-base font-semibold">色轮 / 色环</h2>
          </div>

          <div className="flex flex-col items-center">
            <canvas
              ref={wheelRef}
              width={280}
              height={280}
              onClick={handleWheelClick}
              className="cursor-crosshair rounded-full shadow-2xl mb-6"
            />

            {/* 当前颜色 */}
            <div
              className="w-full max-w-xs p-4 rounded-xl flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
              style={{ backgroundColor: currentColor }}
              onClick={handleCopy}
            >
              <span className={`font-mono text-lg font-bold ${isLightColor(currentColor) ? "text-slate-800" : "text-white"}`}>
                {currentColor.toUpperCase()}
              </span>
              {copied ? (
                <Check className={`w-5 h-5 ${isLightColor(currentColor) ? "text-emerald-600" : "text-emerald-300"}`} />
              ) : (
                <Copy className={`w-5 h-5 ${isLightColor(currentColor) ? "text-slate-700" : "text-white/80"}`} />
              )}
            </div>
          </div>
        </div>

        {/* 精细调节 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            精细调节
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">色相 (H)</span>
                <span className="text-sm font-mono text-white">{hue}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">饱和度 (S)</span>
                <span className="text-sm font-mono text-white">{saturation}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={saturation}
                onChange={(e) => setSaturation(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                style={{
                  background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
                }}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">亮度 (L)</span>
                <span className="text-sm font-mono text-white">{lightness}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={lightness}
                onChange={(e) => setLightness(Number(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                style={{
                  background: `linear-gradient(to right, #000, hsl(${hue}, ${saturation}%, 50%), #fff)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 配色方案 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">互补色</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "原色", color: currentColor },
                { label: "互补色", color: complementary },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-[#27272a]"
                  onClick={() => {
                    navigator.clipboard.writeText(item.color);
                  }}
                >
                  <div className="h-12" style={{ backgroundColor: item.color }} />
                  <div className="p-2 bg-[#09090b] flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono text-slate-300">{item.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">类似色 (±30°)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "-30°", color: analogous2 },
                { label: "原色", color: currentColor },
                { label: "+30°", color: analogous1 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-[#27272a]"
                  onClick={() => navigator.clipboard.writeText(item.color)}
                >
                  <div className="h-12" style={{ backgroundColor: item.color }} />
                  <div className="p-2 bg-[#09090b] flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono text-slate-300">{item.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">三色配色 (±120°)</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "+120°", color: triadic1 },
                { label: "原色", color: currentColor },
                { label: "+240°", color: triadic2 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-[#27272a]"
                  onClick={() => navigator.clipboard.writeText(item.color)}
                >
                  <div className="h-12" style={{ backgroundColor: item.color }} />
                  <div className="p-2 bg-[#09090b] flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs font-mono text-slate-300">{item.color}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
