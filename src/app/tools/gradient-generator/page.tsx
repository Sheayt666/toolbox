"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Paintbrush, Copy, Check, RefreshCw, Shuffle, Download } from "lucide-react";

type GradientType = "linear" | "radial" | "conic";
type GradientDirection = "to right" | "to bottom" | "to bottom right" | "to top right" | "135deg" | "45deg" | "90deg" | "180deg";

const directions: { label: string; value: GradientDirection }[] = [
  { label: "→ 右", value: "to right" },
  { label: "↓ 下", value: "to bottom" },
  { label: "↘ 右下", value: "to bottom right" },
  { label: "↗ 右上", value: "to top right" },
  { label: "45°", value: "45deg" },
  { label: "90°", value: "90deg" },
  { label: "135°", value: "135deg" },
  { label: "180°", value: "180deg" },
];

const presetPalettes = [
  { name: "日落", colors: ["#ff6b6b", "#feca57", "#ff9ff3"] },
  { name: "海洋", colors: ["#667eea", "#764ba2", "#f093fb"] },
  { name: "极光", colors: ["#00f5a0", "#00d9f5", "#0066ff"] },
  { name: "紫罗兰", colors: ["#8b5cf6", "#6366f1", "#3b82f6"] },
  { name: "火焰", colors: ["#f97316", "#ef4444", "#dc2626"] },
  { name: "薄荷", colors: ["#10b981", "#34d399", "#6ee7b7"] },
];

function randomColor(): string {
  return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

export default function GradientGeneratorPage() {
  const [type, setType] = useState<GradientType>("linear");
  const [direction, setDirection] = useState<GradientDirection>("135deg");
  const [colors, setColors] = useState<string[]>(["#667eea", "#764ba2"]);
  const [copied, setCopied] = useState(false);

  const generateGradient = useCallback((): string => {
    const colorStops = colors.map((c, i) => {
      const pct = Math.round((i / (colors.length - 1)) * 100);
      return `${c} ${pct}%`;
    }).join(", ");

    if (type === "linear") {
      return `linear-gradient(${direction}, ${colorStops})`;
    } else if (type === "radial") {
      return `radial-gradient(circle, ${colorStops})`;
    } else {
      return `conic-gradient(from 0deg, ${colorStops})`;
    }
  }, [type, direction, colors]);

  const cssCode = `background: ${generateGradient()};`;

  const copyCSS = useCallback(() => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cssCode]);

  const randomize = () => {
    const count = 2 + Math.floor(Math.random() * 3);
    const newColors: string[] = [];
    for (let i = 0; i < count; i++) {
      newColors.push(randomColor());
    }
    setColors(newColors);
  };

  const addColor = () => {
    if (colors.length < 6) {
      setColors([...colors, randomColor()]);
    }
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...colors];
    newColors[index] = color;
    setColors(newColors);
  };

  const applyPreset = (preset: typeof presetPalettes[0]) => {
    setColors(preset.colors);
  };

  useEffect(() => {
    randomize();
  }, []);

  const downloadPNG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gradient =
      type === "linear"
        ? ctx.createLinearGradient(0, 0, 800, 450)
        : type === "radial"
        ? ctx.createRadialGradient(400, 225, 0, 400, 225, 400)
        : null;

    if (gradient) {
      colors.forEach((c, i) => {
        gradient.addColorStop(i / (colors.length - 1), c);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 450);
    }

    const link = document.createElement("a");
    link.download = "gradient.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title="CSS渐变生成器"
      description="在线生成 CSS 渐变代码，支持线性、径向、锥形渐变，自定义颜色和方向"
      icon={Paintbrush}
      category="生成工具"
      slug="gradient-generator"
      toolId="gradient-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-white">渐变生成</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={randomize}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            <Shuffle className="w-4 h-4" />
            随机
          </button>
          <button
            onClick={copyCSS}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-pink-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制 CSS
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div
          className="w-full h-64 rounded-2xl border border-[#27272a]"
          style={{ background: generateGradient() }}
        />

        {/* 设置区 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 渐变类型 */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-3 block">
              渐变类型
            </label>
            <div className="flex gap-2">
              {(["linear", "radial", "conic"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    type === t
                      ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                  }`}
                >
                  {t === "linear" ? "线性" : t === "radial" ? "径向" : "锥形"}
                </button>
              ))}
            </div>
          </div>

          {/* 方向 */}
          {type === "linear" && (
            <div>
              <label className="text-sm font-medium text-slate-300 mb-3 block">
                方向
              </label>
              <div className="grid grid-cols-4 gap-2">
                {directions.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDirection(d.value)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                      direction === d.value
                        ? "bg-pink-500/20 text-pink-400 border border-pink-500/30"
                        : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 颜色选择 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              颜色 ({colors.length})
            </label>
            <button
              onClick={addColor}
              disabled={colors.length >= 6}
              className="text-xs text-pink-400 hover:text-pink-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + 添加颜色
            </button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="relative">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="w-14 h-14 rounded-xl cursor-pointer border-2 border-[#27272a] hover:border-[#3f3f46] transition-colors"
                  />
                  {colors.length > 2 && (
                    <button
                      onClick={() => removeColor(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center"
                    >
                      ×
                    </button>
                  )}
                </div>
                <span className="text-xs font-mono text-slate-500 uppercase">
                  {color}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            预设方案
          </label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {presetPalettes.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="group relative"
              >
                <div
                  className="h-12 rounded-xl border border-[#27272a] group-hover:border-[#3f3f46] transition-colors"
                  style={{
                    background: `linear-gradient(135deg, ${preset.colors.join(", ")})`,
                  }}
                />
                <span className="text-xs text-slate-500 group-hover:text-slate-300 mt-1.5 block text-center">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CSS 代码 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">CSS 代码</label>
            <button
              onClick={downloadPNG}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
            >
              <Download className="w-3.5 h-3.5" />
              下载 PNG
            </button>
          </div>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap break-all">
              {cssCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持线性、径向、锥形三种渐变类型，最多6个颜色节点</li>
          <li>• 点击颜色块可自定义颜色，也可选择预设方案快速应用</li>
          <li>• 生成的 CSS 代码可直接复制到项目中使用</li>
          <li>• 支持下载高清 PNG 预览图，方便分享和设计参考</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
