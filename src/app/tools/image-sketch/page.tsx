"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  PenLine,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  RotateCcw,
  Eye,
  EyeOff,
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

export default function ImageSketchPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [intensity, setIntensity] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    setIntensity(50);
  };

  const applyFilter = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, intensity: number) => {
        const w = img.width;
    const h = img.height;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    // 转灰度
    const grayData = new Uint8ClampedArray(w * h);
    for (let i = 0; i < data.length; i += 4) {
      grayData[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    // 反色
    const invertData = new Uint8ClampedArray(w * h);
    for (let i = 0; i < grayData.length; i++) {
      invertData[i] = 255 - grayData[i];
    }
    // 均值模糊
    const blurred = new Uint8ClampedArray(w * h);
    const radius = Math.max(1, Math.floor(intensity / 15));
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let sum = 0, count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
              sum += invertData[ny * w + nx];
              count++;
            }
          }
        }
        blurred[y * w + x] = sum / count;
      }
    }
    // 颜色减淡
    for (let i = 0; i < data.length; i += 4) {
      const idx = i / 4;
      const base = grayData[idx];
      const blend = blurred[idx];
      const result = blend >= 255 ? 255 : Math.min(255, (base * 256) / (256 - blend));
      data[i] = result;
      data[i + 1] = result;
      data[i + 2] = result;
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

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
        applyFilter(ctx, img, intensity);
        const dataUrl = canvas.toDataURL("image/png");
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
  }, [intensity, imageData, applyFilter]);

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_image-sketch.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="图片素描效果"
      description="将图片转换为铅笔素描风格，支持线条粗细和细节调节，一键生成艺术素描"
      toolId="image-sketch"
      icon={PenLine}
      category="图片工具"
      slug="image-sketch"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {!imageData ? (
          <div className="p-6">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-72 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                isDragging
                  ? "border-slate-400 bg-slate-500/10"
                  : "border-zinc-700 hover:border-slate-500 hover:bg-zinc-800/50"
              }`}
            >
              <Upload className="w-12 h-12 mb-3 text-zinc-400" />
              <div className="text-lg font-medium mb-1 text-zinc-300">
                {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
              </div>
              <div className="text-sm text-zinc-500">
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
        ) : (
          <>
            <div className="border-b border-zinc-800">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PenLine className="w-5 h-5 text-slate-400" />
                  <h2 className="text-base font-semibold">效果预览</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showOriginal ? "看效果" : "看原图"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                  <button
                    onClick={handleClear}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    重新上传
                  </button>
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="relative w-full bg-zinc-800/50 rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: "400px" }}>
                  {showOriginal ? (
                    <img
                      src={imageData.originalDataUrl}
                      alt="原图"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  ) : isProcessing ? (
                    <div className="py-20 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={resultDataUrl}
                      alt="图片素描效果效果"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">原始大小</div>
                    <div className="text-sm font-medium text-zinc-300">
                      {formatSize(imageData.originalSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">输出大小</div>
                    <div className="text-sm font-medium text-zinc-400">
                      {formatSize(resultSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">效果强度</div>
                    <div className="text-sm font-bold text-slate-400">
                      {intensity}%
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">图片尺寸</div>
                    <div className="text-sm font-medium text-zinc-300">
                      {imageData.originalWidth} × {imageData.originalHeight}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 pt-0">
              <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <h2 className="text-base font-semibold">效果设置</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-zinc-300">
                        效果强度
                      </label>
                      <span className="text-sm font-bold text-slate-400">
                        {intensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-slate-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>轻微</span>
                      <span>中等</span>
                      <span>强烈</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
                  <Download className="w-5 h-5 text-slate-400" />
                  <h2 className="text-base font-semibold">下载结果</h2>
                </div>
                <div className="p-6">
                  <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                    {resultDataUrl ? (
                      <img
                        src={resultDataUrl}
                        alt="处理结果预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-500 text-sm">暂无预览</div>
                    )}
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400">输出格式</span>
                      <span className="text-sm font-medium text-zinc-300">
                        PNG (无损)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">文件大小</span>
                      <span className="text-sm font-bold text-zinc-400">
                        {formatSize(resultSize)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-slate-600 to-zinc-700 hover:brightness-110 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-slate-500/25 disabled:shadow-none hover:shadow-slate-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
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
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-slate-500/10 rounded-xl">
              <div className="text-sm font-medium text-slate-300">图片素描效果</div>
              <p className="text-xs text-slate-400/70 mt-1">
                一键生成图片素描效果效果
              </p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">本地处理</div>
              <p className="text-xs text-emerald-400/70 mt-1">
                图片不上传服务器，保护隐私
              </p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">实时预览</div>
              <p className="text-xs text-blue-400/70 mt-1">
                调节参数，实时查看效果
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
