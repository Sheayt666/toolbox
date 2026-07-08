"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Maximize2,
  Upload,
  Download,
  Trash2,
  Settings,
  FileImage,
  RefreshCw,
  Lock,
  Unlock,
  Percent,
  RotateCcw,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  type: string;
}

type ResizeMode = "pixels" | "percent";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[format] || "image/png";
}

function getExtension(format: string): string {
  return format === "jpeg" ? "jpg" : format;
}

export default function ImageResizePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [resizeMode, setResizeMode] = useState<ResizeMode>("pixels");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [percent, setPercent] = useState(100);
  const [lockRatio, setLockRatio] = useState(true);
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        setWidth(img.width);
        setHeight(img.height);
        setPercent(100);
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
    setWidth(0);
    setHeight(0);
    setPercent(100);
    setResultDataUrl("");
    setResultSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (!imageData) return;
    setWidth(imageData.originalWidth);
    setHeight(imageData.originalHeight);
    setPercent(100);
  };

  // 宽度变化
  const handleWidthChange = (newWidth: number) => {
    if (!imageData) return;
    if (isNaN(newWidth) || newWidth < 1) newWidth = 1;
    if (newWidth > 10000) newWidth = 10000;
    setWidth(newWidth);
    if (lockRatio && imageData) {
      const ratio = imageData.originalWidth / imageData.originalHeight;
      setHeight(Math.round(newWidth / ratio));
    }
    // 更新百分比
    setPercent(Math.round((newWidth / imageData.originalWidth) * 100));
  };

  // 高度变化
  const handleHeightChange = (newHeight: number) => {
    if (!imageData) return;
    if (isNaN(newHeight) || newHeight < 1) newHeight = 1;
    if (newHeight > 10000) newHeight = 10000;
    setHeight(newHeight);
    if (lockRatio && imageData) {
      const ratio = imageData.originalWidth / imageData.originalHeight;
      setWidth(Math.round(newHeight * ratio));
    }
    setPercent(Math.round((newHeight / imageData.originalHeight) * 100));
  };

  // 百分比变化
  const handlePercentChange = (newPercent: number) => {
    if (!imageData) return;
    if (isNaN(newPercent) || newPercent < 1) newPercent = 1;
    if (newPercent > 500) newPercent = 500;
    setPercent(newPercent);
    setWidth(Math.round(imageData.originalWidth * (newPercent / 100)));
    setHeight(Math.round(imageData.originalHeight * (newPercent / 100)));
  };

  // 生成调整大小结果
  useEffect(() => {
    if (!imageData || width === 0 || height === 0) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      // 高质量缩放
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const img = new Image();
      img.onload = () => {
        // 对于JPG格式，填充白色背景
        const mimeType = getMimeType(outputFormat);
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        const base64 = dataUrl.split(",")[1];
        const size = Math.round((base64.length * 3) / 4);

        setResultDataUrl(dataUrl);
        setResultSize(size);
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = imageData.originalDataUrl;
    }, 150);

    return () => clearTimeout(timer);
  }, [width, height, imageData, outputFormat, quality]);

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_resized.${getExtension(outputFormat)}`;
    link.href = resultDataUrl;
    link.click();
  };

  const sizeDiff = imageData ? ((resultSize - imageData.originalSize) / imageData.originalSize) * 100 : 0;

  return (
    <ToolLayout
      title="图片调整大小"
      description="在线调整图片尺寸，支持像素和百分比缩放，锁定宽高比，多格式输出"
      toolId="image-resize"
      icon={Maximize2}
      category="图片工具"
      slug="image-resize"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-indigo-500" />
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
                    ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-indigo-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-indigo-600 dark:text-indigo-400"
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
            {/* 预览和对比 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-5 h-5 text-indigo-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  调整预览
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-indigo-500 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* 原图 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        原图
                      </span>
                      <span className="text-sm text-zinc-500">
                        {imageData.originalWidth} × {imageData.originalHeight}
                      </span>
                    </div>
                    <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={imageData.originalDataUrl}
                        alt="原图"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="text-sm text-zinc-500 text-center">
                      {formatSize(imageData.originalSize)}
                    </div>
                  </div>
                  {/* 结果 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        调整后
                      </span>
                      <span className="text-sm text-indigo-500 font-medium">
                        {width} × {height}
                      </span>
                    </div>
                    <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10">
                          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                        </div>
                      )}
                      {resultDataUrl ? (
                        <img
                          src={resultDataUrl}
                          alt="调整后"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-zinc-400 text-sm">处理中...</div>
                      )}
                    </div>
                    <div className="text-sm text-indigo-500 text-center font-medium">
                      {formatSize(resultSize)}
                      {sizeDiff !== 0 && (
                      <span className={`ml-2 ${sizeDiff < 0 ? "text-emerald-500" : "text-amber-500"}`}>
                        ({sizeDiff > 0 ? "+" : ""}{sizeDiff.toFixed(1)}%)
                      </span>
                    )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 调整设置 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      尺寸设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 模式切换 */}
                  <div>
                    <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                      <button
                        onClick={() => setResizeMode("pixels")}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                          resizeMode === "pixels"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        按像素
                      </button>
                      <button
                        onClick={() => setResizeMode("percent")}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                          resizeMode === "percent"
                            ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        按百分比
                      </button>
                    </div>
                  </div>

                  {resizeMode === "pixels" ? (
                    /* 像素模式 */
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            宽度 (px)
                          </label>
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                            min="1"
                            max="10000"
                          />
                        </div>
                        <button
                          onClick={() => setLockRatio(!lockRatio)}
                          className={`mt-6 w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                            lockRatio
                              ? "bg-indigo-500 text-white border-indigo-500"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300"
                          }`}
                          title={lockRatio ? "锁定宽高比" : "解锁宽高比"}
                        >
                          {lockRatio ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                            高度 (px)
                          </label>
                          <input
                            type="number"
                            value={height}
                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                            min="1"
                            max="10000"
                          />
                        </div>
                      </div>

                      {/* 快捷尺寸 */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                          快捷尺寸
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "50%", w: Math.round(imageData.originalWidth * 0.5) },
                            { label: "75%", w: Math.round(imageData.originalWidth * 0.75) },
                            { label: "2x", w: imageData.originalWidth * 2 },
                            { label: "4K", w: 3840 },
                          ].map((preset) => (
                            <button
                              key={preset.label}
                              onClick={() => handleWidthChange(preset.w)}
                              className="px-2 py-2 text-xs font-medium rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                            >
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* 百分比模式 */
                    <div>
                      <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Percent className="w-4 h-4 text-indigo-500" />
                        缩放比例
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={percent}
                          onChange={(e) => handlePercentChange(Number(e.target.value))}
                          className="w-20 px-2 py-1 text-right text-sm font-bold text-indigo-500 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-indigo-400"
                          min="1"
                          max="500"
                        />
                        <span className="text-sm text-zinc-500">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="200"
                      value={percent}
                      onChange={(e) => handlePercentChange(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>25%</span>
                      <span>50%</span>
                      <span>100%</span>
                      <span>150%</span>
                      <span>200%</span>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2">
                      {[25, 50, 75, 100, 150].map((p) => (
                        <button
                          key={p}
                          onClick={() => handlePercentChange(p)}
                          className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            percent === p
                              ? "bg-indigo-500 text-white"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300"
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                  </div>
                  )}
                </div>
              </div>

              {/* 输出设置和下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-indigo-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      输出设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 输出格式 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    输出格式
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "png", label: "PNG" },
                      { value: "jpg", label: "JPG" },
                      { value: "webp", label: "WebP" },
                    ].map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setOutputFormat(fmt.value)}
                          className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            outputFormat === fmt.value
                              ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                    {outputFormat !== "png" && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">输出质量</span>
                          <span className="text-sm font-bold text-indigo-500">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* 文件大小信息 */}
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        原始大小
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {formatSize(imageData.originalSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        输出大小
                      </span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {formatSize(resultSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-indigo-200/50 dark:border-indigo-800/50">
                      <span className="text-sm text-indigo-600 dark:text-indigo-400">
                        尺寸变化
                      </span>
                      <span className={`text-sm font-bold ${
                        sizeDiff < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}>
                        {sizeDiff > 0 ? "增大 " : "缩小 "}
                        {Math.abs(sizeDiff).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* 下载按钮 */}
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:shadow-none hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载图片
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
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <div className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                两种模式
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                按像素精确调整 + 按百分比缩放
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                本地处理
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                高质量缩放
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                使用高质量插值算法，保留细节
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
