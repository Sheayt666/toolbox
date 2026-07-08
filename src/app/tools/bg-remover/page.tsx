"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Wand2,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Eye,
  EyeOff,
  Pipette,
  CircleDot,
  Sparkles,
  User,
  Package,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  type: string;
}

type PresetMode = "custom" | "white-bg" | "green-screen" | "portrait";
type ToolMode = "pick-color" | "none";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

function colorDistance(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const rmean = (r1 + r2) / 2;
  const r = r1 - r2;
  const g = g1 - g2;
  const b = b1 - b2;
  return Math.sqrt(
    (2 + rmean / 256) * r * r + 4 * g * g + (2 + (255 - rmean) / 256) * b * b
  );
}

export default function BgRemoverPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

  const [presetMode, setPresetMode] = useState<PresetMode>("white-bg");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [tolerance, setTolerance] = useState(30);
  const [feather, setFeather] = useState(5);
  const [toolMode, setToolMode] = useState<ToolMode>("none");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [imageDisplaySize, setImageDisplaySize] = useState({
    width: 0,
    height: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const calculateDisplayScale = useCallback(
    (
      imgWidth: number,
      imgHeight: number,
      containerWidth: number,
      containerHeight: number
    ) => {
      const scaleX = containerWidth / imgWidth;
      const scaleY = containerHeight / imgHeight;
      return Math.min(scaleX, scaleY, 1);
    },
    []
  );

  const updateImageDisplay = useCallback(() => {
    if (!imageData || !containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scale = calculateDisplayScale(
      imageData.originalWidth,
      imageData.originalHeight,
      containerWidth,
      containerHeight
    );
    const displayWidth = imageData.originalWidth * scale;
    const displayHeight = imageData.originalHeight * scale;
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    setDisplayScale(scale);
    setImageDisplaySize({ width: displayWidth, height: displayHeight, offsetX, offsetY });
  }, [imageData, calculateDisplayScale]);

  useEffect(() => {
    updateImageDisplay();
    const handleResize = () => updateImageDisplay();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateImageDisplay, imageData]);

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;

      const img = new Image();
      img.onload = () => {
        setImageData({
          name: file.name,
          originalSize: file.size,
          originalWidth: img.width,
          originalHeight: img.height,
          originalDataUrl: dataUrl,
          type: file.type,
        });
        setIsProcessing(false);
      };
      img.onerror = () => {
        alert("图片加载失败");
        setIsProcessing(false);
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
    setImageData(null);
    setResultDataUrl("");
    setResultSize(0);
    setToolMode("none");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setTolerance(30);
    setFeather(5);
    setBgColor("#ffffff");
    setPresetMode("white-bg");
  };

  // 检测肤色像素
  const isSkinColor = (r: number, g: number, b: number): boolean => {
    const minVal = Math.min(r, g, b);
    const maxVal = Math.max(r, g, b);
    if (maxVal < 60 || minVal > 220) return false;
    if (r < 95 || g < 40 || b < 20) return false;
    if (maxVal - minVal < 15) return false;
    if (Math.abs(r - g) < 15) return false;
    return r > g && g > b;
  };

  // 应用背景移除
  useEffect(() => {
    if (!imageData) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);

      const canvas = document.createElement("canvas");
      canvas.width = imageData.originalWidth;
      canvas.height = imageData.originalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);

        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageDataObj.data;

        let targetR = 255,
          targetG = 255,
          targetB = 255;

        if (presetMode === "custom" || presetMode === "white-bg") {
          const rgb = hexToRgb(bgColor);
          targetR = rgb.r;
          targetG = rgb.g;
          targetB = rgb.b;
        } else if (presetMode === "green-screen") {
          targetR = 0;
          targetG = 255;
          targetB = 0;
        }

        const tol = tolerance;
        const featherAmount = feather;

        if (presetMode === "portrait") {
          // 人像抠图 - 基于边缘采样检测背景色 + 肤色保护
          const edgeColors: { r: number; g: number; b: number }[] = [];
          const step = Math.max(1, Math.floor(canvas.width / 20));
          for (let x = 0; x < canvas.width; x += step) {
            const idxTop = x * 4;
            const idxBottom = ((canvas.height - 1) * canvas.width + x) * 4;
            edgeColors.push({
              r: data[idxTop],
              g: data[idxTop + 1],
              b: data[idxTop + 2],
            });
            edgeColors.push({
              r: data[idxBottom],
              g: data[idxBottom + 1],
              b: data[idxBottom + 2],
            });
          }
          const stepY = Math.max(1, Math.floor(canvas.height / 20));
          for (let y = 0; y < canvas.height; y += stepY) {
            const idxLeft = (y * canvas.width) * 4;
            const idxRight = (y * canvas.width + canvas.width - 1) * 4;
            edgeColors.push({
              r: data[idxLeft],
              g: data[idxLeft + 1],
              b: data[idxLeft + 2],
            });
            edgeColors.push({
              r: data[idxRight],
              g: data[idxRight + 1],
              b: data[idxRight + 2],
            });
          }

          let avgR = 0,
            avgG = 0,
            avgB = 0;
          edgeColors.forEach((c) => {
            avgR += c.r;
            avgG += c.g;
            avgB += c.b;
          });
          avgR = Math.round(avgR / edgeColors.length);
          avgG = Math.round(avgG / edgeColors.length);
          avgB = Math.round(avgB / edgeColors.length);

          targetR = avgR;
          targetG = avgG;
          targetB = avgB;
        }

        // 移除背景
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (presetMode === "portrait") {
            const bgDist = colorDistance(r, g, b, targetR, targetG, targetB);
            const isSkin = isSkinColor(r, g, b);

            if (bgDist < tol && !isSkin) {
              const alpha = Math.min(
                255,
                Math.max(0, ((bgDist - (tol - featherAmount)) / Math.max(1, featherAmount)) * 255)
              );
              data[i + 3] = alpha;
            } else {
              data[i + 3] = 255;
            }
          } else {
            const dist = colorDistance(r, g, b, targetR, targetG, targetB);

            if (dist < tol) {
              const alpha = Math.min(
                255,
                Math.max(
                  0,
                  ((dist - (tol - featherAmount)) / Math.max(1, featherAmount)) * 255
                )
              );
              data[i + 3] = alpha;
            } else {
              data[i + 3] = 255;
            }
          }
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageDataObj, 0, 0);

        const dataUrl = canvas.toDataURL("image/png");
        const base64 = dataUrl.split(",")[1];
        const size = Math.round((base64.length * 3) / 4);

        setResultDataUrl(dataUrl);
        setResultSize(size);
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = imageData.originalDataUrl;
    }, 200);

    return () => clearTimeout(timer);
  }, [imageData, bgColor, tolerance, feather, presetMode]);

  // 点击取色 - 在原图上取色
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (toolMode !== "pick-color" || !imageData) return;

    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * imageData.originalWidth;
    const y = ((e.clientY - rect.top) / rect.height) * imageData.originalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = imageData.originalWidth;
    canvas.height = imageData.originalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const tempImg = new Image();
    tempImg.onload = () => {
      ctx.drawImage(tempImg, 0, 0);
      const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setBgColor(hex);
      setPresetMode("custom");
      setToolMode("none");
    };
    tempImg.src = imageData.originalDataUrl;
  };

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_no_bg.png`;
    link.href = resultDataUrl;
    link.click();
  };

  const presets = [
    { value: "white-bg", label: "白色背景", icon: Package },
    { value: "green-screen", label: "绿幕抠图", icon: Sparkles },
    { value: "portrait", label: "人像抠图", icon: User },
    { value: "custom", label: "自定义", icon: Pipette },
  ];

  return (
    <ToolLayout
      title="图片抠图（背景移除）"
      description="在线一键移除图片背景，支持色度键抠图、容差调整、边缘羽化，生成透明背景PNG图片"
      toolId="bg-remover"
      icon={Wand2}
      category="图片工具"
      slug="bg-remover"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-500" />
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
                    ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-purple-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  支持 JPG、PNG、WebP 格式
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* 预览区域 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    抠图预览
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-purple-500 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
                  >
                    {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showOriginal ? "看效果" : "看原图"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-purple-500 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重置
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    重新上传
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div
                  ref={containerRef}
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{
                    height: "400px",
                    backgroundImage:
                      "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                >
                  {/* 隐藏的canvas用于取色 */}
                  <canvas ref={hiddenCanvasRef} className="hidden" />

                  {showOriginal ? (
                    <img
                      src={imageData.originalDataUrl}
                      alt="原图"
                      onClick={handleImageClick}
                      className={`absolute select-none ${
                        toolMode === "pick-color" ? "cursor-crosshair" : "cursor-default"
                      }`}
                      style={{
                        left: imageDisplaySize.offsetX,
                        top: imageDisplaySize.offsetY,
                        width: imageDisplaySize.width,
                        height: imageDisplaySize.height,
                      }}
                      draggable={false}
                    />
                  ) : isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
                      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={resultDataUrl}
                      alt="抠图效果"
                      onClick={handleImageClick}
                      className={`absolute select-none ${
                        toolMode === "pick-color" ? "cursor-crosshair" : "cursor-default"
                      }`}
                      style={{
                        left: imageDisplaySize.offsetX,
                        top: imageDisplaySize.offsetY,
                        width: imageDisplaySize.width,
                        height: imageDisplaySize.height,
                      }}
                      draggable={false}
                    />
                  )}

                  {toolMode === "pick-color" && (
                    <div className="absolute top-3 left-3 px-3 py-1.5 bg-purple-500 text-white text-xs font-medium rounded-lg shadow-lg">
                      <Pipette className="w-3.5 h-3.5 inline mr-1" />
                      点击图片选取背景颜色
                    </div>
                  )}
                </div>

                {/* 信息 */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      原始大小
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {formatSize(imageData.originalSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      输出大小
                    </div>
                    <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {formatSize(resultSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                      模式
                    </div>
                    <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {presets.find((p) => p.value === presetMode)?.label}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      图片尺寸
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {imageData.originalWidth} × {imageData.originalHeight}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 设置和下载 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      抠图设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 预设模式 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      抠图模式
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((preset) => {
                        const PresetIcon = preset.icon;
                        return (
                          <button
                            key={preset.value}
                            onClick={() => {
                              setPresetMode(preset.value as PresetMode);
                              if (preset.value === "green-screen") {
                                setBgColor("#00ff00");
                              } else if (preset.value === "white-bg") {
                                setBgColor("#ffffff");
                              }
                            }}
                            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg font-medium text-sm transition-all ${
                              presetMode === preset.value
                                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-400 dark:hover:border-purple-600"
                            }`}
                          >
                            <PresetIcon className="w-4 h-4" />
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 背景颜色选择 */}
                  {(presetMode === "custom" || presetMode === "white-bg" || presetMode === "green-screen") && (
                    <div>
                      <label className="flex items-center justify-between text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                        <span className="flex items-center gap-2">
                          <CircleDot className="w-4 h-4 text-purple-500" />
                          背景颜色
                        </span>
                        <button
                          onClick={() => setToolMode(toolMode === "pick-color" ? "none" : "pick-color")}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-colors ${
                            toolMode === "pick-color"
                              ? "bg-purple-500 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400"
                          }`}
                        >
                          <Pipette className="w-3.5 h-3.5" />
                          {toolMode === "pick-color" ? "取消取色" : "取色器"}
                        </button>
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <input
                            type="color"
                            value={bgColor}
                            onChange={(e) => {
                              setBgColor(e.target.value);
                              setPresetMode("custom");
                            }}
                            className="w-12 h-12 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="text"
                            value={bgColor}
                            onChange={(e) => {
                              setBgColor(e.target.value);
                              setPresetMode("custom");
                            }}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-purple-400 dark:focus:border-purple-600"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 容差调整 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        容差
                      </label>
                      <span className="text-sm font-bold text-purple-500">{tolerance}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={tolerance}
                      onChange={(e) => setTolerance(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>精确</span>
                      <span>适中</span>
                      <span>宽松</span>
                    </div>
                  </div>

                  {/* 边缘羽化 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        边缘羽化
                      </label>
                      <span className="text-sm font-bold text-purple-500">{feather}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={feather}
                      onChange={(e) => setFeather(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>锐利</span>
                      <span>自然</span>
                      <span>柔和</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-purple-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      下载结果
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                    }}
                  >
                    {resultDataUrl ? (
                      <img
                        src={resultDataUrl}
                        alt="抠图结果预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-400 text-sm">暂无预览</div>
                    )}
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        输出格式
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        PNG (透明背景)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600 dark:text-purple-400">
                        文件大小
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                        {formatSize(resultSize)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 disabled:shadow-none hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载透明背景图片
                      </>
                    )}
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
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                多种模式
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                白色背景、绿幕、人像、自定义取色
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                本地处理
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                图片不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                边缘羽化
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                智能边缘羽化，抠图更自然不生硬
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
