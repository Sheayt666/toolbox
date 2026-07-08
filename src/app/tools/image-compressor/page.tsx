"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  ImageDown,
  Upload,
  Download,
  Trash2,
  Settings,
  Percent,
  FileImage,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  compressedSize: number;
  compressedDataUrl: string;
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
  return map[format] || "image/jpeg";
}

function getExtension(format: string): string {
  return format === "jpeg" ? "jpg" : format;
}

export default function ImageCompressorPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("jpg");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compareMode, setCompareMode] = useState<"side" | "slider">("side");
  const [sliderPos, setSliderPos] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);

  const compressImage = useCallback(
    (
      dataUrl: string,
      qualityValue: number,
      format: string
    ): Promise<{ dataUrl: string; size: number }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("无法创建Canvas上下文"));
            return;
          }

          // 对于JPG格式，先填充白色背景（处理透明PNG转JPG）
          const mimeType = getMimeType(format);
          if (mimeType === "image/jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0);

          const compressedDataUrl = canvas.toDataURL(
            mimeType,
            qualityValue / 100
          );
          // 计算压缩后大小（base64估算）
          const base64 = compressedDataUrl.split(",")[1];
          const size = Math.round((base64.length * 3) / 4);

          resolve({ dataUrl: compressedDataUrl, size });
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = dataUrl;
      });
    },
    []
  );

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert("请上传图片文件");
        return;
      }

      setIsProcessing(true);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;

        const img = new Image();
        img.onload = async () => {
          try {
            // 确定输出格式
            let format = outputFormat;
            if (outputFormat === "auto") {
              if (file.type === "image/png") format = "png";
              else if (file.type === "image/webp") format = "webp";
              else format = "jpg";
            }

            const result = await compressImage(dataUrl, quality, format);

            setImageData({
              name: file.name,
              originalSize: file.size,
              originalWidth: img.width,
              originalHeight: img.height,
              originalDataUrl: dataUrl,
              compressedSize: result.size,
              compressedDataUrl: result.dataUrl,
              type: file.type,
            });
          } catch {
            alert("图片处理失败");
          } finally {
            setIsProcessing(false);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [quality, outputFormat, compressImage]
  );

  // 当质量或格式改变时重新压缩
  useEffect(() => {
    if (!imageData) return;

    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        let format = outputFormat;
        if (outputFormat === "auto") {
          if (imageData.type === "image/png") format = "png";
          else if (imageData.type === "image/webp") format = "webp";
          else format = "jpg";
        }

        const result = await compressImage(
          imageData.originalDataUrl,
          quality,
          format
        );

        setImageData((prev) =>
          prev
            ? {
                ...prev,
                compressedSize: result.size,
                compressedDataUrl: result.dataUrl,
              }
            : null
        );
      } finally {
        setIsProcessing(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [quality, outputFormat, imageData?.originalDataUrl, compressImage]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!imageData) return;

    let format = outputFormat;
    if (outputFormat === "auto") {
      if (imageData.type === "image/png") format = "png";
      else if (imageData.type === "image/webp") format = "webp";
      else format = "jpg";
    }

    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_compressed.${getExtension(format)}`;
    link.href = imageData.compressedDataUrl;
    link.click();
  };

  const compressionRatio = imageData
    ? ((1 - imageData.compressedSize / imageData.originalSize) * 100).toFixed(1)
    : "0";

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!compareRef.current) return;
    const rect = compareRef.current.getBoundingClientRect();
    let clientX: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  return (
    <ToolLayout
      title="图片压缩工具"
      description="在线图片压缩，支持JPG/PNG/WebP，调整质量压缩后下载，节省存储空间，本地处理安全可靠"
      toolId="image-compressor"
      icon={ImageDown}
      category="图片工具"
      slug="image-compressor"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <canvas ref={canvasRef} className="hidden" />

        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <ImageDown className="w-5 h-5 text-rose-500" />
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
                    ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-rose-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-rose-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-rose-600 dark:text-rose-400"
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
            {/* 压缩结果 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageDown className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    压缩结果
                  </h2>
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
                {/* 对比模式切换 */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    对比模式：
                  </span>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
                    <button
                      onClick={() => setCompareMode("side")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        compareMode === "side"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      左右对比
                    </button>
                    <button
                      onClick={() => setCompareMode("slider")}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        compareMode === "slider"
                          ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                          : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      滑动对比
                    </button>
                  </div>
                </div>

                {compareMode === "side" ? (
                  /* 左右对比 */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                          原图
                        </span>
                        <span className="text-sm text-zinc-500 dark:text-zinc-500">
                          {formatSize(imageData.originalSize)}
                        </span>
                      </div>
                      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                        <img
                          src={imageData.originalDataUrl}
                          alt="原图"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          压缩后
                        </span>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatSize(imageData.compressedSize)}
                        </span>
                      </div>
                      <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center relative">
                        {isProcessing && (
                          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10">
                            <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
                          </div>
                        )}
                        <img
                          src={imageData.compressedDataUrl}
                          alt="压缩后"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 滑动对比 */
                  <div
                    ref={compareRef}
                    className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative cursor-ew-resize select-none"
                    onMouseMove={handleSliderMove}
                    onTouchMove={handleSliderMove}
                  >
                    <img
                      src={imageData.compressedDataUrl}
                      alt="压缩后"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={imageData.originalDataUrl}
                        alt="原图"
                        className="w-full h-full object-contain"
                        style={{
                          width: compareRef.current
                            ? compareRef.current.offsetWidth + "px"
                            : "100%",
                          maxWidth: "none",
                        }}
                      />
                    </div>
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                      style={{ left: `${sliderPos}%` }}
                    >
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 text-zinc-600 rotate-90" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      原图
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      压缩后
                    </div>
                  </div>
                )}

                {/* 压缩信息 */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                      压缩后大小
                    </div>
                    <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formatSize(imageData.compressedSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                      压缩率
                    </div>
                    <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {Number(compressionRatio) > 0 ? "-" : "+"}
                      {Math.abs(Number(compressionRatio))}%
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

            {/* 压缩设置 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-rose-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    压缩设置
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* 压缩质量 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      <Percent className="w-4 h-4 text-rose-500" />
                      压缩质量
                    </label>
                    <span className="text-sm font-bold text-rose-500">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    <span>体积小</span>
                    <span>平衡</span>
                    <span>画质高</span>
                  </div>
                </div>

                {/* 输出格式 */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                    <FileImage className="w-4 h-4 text-rose-500" />
                    输出格式
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "auto", label: "自动" },
                      { value: "jpg", label: "JPG" },
                      { value: "png", label: "PNG" },
                      { value: "webp", label: "WebP" },
                    ].map((fmt) => (
                      <button
                        key={fmt.value}
                        onClick={() => setOutputFormat(fmt.value)}
                        className={`px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          outputFormat === fmt.value
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300 dark:hover:border-rose-600"
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 下载按钮 */}
                <button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-rose-500/25 disabled:shadow-none hover:shadow-rose-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下载压缩图片
                    </>
                  )}
                </button>
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
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
              <div className="text-sm font-medium text-rose-700 dark:text-rose-300">
                本地处理
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                多格式支持
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                JPG/PNG/WebP 格式互转
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                实时预览
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                拖动滑块即时查看效果
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
