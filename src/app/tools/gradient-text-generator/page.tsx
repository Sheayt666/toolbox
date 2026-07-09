"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check, RefreshCw, Palette } from "lucide-react";

const presetGradients = [
  { name: "紫粉", colors: ["#667eea", "#764ba2", "#f093fb"] },
  { name: "日落", colors: ["#fa709a", "#fee140"] },
  { name: "海洋", colors: ["#2E3192", "#1BFFFF"] },
  { name: "火焰", colors: ["#f12711", "#f5af19"] },
  { name: "极光", colors: ["#00c6ff", "#0072ff", "#8e2de2"] },
  { name: "薄荷", colors: ["#11998e", "#38ef7d"] },
  { name: "玫瑰", colors: ["#ee9ca7", "#ffdde1"] },
  { name: "宇宙", colors: ["#0f0c29", "#302b63", "#24243e"] },
];

export default function GradientTextGeneratorPage() {
  const [text, setText] = useState("渐变文字");
  const [colors, setColors] = useState(["#667eea", "#764ba2", "#f093fb"]);
  const [angle, setAngle] = useState(135);
  const [fontSize, setFontSize] = useState(64);
  const [fontWeight, setFontWeight] = useState(700);
  const [copied, setCopied] = useState(false);

  const gradientStr = `linear-gradient(${angle}deg, ${colors.join(", ")})`;

  const textStyle: React.CSSProperties = {
    background: gradientStr,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontSize: `${fontSize}px`,
    fontWeight,
  };

  const cssCode = `.gradient-text {
  background: ${gradientStr};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: ${fontSize}px;
  font-weight: ${fontWeight};
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: typeof presetGradients[0]) => {
    setColors(preset.colors);
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const addColor = () => {
    if (colors.length < 6) {
      const lastColor = colors[colors.length - 1];
      setColors([...colors, lastColor]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const randomGradient = () => {
    const count = 2 + Math.floor(Math.random() * 3);
    const newColors: string[] = [];
    for (let i = 0; i < count; i++) {
      newColors.push("#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"));
    }
    setColors(newColors);
    setAngle(Math.floor(Math.random() * 360));
  };

  return (
    <ToolLayout
      title="渐变文字生成器"
      description="创建炫酷的渐变文字效果，自定义颜色、角度和样式，一键复制CSS代码"
      icon={Type}
      category="设计工具"
      slug="gradient-text-generator"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 预览区域 */}
        <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-fuchsia-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Type className="w-5 h-5" />
            <h2 className="text-base font-semibold">渐变文字生成器</h2>
          </div>

          <div className="bg-[#09090b] rounded-xl p-8 min-h-[160px] flex items-center justify-center border border-white/10">
            <div style={textStyle} className="font-bold text-center break-all px-4">
              {text || "输入文字"}
            </div>
          </div>
        </div>

        {/* 文字设置 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">文字设置</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">文字内容</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-transparent"
                placeholder="输入文字内容"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">字体大小: {fontSize}px</label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-[#09090b] rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-2 block">字重: {fontWeight}</label>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                >
                  <option value={300}>细体 (300)</option>
                  <option value={400}>常规 (400)</option>
                  <option value={500}>中等 (500)</option>
                  <option value={600}>半粗 (600)</option>
                  <option value={700}>粗体 (700)</option>
                  <option value={800}>特粗 (800)</option>
                  <option value={900}>超粗 (900)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-400">渐变角度: {angle}°</label>
                <button
                  onClick={randomGradient}
                  className="text-xs px-3 py-1.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-500/30 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  随机
                </button>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ background: `linear-gradient(${angle}deg, ${colors.join(", ")})` }}
              />
            </div>
          </div>
        </div>

        {/* 颜色设置 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-fuchsia-400" />
              颜色设置
            </h3>
            {colors.length < 6 && (
              <button
                onClick={addColor}
                className="text-xs px-3 py-1.5 bg-[#09090b] text-slate-400 rounded-lg hover:text-white border border-[#27272a] transition-colors"
              >
                + 添加颜色
              </button>
            )}
          </div>

          <div className="space-y-3">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-6">#{i + 1}</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a] bg-transparent p-0"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => {
                    if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) updateColor(i, e.target.value);
                  }}
                  className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                />
                {colors.length > 2 && (
                  <button
                    onClick={() => removeColor(i)}
                    className="w-8 h-8 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 预设渐变 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">预设渐变</h3>
          <div className="grid grid-cols-4 gap-3">
            {presetGradients.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="group"
              >
                <div
                  className="h-12 rounded-lg border border-[#27272a] group-hover:border-fuchsia-500/50 transition-colors shadow-md"
                  style={{ background: `linear-gradient(135deg, ${preset.colors.join(", ")})` }}
                />
                <div className="text-xs text-slate-400 mt-1.5 text-center group-hover:text-fuchsia-400 transition-colors">
                  {preset.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CSS 代码 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">CSS 代码</h3>
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 bg-fuchsia-500/20 text-fuchsia-400 rounded-lg hover:bg-fuchsia-500/30 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
          <pre className="p-4 text-sm text-emerald-400 overflow-x-auto font-mono leading-relaxed">
{cssCode}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
