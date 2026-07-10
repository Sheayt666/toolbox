"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Box, Copy, Check, Sun, Moon } from "lucide-react";

export default function NeumorphismGeneratorPage() {
  const [bgColor, setBgColor] = useState("#2a2a2e");
  const [size, setSize] = useState(160);
  const [radius, setRadius] = useState(40);
  const [distance, setDistance] = useState(12);
  const [intensity, setIntensity] = useState(40);
  const [inset, setInset] = useState(false);
  const [copied, setCopied] = useState(false);

  const rgb = (hex: string) => {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };

  const [r, g, b] = rgb(bgColor);
  const lightOffset = intensity * 2.55;
  const darkOffset = intensity * 2.55;
  const light = `rgb(${Math.min(255, r + lightOffset)}, ${Math.min(255, g + lightOffset)}, ${Math.min(255, b + lightOffset)})`;
  const dark = `rgb(${Math.max(0, r - darkOffset)}, ${Math.max(0, g - darkOffset)}, ${Math.max(0, b - darkOffset)})`;

  const shadow = inset
    ? `inset ${distance}px ${distance}px ${distance * 2}px ${dark}, inset -${distance}px -${distance}px ${distance * 2}px ${light}`
    : `${distance}px ${distance}px ${distance * 2}px ${dark}, -${distance}px -${distance}px ${distance * 2}px ${light}`;

  const css = `.neumorphic {
  background: ${bgColor};
  border-radius: ${radius}px;
  box-shadow: ${shadow};
}`;

  const copy = () => {
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="新拟态效果生成"
      description="生成Neumorphism UI效果CSS"
      icon={Box}
      category="设计工具"
      slug="neumorphism-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">背景颜色</label>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">元素尺寸 {size}px</label>
              <input type="range" min={80} max={240} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">圆角 {radius}px</label>
              <input type="range" min={0} max={120} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">阴影距离 {distance}px</label>
              <input type="range" min={2} max={30} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">阴影强度 {intensity}</label>
              <input type="range" min={5} max={80} value={intensity} onChange={(e) => setIntensity(Number(e.target.value))} className="w-full accent-primary-500" />
            </div>
            <button
              onClick={() => setInset(!inset)}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-lg border ${inset ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}
            >
              {inset ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {inset ? "内凹模式（按下）" : "外凸模式（凸起）"}
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">实时预览</label>
            <div
              className="rounded-lg h-64 flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: size,
                  height: size,
                  background: bgColor,
                  borderRadius: `${radius}px`,
                  boxShadow: shadow,
                }}
              >
                <span className="text-white/60 text-xs">{inset ? "内凹" : "外凸"}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">CSS 代码</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap">{css}</pre>
        </div>
      </div>
    </ToolLayout>
  );
}
