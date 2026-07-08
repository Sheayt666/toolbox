"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  User,
  Download,
  RefreshCw,
  Palette,
  Maximize2,
  Circle,
  Square,
  Type,
  Shuffle,
} from "lucide-react";

type AvatarShape = "circle" | "square";
type GradientPreset = {
  name: string;
  colors: [string, string];
};

const gradientPresets: GradientPreset[] = [
  { name: "日落", colors: ["#ff6b6b", "#feca57"] },
  { name: "海洋", colors: ["#4facfe", "#00f2fe"] },
  { name: "森林", colors: ["#11998e", "#38ef7d"] },
  { name: "紫罗兰", colors: ["#8e2de2", "#4a00e0"] },
  { name: "玫瑰", colors: ["#ee0979", "#ff6a00"] },
  { name: "极光", colors: ["#00c6fb", "#005bea"] },
  { name: "樱桃", colors: ["#eb3349", "#f45c43"] },
  { name: "薄荷", colors: ["#00b09b", "#96c93d"] },
  { name: "暮色", colors: ["#654ea3", "#eaafc8"] },
  { name: "火焰", colors: ["#f12711", "#f5af19"] },
  { name: "冰川", colors: ["#2193b0", "#6dd5ed"] },
  { name: "薰衣草", colors: ["#a18cd1", "#fbc2eb"] },
];

function getInitials(name: string): string {
  if (!name.trim()) return "?";

  // 检测是否包含中文字符
  const chineseChars = name.match(/[\u4e00-\u9fa5]/g);
  if (chineseChars && chineseChars.length > 0) {
    // 取第一个汉字
    return chineseChars[0];
  }

  // 英文：取首字母
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

export default function AvatarGeneratorPage() {
  const [name, setName] = useState("工具箱");
  const [shape, setShape] = useState<AvatarShape>("circle");
  const [size, setSize] = useState(200);
  const [presetIndex, setPresetIndex] = useState(0);
  const [customColor1, setCustomColor1] = useState("#ff6b6b");
  const [customColor2, setCustomColor2] = useState("#feca57");
  const [fontSize, setFontSize] = useState(40);
  const [textColor, setTextColor] = useState("#ffffff");
  const [useCustomColors, setUseCustomColors] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = useCustomColors
    ? [customColor1, customColor2] as [string, string]
    : gradientPresets[presetIndex].colors;

  // 生成随机颜色
  const handleRandom = () => {
    const randomIndex = Math.floor(Math.random() * gradientPresets.length);
    setPresetIndex(randomIndex);
    setUseCustomColors(false);
  };

  // 绘制头像
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.clip();
    } else {
      ctx.fillStyle = gradient;
      // 方形带圆角
      const radius = size * 0.15;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();
    }

    // 绘制文字
    const text = getInitials(name);
    const fontSizePx = (size * fontSize) / 100;

    ctx.font = `bold ${fontSizePx}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;

    // 文字阴影
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = size * 0.02;
    ctx.shadowOffsetY = size * 0.01;

    ctx.fillText(text, size / 2, size / 2);
  }, [name, shape, size, colors, fontSize, textColor]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `avatar_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const sizePresets = [
    { label: "S", size: 100, desc: "100px" },
    { label: "M", size: 200, desc: "200px" },
    { label: "L", size: 400, desc: "400px" },
    { label: "XL", size: 512, desc: "512px" },
  ];

  return (
    <ToolLayout
      title="头像生成器"
      description="生成个性化头像，文字头像、渐变背景、多种配色方案，一键下载，本地处理安全可靠"
      toolId="avatar-generator"
      icon={User}
      category="图片工具"
      slug="avatar-generator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：控制面板 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm space-y-6">
            {/* 文字输入 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Type className="w-4 h-4 text-violet-500" />
                头像文字
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入名字或昵称..."
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                中文取首字，英文取首字母
              </p>
            </div>

            {/* 形状选择 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Circle className="w-4 h-4 text-violet-500" />
                头像形状
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShape("circle")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    shape === "circle"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                  }`}
                >
                  <Circle className="w-5 h-5" />
                  圆形
                </button>
                <button
                  onClick={() => setShape("square")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                    shape === "square"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                  }`}
                >
                  <Square className="w-5 h-5" />
                  方形
                </button>
              </div>
            </div>

            {/* 尺寸选择 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Maximize2 className="w-4 h-4 text-violet-500" />
                头像尺寸
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {sizePresets.map((preset) => (
                  <button
                    key={preset.size}
                    onClick={() => setSize(preset.size)}
                    className={`flex flex-col items-center py-2.5 rounded-lg font-medium transition-all ${
                      size === preset.size
                        ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                        : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                    }`}
                  >
                    <span className="text-sm">{preset.label}</span>
                    <span className="text-xs opacity-70">{preset.desc}</span>
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="50"
                max="512"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-1 text-xs text-zinc-500 dark:text-zinc-500">
                <span>50px</span>
                <span>{size}px</span>
                <span>512px</span>
              </div>
            </div>

            {/* 配色方案 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Palette className="w-4 h-4 text-violet-500" />
                  配色方案
                </label>
                <button
                  onClick={handleRandom}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  随机
                </button>
              </div>

              {/* 预设配色 */}
              <div className="grid grid-cols-6 gap-2 mb-4">
                {gradientPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPresetIndex(idx);
                      setUseCustomColors(false);
                    }}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      !useCustomColors && presetIndex === idx
                        ? "border-violet-500 scale-110 shadow-lg shadow-violet-500/30"
                        : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-600"
                    }`}
                    title={preset.name}
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                    }}
                  />
                ))}
              </div>

              {/* 自定义颜色 */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    自定义颜色
                  </span>
                  <button
                    onClick={() => setUseCustomColors(!useCustomColors)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      useCustomColors
                        ? "bg-violet-500 text-white"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {useCustomColors ? "已启用" : "启用"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      起始色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor1}
                        onChange={(e) => {
                          setCustomColor1(e.target.value);
                          setUseCustomColors(true);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                      />
                      <input
                        type="text"
                        value={customColor1}
                        onChange={(e) => {
                          setCustomColor1(e.target.value);
                          setUseCustomColors(true);
                        }}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      结束色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customColor2}
                        onChange={(e) => {
                          setCustomColor2(e.target.value);
                          setUseCustomColors(true);
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                      />
                      <input
                        type="text"
                        value={customColor2}
                        onChange={(e) => {
                          setCustomColor2(e.target.value);
                          setUseCustomColors(true);
                        }}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 文字设置 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Type className="w-4 h-4 text-violet-500" />
                文字设置
              </label>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      文字大小
                    </span>
                    <span className="text-xs font-medium text-violet-500">
                      {fontSize}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    文字颜色
                  </span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* 下载按钮 */}
            <button
              onClick={handleDownload}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              下载头像 (PNG)
            </button>
          </div>

          {/* 右侧：预览 */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                实时预览
              </h2>
            </div>

            <div className="flex flex-col items-center justify-center min-h-[400px] bg-zinc-50 dark:bg-zinc-800/30 rounded-xl p-8">
              {/* 棋盘格背景（用于透明效果展示） */}
              <div
                className="relative"
                style={{
                  backgroundImage:
                    "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  padding: "20px",
                  borderRadius: "16px",
                }}
              >
                <canvas ref={canvasRef} className="block" />
              </div>

              <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
                尺寸: {size} × {size} px
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                PNG格式 · 高清无损
              </p>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-100 dark:border-violet-900/30">
              <h3 className="text-xs font-medium text-violet-700 dark:text-violet-300 mb-2 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                小贴士
              </h3>
              <ul className="text-xs text-violet-600 dark:text-violet-400 space-y-1">
                <li>• 点击「随机」按钮快速切换配色方案</li>
                <li>• 支持自定义渐变色，打造专属头像</li>
                <li>• 圆形头像背景透明，可直接使用</li>
                <li>• 最大支持512px高清输出</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
