"use client";

import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Image as ImageIcon, Upload, Pipette, Copy, Check, Palette } from "lucide-react";

export default function ColorPaletteFromImagePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<string[]>([]);
  const [hoverColor, setHoverColor] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractColors = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 缩小图片以提高性能
    const maxSize = 100;
    const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 收集所有颜色
    const colorMap = new Map<string, number>();
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 128) continue;

      // 量化颜色（减少颜色数量）
      const qr = Math.round(r / 20) * 20;
      const qg = Math.round(g / 20) * 20;
      const qb = Math.round(b / 20) * 20;
      const key = `${qr},${qg},${qb}`;
      colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // 按频率排序
    const sortedColors = Array.from(colorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);

    // 选取差异较大的颜色
    const selected: string[] = [];
    for (const [colorKey] of sortedColors) {
      const [r, g, b] = colorKey.split(",").map(Number);
      const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");

      // 检查是否与已选颜色太接近
      const isSimilar = selected.some((s) => {
        const sr = parseInt(s.slice(1, 3), 16);
        const sg = parseInt(s.slice(3, 5), 16);
        const sb = parseInt(s.slice(5, 7), 16);
        const dist = Math.sqrt((r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2);
        return dist < 60;
      });

      if (!isSimilar && selected.length < 8) {
        selected.push(hex);
      }
      if (selected.length >= 8) break;
    }

    setColors(selected);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      setIsProcessing(true);
      setColors([]);

      const img = new Image();
      img.onload = () => {
        extractColors(img);
        setIsProcessing(false);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopied(hex);
    setTimeout(() => setCopied(null), 1500);
  };

  const isLightColor = (hex: string): boolean => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  };

  return (
    <ToolLayout
      title="图片取色/提取配色"
      description="上传图片自动提取主色调和配色方案，支持多种颜色提取"
      icon={Pipette}
      category="设计工具"
      slug="color-palette-from-image"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/25">
          <div className="flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-base font-semibold">图片取色</h2>
          </div>

          <div
            className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:bg-white/10 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 opacity-70" />
            <div className="font-medium mb-1">点击或拖拽上传图片</div>
            <div className="text-sm text-white/70">自动提取图片主色调和配色</div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>
        </div>

        {/* 图片预览 */}
        {imageUrl && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">图片预览</h3>
              <span className="text-xs text-slate-500">
                {isProcessing ? "提取中..." : `提取到 ${colors.length} 种颜色`}
              </span>
            </div>
            <div className="p-4 flex items-center justify-center bg-[#09090b]/50">
              <img
                src={imageUrl}
                alt="preview"
                className="max-w-full max-h-64 rounded-lg shadow-lg"
              />
            </div>
          </div>
        )}

        {/* 提取的颜色 */}
        {colors.length > 0 && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b] flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-400" />
              <h3 className="text-base font-semibold text-white">提取的配色</h3>
            </div>

            {/* 颜色条 */}
            <div className="flex h-20">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-pointer transition-all hover:flex-[1.5] hover:z-10 relative group"
                  style={{ backgroundColor: color }}
                  onClick={() => handleCopy(color)}
                  onMouseEnter={() => setHoverColor(color)}
                  onMouseLeave={() => setHoverColor(null)}
                >
                  <div className={`absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity font-medium ${
                    isLightColor(color) ? "text-slate-700" : "text-white"
                  }`}>
                    {copied === color ? "✓" : color}
                  </div>
                </div>
              ))}
            </div>

            {/* 颜色详情 */}
            <div className="p-4 grid grid-cols-4 gap-3">
              {colors.map((color, i) => (
                <div
                  key={i}
                  className="group rounded-lg overflow-hidden border border-[#27272a] hover:border-orange-500/50 transition-colors cursor-pointer"
                  onClick={() => handleCopy(color)}
                >
                  <div className="h-14" style={{ backgroundColor: color }} />
                  <div className="p-2 bg-[#09090b] text-center">
                    <span className={`text-xs font-mono ${
                      copied === color ? "text-emerald-400" : "text-slate-400"
                    }`}>
                      {copied === color ? "已复制" : color}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 悬停颜色详情 */}
        {hoverColor && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border-2 border-[#27272a] shadow-lg"
                style={{ backgroundColor: hoverColor }}
              />
              <div className="flex-1">
                <div className="text-lg font-mono font-bold text-white">{hoverColor.toUpperCase()}</div>
                <div className="text-sm text-slate-500">
                  RGB({parseInt(hoverColor.slice(1, 3), 16)}, {parseInt(hoverColor.slice(3, 5), 16)}, {parseInt(hoverColor.slice(5, 7), 16)})
                </div>
              </div>
              <button
                onClick={() => handleCopy(hoverColor)}
                className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors flex items-center gap-2"
              >
                {copied === hoverColor ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                复制
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3">使用说明</h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>1. 上传任意图片，自动提取图片中的主要颜色</p>
            <p>2. 提取的配色会按出现频率和色彩差异智能筛选</p>
            <p>3. 点击任意颜色块可复制对应的 HEX 颜色代码</p>
            <p>4. 可用于 UI 设计、品牌配色、海报设计等场景</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
