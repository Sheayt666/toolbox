"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Monitor,
  Upload,
  Download,
  Trash2,
  Settings,
  Palette,
  Maximize2,
  Sparkles,
  MonitorPlay,
  Square,
  Radius,
  Box,
} from "lucide-react";

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  dataUrl: string;
}

type BackgroundType = "gradient" | "solid" | "transparent";
type DeviceFrame = "none" | "browser" | "simple";

interface GradientPreset {
  name: string;
  colors: string[];
  angle: number;
}

const gradientPresets: GradientPreset[] = [
  { name: "晨雾", colors: ["#a8edea", "#fed6e3"], angle: 135 },
  { name: "夕阳", colors: ["#ff9a9e", "#fecfef"], angle: 135 },
  { name: "海洋", colors: ["#667eea", "#764ba2"], angle: 135 },
  { name: "森林", colors: ["#11998e", "#38ef7d"], angle: 135 },
  { name: "极光", colors: ["#a18cd1", "#fbc2eb"], angle: 135 },
  { name: "暖阳", colors: ["#f6d365", "#fda085"], angle: 135 },
  { name: "深海", colors: ["#2c3e50", "#4ca1af"], angle: 135 },
  { name: "樱花", colors: ["#ffecd2", "#fcb69f"], angle: 135 },
];

const solidPresets = [
  "#ffffff",
  "#f8fafc",
  "#f1f5f9",
  "#1e293b",
  "#0f172a",
  "#000000",
  "#fef3c7",
  "#dbeafe",
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ScreenshotMakerPage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  // 设置项
  const [borderRadius, setBorderRadius] = useState(12);
  const [shadowIntensity, setShadowIntensity] = useState(40);
  const [padding, setPadding] = useState(40);
  const [bgType, setBgType] = useState<BackgroundType>("gradient");
  const [solidColor, setSolidColor] = useState("#ffffff");
  const [gradientIndex, setGradientIndex] = useState(0);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>("none");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 生成美化后的截图
  const generateScreenshot = useCallback(() => {
    if (!imageInfo) return;

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // 计算画布尺寸
      const paddingPx = padding;
      const shadowOffset = shadowIntensity * 0.3;
      const shadowBlur = shadowIntensity * 0.8;

      let frameTop = 0;
      let frameHeight = 0;
      if (deviceFrame === "browser") {
        frameTop = 40;
        frameHeight = 40;
      } else if (deviceFrame === "simple") {
        frameTop = 8;
        frameHeight = 8;
      }

      const totalPadding = paddingPx * 2 + shadowBlur * 2 + shadowOffset;
      canvas.width = img.width + totalPadding;
      canvas.height = img.height + totalPadding + frameHeight;

      // 绘制背景
      if (bgType === "transparent") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (bgType === "solid") {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // 渐变背景
        const preset = gradientPresets[gradientIndex];
        const angle = (preset.angle * Math.PI) / 180;
        const x0 = canvas.width / 2 - (Math.cos(angle) * canvas.width) / 2;
        const y0 = canvas.height / 2 - (Math.sin(angle) * canvas.height) / 2;
        const x1 = canvas.width / 2 + (Math.cos(angle) * canvas.width) / 2;
        const y1 = canvas.height / 2 + (Math.sin(angle) * canvas.height) / 2;
        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);
        gradient.addColorStop(0, preset.colors[0]);
        gradient.addColorStop(1, preset.colors[1]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 计算截图位置
      const imgX = shadowBlur + paddingPx;
      const imgY = shadowBlur + paddingPx + frameTop;

      // 绘制阴影
      ctx.save();
      ctx.shadowColor = `rgba(0, 0, 0, ${shadowIntensity / 100})`;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetY = shadowOffset;

      // 设备外壳
      if (deviceFrame === "browser") {
        // 浏览器窗口样式
        const frameX = imgX - 1;
        const frameY = imgY - frameTop;
        const frameW = img.width + 2;
        const frameH = img.height + frameTop;

        // 浏览器顶部栏
        ctx.fillStyle = "#f1f5f9";
        roundRect(ctx, frameX, frameY, frameW, frameTop, 10);
        ctx.fill();

        // 三个圆点
        const dotY = frameY + frameTop / 2;
        const dotStartX = frameX + 16;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(dotStartX, dotY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.arc(dotStartX + 20, dotY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.arc(dotStartX + 40, dotY, 6, 0, Math.PI * 2);
        ctx.fill();

        // 地址栏
        ctx.fillStyle = "#e2e8f0";
        roundRect(ctx, frameX + 80, frameY + 8, frameW - 100, frameTop - 16, 4);
        ctx.fill();
      } else if (deviceFrame === "simple") {
        // 简单边框
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
      }

      // 绘制截图（带圆角）
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, imgX, imgY, img.width, img.height, borderRadius);
      ctx.clip();
      ctx.drawImage(img, imgX, imgY);
      ctx.restore();

      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      setResultDataUrl(dataUrl);

      // 计算大小
      const base64 = dataUrl.split(",")[1];
      setResultSize(Math.round((base64.length * 3) / 4));

      setIsProcessing(false);
    };
    img.onerror = () => {
      setIsProcessing(false);
      alert("图片加载失败");
    };
    img.src = imageInfo.dataUrl;
  }, [
    imageInfo,
    borderRadius,
    shadowIntensity,
    padding,
    bgType,
    solidColor,
    gradientIndex,
    deviceFrame,
  ]);

  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // 参数变化时重新生成
  useEffect(() => {
    if (!imageInfo) return;

    const timer = setTimeout(() => {
      generateScreenshot();
    }, 100);

    return () => clearTimeout(timer);
  }, [
    imageInfo,
    borderRadius,
    shadowIntensity,
    padding,
    bgType,
    solidColor,
    gradientIndex,
    deviceFrame,
    generateScreenshot,
  ]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          dataUrl,
        });
        setResultDataUrl("");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClear = () => {
    setImageInfo(null);
    setResultDataUrl("");
    setResultSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `${imageInfo?.name.replace(/\.[^.]+$/, "")}_beautified.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="截图美化工具"
      description="给截图添加圆角、阴影、背景渐变和设备外壳，制作精美的展示图，一键生成高端大气的截图"
      toolId="screenshot-maker"
      icon={MonitorPlay}
      category="图片工具"
      slug="screenshot-maker"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 / 预览区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {imageInfo ? "美化效果预览" : "上传截图"}
              </h2>
            </div>
            {imageInfo && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                重新上传
              </button>
            )}
          </div>

          <div className="p-6">
            {!imageInfo ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-72 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-orange-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-orange-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDragging ? "释放鼠标上传截图" : "点击或拖拽上传截图"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、WebP 等格式
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl min-h-[400px]">
                <div className="relative">
                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Sparkles className="w-10 h-10 text-orange-500 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">生成中...</p>
                      </div>
                    </div>
                  )}
                  {resultDataUrl ? (
                    <img
                      src={resultDataUrl}
                      alt="美化结果"
                      className="max-w-full max-h-[500px] object-contain rounded-lg"
                      style={{ opacity: isProcessing ? 0.3 : 1 }}
                    />
                  ) : (
                    <img
                      src={imageInfo.dataUrl}
                      alt="原图"
                      className="max-w-full max-h-[500px] object-contain rounded-lg"
                    />
                  )}
                </div>
              </div>
            )}

            {imageInfo && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    原始大小
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {formatSize(imageInfo.size)}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    图片尺寸
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {imageInfo.width} × {imageInfo.height}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-xs text-orange-600 dark:text-orange-400 mb-1">
                    输出大小
                  </div>
                  <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {resultSize ? formatSize(resultSize) : "-"}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    文件名
                  </div>
                  <div
                    className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
                    title={imageInfo.name}
                  >
                    {imageInfo.name}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 美化设置 */}
        {imageInfo && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  美化设置
                </h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 圆角 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Radius className="w-4 h-4 text-orange-500" />
                    圆角大小
                  </label>
                  <span className="text-sm font-bold text-orange-500">
                    {borderRadius} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* 阴影强度 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Box className="w-4 h-4 text-orange-500" />
                    阴影强度
                  </label>
                  <span className="text-sm font-bold text-orange-500">
                    {shadowIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={shadowIntensity}
                  onChange={(e) => setShadowIntensity(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* 内边距 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Maximize2 className="w-4 h-4 text-orange-500" />
                    内边距
                  </label>
                  <span className="text-sm font-bold text-orange-500">
                    {padding} px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* 设备外壳 */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  <MonitorPlay className="w-4 h-4 text-orange-500" />
                  设备外壳
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "none", label: "无", icon: Square },
                    { value: "simple", label: "简约", icon: Square },
                    { value: "browser", label: "浏览器", icon: Monitor },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        onClick={() => setDeviceFrame(item.value as DeviceFrame)}
                        className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                          deviceFrame === item.value
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 背景类型 */}
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  <Palette className="w-4 h-4 text-orange-500" />
                  背景样式
                </label>
                <div className="flex gap-2 mb-4">
                  {[
                    { value: "gradient", label: "渐变" },
                    { value: "solid", label: "纯色" },
                    { value: "transparent", label: "透明" },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setBgType(item.value as BackgroundType)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                        bgType === item.value
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* 渐变预设 */}
                {bgType === "gradient" && (
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {gradientPresets.map((preset, index) => (
                      <button
                        key={preset.name}
                        onClick={() => setGradientIndex(index)}
                        className={`aspect-square rounded-xl border-2 transition-all ${
                          gradientIndex === index
                            ? "border-orange-500 scale-105 shadow-md"
                            : "border-zinc-200 dark:border-zinc-700 hover:scale-105"
                        }`}
                        style={{
                          background: `linear-gradient(${preset.angle}deg, ${preset.colors[0]}, ${preset.colors[1]})`,
                        }}
                        title={preset.name}
                      />
                    ))}
                  </div>
                )}

                {/* 纯色预设 */}
                {bgType === "solid" && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {solidPresets.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSolidColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          solidColor === color
                            ? "border-orange-500 scale-110 shadow-md"
                            : "border-zinc-200 dark:border-zinc-700 hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                      />
                      <input
                        type="text"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="w-24 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 下载按钮 */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={handleDownload}
                  disabled={!resultDataUrl || isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-orange-500/25 disabled:shadow-none hover:shadow-orange-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                >
                  <Download className="w-5 h-5" />
                  下载美化截图
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <div className="text-sm font-medium text-orange-700 dark:text-orange-300">
                本地处理
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                截图不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                精美背景
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                渐变、纯色、透明多种背景可选
              </p>
            </div>
            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <div className="text-sm font-medium text-sky-700 dark:text-sky-300">
                设备外壳
              </div>
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                浏览器样式外壳，展示更专业
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
