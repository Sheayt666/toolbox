"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Crop,
  Upload,
  Download,
  Trash2,
  Settings,
  RotateCcw,
  FileImage,
  RefreshCw,
  Move,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  type: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

type AspectRatio = "free" | "1:1" | "4:3" | "16:9" | "3:4" | "9:16";

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

function getAspectRatioValue(ratio: AspectRatio): number | null {
  const map: Record<string, number> = {
    "1:1": 1,
    "4:3": 4 / 3,
    "16:9": 16 / 9,
    "3:4": 3 / 4,
    "9:16": 9 / 16,
  };
  return ratio === "free" ? null : map[ratio] || null;
}

export default function ImageCropPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [outputFormat, setOutputFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [croppedDataUrl, setCroppedDataUrl] = useState("");
  const [croppedSize, setCroppedSize] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{
    type: "move" | "resize" | null;
    handle: string;
    startX: number;
    startY: number;
    startCrop: CropArea;
  }>({ type: null, handle: "", startX: 0, startY: 0, startCrop: { x: 0, y: 0, width: 0, height: 0 } });

  const [displayScale, setDisplayScale] = useState(1);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0, offsetX: 0, offsetY: 0 });

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

        // 初始化裁剪区域（居中80%）
        const initSize = Math.min(img.width, img.height) * 0.8;
        setCropArea({
          x: (img.width - initSize) / 2,
          y: (img.height - initSize) / 2,
          width: initSize,
          height: initSize,
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
    setCropArea({ x: 0, y: 0, width: 0, height: 0 });
    setCroppedDataUrl("");
    setCroppedSize(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (!imageData) return;
    const initSize = Math.min(imageData.originalWidth, imageData.originalHeight) * 0.8;
    setCropArea({
      x: (imageData.originalWidth - initSize) / 2,
      y: (imageData.originalHeight - initSize) / 2,
      width: initSize,
      height: initSize,
    });
    setAspectRatio("free");
  };

  // 鼠标/触摸事件处理
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
      startCrop: { ...cropArea },
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
      const start = dragStateRef.current.startCrop;
      const ratio = getAspectRatioValue(aspectRatio);

      if (dragStateRef.current.type === "move") {
        let newX = start.x + dx;
        let newY = start.y + dy;
        newX = Math.max(0, Math.min(imageData!.originalWidth - start.width, newX));
        newY = Math.max(0, Math.min(imageData!.originalHeight - start.height, newY));
        setCropArea((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragStateRef.current.type === "resize") {
        let newX = start.x;
        let newY = start.y;
        let newWidth = start.width;
        let newHeight = start.height;
        const handle = dragStateRef.current.handle;

        if (handle.includes("e")) {
          newWidth = Math.max(20, start.width + dx);
        }
        if (handle.includes("w")) {
          newWidth = Math.max(20, start.width - dx);
          newX = start.x + dx;
          if (newX < 0) {
            newWidth += newX;
            newX = 0;
          }
        }
        if (handle.includes("s")) {
          newHeight = Math.max(20, start.height + dy);
        }
        if (handle.includes("n")) {
          newHeight = Math.max(20, start.height - dy);
          newY = start.y + dy;
          if (newY < 0) {
            newHeight += newY;
            newY = 0;
          }
        }

        // 固定比例
        if (ratio) {
          if (handle === "e" || handle === "w") {
            newHeight = newWidth / ratio;
          } else if (handle === "n" || handle === "s") {
            newWidth = newHeight * ratio;
          } else {
            // 角点调整
            if (Math.abs(dx) > Math.abs(dy)) {
              newHeight = newWidth / ratio;
            } else {
              newWidth = newHeight * ratio;
            }
          }

          // 边界检查
          if (newX + newWidth > imageData!.originalWidth) {
            newWidth = imageData!.originalWidth - newX;
            newHeight = newWidth / ratio;
          }
          if (newY + newHeight > imageData!.originalHeight) {
            newHeight = imageData!.originalHeight - newY;
            newWidth = newHeight * ratio;
          }
          if (newX < 0) newX = 0;
          if (newY < 0) newY = 0;
        } else {
          // 自由比例边界检查
          if (newX + newWidth > imageData!.originalWidth) {
            newWidth = imageData!.originalWidth - newX;
          }
          if (newY + newHeight > imageData!.originalHeight) {
            newHeight = imageData!.originalHeight - newY;
          }
        }

        setCropArea({ x: newX, y: newY, width: newWidth, height: newHeight });
      }
    };

    const handleUp = () => {
      dragStateRef.current = { type: null, handle: "", startX: 0, startY: 0, startCrop: { x: 0, y: 0, width: 0, height: 0 } };
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

  // 键盘微调
  useEffect(() => {
    if (!imageData) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const step = e.shiftKey ? 10 : 1;
      setCropArea((prev) => {
        let { x, y, width, height } = prev;

        switch (e.key) {
          case "ArrowLeft":
            x = Math.max(0, x - step);
            break;
          case "ArrowRight":
            x = Math.min(imageData.originalWidth - width, x + step);
            break;
          case "ArrowUp":
            y = Math.max(0, y - step);
            break;
          case "ArrowDown":
            y = Math.min(imageData.originalHeight - height, y + step);
            break;
          default:
            return prev;
        }

        e.preventDefault();
        return { x, y, width, height };
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [imageData]);

  // 比例改变时调整裁剪框
  useEffect(() => {
    if (!imageData || aspectRatio === "free") return;
    const ratio = getAspectRatioValue(aspectRatio);
    if (!ratio) return;

    setCropArea((prev) => {
      let newWidth = prev.width;
      let newHeight = prev.width / ratio;

      if (newHeight > imageData.originalHeight) {
        newHeight = imageData.originalHeight * 0.8;
        newWidth = newHeight * ratio;
      }
      if (newWidth > imageData.originalWidth) {
        newWidth = imageData.originalWidth * 0.8;
        newHeight = newWidth / ratio;
      }

      const newX = Math.max(0, Math.min(imageData.originalWidth - newWidth, prev.x + (prev.width - newWidth) / 2));
      const newY = Math.max(0, Math.min(imageData.originalHeight - newHeight, prev.y + (prev.height - newHeight) / 2));

      return { x: newX, y: newY, width: newWidth, height: newHeight };
    });
  }, [aspectRatio, imageData]);

  // 生成裁剪结果
  useEffect(() => {
    if (!imageData || cropArea.width === 0) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);
      const canvas = document.createElement("canvas");
      const w = Math.round(cropArea.width);
      const h = Math.round(cropArea.height);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          w,
          h
        );
        const mimeType = getMimeType(outputFormat);
        const dataUrl = canvas.toDataURL(mimeType, quality / 100);
        const base64 = dataUrl.split(",")[1];
        const size = Math.round((base64.length * 3) / 4);
        setCroppedDataUrl(dataUrl);
        setCroppedSize(size);
        setIsProcessing(false);
      };
      img.onerror = () => setIsProcessing(false);
      img.src = imageData.originalDataUrl;
    }, 100);

    return () => clearTimeout(timer);
  }, [cropArea, imageData, outputFormat, quality]);

  const handleDownload = () => {
    if (!croppedDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_cropped.${getExtension(outputFormat)}`;
    link.href = croppedDataUrl;
    link.click();
  };

  const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: "free", label: "自由" },
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "16:9", label: "16:9" },
    { value: "3:4", label: "3:4" },
    { value: "9:16", label: "9:16" },
  ];

  return (
    <ToolLayout
      title="图片裁剪工具"
      description="在线图片裁剪，支持自由裁剪和固定比例裁剪，拖拽调整裁剪框，键盘微调，实时预览，一键下载"
      toolId="image-crop"
      icon={Crop}
      category="图片工具"
      slug="image-crop"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Crop className="w-5 h-5 text-purple-500" />
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
                    ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-purple-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-purple-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-purple-600 dark:text-purple-400"
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
            {/* 裁剪区域 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crop className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    裁剪图片
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-purple-500 dark:text-zinc-400 dark:hover:text-purple-400 transition-colors"
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
                  {/* 图片 */}
                  <img
                    src={imageData.originalDataUrl}
                    alt="原图"
                    className="absolute select-none pointer-events-none"
                    style={{
                      left: imageDisplaySize.offsetX,
                      top: imageDisplaySize.offsetY,
                      width: imageDisplaySize.width,
                      height: imageDisplaySize.height,
                    }}
                    draggable={false}
                  />

                  {/* 裁剪框遮罩 */}
                  {displayScale > 0 && (
                    <>
                      {/* 上遮罩 */}
                      <div
                        className="absolute bg-black/50 pointer-events-none"
                        style={{
                          left: imageDisplaySize.offsetX,
                          top: imageDisplaySize.offsetY,
                          width: imageDisplaySize.width,
                          height: cropArea.y * displayScale,
                        }}
                      />
                      {/* 下遮罩 */}
                      <div
                        className="absolute bg-black/50 pointer-events-none"
                        style={{
                          left: imageDisplaySize.offsetX,
                          top: imageDisplaySize.offsetY + (cropArea.y + cropArea.height) * displayScale,
                          width: imageDisplaySize.width,
                          height: imageDisplaySize.height - (cropArea.y + cropArea.height) * displayScale,
                        }}
                      />
                      {/* 左遮罩 */}
                      <div
                        className="absolute bg-black/50 pointer-events-none"
                        style={{
                          left: imageDisplaySize.offsetX,
                          top: imageDisplaySize.offsetY + cropArea.y * displayScale,
                          width: cropArea.x * displayScale,
                          height: cropArea.height * displayScale,
                        }}
                      />
                      {/* 右遮罩 */}
                      <div
                        className="absolute bg-black/50 pointer-events-none"
                        style={{
                          left: imageDisplaySize.offsetX + (cropArea.x + cropArea.width) * displayScale,
                          top: imageDisplaySize.offsetY + cropArea.y * displayScale,
                          width: imageDisplaySize.width - (cropArea.x + cropArea.width) * displayScale,
                          height: cropArea.height * displayScale,
                        }}
                      />

                      {/* 裁剪框 */}
                      <div
                        className="absolute border-2 border-white cursor-move"
                        style={{
                          left: imageDisplaySize.offsetX + cropArea.x * displayScale,
                          top: imageDisplaySize.offsetY + cropArea.y * displayScale,
                          width: cropArea.width * displayScale,
                          height: cropArea.height * displayScale,
                          boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
                        }}
                        onMouseDown={(e) => handleMouseDown(e, "move")}
                        onTouchStart={(e) => handleMouseDown(e, "move")}
                      >
                        {/* 网格线 */}
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/50" />
                          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/50" />
                          <div className="absolute top-1/3 left-0 right-0 h-px bg-white/50" />
                          <div className="absolute top-2/3 left-0 right-0 h-px bg-white/50" />
                        </div>

                        {/* 调整手柄 */}
                        {["nw", "n", "ne", "e", "se", "s", "sw", "w"].map((handle) => (
                          <div
                            key={handle}
                            className={`absolute w-3 h-3 bg-white border-2 border-purple-500 rounded-sm ${
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
                      </div>
                    </>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-zinc-900/80 flex items-center justify-center z-20">
                      <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* 裁剪信息 */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                  <span>
                    原图尺寸: {imageData.originalWidth} × {imageData.originalHeight}
                  </span>
                  <span className="text-purple-500 font-medium">
                    裁剪尺寸: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Move className="w-3.5 h-3.5" />
                    拖拽调整 / 方向键微调
                  </span>
                </div>
              </div>
            </div>

            {/* 裁剪设置 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      裁剪设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 裁剪比例 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <Crop className="w-4 h-4 text-purple-500" />
                      裁剪比例
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {aspectRatios.map((r) => (
                        <button
                          key={r.value}
                          onClick={() => setAspectRatio(r.value)}
                          className={`px-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                            aspectRatio === r.value
                              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600"
                          }`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 输出格式 */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      <FileImage className="w-4 h-4 text-purple-500" />
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
                              ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-600"
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
                          <span className="text-sm font-bold text-purple-500">{quality}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                          className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-purple-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 预览和下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-purple-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      裁剪预览
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                    {croppedDataUrl ? (
                      <img
                        src={croppedDataUrl}
                        alt="裁剪预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-400 text-sm">暂无预览</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-zinc-500 dark:text-zinc-400">文件大小</span>
                    <span className="font-medium text-purple-500">{formatSize(croppedSize)}</span>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !croppedDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-purple-500/25 disabled:shadow-none hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载裁剪图片
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
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <div className="text-sm font-medium text-purple-700 dark:text-purple-300">
                多种比例
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                自由裁剪 + 6种常用固定比例
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
                精确控制
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                拖拽调整 + 键盘方向键微调
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
