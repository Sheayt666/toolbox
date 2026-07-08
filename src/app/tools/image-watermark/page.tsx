"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Droplets,
  Upload,
  Download,
  Trash2,
  Settings,
  Type,
  Image as ImageIcon,
  RotateCw,
  AlignCenter,
} from "lucide-react";

type WatermarkMode = "text" | "image";
type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const positionLabels: Record<WatermarkPosition, string> = {
  "top-left": "左上",
  "top-center": "顶部居中",
  "top-right": "右上",
  "middle-left": "左侧居中",
  "middle-center": "居中",
  "middle-right": "右侧居中",
  "bottom-left": "左下",
  "bottom-center": "底部居中",
  "bottom-right": "右下",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageWatermarkPage() {
  const [mode, setMode] = useState<WatermarkMode>("text");
  const [originalImage, setOriginalImage] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [watermarkImage, setWatermarkImage] = useState<{
    dataUrl: string;
    width: number;
    height: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  // 文字水印设置
  const [watermarkText, setWatermarkText] = useState("© 工具箱");
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textOpacity, setTextOpacity] = useState(50);
  const [position, setPosition] = useState<WatermarkPosition>("bottom-right");
  const [rotation, setRotation] = useState(0);
  const [margin, setMargin] = useState(20);

  // 图片水印设置
  const [imageScale, setImageScale] = useState(20);
  const [imageOpacity, setImageOpacity] = useState(80);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fontFamilies = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: '"Microsoft YaHei"', label: "微软雅黑" },
    { value: '"PingFang SC"', label: "苹方" },
    { value: '"SimSun"', label: "宋体" },
  ];

  // 计算水印位置
  const getWatermarkPosition = (
    imgWidth: number,
    imgHeight: number,
    wmWidth: number,
    wmHeight: number,
    pos: WatermarkPosition,
    m: number
  ): { x: number; y: number } => {
    let x = 0,
      y = 0;

    switch (pos) {
      case "top-left":
        x = m + wmWidth / 2;
        y = m + wmHeight / 2;
        break;
      case "top-center":
        x = imgWidth / 2;
        y = m + wmHeight / 2;
        break;
      case "top-right":
        x = imgWidth - m - wmWidth / 2;
        y = m + wmHeight / 2;
        break;
      case "middle-left":
        x = m + wmWidth / 2;
        y = imgHeight / 2;
        break;
      case "middle-center":
        x = imgWidth / 2;
        y = imgHeight / 2;
        break;
      case "middle-right":
        x = imgWidth - m - wmWidth / 2;
        y = imgHeight / 2;
        break;
      case "bottom-left":
        x = m + wmWidth / 2;
        y = imgHeight - m - wmHeight / 2;
        break;
      case "bottom-center":
        x = imgWidth / 2;
        y = imgHeight - m - wmHeight / 2;
        break;
      case "bottom-right":
        x = imgWidth - m - wmWidth / 2;
        y = imgHeight - m - wmHeight / 2;
        break;
    }

    return { x, y };
  };

  // 添加水印
  const addWatermark = useCallback(() => {
    if (!originalImage) return;

    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制原图
      ctx.drawImage(img, 0, 0);

      if (mode === "text") {
        // 文字水印
        const fontSizePx = (fontSize / 1000) * Math.max(img.width, img.height);
        ctx.font = `bold ${fontSizePx}px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // 测量文字尺寸
        const metrics = ctx.measureText(watermarkText);
        const textWidth = metrics.width;
        const textHeight = fontSizePx * 1.2;

        const pos = getWatermarkPosition(
          img.width,
          img.height,
          textWidth,
          textHeight,
          position,
          margin * (img.width / 1000)
        );

        ctx.save();
        ctx.globalAlpha = textOpacity / 100;
        ctx.translate(pos.x, pos.y);
        ctx.rotate((rotation * Math.PI) / 180);

        // 文字阴影
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = fontSizePx * 0.15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = fontSizePx * 0.05;

        ctx.fillStyle = textColor;
        ctx.fillText(watermarkText, 0, 0);
        ctx.restore();
      } else if (mode === "image" && watermarkImage) {
        // 图片水印
        const wmImg = new Image();
        wmImg.onload = () => {
          const scale = imageScale / 100;
          const wmWidth = img.width * scale;
          const wmHeight = (wmImg.height / wmImg.width) * wmWidth;

          const pos = getWatermarkPosition(
            img.width,
            img.height,
            wmWidth,
            wmHeight,
            position,
            margin * (img.width / 1000)
          );

          ctx.save();
          ctx.globalAlpha = imageOpacity / 100;
          ctx.translate(pos.x, pos.y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
          ctx.restore();

          finishWatermark(canvas);
        };
        wmImg.src = watermarkImage.dataUrl;
        return;
      }

      finishWatermark(canvas);
    };

    const finishWatermark = (cvs: HTMLCanvasElement) => {
      const dataUrl = cvs.toDataURL("image/png");
      setResultDataUrl(dataUrl);

      // 计算大小
      const base64 = dataUrl.split(",")[1];
      setResultSize(Math.round((base64.length * 3) / 4));

      setIsProcessing(false);
    };

    img.src = originalImage.dataUrl;
  }, [
    originalImage,
    mode,
    watermarkText,
    fontSize,
    fontFamily,
    textColor,
    textOpacity,
    position,
    rotation,
    margin,
    watermarkImage,
    imageScale,
    imageOpacity,
  ]);

  // 参数变化时重新生成
  useEffect(() => {
    if (!originalImage) return;

    const timer = setTimeout(() => {
      addWatermark();
    }, 100);

    return () => clearTimeout(timer);
  }, [
    mode,
    watermarkText,
    fontSize,
    fontFamily,
    textColor,
    textOpacity,
    position,
    rotation,
    margin,
    watermarkImage,
    imageScale,
    imageOpacity,
    addWatermark,
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
        setOriginalImage({
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
          width: img.width,
          height: img.height,
        });
        setResultDataUrl("");
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const processWatermarkFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;

      const img = new Image();
      img.onload = () => {
        setWatermarkImage({
          dataUrl,
          width: img.width,
          height: img.height,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleWatermarkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processWatermarkFile(file);
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
    setOriginalImage(null);
    setResultDataUrl("");
    setWatermarkImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `${originalImage?.name.replace(/\.[^.]+$/, "")}_watermarked.png`;
    link.href = resultDataUrl;
    link.click();
  };

  const positions: WatermarkPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "middle-center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
  ];

  return (
    <ToolLayout
      title="图片加水印"
      description="给图片添加文字或图片水印，支持位置选择、透明度调节、旋转，本地处理安全可靠"
      toolId="image-watermark"
      icon={Droplets}
      category="图片工具"
      slug="image-watermark"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {/* 上传区域 */}
        {!originalImage ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-cyan-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  上传图片
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-72 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Droplets
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-cyan-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
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
            </div>
          </div>
        ) : (
          <>
            {/* 模式切换 + 预览 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-cyan-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      水印效果预览
                    </h2>
                  </div>
                  {/* 模式切换 */}
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setMode("text")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        mode === "text"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      <Type className="w-4 h-4" />
                      文字水印
                    </button>
                    <button
                      onClick={() => setMode("image")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                        mode === "image"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      图片水印
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  重新上传
                </button>
              </div>

              <div className="p-6">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Droplets className="w-10 h-10 text-cyan-500 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">处理中...</p>
                      </div>
                    </div>
                  )}
                  {resultDataUrl ? (
                    <img
                      src={resultDataUrl}
                      alt="水印效果"
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <img
                      src={originalImage.dataUrl}
                      alt="原图"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>

                {/* 图片信息 */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      原始大小
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatSize(originalImage.size)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      图片尺寸
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {originalImage.width} × {originalImage.height}
                    </div>
                  </div>
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg">
                    <div className="text-xs text-cyan-600 dark:text-cyan-400 mb-1">
                      输出大小
                    </div>
                    <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                      {resultSize ? formatSize(resultSize) : "-"}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      文件名
                    </div>
                    <div
                      className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
                      title={originalImage.name}
                    >
                      {originalImage.name}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 水印设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-cyan-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    水印设置
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {mode === "text" ? (
                  <div className="space-y-6">
                    {/* 水印文字 */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                        <Type className="w-4 h-4 text-cyan-500" />
                        水印文字
                      </label>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="输入水印文字..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                      />
                    </div>

                    {/* 字体 + 大小 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          字体
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                        >
                          {fontFamilies.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            字体大小
                          </label>
                          <span className="text-sm font-bold text-cyan-500">
                            {fontSize}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>

                    {/* 颜色 + 透明度 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          文字颜色
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            透明度
                          </label>
                          <span className="text-sm font-bold text-cyan-500">
                            {textOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={textOpacity}
                          onChange={(e) => setTextOpacity(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 上传水印图片 */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                        <ImageIcon className="w-4 h-4 text-cyan-500" />
                        水印图片
                      </label>
                      {watermarkImage ? (
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                            <img
                              src={watermarkImage.dataUrl}
                              alt="水印"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              {watermarkImage.width} × {watermarkImage.height}
                            </p>
                            <button
                              onClick={() => setWatermarkImage(null)}
                              className="mt-2 text-xs text-red-500 hover:text-red-600"
                            >
                              移除水印图片
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => watermarkInputRef.current?.click()}
                          className="h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer hover:border-cyan-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all"
                        >
                          <Upload className="w-8 h-8 text-zinc-400 mb-1" />
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            点击上传水印图片（支持PNG透明）
                          </span>
                          <input
                            ref={watermarkInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleWatermarkFileChange}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* 缩放 + 透明度 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            缩放比例
                          </label>
                          <span className="text-sm font-bold text-cyan-500">
                            {imageScale}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={imageScale}
                          onChange={(e) => setImageScale(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            透明度
                          </label>
                          <span className="text-sm font-bold text-cyan-500">
                            {imageOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="100"
                          value={imageOpacity}
                          onChange={(e) => setImageOpacity(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 公共设置：位置、旋转、边距 */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-6">
                  {/* 位置选择 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <AlignCenter className="w-4 h-4 text-cyan-500" />
                      水印位置
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                      {positions.map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setPosition(pos)}
                          className={`aspect-square flex items-center justify-center rounded-lg font-medium text-xs transition-all ${
                            position === pos
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-cyan-300 dark:hover:border-cyan-600"
                          }`}
                          title={positionLabels[pos]}
                        >
                          {positionLabels[pos]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 旋转 + 边距 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="flex items-center gap-1.5 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          <RotateCw className="w-4 h-4 text-cyan-500" />
                          旋转角度
                        </label>
                        <span className="text-sm font-bold text-cyan-500">
                          {rotation}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={rotation}
                        onChange={(e) => setRotation(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          边距
                        </label>
                        <span className="text-sm font-bold text-cyan-500">
                          {margin}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={margin}
                        onChange={(e) => setMargin(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* 下载按钮 */}
                <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <button
                    onClick={handleDownload}
                    disabled={!resultDataUrl || isProcessing}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 disabled:shadow-none hover:shadow-cyan-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    <Download className="w-5 h-5" />
                    下载带水印图片
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
              <div className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                本地处理
              </div>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                两种模式
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                支持文字水印和图片水印
              </p>
            </div>
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                9宫格定位
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                快速选择水印位置
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
