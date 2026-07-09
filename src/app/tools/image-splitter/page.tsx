"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Grid2x2,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Image,
  Grid3X3,
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

export default function ImageSplitterPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  
  const [gridSize, setGridSize] = useState(3);
  const [pieces, setPieces] = useState<string[]>([]);
  
  
  
  
  
  
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(
    (dataUrl: string): Promise<string[]> => {
      return new Promise((resolve, reject) => {
        const img = new (window as any).Image();
        img.onload = () => {
          const pieceSize = Math.min(img.width, img.height) / gridSize;
          const offsetX = (img.width - pieceSize * gridSize) / 2;
          const offsetY = (img.height - pieceSize * gridSize) / 2;
          const results: string[] = [];

          for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
              const c = document.createElement("canvas");
              c.width = pieceSize;
              c.height = pieceSize;
              const cx = c.getContext("2d");
              if (!cx) continue;
              cx.drawImage(
                img,
                offsetX + col * pieceSize,
                offsetY + row * pieceSize,
                pieceSize,
                pieceSize,
                0,
                0,
                pieceSize,
                pieceSize
              );
              results.push(c.toDataURL("image/png"));
            }
          }
          resolve(results);
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = dataUrl;
      });
    },
    [gridSize]
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
        try {
          const result = await processImage(dataUrl);
          setPieces(result);
          const img = new (window as any).Image();
          img.onload = () => {
            setImageData({
              name: file.name,
              originalDataUrl: dataUrl,
              processedDataUrl: dataUrl,
              width: img.width,
              height: img.height,
              type: file.type,
            });
            setIsProcessing(false);
          };
          img.src = dataUrl;
        } catch {
          alert("图片处理失败");
          setIsProcessing(false);
        }
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

  useEffect(() => {
    if (!imageData) return;
    const timer = setTimeout(async () => {
      setIsProcessing(true);
      try {
        const result = await processImage(imageData.originalDataUrl);
        setPieces(result);
      } finally {
        setIsProcessing(false);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [gridSize, imageData?.originalDataUrl, processImage]);

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
    setPieces([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = (index: number) => {
    if (!pieces[index]) return;
    const link = document.createElement("a");
    link.download = `piece_${index + 1}.png`;
    link.href = pieces[index];
    link.click();
  };

  const handleDownloadAll = () => {
    pieces.forEach((piece, i) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.download = `piece_${i + 1}.png`;
        link.href = piece;
        link.click();
      }, i * 200);
    });
  };

  

  

  

  

  

  

  return (
    <ToolLayout
      title="图片分割九宫格"
      description="在线图片九宫格分割，将一张图切成多块，社交媒体发图必备"
      toolId="image-splitter"
      icon={Grid2x2}
      category="图片工具"
      slug="image-splitter"
    >
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {!imageData ? (
          <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
            <div className="p-4 border-b border-[#27272a]">
              <div className="flex items-center gap-2">
                <Grid2x2 className="w-5 h-5 text-amber-500" />
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
                    ? "border-amber-400 bg-amber-500/10"
                    : "border-[#27272a] hover:border-[#3f3f46] hover:bg-[#27272a]/30"
                }`}
              >
                <Upload className={`w-12 h-12 mb-3 transition-colors ${isDragging ? "text-amber-500" : "text-zinc-500"}`} />
                <div className={`text-lg font-medium mb-1 ${isDragging ? "text-amber-400" : "text-zinc-300"}`}>
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
                  <Grid2x2 className="w-5 h-5 text-amber-500" />
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
                <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                  {pieces.map((piece, i) => (
                    <div key={i} className="relative group aspect-square bg-[#27272a] rounded-lg overflow-hidden">
                      <img src={piece} alt={`分片${i+1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDownload(i)}
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Download className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
                {isProcessing && (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
              <div className="p-4 border-b border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-white">分割设置</h2>
                </div>
              </div>
              <div className="p-6 space-y-6">
                

                

                

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zinc-300 mb-3">
                    <Grid3X3 className="w-4 h-4 text-amber-500" />
                    网格数量
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((size) => (
                      <button
                        key={size}
                        onClick={() => setGridSize(size)}
                        className={`px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          gridSize === size
                            ? "bg-amber-500 text-white shadow-lg"
                            : "bg-[#27272a] text-zinc-400 border border-[#3f3f46]"
                        }`}
                      >
                        {size}×{size}
                      </button>
                    ))}
                  </div>
                </div>

                

                

                

                

                <button
                  onClick={handleDownloadAll}
                  disabled={isProcessing}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:active:scale-100"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下载全部
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
              <div className="text-sm font-medium text-emerald-400">九宫格切图</div>
              <p className="text-xs text-zinc-400 mt-1">一键切成九宫格，发朋友圈必备</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-cyan-400">多种网格</div>
              <p className="text-xs text-zinc-400 mt-1">支持2x2、3x3、4x4等多种网格</p>
            </div>
            <div className="p-4 bg-[#27272a]/50 rounded-xl">
              <div className="text-sm font-medium text-violet-400">批量下载</div>
              <p className="text-xs text-zinc-400 mt-1">一键下载所有切割后的图片</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
