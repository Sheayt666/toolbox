"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Sparkles,
  Upload,
  Download,
  Trash2,
  Settings,
  RefreshCw,
  Grid3X3,
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

interface BlurArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type BlurMode = "gaussian" | "pixelate";
type ApplyMode = "full" | "local";

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageBlurPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [blurMode, setBlurMode] = useState<BlurMode>("gaussian");
  const [applyMode, setApplyMode] = useState<ApplyMode>("full");
  const [blurRadius, setBlurRadius] = useState(10);
  const [pixelSize, setPixelSize] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [blurArea, setBlurArea] = useState<BlurArea>({ x: 0, y: 0, width: 200, height: 200 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayScale, setDisplayScale] = useState(1);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });
  const dragStateRef = useRef<{
    type: "move" | "resize" | "draw" | null;
    handle: string;
    startX: number;
    startY: number;
    startArea: BlurArea;
  }>({ type: null, handle: "", startX: 0, startY: 0, startArea: { x: 0, y: 0, width: 0, height: 0 } });

  const calculateDisplayScale = useCallback((imgWidth: number, imgHeight: number, containerWidth: number, containerHeight: number) => {
    const scaleX = containerWidth / imgWidth;
    const scaleY = containerHeight / imgHeight;
    return Math.min(scaleX, scaleY, 1);
  }, []);

  const updateImageDisplay = useCallback(() => {
    if (!imageData || !containerRef.current) return;
    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const scale = calculateDisplayScale(imageData.originalWidth, imageData.originalHeight, containerWidth, containerHeight);
    const displayWidth = imageData.originalWidth * scale;
    const displayHeight = imageData.originalHeight * scale;
    const offsetX = (containerWidth - displayWidth) / 2;
    const offsetY = (containerHeight - displayHeight) / 2;
    setDisplayScale(scale);
    setImageDisplaySize({ width: displayWidth, height: displayHeight, offsetX, offsetY });
  }, [imageData, calculateDisplayScale]);

  useEffect(() => {
    updateImageDisplay();
    const handleResize = () => updateImageDisplay();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateImageDisplay, imageData]);

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

        // 初始化模糊区域
        const areaSize = Math.min(img.width, img.height) * 0.3;
        setBlurArea({
          x: (img.width - areaSize) / 2,
          y: (img.height - areaSize) / 2,
          width: areaSize,
          height: areaSize,
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
    setBlurRadius(10);
    setPixelSize(10);
    if (imageData) {
      const areaSize = Math.min(imageData.originalWidth, imageData.originalHeight) * 0.3;
      setBlurArea({
        x: (imageData.originalWidth - areaSize) / 2,
        y: (imageData.originalHeight - areaSize) / 2,
        width: areaSize,
        height: areaSize,
      });
    }
  };

  // 像素化处理
  const pixelateImage = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, pixelSize: number, area?: BlurArea) => {
    const w = img.width;
    const h = img.height;

    if (area) {
      // 局部像素化
      const ax = Math.max(0, Math.floor(area.x));
      const ay = Math.max(0, Math.floor(area.y));
      const aw = Math.min(w - ax, Math.floor(area.width));
      const ah = Math.min(h - ay, Math.floor(area.height));

      // 获取区域像素数据
      const imageData = ctx.getImageData(ax, ay, aw, ah);
      const data = imageData.data;

      // 像素化处理
      for (let y = 0; y < ah; y += pixelSize) {
        for (let x = 0; x < aw; x += pixelSize) {
          // 获取块的平均颜色
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          for (let py = 0; py < pixelSize && y + py < ah; py++) {
            for (let px = 0; px < pixelSize && x + px < aw; px++) {
              const idx = ((y + py) * aw + (x + px)) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          a = Math.round(a / count);

          // 填充块
          for (let py = 0; py < pixelSize && y + py < ah; py++) {
            for (let px = 0; px < pixelSize && x + px < aw; px++) {
              const idx = ((y + py) * aw + (x + px)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }

      ctx.putImageData(imageData, ax, ay);
    } else {
      // 全图像素化
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      for (let y = 0; y < h; y += pixelSize) {
        for (let x = 0; x < w; x += pixelSize) {
          let r = 0, g = 0, b = 0, a = 0, count = 0;
          for (let py = 0; py < pixelSize && y + py < h; py++) {
            for (let px = 0; px < pixelSize && x + px < w; px++) {
              const idx = ((y + py) * w + (x + px)) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              a += data[idx + 3];
              count++;
            }
          }
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          a = Math.round(a / count);

          for (let py = 0; py < pixelSize && y + py < h; py++) {
            for (let px = 0; px < pixelSize && x + px < w; px++) {
              const idx = ((y + py) * w + (x + px)) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
              data[idx + 3] = a;
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }
  }, []);

  // 生成模糊/像素化结果
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
        ctx.drawImage(img, 0, 0);

        const area = applyMode === "local" ? blurArea : undefined;

        if (blurMode === "gaussian") {
          // 高斯模糊 - 使用canvas filter
          if (applyMode === "full") {
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.drawImage(img, 0, 0);
            ctx.filter = "none";
          } else {
            // 局部模糊 - 离屏canvas处理
            const offCanvas = document.createElement("canvas");
            offCanvas.width = canvas.width;
            offCanvas.height = canvas.height;
            const offCtx = offCanvas.getContext("2d");
            if (offCtx) {
              offCtx.drawImage(img, 0, 0);
              offCtx.filter = `blur(${blurRadius}px)`;
              offCtx.drawImage(img, 0, 0);
              offCtx.filter = "none";

              // 只保留模糊区域
              const ax = Math.max(0, Math.floor(blurArea.x));
              const ay = Math.max(0, Math.floor(blurArea.y));
              const aw = Math.min(img.width - ax, Math.floor(blurArea.width));
              const ah = Math.min(img.height - ay, Math.floor(blurArea.height));

              if (aw > 0 && ah > 0) {
                const blurredData = offCtx.getImageData(ax, ay, aw, ah);
                ctx.putImageData(blurredData, ax, ay);
              }
            }
          }
        } else {
          // 像素化
          pixelateImage(ctx, img, pixelSize, area);
        }

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
  }, [blurMode, applyMode, blurRadius, pixelSize, blurArea, imageData, pixelateImage]);

  // 鼠标事件处理局部模糊区域
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, type: "move" | "resize", handle = "") => {
    e.preventDefault();
    e.stopPropagation();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    dragStateRef.current = {
      type,
      handle,
      startX: clientX,
      startY: clientY,
      startArea: { ...blurArea },
    };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      let moveX: number, moveY: number;
      if ("touches" in moveEvent) {
        moveX = moveEvent.touches[0].clientX;
        moveY = moveEvent.touches[0].clientY;
      } else {
        moveX = moveEvent.clientX;
        moveY = moveEvent.clientY;
      }

      const dx = (moveX - dragStateRef.current.startX) / displayScale;
      const dy = (moveY - dragStateRef.current.startY) / displayScale;
      const start = dragStateRef.current.startArea;

      if (dragStateRef.current.type === "move") {
        let newX = start.x + dx;
        let newY = start.y + dy;
        newX = Math.max(0, Math.min(imageData!.originalWidth - start.width, newX));
        newY = Math.max(0, Math.min(imageData!.originalHeight - start.height, newY));
        setBlurArea((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragStateRef.current.type === "resize") {
        let newX = start.x;
        let newY = start.y;
        let newWidth = start.width;
        let newHeight = start.height;
        const h = dragStateRef.current.handle;

        if (h.includes("e")) {
          newWidth = Math.max(20, start.width + dx);
        }
        if (h.includes("w")) {
          newWidth = Math.max(20, start.width - dx);
          newX = start.x + dx;
          if (newX < 0) {
            newWidth += newX;
            newX = 0;
          }
        }
        if (h.includes("s")) {
          newHeight = Math.max(20, start.height + dy);
        }
        if (h.includes("n")) {
          newHeight = Math.max(20, start.height - dy);
          newY = start.y + dy;
          if (newY < 0) {
            newHeight += newY;
            newY = 0;
          }
        }

        // 边界检查
        if (newX + newWidth > imageData!.originalWidth) {
          newWidth = imageData!.originalWidth - newX;
        }
        if (newY + newHeight > imageData!.originalHeight) {
          newHeight = imageData!.originalHeight - newY;
        }

        setBlurArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleUp = () => {
      dragStateRef.current = { type: null, handle: "", startX: 0, startY: 0, startArea: { x: 0, y: 0, width: 0, height: 0 } };
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove);
    document.addEventListener("touchend", handleUp);
  };

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_blurred.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="图片模糊像素化"
      description="图片高斯模糊和马赛克像素化处理，支持强度调节和局部模糊，实时预览"
      toolId="image-blur"
      icon={Sparkles}
      category="图片工具"
      slug="image-blur"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-slate-500" />
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
                    ? "border-slate-400 bg-slate-50 dark:bg-slate-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-slate-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-slate-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-slate-600 dark:text-slate-400"
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
                  <Sparkles className="w-5 h-5 text-slate-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    {applyMode === "local" ? "调整模糊区域" : "效果预览"}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowOriginal(!showOriginal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-slate-400 transition-colors"
                  >
                    {showOriginal ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showOriginal ? "看效果" : "看原图"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-slate-500 dark:text-zinc-400 dark:hover:text-slate-400 transition-colors"
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
                <div
                  ref={containerRef}
                  className="relative w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden"
                  style={{ height: "400px" }}
                >
                  {showOriginal ? (
                    <img
                      src={imageData.originalDataUrl}
                      alt="原图"
                      className="absolute select-none"
                      style={{
                        left: imageDisplaySize.offsetX,
                        top: imageDisplaySize.offsetY,
                        width: imageDisplaySize.width,
                        height: imageDisplaySize.height,
                      }}
                      draggable={false}
                    />
                  ) : isProcessing ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
                    </div>
                  ) : applyMode === "local" ? (
                    <>
                      {/* 底层：模糊后的图 */}
                      <img
                        src={resultDataUrl}
                        alt="模糊效果"
                        className="absolute select-none pointer-events-none"
                        style={{
                          left: imageDisplaySize.offsetX,
                          top: imageDisplaySize.offsetY,
                          width: imageDisplaySize.width,
                          height: imageDisplaySize.height,
                        }}
                        draggable={false}
                      />

                      {/* 模糊区域选择框 */}
                      {displayScale > 0 && (
                        <div
                          className="absolute border-2 border-white cursor-move"
                          style={{
                            left: imageDisplaySize.offsetX + blurArea.x * displayScale,
                            top: imageDisplaySize.offsetY + blurArea.y * displayScale,
                            width: blurArea.width * displayScale,
                            height: blurArea.height * displayScale,
                            boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 0 20px rgba(0,0,0,0.3)",
                          }}
                          onMouseDown={(e) => handleMouseDown(e, "move")}
                          onTouchStart={(e) => handleMouseDown(e, "move")}
                        >
                          <div className="absolute inset-0 bg-slate-500/10" />
                          {/* 调整手柄 */}
                          {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                            <div
                              key={handle}
                              className={`absolute w-3 h-3 bg-white border-2 border-slate-500 rounded-sm ${
                                handle.includes("n") ? "-top-1.5" : handle.includes("s") ? "-bottom-1.5" : "top-1/2 -translate-y-1/2"
                              } ${
                                handle.includes("w") ? "-left-1.5" : handle.includes("e") ? "-right-1.5" : "left-1/2 -translate-x-1/2"
                              } ${
                                handle === "nw" || handle === "se" ? "cursor-nwse-resize" :
                                handle === "ne" || handle === "sw" ? "cursor-nesw-resize" :
                                handle === "n" || handle === "s" ? "cursor-ns-resize" :
                                "cursor-ew-resize"
                              }`}
                              onMouseDown={(e) => handleMouseDown(e, "resize", handle)}
                              onTouchStart={(e) => handleMouseDown(e, "resize", handle)}
                            />
                          ))}
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-700 text-white text-xs rounded whitespace-nowrap">
                            {Math.round(blurArea.width)} × {Math.round(blurArea.height)}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <img
                      src={resultDataUrl}
                      alt="模糊效果"
                      className="absolute select-none"
                      style={{
                        left: imageDisplaySize.offsetX,
                        top: imageDisplaySize.offsetY,
                        width: imageDisplaySize.width,
                        height: imageDisplaySize.height,
                      }}
                      draggable={false}
                    />
                  )}
                </div>

                {/* 信息 */}
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
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {formatSize(resultSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                      模式
                    </div>
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                      {blurMode === "gaussian" ? "高斯模糊" : "像素化"}
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

            {/* 设置区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      效果设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 模糊模式 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      模糊类型
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBlurMode("gaussian")}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          blurMode === "gaussian"
                            ? "bg-slate-700 text-white shadow-lg shadow-slate-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-slate-400"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        高斯模糊
                      </button>
                      <button
                        onClick={() => setBlurMode("pixelate")}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${
                          blurMode === "pixelate"
                            ? "bg-slate-700 text-white shadow-lg shadow-slate-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-slate-400"
                        }`}
                      >
                        <Grid3X3 className="w-4 h-4" />
                        马赛克像素化
                      </button>
                    </div>
                  </div>

                  {/* 应用范围 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      应用范围
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setApplyMode("full")}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          applyMode === "full"
                            ? "bg-slate-500 text-white shadow-lg shadow-slate-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-slate-400"
                        }`}
                      >
                        整图应用
                      </button>
                      <button
                        onClick={() => setApplyMode("local")}
                        className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                          applyMode === "local"
                            ? "bg-slate-500 text-white shadow-lg shadow-slate-500/25"
                            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-slate-400"
                        }`}
                      >
                        局部模糊
                      </button>
                    </div>
                    {applyMode === "local" && (
                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        拖拽选择框调整模糊区域的位置和大小
                      </p>
                    )}
                  </div>

                  {/* 强度调节 */}
                  {blurMode === "gaussian" ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          模糊强度
                        </label>
                        <span className="text-sm font-bold text-slate-500">
                          {blurRadius}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={blurRadius}
                        onChange={(e) => setBlurRadius(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-slate-500"
                      />
                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>轻微</span>
                        <span>中等</span>
                        <span>强烈</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          像素大小
                        </label>
                        <span className="text-sm font-bold text-slate-500">
                          {pixelSize}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        value={pixelSize}
                        onChange={(e) => setPixelSize(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-slate-500"
                      />
                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>细腻</span>
                        <span>中等</span>
                        <span>粗糙</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-slate-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      下载结果
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                    {resultDataUrl ? (
                      <img
                        src={resultDataUrl}
                        alt="处理结果预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-400 text-sm">暂无预览</div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        输出格式
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        PNG (无损)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        文件大小
                      </span>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                        {formatSize(resultSize)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-slate-500/25 disabled:shadow-none hover:shadow-slate-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
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
            <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-xl">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                两种效果
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                高斯模糊 + 马赛克像素化
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
                局部模糊
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                精准选择模糊区域，保护隐私
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
