"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  RotateCw,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  Settings,
  FlipHorizontal,
  FlipVertical,
  FileImage,
  RefreshCw,
  Undo2,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  type: string;
}

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

export default function ImageRotatePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [rotation, setRotation] = useState(0); // 旋转角度 (度)
  const [flipH, setFlipH] = useState(false); // 水平翻转
  const [flipV, setFlipV] = useState(false); // 垂直翻转
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [resultWidth, setResultWidth] = useState(0);
  const [resultHeight, setResultHeight] = useState(0);

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
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
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
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setResultDataUrl("");
    setResultSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
  };

  const rotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const rotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // 生成旋转/翻转结果
  useEffect(() => {
    if (!imageData) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const rad = (rotation * Math.PI) / 180;
        const sin = Math.abs(Math.sin(rad));
        const cos = Math.abs(Math.cos(rad));

        // 计算旋转后的画布尺寸
        const newWidth = img.width * cos + img.height * sin;
        const newHeight = img.width * sin + img.height * cos;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // 对于JPG格式，填充白色背景
        const mimeType = getMimeType(outputFormat);
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rad);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        const base64 = dataUrl.split(",")[1];
        const size = Math.round((base64.length * 3) / 4);

        setResultDataUrl(dataUrl);
        setResultSize(size);
        setResultWidth(Math.round(newWidth));
        setResultHeight(Math.round(newHeight));
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = imageData.originalDataUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, [rotation, flipH, flipV, imageData, outputFormat, quality]);

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_rotated.${getExtension(outputFormat)}`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="图片旋转翻转"
      description="在线图片旋转和翻转，支持任意角度旋转、水平垂直翻转，实时预览，一键下载"
      toolId="image-rotate"
      icon={RotateCw}
      category="图片工具"
      slug="image-rotate"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-teal-500" />
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
                    ? "border-teal-400 bg-teal-50 dark:bg-teal-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-teal-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-teal-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-teal-600 dark:text-teal-400"
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
                  <RotateCw className="w-5 h-5 text-teal-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    旋转预览
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-teal-500 dark:text-zinc-400 dark:hover:text-teal-400 transition-colors"
                  >
                    <Undo2 className="w-4 h-4" />
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
                      <span className="text-sm text-zinc-500 dark:text-zinc-500">
                        {imageData.originalWidth} × {imageData.originalHeight}
                      </span>
                    </div>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                      <img
                        src={imageData.originalDataUrl}
                        alt="原图"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                  {/* 结果 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-600 dark:text-teal-400">
                        处理后
                      </span>
                      <span className="text-sm text-teal-500 dark:text-teal-400 font-medium">
                        {resultWidth} × {resultHeight}
                      </span>
                    </div>
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10">
                          <RefreshCw className="w-8 h-8 text-teal-500 animate-spin" />
                        </div>
                      )}
                      {resultDataUrl ? (
                        <img
                          src={resultDataUrl}
                          alt="处理后"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-zinc-400 text-sm">处理中...</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 文件信息 */}
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
                    <div className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {formatSize(resultSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                    <div className="text-xs text-teal-600 dark:text-teal-400 mb-1">
                      旋转角度
                    </div>
                    <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                      {rotation}°
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      翻转
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {flipH ? "水平 " : ""}
                      {flipV ? "垂直" : ""}
                      {!flipH && !flipV ? "无" : ""}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 旋转设置 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      旋转翻转
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 快捷旋转按钮 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <RotateCw className="w-4 h-4 text-teal-500" />
                      快捷旋转
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        onClick={rotateLeft}
                        className="flex flex-col items-center gap-1 px-3 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                      >
                        <RotateCcw className="w-5 h-5" />
                        <span className="text-xs">左90°</span>
                      </button>
                      <button
                        onClick={rotateRight}
                        className="flex flex-col items-center gap-1 px-3 py-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
                      >
                        <RotateCw className="w-5 h-5" />
                        <span className="text-xs">右90°</span>
                      </button>
                      <button
                        onClick={() => setFlipH((v) => !v)}
                        className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border transition-all ${
                          flipH
                            ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600"
                        }`}
                      >
                        <FlipHorizontal className="w-5 h-5" />
                        <span className="text-xs">水平翻转</span>
                      </button>
                      <button
                        onClick={() => setFlipV((v) => !v)}
                        className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border transition-all ${
                          flipV
                            ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600"
                        }`}
                      >
                        <FlipVertical className="w-5 h-5" />
                        <span className="text-xs">垂直翻转</span>
                      </button>
                    </div>
                  </div>

                  {/* 任意角度旋转 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        任意角度
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={rotation}
                          onChange={(e) => {
                            let val = Number(e.target.value);
                            if (isNaN(val)) val = 0;
                            val = ((val % 360) + 360) % 360;
                            setRotation(val);
                          }}
                          className="w-20 px-2 py-1 text-right text-sm font-bold text-teal-500 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:border-teal-400"
                          min="0"
                          max="359"
                        />
                        <span className="text-sm text-zinc-500">°</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={rotation}
                      onChange={(e) => setRotation(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                      <span>0°</span>
                      <span>90°</span>
                      <span>180°</span>
                      <span>270°</span>
                      <span>360°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 输出设置和下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-teal-500" />
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
                              ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-teal-300 dark:hover:border-teal-600"
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
                          <span className="text-sm font-bold text-teal-500">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-teal-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* 下载按钮 */}
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-teal-500/25 disabled:shadow-none hover:shadow-teal-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
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
            <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl">
              <div className="text-sm font-medium text-teal-700 dark:text-teal-300">
                多种旋转方式
              </div>
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-1">
                90度一键旋转 + 任意角度精确调整
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
                实时预览
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                调整参数即时查看效果
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
