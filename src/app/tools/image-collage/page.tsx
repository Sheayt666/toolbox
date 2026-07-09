"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Layers,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Image,
  Plus,
  Minus,
  ArrowRightLeft,
  Palette,
} from "lucide-react";

interface ImageItem {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

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

export default function ImageCollagePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<"horizontal" | "vertical">("vertical");
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [collageResult, setCollageResult] = useState<string | null>(null);
  
  
  
  
  
  
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (dataUrl: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        const img = new (window as any).Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) { reject(new Error("无法创建Canvas")); return; }
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = dataUrl;
      });
    },
    []
  );

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new (window as any).Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleFiles = async (files: File[]) => {
    const newImages: ImageItem[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readFileAsDataURL(file);
      const img = await loadImage(dataUrl);
      newImages.push({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        dataUrl,
        width: img.width,
        height: img.height,
      });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    handleFiles(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files) return;
    handleFiles(Array.from(files));
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  useEffect(() => {
    if (images.length < 2) {
      setCollageResult(null);
      return;
    }
    generateCollage();
  }, [images, direction, gap, bgColor]);

  const generateCollage = async () => {
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const totalGap = gap * (images.length - 1);
      
      if (direction === "horizontal") {
        const maxHeight = Math.max(...images.map(img => img.height));
        canvas.width = images.reduce((sum, img) => sum + img.width, 0) + totalGap;
        canvas.height = maxHeight;
      } else {
        const maxWidth = Math.max(...images.map(img => img.width));
        canvas.width = maxWidth;
        canvas.height = images.reduce((sum, img) => sum + img.height, 0) + totalGap;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let offset = 0;
      for (const imgItem of images) {
        const img = await loadImage(imgItem.dataUrl);
        if (direction === "horizontal") {
          ctx.drawImage(img, offset, 0);
          offset += img.width + gap;
        } else {
          ctx.drawImage(img, 0, offset);
          offset += img.height + gap;
        }
      }

      setCollageResult(canvas.toDataURL("image/png"));
    } finally {
      setIsProcessing(false);
    }
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
    setImages([]);
    setCollageResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  

  const handleDownload = () => {
    if (!collageResult) return;
    const link = document.createElement("a");
    link.download = "collage.png";
    link.href = collageResult;
    link.click();
  };

  

  

  

  

  

  

  return (
    <ToolLayout
      title="图片拼接"
      description="在线多张图片拼接，支持横向和纵向拼接，自定义间距和背景色"
      toolId="image-collage"
      icon={Layers}
      category="图片工具"
      slug="image-collage"
    >
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {images.length === 0 ? (
          <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
            <div className="p-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-500" />
                <h2 className="text-base font-semibold text-white">上传图片（支持多张）</h2>
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
                    ? "border-violet-400 bg-violet-500/10"
                    : "border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a]/30"
                }`}
              >
                <Upload className={`w-12 h-12 mb-3 transition-colors ${isDragging ? "text-violet-500" : "text-zinc-500"}`} />
                <div className={`text-lg font-medium mb-1 ${isDragging ? "text-violet-400" : "text-zinc-300"}`}>
                  {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传图片"}
                </div>
                <div className="text-sm text-zinc-500">支持 JPG/PNG/WebP 格式，支持多张</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple accept="image/jpeg,image/png,image/webp"
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
                  <Layers className="w-5 h-5 text-violet-500" />
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-medium text-zinc-400 mb-3">图片列表（${images.length}张）</div>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {images.map((img) => (
                        <div key={img.id} className="flex items-center gap-3 p-2 bg-[#27272a] rounded-lg">
                          <img src={img.dataUrl} alt={img.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-zinc-300 truncate">{img.name}</div>
                            <div className="text-xs text-zinc-500">{img.width} × {img.height}</div>
                          </div>
                          <button
                            onClick={() => removeImage(img.id)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-zinc-400 mb-3">拼接预览</div>
                    <div className="bg-[#27272a] rounded-lg p-4 flex items-center justify-center min-h-[200px]">
                      {collageResult ? (
                        <img src={collageResult} alt="拼接结果" className="max-w-full max-h-80 object-contain" />
                      ) : (
                        <div className="text-zinc-500 text-sm">请添加至少2张图片</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
              <div className="p-4 border-b border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-violet-500" />
                  <h2 className="text-base font-semibold text-white">拼接设置</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                

                

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <ArrowRightLeft className="w-4 h-4 text-violet-500" />
                    拼接方向
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDirection("horizontal")}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        direction === "horizontal"
                          ? "bg-violet-500 text-white shadow-lg"
                          : "bg-[#27272a] text-zinc-400 border border-[#3f3f46]"
                      }`}
                    >
                      横向拼接
                    </button>
                    <button
                      onClick={() => setDirection("vertical")}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                        direction === "vertical"
                          ? "bg-violet-500 text-white shadow-lg"
                          : "bg-[#27272a] text-zinc-400 border border-[#3f3f46]"
                      }`}
                    >
                      纵向拼接
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                      <Minus className="w-4 h-4 text-violet-500" />
                      图片间距
                    </label>
                    <span className="text-sm font-bold text-violet-500">{gap}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={gap}
                    onChange={(e) => setGap(Number(e.target.value))}
                    className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-violet-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Palette className="w-4 h-4 text-violet-500" />
                    背景颜色
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-12 rounded-lg cursor-pointer border border-[#3f3f46] bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded-lg text-zinc-300 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 bg-[#27272a] border border-[#3f3f46] rounded-lg text-zinc-300 font-medium text-sm hover:bg-[#3f3f46] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加更多图片
                </button>

                

                

                

                

                

                <button
                  onClick={handleDownload}
                  disabled={!collageResult || isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:opacity-90 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下载拼接图
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
              <div className="text-sm font-medium text-emerald-400">多图拼接</div>
              <p className="text-xs text-zinc-400 mt-1">支持多张图片横向纵向拼接</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-cyan-400">自定义间距</div>
              <p className="text-xs text-zinc-400 mt-1">间距和背景色自由设置</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-violet-400">一键下载</div>
              <p className="text-xs text-zinc-400 mt-1">实时预览，一键生成长图</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
