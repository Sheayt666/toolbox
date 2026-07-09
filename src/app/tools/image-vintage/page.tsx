"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Sun,
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

export default function ImageVintagePage() {
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
    const amount = intensity / 100;
    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];
      // Sepia
      const tr = 0.393 * r + 0.769 * g + 0.189 * b;
      const tg = 0.349 * r + 0.686 * g + 0.168 * b;
      const tb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = Math.min(255, r * (1 - amount) + tr * amount);
      g = Math.min(255, g * (1 - amount) + tg * amount);
      b = Math.min(255, b * (1 - amount) + tb * amount);
      // 降低对比度
      const contrast = 1 - amount * 0.3;
      r = (r - 128) * contrast + 128;
      g = (g - 128) * contrast + 128;
      b = (b - 128) * contrast + 128;
      // 暖色调
      r = Math.min(255, r + amount * 20);
      g = Math.min(255, g + amount * 10);
      data[i] = Math.max(0, Math.min(255, Math.round(r)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
    }
    // 暗角
    const cx = w / 2, cy = h / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const vignetteStrength = amount * 0.5;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;
        const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        const darken = 1 - (dist / maxDist) ** 2 * vignetteStrength;
        data[idx] = Math.round(data[idx] * darken);
        data[idx + 1] = Math.round(data[idx + 1] * darken);
        data[idx + 2] = Math.round(data[idx + 2] * darken);
      }
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
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_image-vintage.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="图片复古效果"
      description="给图片添加复古怀旧滤镜，模拟老照片效果，支持多种复古风格和强度调节"
      toolId="image-vintage"
      icon={Sun}
      category="图片工具"
      slug="image-vintage"
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
                  ? "border-amber-400 bg-amber-500/10"
                  : "border-zinc-700 hover:border-amber-500 hover:bg-zinc-800/50"
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
                  <Sun className="w-5 h-5 text-amber-400" />
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
                      alt="图片复古效果效果"
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
                    <div className="text-sm font-bold text-amber-400">
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
                  <Settings className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-semibold">效果设置</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-zinc-300">
                        效果强度
                      </label>
                      <span className="text-sm font-bold text-amber-400">
                        {intensity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={intensity}
                      onChange={(e) => setIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
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
                  <Download className="w-5 h-5 text-amber-400" />
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
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-amber-500/25 disabled:shadow-none hover:shadow-amber-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
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
            <div className="p-4 bg-amber-500/10 rounded-xl">
              <div className="text-sm font-medium text-amber-300">图片复古效果</div>
              <p className="text-xs text-amber-400/70 mt-1">
                一键生成图片复古效果效果
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
