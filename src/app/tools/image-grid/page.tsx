"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  LayoutGrid,
  Upload,
  Download,
  Trash2,
  Settings,
  Image as ImageIcon,
  ArrowRight,
  ArrowDown,
  Palette,
  MoveUp,
  MoveDown,
  X,
  GripVertical,
} from "lucide-react";

interface ImageItem {
  id: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  dataUrl: string;
}

type Direction = "horizontal" | "vertical";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export default function ImageGridPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<Direction>("vertical");
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [borderRadius, setBorderRadius] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [resultWidth, setResultWidth] = useState(0);
  const [resultHeight, setResultHeight] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgPresets = [
    "#ffffff",
    "#000000",
    "#f1f5f9",
    "#fef3c7",
    "#dbeafe",
    "#dcfce7",
    "#fce7f3",
    "#ede9fe",
  ];

  // 拼接图片
  const stitchImages = useCallback(() => {
    if (images.length === 0) return;

    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    const loadImages = images.map(
      (img) =>
        new Promise<{ img: HTMLImageElement; item: ImageItem }>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ img: image, item: img });
          image.onerror = () => reject(new Error("图片加载失败"));
          image.src = img.dataUrl;
        })
    );

    Promise.all(loadImages)
      .then((loadedImages) => {
        const gapPx = gap;
        const radius = borderRadius;

        if (direction === "horizontal") {
          // 横向拼接：高度取最大值，宽度累加
          const maxHeight = Math.max(...loadedImages.map((i) => i.img.height));
          const totalWidth =
            loadedImages.reduce((sum, i) => sum + i.img.width, 0) +
            gapPx * (loadedImages.length - 1);

          canvas.width = totalWidth + radius * 2;
          canvas.height = maxHeight + radius * 2;

          // 填充背景
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制圆角裁剪
          if (radius > 0) {
            ctx.save();
            ctx.beginPath();
            roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
            ctx.clip();
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // 绘制每张图片
          let x = radius;
          loadedImages.forEach(({ img }) => {
            const y = radius + (maxHeight - img.height) / 2;
            ctx.drawImage(img, x, y);
            x += img.width + gapPx;
          });

          if (radius > 0) {
            ctx.restore();
          }

          setResultWidth(canvas.width);
          setResultHeight(canvas.height);
        } else {
          // 纵向拼接：宽度取最大值，高度累加
          const maxWidth = Math.max(...loadedImages.map((i) => i.img.width));
          const totalHeight =
            loadedImages.reduce((sum, i) => sum + i.img.height, 0) +
            gapPx * (loadedImages.length - 1);

          canvas.width = maxWidth + radius * 2;
          canvas.height = totalHeight + radius * 2;

          // 填充背景
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 绘制圆角裁剪
          if (radius > 0) {
            ctx.save();
            ctx.beginPath();
            roundRect(ctx, 0, 0, canvas.width, canvas.height, radius);
            ctx.clip();
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // 绘制每张图片
          let y = radius;
          loadedImages.forEach(({ img }) => {
            const x = radius + (maxWidth - img.width) / 2;
            ctx.drawImage(img, x, y);
            y += img.height + gapPx;
          });

          if (radius > 0) {
            ctx.restore();
          }

          setResultWidth(canvas.width);
          setResultHeight(canvas.height);
        }

        const dataUrl = canvas.toDataURL("image/png");
        setResultDataUrl(dataUrl);

        // 计算大小
        const base64 = dataUrl.split(",")[1];
        setResultSize(Math.round((base64.length * 3) / 4));

        setIsProcessing(false);
      })
      .catch(() => {
        setIsProcessing(false);
        alert("图片处理失败");
      });
  }, [images, direction, gap, bgColor, borderRadius]);

  // 绘制圆角矩形路径
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // 参数变化时重新生成
  useEffect(() => {
    if (images.length === 0) return;

    const timer = setTimeout(() => {
      stitchImages();
    }, 150);

    return () => clearTimeout(timer);
  }, [images, direction, gap, bgColor, borderRadius, stitchImages]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      alert("请上传图片文件");
      return;
    }

    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const newImage: ImageItem = {
            id: generateId(),
            name: file.name,
            size: file.size,
            type: file.type,
            width: img.width,
            height: img.height,
            dataUrl,
          };
          setImages((prev) => [...prev, newImage]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
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

  const handleRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const newImages = [...prev];
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
      return newImages;
    });
  };

  const handleMoveDown = (index: number) => {
    setImages((prev) => {
      if (index === prev.length - 1) return prev;
      const newImages = [...prev];
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
      return newImages;
    });
  };

  const handleClear = () => {
    setImages([]);
    setResultDataUrl("");
    setResultSize(0);
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `stitched_image_${Date.now()}.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="图片拼接/长图拼接"
      description="在线图片拼接工具，支持多张图片横向或纵向拼接，自定义间距、背景色、圆角，制作精美长图"
      toolId="image-grid"
      icon={LayoutGrid}
      category="图片工具"
      slug="image-grid"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                上传图片 ({images.length} 张)
              </h2>
            </div>
            {images.length > 0 && (
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空全部
              </button>
            )}
          </div>

          <div className="p-6">
            {/* 拖拽上传区域 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-40 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all mb-4 ${
                isDragging
                  ? "border-violet-400 bg-violet-50 dark:bg-violet-900/20"
                  : "border-zinc-300 dark:border-zinc-700 hover:border-violet-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              <Upload
                className={`w-10 h-10 mb-2 transition-colors ${
                  isDragging ? "text-violet-500" : "text-zinc-400"
                }`}
              />
              <div
                className={`text-base font-medium mb-1 ${
                  isDragging
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {isDragging ? "释放鼠标上传图片" : "点击或拖拽上传多张图片"}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400">
                支持 JPG、PNG、WebP 等格式，可批量上传
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* 图片列表 */}
            {images.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                  图片列表（拖拽顺序决定拼接顺序）
                </div>
                <div className={`grid gap-3 ${direction === "horizontal" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
                  {images.map((img, index) => (
                    <div
                      key={img.id}
                      className="group relative bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="aspect-video flex items-center justify-center p-2">
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="max-w-full max-h-full object-contain rounded-lg"
                        />
                      </div>
                      <div className="p-2 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate max-w-[80px]">
                              {img.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveUp(index);
                              }}
                              disabled={index === 0}
                              className="p-1 text-zinc-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="上移"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveDown(index);
                              }}
                              disabled={index === images.length - 1}
                              className="p-1 text-zinc-400 hover:text-violet-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="下移"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(img.id);
                              }}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-colors"
                              title="删除"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-500 mt-1">
                          {img.width}×{img.height} · {formatSize(img.size)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 拼接设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                拼接设置
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 拼接方向 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <LayoutGrid className="w-4 h-4 text-violet-500" />
                拼接方向
              </label>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                <button
                  onClick={() => setDirection("horizontal")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    direction === "horizontal"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  横向拼接
                </button>
                <button
                  onClick={() => setDirection("vertical")}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    direction === "vertical"
                      ? "bg-violet-500 text-white shadow-lg shadow-violet-500/25"
                      : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600"
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  纵向拼接
                </button>
              </div>
            </div>

            {/* 间距 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <GripVertical className="w-4 h-4 text-violet-500" />
                  图片间距
                </label>
                <span className="text-sm font-bold text-violet-500">{gap} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>无间距</span>
                <span>适中</span>
                <span>大间距</span>
              </div>
            </div>

            {/* 背景色 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <Palette className="w-4 h-4 text-violet-500" />
                背景颜色
              </label>
              <div className="flex items-center gap-3 flex-wrap">
                {bgPresets.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBgColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      bgColor === color
                        ? "border-violet-500 scale-110 shadow-md"
                        : "border-zinc-200 dark:border-zinc-700 hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-24 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>
              </div>
            </div>

            {/* 圆角 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  圆角大小
                </label>
                <span className="text-sm font-bold text-violet-500">{borderRadius} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={borderRadius}
                onChange={(e) => setBorderRadius(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                <span>直角</span>
                <span>小圆角</span>
                <span>大圆角</span>
              </div>
            </div>
          </div>
        </div>

        {/* 预览结果 */}
        {images.length > 0 && resultDataUrl && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-emerald-500" />
                <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  拼接效果预览
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div
                className="rounded-xl overflow-hidden flex items-center justify-center p-4"
                style={{ backgroundColor: bgColor === "#ffffff" ? "#f1f5f9" : "#1e293b" }}
              >
                <div className="relative">
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-10 rounded-xl">
                      <div className="text-center">
                        <LayoutGrid className="w-10 h-10 text-violet-500 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">处理中...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={resultDataUrl}
                    alt="拼接结果"
                    className="max-w-full max-h-[500px] object-contain shadow-xl"
                    style={{ borderRadius: `${Math.min(borderRadius, 20)}px` }}
                  />
                </div>
              </div>

              {/* 结果信息 */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    图片数量
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {images.length} 张
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    输出尺寸
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {resultWidth} × {resultHeight}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">
                    文件大小
                  </div>
                  <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {formatSize(resultSize)}
                  </div>
                </div>
              </div>

              {/* 下载按钮 */}
              <button
                onClick={handleDownload}
                disabled={!resultDataUrl || isProcessing}
                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-violet-500/25 disabled:shadow-none hover:shadow-violet-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
              >
                <Download className="w-5 h-5" />
                下载拼接长图
              </button>
            </div>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl">
              <div className="text-sm font-medium text-violet-700 dark:text-violet-300">
                本地处理
              </div>
              <p className="text-xs text-violet-600 dark:text-violet-400 mt-1">
                图片不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                批量拼接
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                支持多张图片批量上传和拼接
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                自定义样式
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                间距、背景色、圆角自由调节
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
