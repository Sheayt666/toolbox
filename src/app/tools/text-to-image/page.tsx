"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Type,
  Download,
  Palette,
  Settings,
  RefreshCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from "lucide-react";

type PresetStyle = "minimal" | "gradient" | "card" | "dark";
type TextAlign = "left" | "center" | "right";
type BgType = "solid" | "gradient";

interface TextStyleConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  textColor: string;
  bgType: BgType;
  bgColor: string;
  bgColor2: string;
  gradientAngle: number;
  padding: number;
  borderRadius: number;
  shadow: boolean;
  shadowBlur: number;
  shadowOffset: number;
  width: number;
  height: number;
  autoHeight: boolean;
  textAlign: TextAlign;
  lineHeight: number;
}

const presetStyles: Record<PresetStyle, Partial<TextStyleConfig>> = {
  minimal: {
    textColor: "#1a1a1a",
    bgType: "solid",
    bgColor: "#ffffff",
    bgColor2: "#ffffff",
    borderRadius: 0,
    shadow: false,
    fontFamily: "system-ui",
  },
  gradient: {
    textColor: "#ffffff",
    bgType: "gradient",
    bgColor: "#667eea",
    bgColor2: "#764ba2",
    gradientAngle: 135,
    borderRadius: 24,
    shadow: true,
    shadowBlur: 30,
    shadowOffset: 10,
    fontFamily: "system-ui",
  },
  card: {
    textColor: "#333333",
    bgType: "solid",
    bgColor: "#ffffff",
    bgColor2: "#ffffff",
    borderRadius: 16,
    shadow: true,
    shadowBlur: 20,
    shadowOffset: 5,
    fontFamily: "system-ui",
  },
  dark: {
    textColor: "#e0e0e0",
    bgType: "solid",
    bgColor: "#1a1a2e",
    bgColor2: "#1a1a2e",
    borderRadius: 12,
    shadow: true,
    shadowBlur: 40,
    shadowOffset: 0,
    fontFamily: "system-ui",
  },
};

const fontFamilies = [
  { value: "system-ui, -apple-system, sans-serif", label: "系统默认" },
  { value: "'Microsoft YaHei', '微软雅黑', sans-serif", label: "微软雅黑" },
  { value: "'SimHei', '黑体', sans-serif", label: "黑体" },
  { value: "'SimSun', '宋体', serif", label: "宋体" },
  { value: "'KaiTi', '楷体', serif", label: "楷体" },
  { value: "'Courier New', 'Consolas', monospace", label: "等宽字体" },
];

export default function TextToImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");

  const [config, setConfig] = useState<TextStyleConfig>({
    text: "你好，世界\nHello World",
    fontSize: 48,
    fontFamily: "system-ui, -apple-system, sans-serif",
    textColor: "#1a1a1a",
    bgType: "gradient",
    bgColor: "#667eea",
    bgColor2: "#764ba2",
    gradientAngle: 135,
    padding: 60,
    borderRadius: 24,
    shadow: true,
    shadowBlur: 30,
    shadowOffset: 10,
    width: 800,
    height: 600,
    autoHeight: true,
    textAlign: "center",
    lineHeight: 1.6,
  });

  const [activePreset, setActivePreset] = useState<PresetStyle>("gradient");

  const updateConfig = (updates: Partial<TextStyleConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const applyPreset = (preset: PresetStyle) => {
    setActivePreset(preset);
    const style = presetStyles[preset];
    setConfig((prev) => ({ ...prev, ...style }));
  };

  // 计算文字换行
  const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const lines: string[] = [];
    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
      if (paragraph === "") {
        lines.push("");
        continue;
      }

      let currentLine = "";
      const chars = paragraph.split("");

      for (let i = 0; i < chars.length; i++) {
        const testLine = currentLine + chars[i];
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine !== "") {
          lines.push(currentLine);
          currentLine = chars[i];
        } else {
          currentLine = testLine;
        }
      }

      if (currentLine) {
        lines.push(currentLine);
      }
    }

    return lines;
  }, []);

  // 生成图片
  const generateImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsGenerating(true);

    // 设置字体
    ctx.font = `${config.fontSize}px ${config.fontFamily}`;

    // 计算文字区域宽度
    const textAreaWidth = config.width - config.padding * 2;

    // 计算换行
    const lines = wrapText(ctx, config.text, textAreaWidth);
    const lineHeight = config.fontSize * config.lineHeight;
    const totalTextHeight = lines.length * lineHeight;

    // 计算画布高度
    let canvasHeight = config.height;
    if (config.autoHeight) {
      canvasHeight = totalTextHeight + config.padding * 2;
    }

    canvas.width = config.width;
    canvas.height = canvasHeight;

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制背景（带圆角和阴影）
    ctx.save();

    // 阴影
    if (config.shadow) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = config.shadowBlur;
      ctx.shadowOffsetY = config.shadowOffset;
    }

    // 圆角矩形路径
    const r = config.borderRadius;
    const x = 0;
    const y = 0;
    const w = canvas.width;
    const h = canvas.height;

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    // 填充背景
    if (config.bgType === "gradient") {
      const angleRad = (config.gradientAngle * Math.PI) / 180;
      const centerX = w / 2;
      const centerY = h / 2;
      const gradientLen = Math.sqrt(w * w + h * h) / 2;
      const startX = centerX - Math.cos(angleRad) * gradientLen;
      const startY = centerY - Math.sin(angleRad) * gradientLen;
      const endX = centerX + Math.cos(angleRad) * gradientLen;
      const endY = centerY + Math.sin(angleRad) * gradientLen;

      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, config.bgColor);
      gradient.addColorStop(1, config.bgColor2);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = config.bgColor;
    }

    ctx.fill();
    ctx.restore();

    // 绘制文字
    ctx.save();
    ctx.font = `${config.fontSize}px ${config.fontFamily}`;
    ctx.fillStyle = config.textColor;
    ctx.textBaseline = "top";

    // 计算文字垂直居中（如果不是自动高度）
    let startY = config.padding;
    if (!config.autoHeight) {
      startY = (canvasHeight - totalTextHeight) / 2;
    }

    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight;
      let lineX = config.padding;

      if (config.textAlign === "center") {
        const metrics = ctx.measureText(line);
        lineX = (canvas.width - metrics.width) / 2;
      } else if (config.textAlign === "right") {
        const metrics = ctx.measureText(line);
        lineX = canvas.width - config.padding - metrics.width;
      }

      ctx.fillText(line, lineX, lineY);
    });

    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setResultDataUrl(dataUrl);
    setIsGenerating(false);
  }, [config, wrapText]);

  // 配置变化时重新生成
  useEffect(() => {
    const timer = setTimeout(() => {
      generateImage();
    }, 100);
    return () => clearTimeout(timer);
  }, [config, generateImage]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = "text-image.png";
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="文字转图片"
      description="将文字转换为图片，自定义字体颜色背景，多种预设样式，社交媒体配图一键生成"
      toolId="text-to-image"
      icon={Type}
      category="图片工具"
      slug="text-to-image"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 隐藏的canvas */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：预览 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  实时预览
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div
                className="bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                  </div>
                ) : resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="文字转图片预览"
                    className="max-w-full max-h-[500px] object-contain p-4"
                  />
                ) : null}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                <span>
                  尺寸: {config.width} × {config.autoHeight ? "自适应" : config.height}
                </span>
                <span>格式: PNG</span>
              </div>

              <button
                onClick={handleDownload}
                disabled={isGenerating || !resultDataUrl}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-pink-500/25 disabled:shadow-none hover:shadow-pink-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
              >
                <Download className="w-5 h-5" />
                下载图片
              </button>
            </div>
          </div>

          {/* 右侧：设置 */}
          <div className="space-y-6">
            {/* 预设样式 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    预设样式
                  </h2>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "minimal" as PresetStyle, label: "极简", color: "bg-white border-zinc-300" },
                    { value: "gradient" as PresetStyle, label: "渐变", color: "bg-gradient-to-br from-purple-500 to-pink-500" },
                    { value: "card" as PresetStyle, label: "卡片", color: "bg-white border-zinc-200 shadow-sm" },
                    { value: "dark" as PresetStyle, label: "暗黑", color: "bg-zinc-800" },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => applyPreset(preset.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        activePreset === preset.value
                          ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                          : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg ${preset.color}`} />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 文字设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    文字内容
                  </h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <textarea
                  value={config.text}
                  onChange={(e) => updateConfig({ text: e.target.value })}
                  placeholder="输入要转换的文字..."
                  className="w-full h-28 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm resize-none focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      字体大小
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="12"
                        max="120"
                        value={config.fontSize}
                        onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
                        className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                      />
                      <span className="w-12 text-right text-sm font-bold text-pink-500">
                        {config.fontSize}px
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      文字颜色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => updateConfig({ textColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.textColor}
                        onChange={(e) => updateConfig({ textColor: e.target.value })}
                        className="flex-1 px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    字体
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                  >
                    {fontFamilies.map((f) => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    对齐方式
                  </label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                    {[
                      { value: "left" as TextAlign, icon: AlignLeft, label: "左对齐" },
                      { value: "center" as TextAlign, icon: AlignCenter, label: "居中" },
                      { value: "right" as TextAlign, icon: AlignRight, label: "右对齐" },
                    ].map((align) => (
                      <button
                        key={align.value}
                        onClick={() => updateConfig({ textAlign: align.value })}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                          config.textAlign === align.value
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <align.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{align.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      行高
                    </label>
                    <span className="text-sm font-bold text-pink-500">
                      {config.lineHeight.toFixed(1)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={config.lineHeight}
                    onChange={(e) => updateConfig({ lineHeight: Number(e.target.value) })}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* 背景设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    背景与样式
                  </h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* 背景类型 */}
                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                  <button
                    onClick={() => updateConfig({ bgType: "solid" })}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      config.bgType === "solid"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    纯色
                  </button>
                  <button
                    onClick={() => updateConfig({ bgType: "gradient" })}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                      config.bgType === "gradient"
                        ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    渐变
                  </button>
                </div>

                {/* 背景颜色 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {config.bgType === "gradient" ? "起始颜色" : "背景颜色"}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.bgColor}
                        onChange={(e) => updateConfig({ bgColor: e.target.value })}
                        className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.bgColor}
                        onChange={(e) => updateConfig({ bgColor: e.target.value })}
                        className="flex-1 px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-pink-400"
                      />
                    </div>
                  </div>
                  {config.bgType === "gradient" && (
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        结束颜色
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={config.bgColor2}
                          onChange={(e) => updateConfig({ bgColor2: e.target.value })}
                          className="w-10 h-10 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={config.bgColor2}
                          onChange={(e) => updateConfig({ bgColor2: e.target.value })}
                          className="flex-1 px-2 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-pink-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {config.bgType === "gradient" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        渐变角度
                      </label>
                      <span className="text-sm font-bold text-pink-500">
                        {config.gradientAngle}°
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={config.gradientAngle}
                      onChange={(e) => updateConfig({ gradientAngle: Number(e.target.value) })}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}

                {/* 内边距和圆角 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        内边距
                      </label>
                      <span className="text-sm font-bold text-pink-500">
                        {config.padding}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      value={config.padding}
                      onChange={(e) => updateConfig({ padding: Number(e.target.value) })}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        圆角
                      </label>
                      <span className="text-sm font-bold text-pink-500">
                        {config.borderRadius}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={config.borderRadius}
                      onChange={(e) => updateConfig({ borderRadius: Number(e.target.value) })}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>

                {/* 阴影开关 */}
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    阴影效果
                  </span>
                  <button
                    onClick={() => updateConfig({ shadow: !config.shadow })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      config.shadow ? "bg-pink-500" : "bg-zinc-300 dark:bg-zinc-600"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        config.shadow ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </label>

                {config.shadow && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        阴影模糊
                      </label>
                      <span className="text-sm font-bold text-pink-500">
                        {config.shadowBlur}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={config.shadowBlur}
                      onChange={(e) => updateConfig({ shadowBlur: Number(e.target.value) })}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 尺寸设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    图片尺寸
                  </h2>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      宽度 (px)
                    </label>
                    <input
                      type="number"
                      value={config.width}
                      onChange={(e) => updateConfig({ width: Math.max(100, Number(e.target.value)) })}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20"
                      min="100"
                      max="2000"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        高度 (px)
                      </span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.height}
                        onChange={(e) => updateConfig({ height: Math.max(100, Number(e.target.value)) })}
                        disabled={config.autoHeight}
                        className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 disabled:opacity-50"
                        min="100"
                        max="2000"
                      />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.autoHeight}
                    onChange={(e) => updateConfig({ autoHeight: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-300 text-pink-500 focus:ring-pink-500"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    自适应高度
                  </span>
                </label>

                {/* 快捷尺寸 */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    快捷尺寸
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "微信", w: 900, h: 383 },
                      { label: "小红书", w: 1080, h: 1440 },
                      { label: "微博", w: 1080, h: 1080 },
                      { label: "公众号", w: 900, h: 500 },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => updateConfig({ width: preset.w, height: preset.h, autoHeight: false })}
                        className="px-2 py-2 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600 hover:text-pink-600 dark:hover:text-pink-400 transition-all"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <div className="text-sm font-medium text-pink-700 dark:text-pink-300">
                多种预设
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                极简、渐变、卡片、暗黑四种风格
              </p>
            </div>
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                高度自定义
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                字体、颜色、圆角、阴影自由调节
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                实时预览
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                修改参数即时查看效果
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
