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
  Move,
  ZoomIn,
  ZoomOut,
  Square,
  Hexagon,
  Palette,
  Maximize2,
} from "lucide-react";

interface ImageData {
  name: string;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalDataUrl: string;
  type: string;
}

type ShapeType = "circle" | "rounded" | "hexagon";

interface TransformState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function CircleCropPage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  const [shape, setShape] = useState<ShapeType>("circle");
  const [borderEnabled, setBorderEnabled] = useState(false);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [borderWidth, setBorderWidth] = useState(8);
  const [borderRadius, setBorderRadius] = useState(30);
  const [outputSize, setOutputSize] = useState(512);
  const [bgColor, setBgColor] = useState("transparent");

  const [transform, setTransform] = useState<TransformState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingImage = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [previewSize, setPreviewSize] = useState(300);

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

        // 重置变换
        const minDim = Math.min(img.width, img.height);
        const scale = outputSize / minDim;
        setTransform({
          scale: scale,
          offsetX: 0,
          offsetY: 0,
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
  }, [outputSize]);

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
    setTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    if (!imageData) return;
    const minDim = Math.min(imageData.originalWidth, imageData.originalHeight);
    const scale = outputSize / minDim;
    setTransform({
      scale: scale,
      offsetX: 0,
      offsetY: 0,
    });
    setBorderEnabled(false);
    setBorderColor("#ffffff");
    setBorderWidth(8);
    setShape("circle");
    setBgColor("transparent");
  };

  // 更新预览尺寸
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth;
        setPreviewSize(Math.min(w - 48, 400));
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // 拖拽图片
  const handleImageMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingImage.current = true;

    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    dragStart.current = {
      x: clientX - transform.offsetX,
      y: clientY - transform.offsetY,
    };

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      if (!isDraggingImage.current) return;

      let moveX: number, moveY: number;
      if ("touches" in moveEvent) {
        moveX = moveEvent.touches[0].clientX;
        moveY = moveEvent.touches[0].clientY;
      } else {
        moveX = moveEvent.clientX;
        moveY = moveEvent.clientY;
      }

      setTransform((prev) => ({
        ...prev,
        offsetX: moveX - dragStart.current.x,
        offsetY: moveY - dragStart.current.y,
      }));
    };

    const handleUp = () => {
      isDraggingImage.current = false;
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleUp);
  };

  // 缩放
  const handleZoom = (delta: number) => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(0.2, Math.min(5, prev.scale + delta)),
    }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    handleZoom(delta * transform.scale);
  };

  // 生成裁剪结果
  useEffect(() => {
    if (!imageData) return;

    const timer = setTimeout(() => {
      setIsProcessing(true);

      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 如果有背景色，填充背景
        if (bgColor !== "transparent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // 创建裁剪路径
        ctx.save();

        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - (borderEnabled ? borderWidth : 0), 0, Math.PI * 2);
          ctx.closePath();
        } else if (shape === "rounded") {
          const r = borderRadius * (canvas.width / 100);
          const inset = borderEnabled ? borderWidth : 0;
          const x = inset;
          const y = inset;
          const w = canvas.width - inset * 2;
          const h = canvas.height - inset * 2;
          const radius = Math.min(r, w / 2, h / 2);

          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + w - radius, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
          ctx.lineTo(x + w, y + h - radius);
          ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
          ctx.lineTo(x + radius, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
        } else if (shape === "hexagon") {
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const radius = canvas.width / 2 - (borderEnabled ? borderWidth : 0);

          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
        }

        ctx.clip();

        // 计算图片绘制位置和大小
        const imgW = img.width * transform.scale;
        const imgH = img.height * transform.scale;
        const imgX = canvas.width / 2 - imgW / 2 + transform.offsetX * (outputSize / previewSize);
        const imgY = canvas.height / 2 - imgH / 2 + transform.offsetY * (outputSize / previewSize);

        ctx.drawImage(img, imgX, imgY, imgW, imgH);

        ctx.restore();

        // 绘制边框
        if (borderEnabled && borderWidth > 0) {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderWidth;

          if (shape === "circle") {
            ctx.beginPath();
            ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2 - borderWidth / 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (shape === "rounded") {
            const r = borderRadius * (canvas.width / 100);
            const inset = borderWidth / 2;
            const x = inset;
            const y = inset;
            const w = canvas.width - inset * 2;
            const h = canvas.height - inset * 2;
            const radius = Math.min(r, w / 2, h / 2);

            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + w - radius, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
            ctx.lineTo(x + w, y + h - radius);
            ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
            ctx.lineTo(x + radius, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.stroke();
          } else if (shape === "hexagon") {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const r = canvas.width / 2 - borderWidth / 2;

            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (Math.PI / 3) * i - Math.PI / 2;
              const x = centerX + r * Math.cos(angle);
              const y = centerY + r * Math.sin(angle);
              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            ctx.closePath();
            ctx.stroke();
          }
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
  }, [imageData, transform, shape, borderEnabled, borderColor, borderWidth, borderRadius, outputSize, bgColor, previewSize]);

  const handleDownload = () => {
    if (!resultDataUrl || !imageData) return;
    const link = document.createElement("a");
    link.download = `${imageData.name.replace(/\.[^.]+$/, "")}_avatar.png`;
    link.href = resultDataUrl;
    link.click();
  };

  const shapes = [
    { value: "circle", label: "圆形", icon: Circle },
    { value: "rounded", label: "圆角", icon: Square },
    { value: "hexagon", label: "六边形", icon: Hexagon },
  ];

  // 生成形状mask的SVG
  const getShapeClipPath = () => {
    if (shape === "circle") {
      return "circle(50% at 50% 50%)";
    } else if (shape === "rounded") {
      return `inset(0 round ${borderRadius}%)`;
    } else if (shape === "hexagon") {
      return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
    }
    return "none";
  };

  return (
    <ToolLayout
      title="圆形头像裁剪"
      description="在线图片圆形裁剪工具，支持缩放拖动调整，多种形状和边框设置，一键生成透明背景头像"
      toolId="circle-crop"
      icon={Circle}
      category="图片工具"
      slug="circle-crop"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 上传区域 */}
        {!imageData ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <Circle className="w-5 h-5 text-amber-500" />
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
                    ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-amber-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              >
                <Upload
                  className={`w-12 h-12 mb-3 transition-colors ${
                    isDragging ? "text-amber-500" : "text-zinc-400"
                  }`}
                />
                <div
                  className={`text-lg font-medium mb-1 ${
                    isDragging
                      ? "text-amber-600 dark:text-amber-400"
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
            {/* 裁剪预览区域 */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                    调整头像
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-amber-500 dark:text-zinc-400 dark:hover:text-amber-400 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
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
                  className="relative w-full flex items-center justify-center"
                  style={{ minHeight: "420px" }}
                >
                  <div
                    className="relative overflow-hidden select-none"
                    style={{
                      width: previewSize,
                      height: previewSize,
                      clipPath: getShapeClipPath(),
                      WebkitClipPath: getShapeClipPath(),
                      background: bgColor === "transparent"
                        ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                        : bgColor,
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                      cursor: isDragging ? "grabbing" : "grab",
                      boxShadow: borderEnabled ? `inset 0 0 0 ${borderWidth}px ${borderColor}` : "none",
                    }}
                    onMouseDown={handleImageMouseDown}
                    onTouchStart={handleImageMouseDown}
                    onWheel={handleWheel}
                  >
                    <img
                      src={imageData.originalDataUrl}
                      alt="头像预览"
                      className="absolute pointer-events-none select-none"
                      style={{
                        left: `calc(50% - ${(imageData.originalWidth * transform.scale) / 2}px + ${transform.offsetX}px)`,
                        top: `calc(50% - ${(imageData.originalHeight * transform.scale) / 2}px + ${transform.offsetY}px)`,
                        width: imageData.originalWidth * transform.scale,
                        height: imageData.originalHeight * transform.scale,
                      }}
                      draggable={false}
                    />
                  </div>

                  {/* 缩放控制 */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-full">
                    <button
                      onClick={() => handleZoom(-0.2 * transform.scale)}
                      className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-white text-xs font-medium w-14 text-center">
                      {Math.round(transform.scale * 100)}%
                    </span>
                    <button
                      onClick={() => handleZoom(0.2 * transform.scale)}
                      className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded-full transition-colors"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                  </div>
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
                    <div className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {formatSize(resultSize)}
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-xs text-amber-600 dark:text-amber-400 mb-1">
                      形状
                    </div>
                    <div className="text-sm font-bold text-amber-700 dark:text-amber-300">
                      {shapes.find((s) => s.value === shape)?.label}
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                      输出尺寸
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {outputSize} × {outputSize}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <Move className="w-3.5 h-3.5" />
                  拖拽移动图片 / 滚轮缩放
                </div>
              </div>
            </div>

            {/* 设置和下载 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      裁剪设置
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* 形状选择 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      裁剪形状
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {shapes.map((s) => {
                        const ShapeIcon = s.icon;
                        return (
                          <button
                            key={s.value}
                            onClick={() => setShape(s.value as ShapeType)}
                            className={`flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-lg font-medium text-sm transition-all ${
                              shape === s.value
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                                : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600"
                            }`}
                          >
                            <ShapeIcon className="w-5 h-5" />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 圆角设置 (仅圆角形状) */}
                  {shape === "rounded" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                          圆角大小
                        </label>
                        <span className="text-sm font-bold text-amber-500">{borderRadius}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        value={borderRadius}
                        onChange={(e) => setBorderRadius(Number(e.target.value))}
                        className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                      />
                      <div className="flex justify-between mt-2 text-xs text-zinc-500">
                        <span>方形</span>
                        <span>中等</span>
                        <span>圆形</span>
                      </div>
                    </div>
                  )}

                  {/* 输出尺寸 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Maximize2 className="w-4 h-4 text-amber-500" />
                        输出尺寸
                      </label>
                      <span className="text-sm font-bold text-amber-500">{outputSize}px</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[128, 256, 512, 1024].map((size) => (
                        <button
                          key={size}
                          onClick={() => setOutputSize(size)}
                          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                            outputSize === size
                              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25"
                              : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-600"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 边框设置 */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        <Palette className="w-4 h-4 text-amber-500" />
                        边框
                      </label>
                      <button
                        onClick={() => setBorderEnabled(!borderEnabled)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          borderEnabled ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow ${
                            borderEnabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {borderEnabled && (
                      <div className="space-y-4 mt-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              边框宽度
                            </span>
                            <span className="text-xs font-bold text-amber-500">{borderWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={30}
                            value={borderWidth}
                            onChange={(e) => setBorderWidth(Number(e.target.value))}
                            className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-amber-500"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 w-16">
                            边框颜色
                          </span>
                          <input
                            type="color"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700"
                          />
                          <input
                            type="text"
                            value={borderColor}
                            onChange={(e) => setBorderColor(e.target.value)}
                            className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-mono text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 背景色 */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      背景色
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: "transparent", label: "透明", isTransparent: true },
                        { value: "#ffffff", label: "白色" },
                        { value: "#000000", label: "黑色" },
                        { value: "#f59e0b", label: "金色" },
                      ].map((bg) => (
                        <button
                          key={bg.value}
                          onClick={() => setBgColor(bg.value)}
                          className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-lg transition-all ${
                            bgColor === bg.value
                              ? "ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-zinc-900"
                              : "border border-zinc-200 dark:border-zinc-700 hover:border-amber-400"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full border border-zinc-300 dark:border-zinc-600"
                            style={{
                              background: bg.isTransparent
                                ? "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)"
                                : bg.value,
                              backgroundSize: bg.isTransparent ? "8px 8px" : undefined,
                              backgroundPosition: bg.isTransparent ? "0 0, 0 4px, 4px -4px, -4px 0px" : undefined,
                            }}
                          />
                          <span className="text-xs text-zinc-600 dark:text-zinc-400">
                            {bg.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 下载 */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-amber-500" />
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      下载结果
                    </h2>
                  </div>
                </div>

                <div className="p-6">
                  <div
                    className="aspect-square rounded-xl overflow-hidden flex items-center justify-center mb-4"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
                    }}
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                    ) : resultDataUrl ? (
                      <img
                        src={resultDataUrl}
                        alt="裁剪结果预览"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-zinc-400 text-sm">暂无预览</div>
                    )}
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        输出格式
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        PNG (透明背景)
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        文件大小
                      </span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {formatSize(resultSize)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-amber-600 dark:text-amber-400">
                        图片尺寸
                      </span>
                      <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                        {outputSize} × {outputSize}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    disabled={isProcessing || !resultDataUrl}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-amber-500/25 disabled:shadow-none hover:shadow-amber-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        下载头像
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
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                多种形状
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                圆形、圆角矩形、六边形三种形状
              </p>
            </div>
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <div className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                本地处理
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                图片不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                边框美化
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                支持自定义边框颜色和宽度
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
