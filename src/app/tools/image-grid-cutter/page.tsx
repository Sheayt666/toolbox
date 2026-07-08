"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Grid3X3,
  Upload,
  Download,
  Trash2,
  Settings,
  Image as ImageIcon,
  Zap,
  Circle,
  Square,
  Info,
} from "lucide-react";

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  dataUrl: string;
}

interface GridSlices {
  dataUrls: string[];
  sliceWidth: number;
  sliceHeight: number;
}

const presets = [
  { rows: 2, cols: 2, label: "2×2" },
  { rows: 3, cols: 3, label: "3×3 九宫格" },
  { rows: 4, cols: 4, label: "4×4" },
  { rows: 3, cols: 2, label: "3×2" },
  { rows: 2, cols: 3, label: "2×3" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageGridCutterPage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [slices, setSlices] = useState<GridSlices | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [circleCrop, setCircleCrop] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 切割图片
  const sliceImage = useCallback(
    (
      imgSrc: string,
      imgType: string,
      rowCount: number,
      colCount: number,
      isCircle: boolean
    ): Promise<GridSlices> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          // 计算切割尺寸（取正方形区域居中裁剪）
          const sliceSize = Math.min(
            Math.floor(img.width / colCount),
            Math.floor(img.height / rowCount)
          );
          const totalWidth = sliceSize * colCount;
          const totalHeight = sliceSize * rowCount;
          const offsetX = (img.width - totalWidth) / 2;
          const offsetY = (img.height - totalHeight) / 2;

          const dataUrls: string[] = [];

          for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < colCount; c++) {
              const canvas = document.createElement("canvas");
              canvas.width = sliceSize;
              canvas.height = sliceSize;
              const ctx = canvas.getContext("2d");
              if (!ctx) {
                reject(new Error("Canvas 不支持"));
                return;
              }

              if (isCircle) {
                // 圆形裁剪
                ctx.save();
                ctx.beginPath();
                ctx.arc(
                  sliceSize / 2,
                  sliceSize / 2,
                  sliceSize / 2,
                  0,
                  Math.PI * 2
                );
                ctx.closePath();
                ctx.clip();
              }

              ctx.drawImage(
                img,
                offsetX + c * sliceSize,
                offsetY + r * sliceSize,
                sliceSize,
                sliceSize,
                0,
                0,
                sliceSize,
                sliceSize
              );

              if (isCircle) {
                ctx.restore();
              }

              // 输出格式：圆形裁剪用 PNG，其他按原格式
              const mimeType = isCircle || imgType === "image/png" ? "image/png" : "image/jpeg";
              const quality = isCircle || imgType === "image/png" ? undefined : 0.95;
              dataUrls.push(canvas.toDataURL(mimeType, quality));
            }
          }

          resolve({ dataUrls, sliceWidth: sliceSize, sliceHeight: sliceSize });
        };
        img.onerror = () => reject(new Error("图片加载失败"));
        img.src = imgSrc;
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
          const info: ImageInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            dataUrl,
          };
          setImageInfo(info);

          try {
            const result = await sliceImage(dataUrl, file.type, rows, cols, circleCrop);
            setSlices(result);
          } catch (err) {
            console.error("切割失败:", err);
          } finally {
            setIsProcessing(false);
          }
        };
        img.onerror = () => {
          setIsProcessing(false);
          alert("图片加载失败");
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [rows, cols, circleCrop, sliceImage]
  );

  // 当行列数或圆形裁剪变化时重新切割
  const handleGridChange = useCallback(
    async (newRows: number, newCols: number) => {
      setRows(newRows);
      setCols(newCols);

      if (imageInfo) {
        setIsProcessing(true);
        try {
          const result = await sliceImage(
            imageInfo.dataUrl,
            imageInfo.type,
            newRows,
            newCols,
            circleCrop
          );
          setSlices(result);
        } catch (err) {
          console.error("切割失败:", err);
        } finally {
          setIsProcessing(false);
        }
      }
    },
    [imageInfo, circleCrop, sliceImage]
  );

  // 切换圆形裁剪
  const toggleCircleCrop = useCallback(async () => {
    const newCircle = !circleCrop;
    setCircleCrop(newCircle);

    if (imageInfo) {
      setIsProcessing(true);
      try {
        const result = await sliceImage(
          imageInfo.dataUrl,
          imageInfo.type,
          rows,
          cols,
          newCircle
        );
        setSlices(result);
      } catch (err) {
        console.error("切割失败:", err);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [circleCrop, imageInfo, rows, cols, sliceImage]);

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
    setImageInfo(null);
    setSlices(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadSlice = (dataUrl: string, index: number) => {
    const ext = circleCrop || imageInfo?.type === "image/png" ? "png" : "jpg";
    const baseName = imageInfo?.name.replace(/\.[^.]+$/, "") || "slice";
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${baseName}_${index + 1}.${ext}`;
    a.click();
  };

  const downloadAll = async () => {
    if (!slices) return;
    const ext = circleCrop || imageInfo?.type === "image/png" ? "png" : "jpg";
    const baseName = imageInfo?.name.replace(/\.[^.]+$/, "") || "slice";

    // 逐个下载（间隔一段时间避免浏览器阻止）
    for (let i = 0; i < slices.dataUrls.length; i++) {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = slices.dataUrls[i];
        a.download = `${baseName}_${i + 1}.${ext}`;
        a.click();
      }, i * 200);
    }
  };

  const totalSlices = rows * cols;

  return (
    <ToolLayout
      title="九宫格切图"
      description="将图片切成九宫格，支持自定义行列数和圆形裁剪，一键下载切好的图片，朋友圈微博配图神器"
      toolId="image-grid-cutter"
      icon={Grid3X3}
      category="图片工具"
      slug="image-grid-cutter"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                上传图片
              </h2>
            </div>
          </div>

          <div className="p-6">
            {!imageInfo ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-64 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                  isDragging
                    ? "border-sky-400 bg-sky-50 dark:bg-sky-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-sky-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-sky-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-sky-600 dark:text-sky-400"
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
            ) : (
              <div className="flex flex-col sm:flex-row gap-6">
                {/* 图片预览 */}
                <div className="flex-shrink-0">
                  <div className="relative w-full sm:w-56 h-56 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={imageInfo.dataUrl}
                      alt="preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    {/* 网格预览线 */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage: `
                          linear-gradient(to right, rgba(255,255,255,0.7) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255,255,255,0.7) 1px, transparent 1px)
                        `,
                        backgroundSize: `${100 / cols}% ${100 / rows}%`,
                      }}
                    />
                    {isProcessing && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-sm">处理中...</div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      重新上传
                    </button>
                  </div>
                </div>

                {/* 图片信息 */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoItem label="文件名" value={imageInfo.name} />
                    <InfoItem label="文件大小" value={formatSize(imageInfo.size)} />
                    <InfoItem
                      label="图片尺寸"
                      value={`${imageInfo.width} × ${imageInfo.height}`}
                    />
                    <InfoItem label="文件类型" value={imageInfo.type} />
                  </div>
                  {slices && (
                    <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                      <div className="text-sm text-sky-700 dark:text-sky-300 font-medium">
                      切成 {rows} × {cols} = {totalSlices} 张图片
                    </div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                        单张尺寸: {slices.sliceWidth} × {slices.sliceHeight} px
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 切割设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-sky-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                切割设置
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-5">
            {/* 预设 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  快捷预设
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleGridChange(p.rows, p.cols)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                      rows === p.rows && cols === p.cols
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-700 dark:hover:text-sky-300"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 自定义行列数 */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">行数:</span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    onClick={() => handleGridChange(Math.max(2, rows - 1), cols)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                    {rows}
                  </span>
                  <button
                    onClick={() => handleGridChange(Math.min(10, rows + 1), cols)}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">列数:</span>
                <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    onClick={() => handleGridChange(rows, Math.max(2, cols - 1))}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-semibold text-zinc-900 dark:text-white">
                    {cols}
                  </span>
                  <button
                    onClick={() => handleGridChange(rows, Math.min(10, cols + 1))}
                    className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 裁剪形状 */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Square className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  裁剪形状
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                if (circleCrop) toggleCircleCrop();
              }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    !circleCrop
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                  }`}
                >
                  <Square className="w-4 h-4" />
                  方形
                </button>
                <button
                  onClick={toggleCircleCrop}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    circleCrop
                      ? "bg-sky-500 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-sky-100 dark:hover:bg-sky-900/30"
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  圆形
                </button>
              </div>
              {circleCrop && (
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
                  圆形裁剪将输出 PNG 格式透明背景图片
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 切割结果 */}
        {slices && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    切割结果 ({totalSlices} 张)
                  </h2>
                </div>
                <button
                  onClick={downloadAll}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  全部下载
                </button>
              </div>
            </div>

            <div className="p-4">
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {slices.dataUrls.map((url, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-sky-400 transition-all shadow-sm hover:shadow-md"
                    onClick={() => downloadSlice(url, index)}
                    title={`点击下载第 ${index + 1} 张`}
                  >
                    <img
                      src={url}
                      alt={`slice-${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500 text-center">
                点击单张图片可单独下载，或点击「全部下载」批量下载
              </p>
            </div>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具介绍
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-3 leading-relaxed">
            <p>
              九宫格切图工具可以快速将一张图片切割成指定行列数的小图片，
              特别适合制作微信朋友圈、微博、Instagram等平台的九宫格配图。
              支持方形和圆形两种裁剪方式，所有处理在浏览器本地完成，使用 Canvas API 切割，
              图片不会上传到服务器，保护您的隐私安全。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
                <div className="text-sm font-medium text-sky-700 dark:text-sky-300">
                  本地处理
                </div>
                <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                  图片不上传服务器
                </p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  多种网格
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  支持 2×2 到 10×10
                </p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  圆形裁剪
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  支持圆形头像风格
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{label}</div>
      <div
        className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate"
        title={value}
      >
        {value}
      </div>
    </div>
  );
}
