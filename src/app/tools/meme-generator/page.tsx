"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Smile,
  Upload,
  Download,
  Trash2,
  Settings,
  Type,
  Image as ImageIcon,
  Palette,
  Bold,
  AlignCenter,
  Sparkles,
} from "lucide-react";

interface ImageInfo {
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  dataUrl: string;
}

interface MemeTemplate {
  id: string;
  name: string;
  bgColor: string;
  textColor: string;
  strokeColor: string;
  preview: string;
}

const memeTemplates: MemeTemplate[] = [
  { id: "classic", name: "经典白底", bgColor: "#ffffff", textColor: "#000000", strokeColor: "#000000", preview: "经典" },
  { id: "black", name: "黑底白字", bgColor: "#000000", textColor: "#ffffff", strokeColor: "#ffffff", preview: "黑底" },
  { id: "yellow", name: "表情包黄", bgColor: "#fef3c7", textColor: "#000000", strokeColor: "#000000", preview: "黄色" },
  { id: "pink", name: "少女粉", bgColor: "#fce7f3", textColor: "#be185d", strokeColor: "#be185d", preview: "粉色" },
  { id: "blue", name: "清新蓝", bgColor: "#dbeafe", textColor: "#1e40af", strokeColor: "#1e40af", preview: "蓝色" },
  { id: "green", name: "薄荷绿", bgColor: "#dcfce7", textColor: "#166534", strokeColor: "#166534", preview: "绿色" },
];

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function MemeGeneratorPage() {
  const [customImage, setCustomImage] = useState<ImageInfo | null>(null);
  const [useCustomImage, setUseCustomImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultDataUrl, setResultDataUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);

  // 文字设置
  const [topText, setTopText] = useState("上面的文字");
  const [bottomText, setBottomText] = useState("下面的文字");
  const [fontSize, setFontSize] = useState(36);
  const [textColor, setTextColor] = useState("#000000");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [textPosition, setTextPosition] = useState("edge"); // edge | inside

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 应用模板
  const applyTemplate = (templateId: string) => {
    const template = memeTemplates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      if (!useCustomImage) {
        setTextColor(template.textColor);
        setStrokeColor(template.strokeColor);
      }
    }
  };

  // 生成表情包
  const generateMeme = useCallback(() => {
    setIsProcessing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    if (useCustomImage && customImage) {
      // 使用自定义底图
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        drawText(ctx, canvas.width, canvas.height);
        finishMeme(canvas);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert("图片加载失败");
      };
      img.src = customImage.dataUrl;
    } else {
      // 使用模板背景
      const template = memeTemplates.find((t) => t.id === selectedTemplate);
      const bgColor = template?.bgColor || "#ffffff";

      canvas.width = 600;
      canvas.height = 600;

      // 填充背景
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制装饰性边框
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      drawText(ctx, canvas.width, canvas.height);
      finishMeme(canvas);
    }

    function drawText(
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number
    ) {
      const fontSizePx = (fontSize / 600) * width;
      const fontName = '"Microsoft YaHei", "PingFang SC", "SimHei", sans-serif';

      ctx.font = `bold ${fontSizePx}px ${fontName}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // 顶部文字
      if (topText) {
        const topY =
          textPosition === "edge"
            ? fontSizePx * 1.2
            : height * 0.15;

        // 描边
        if (strokeWidth > 0) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = (strokeWidth / 36) * fontSizePx;
          ctx.lineJoin = "round";
          ctx.strokeText(topText, width / 2, topY);
        }

        // 填充
        ctx.fillStyle = textColor;
        ctx.fillText(topText, width / 2, topY);
      }

      // 底部文字
      if (bottomText) {
        const bottomY =
          textPosition === "edge"
            ? height - fontSizePx * 1.2
            : height * 0.85;

        // 描边
        if (strokeWidth > 0) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = (strokeWidth / 36) * fontSizePx;
          ctx.lineJoin = "round";
          ctx.strokeText(bottomText, width / 2, bottomY);
        }

        // 填充
        ctx.fillStyle = textColor;
        ctx.fillText(bottomText, width / 2, bottomY);
      }
    }

    function finishMeme(cvs: HTMLCanvasElement) {
      const dataUrl = cvs.toDataURL("image/png");
      setResultDataUrl(dataUrl);

      // 计算大小
      const base64 = dataUrl.split(",")[1];
      setResultSize(Math.round((base64.length * 3) / 4));

      setIsProcessing(false);
    }
  }, [
    useCustomImage,
    customImage,
    topText,
    bottomText,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    selectedTemplate,
    textPosition,
  ]);

  // 参数变化时重新生成
  useEffect(() => {
    const timer = setTimeout(() => {
      generateMeme();
    }, 100);

    return () => clearTimeout(timer);
  }, [
    useCustomImage,
    customImage,
    topText,
    bottomText,
    fontSize,
    textColor,
    strokeColor,
    strokeWidth,
    selectedTemplate,
    textPosition,
    generateMeme,
  ]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("请上传图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setCustomImage({
          name: file.name,
          size: file.size,
          type: file.type,
          width: img.width,
          height: img.height,
          dataUrl,
        });
        setUseCustomImage(true);
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

  const handleClearImage = () => {
    setCustomImage(null);
    setUseCustomImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const link = document.createElement("a");
    link.download = `meme_${Date.now()}.png`;
    link.href = resultDataUrl;
    link.click();
  };

  return (
    <ToolLayout
      title="表情包生成器"
      description="在线表情包制作工具，给图片添加顶部和底部文字，支持多种模板，自定义字体大小、颜色、描边，一键生成搞笑表情包"
      toolId="meme-generator"
      icon={Smile}
      category="图片工具"
      slug="meme-generator"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 预览区域 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smile className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                表情包预览
              </h2>
            </div>
            {customImage && (
              <button
                onClick={handleClearImage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                移除底图
              </button>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-center justify-center p-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl min-h-[400px]">
              <div className="relative">
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center">
                      <Sparkles className="w-10 h-10 text-pink-500 animate-pulse mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">生成中...</p>
                    </div>
                  </div>
                )}
                {resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="表情包"
                    className="max-w-full max-h-[450px] object-contain rounded-lg shadow-lg"
                    style={{ opacity: isProcessing ? 0.3 : 1 }}
                  />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center bg-white rounded-xl border-2 border-dashed border-zinc-300">
                    <span className="text-zinc-400">表情包预览</span>
                  </div>
                )}
              </div>
            </div>

            {customImage && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    底图大小
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {formatSize(customImage.size)}
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                    图片尺寸
                  </div>
                  <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {customImage.width} × {customImage.height}
                  </div>
                </div>
                <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                  <div className="text-xs text-pink-600 dark:text-pink-400 mb-1">
                    输出大小
                  </div>
                  <div className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    {resultSize ? formatSize(resultSize) : "-"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 文字设置 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Type className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                文字设置
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* 顶部文字 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                顶部文字
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="输入顶部文字..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              />
            </div>

            {/* 底部文字 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                底部文字
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="输入底部文字..."
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              />
            </div>

            {/* 字体大小 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <Bold className="w-4 h-4 text-pink-500" />
                  字体大小
                </label>
                <span className="text-sm font-bold text-pink-500">{fontSize} px</span>
              </div>
              <input
                type="range"
                min="16"
                max="80"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* 文字颜色 + 描边颜色 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  文字颜色
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  描边颜色
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-200 dark:border-zinc-700 bg-transparent"
                  />
                  <input
                    type="text"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>
              </div>
            </div>

            {/* 描边粗细 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  描边粗细
                </label>
                <span className="text-sm font-bold text-pink-500">{strokeWidth} px</span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer accent-pink-500"
              />
            </div>

            {/* 文字位置 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                <AlignCenter className="w-4 h-4 text-pink-500" />
                文字位置
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTextPosition("edge")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    textPosition === "edge"
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  }`}
                >
                  边缘
                </button>
                <button
                  onClick={() => setTextPosition("inside")}
                  className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    textPosition === "inside"
                      ? "bg-pink-500 text-white shadow-sm"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-pink-100 dark:hover:bg-pink-900/30"
                  }`}
                >
                  靠内
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 模板 + 上传 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                模板与底图
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* 模板选择 */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                表情模板
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {memeTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template.id)}
                    className={`relative aspect-square rounded-xl border-2 transition-all overflow-hidden ${
                      selectedTemplate === template.id && !useCustomImage
                        ? "border-pink-500 scale-105 shadow-lg shadow-pink-500/20"
                        : "border-zinc-200 dark:border-zinc-700 hover:border-pink-300 dark:hover:border-pink-600 hover:scale-105"
                    }`}
                    style={{ backgroundColor: template.bgColor }}
                    title={template.name}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                      style={{ color: template.textColor }}
                    >
                      {template.preview}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 上传自定义底图 */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  自定义底图
                </label>
                {customImage && (
                  <button
                    onClick={() => setUseCustomImage(!useCustomImage)}
                    className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
                      useCustomImage
                        ? "bg-pink-500 text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {useCustomImage ? "使用中" : "使用模板"}
                  </button>
                )}
              </div>
              {customImage ? (
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={customImage.dataUrl}
                      alt="底图"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 truncate">
                      {customImage.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      {customImage.width} × {customImage.height}
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    更换
                  </button>
                </div>
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={`h-24 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                    isDragging
                      ? "border-pink-400 bg-pink-50 dark:bg-pink-900/20"
                      : "border-zinc-300 dark:border-zinc-700 hover:border-pink-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Upload
                    className={`w-6 h-6 mb-1 transition-colors ${
                      isDragging ? "text-pink-500" : "text-zinc-400"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      isDragging
                        ? "text-pink-600 dark:text-pink-400"
                        : "text-zinc-500 dark:text-zinc-400"
                    }`}
                  >
                    点击或拖拽上传自定义底图
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* 下载按钮 */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleDownload}
                disabled={!resultDataUrl || isProcessing}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-pink-500/25 disabled:shadow-none hover:shadow-pink-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
              >
                <Download className="w-5 h-5" />
                下载表情包
              </button>
            </div>
          </div>
        </div>

        {/* 工具介绍 */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            工具特性
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
              <div className="text-sm font-medium text-pink-700 dark:text-pink-300">
                本地处理
              </div>
              <p className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                图片不上传服务器，保护隐私安全
              </p>
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                多种模板
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                6种预设模板，支持自定义底图
              </p>
            </div>
            <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <div className="text-sm font-medium text-sky-700 dark:text-sky-300">
                文字描边
              </div>
              <p className="text-xs text-sky-600 dark:text-sky-400 mt-1">
                支持文字描边，清晰醒目
              </p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
