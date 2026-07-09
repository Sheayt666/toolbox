"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Circle,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Image,
} from "lucide-react";


interface ImageData {
  name: string;
  originalDataUrl: string;
  processedDataUrl: string;
  width: number;
  height: number;
  type: string;
}

function getMimeType(format: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    bmp: "image/bmp",
  };
  return map[format] || "image/png";
}

export default function ImageRoundPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  
  
  const [sliderValue, setSliderValue] = useState(20);
  
  
  
  
  const [isCircle, setIsCircle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (dataUrl: string, _width: number, _height: number): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new (window as any).Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("无法创建Canvas")); return; }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          if (isCircle) {
            const radius = Math.min(canvas.width, canvas.height) / 2;
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 0, 0);
          } else {
            const r = Math.min(canvas.width, canvas.height) * (sliderValue / 100);
            ctx.beginPath();
            ctx.moveTo(r, 0);
            ctx.lineTo(canvas.width - r, 0);
            ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
            ctx.lineTo(canvas.width, canvas.height - r);
            ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
            ctx.lineTo(r, canvas.height);
            ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 0, 0);
          }
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = dataUrl;
      });
    },
    [sliderValue, isCircle]
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
        const img = new (window as any).Image();
        img.onload = async () => {
          try {
            const result = await processImage(dataUrl, img.width, img.height);
            setImageData({
              name: file.name,
              originalDataUrl: dataUrl,
              processedDataUrl: result,
              width: img.width,
              height: img.height,
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
    [processImage]
  );

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
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\\.[^.]+$/, "")}_round.png`;
    link.href = imageData.processedDataUrl;
    link.click();
  };

  useEffect(() => {
    if (!imageData) return;
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await processImage(
          imageData.originalDataUrl,
          imageData.width,
          imageData.height
        );
        setImageData((prev) =>
          prev ? { ...prev, processedDataUrl: result } : null
        );
      } finally {
        setIsProcessing(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [sliderValue, imageData?.originalDataUrl, processImage]);

  

  

  

  

  useEffect(() => {
    if (!imageData) return;
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await processImage(
          imageData.originalDataUrl,
          imageData.width,
          imageData.height
        );
        setImageData((prev) =>
          prev ? { ...prev, processedDataUrl: result } : null
        );
      } finally {
        setIsProcessing(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [sliderValue, isCircle, imageData?.originalDataUrl, processImage]);

  return (
    <ToolLayout
      title="图片圆角/圆形裁剪"
      description="在线给图片添加圆角或裁剪为圆形，自定义圆角大小，头像制作必备"
      toolId="image-round"
      icon={Circle}
      category="图片工具"
      slug="image-round"
    >
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {!imageData ? (
          <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
            <div className="p-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-pink-500" />
                <h2 className="text-base font-semibold text-white">上传图片</h2>
              </div>
            </div>
            <div className="p-6">
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-pink-400 bg-pink-500/10"
                    : "border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a]/30"
                }`}
              >
                <Upload className={`w-12 h-12 mb-3 transition-colors ${isDragging ? "text-pink-500" : "text-zinc-500"}`} />
                <div className={`text-lg font-medium mb-1 ${isDragging ? "text-pink-400" : "text-zinc-300"}`}>
                  {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
                </div>
                <div className="text-sm text-zinc-500">支持 JPG/PNG/WebP 格式</div>
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
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
              <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-white">处理结果</h2>
                </div>
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  重新上传
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-400">原图</span>
                    </div>
                    <div className="aspect-video bg-[#27272a] rounded-xl overflow-hidden flex items-center justify-center">
                      <img src={imageData.originalDataUrl} alt="原图" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-400">处理后</span>
                    </div>
                    <div className="aspect-video bg-[#27272a] rounded-xl overflow-hidden flex items-center justify-center relative">
                      {isProcessing && (
                        <div className="absolute inset-0 bg-[#18181b]/80 flex items-center justify-center z-10">
                          <RefreshCw className="w-8 h-8 text-pink-500 animate-spin" />
                        </div>
                      )}
                      <img src={imageData.processedDataUrl} alt="处理后" className="max-w-full max-h-full object-contain" />
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#27272a]/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">图片尺寸</div>
                    <div className="text-sm font-medium text-zinc-300">{imageData.width} × {imageData.height}</div>
                  </div>
                  <div className="p-3 bg-[#27272a]/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">文件名</div>
                    <div className="text-sm font-medium text-zinc-300 truncate">{imageData.name}</div>
                  </div>
                  <div className="p-3 bg-[#27272a]/50 rounded-lg">
                    <div className="text-xs text-zinc-500 mb-1">输出格式</div>
                    <div className="text-sm font-medium text-zinc-300">PNG</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
              <div className="p-4 border-b border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-pink-500" />
                  <h2 className="text-base font-semibold text-white">处理设置</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Circle className="w-4 h-4 text-pink-500" />
                      圆角大小
                    </label>
                    <span className="text-sm font-bold text-pink-500">{sliderValue}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-pink-500"
                  />
                </div>

                

                

                

                

                

                

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Circle className="w-4 h-4 text-pink-500" />
                    裁剪方式
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsCircle(false)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        !isCircle
                          ? "bg-pink-500 text-white shadow-lg"
                          : "bg-[#27272a] text-zinc-400 border border-[#3f3f46]"
                      }`}
                    >
                      圆角矩形
                    </button>
                    <button
                      onClick={() => setIsCircle(true)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        isCircle
                          ? "bg-pink-500 text-white shadow-lg"
                          : "bg-[#27272a] text-zinc-400 border border-[#3f3f46]"
                      }`}
                    >
                      正圆形
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:opacity-90 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下载处理结果
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-emerald-400">圆角裁剪</div>
              <p className="text-xs text-zinc-400 mt-1">自定义圆角大小，自由调节</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-cyan-400">圆形裁剪</div>
              <p className="text-xs text-zinc-400 mt-1">一键裁剪为正圆形头像</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-violet-400">透明背景</div>
              <p className="text-xs text-zinc-400 mt-1">PNG输出，支持透明背景</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
