"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ImagePlus, Download, Upload, Trash2, Check } from "lucide-react";

const faviconSizes = [
  { size: 16, label: "16x16", desc: "经典 favicon" },
  { size: 32, label: "32x32", desc: "标准 favicon" },
  { size: 48, label: "48x48", desc: "Windows 桌面" },
  { size: 64, label: "64x64", desc: "高清图标" },
  { size: 96, label: "96x96", desc: "Android 主屏" },
  { size: 128, label: "128x128", desc: "Chrome 应用" },
  { size: 180, label: "180x180", desc: "iOS 触摸图标" },
  { size: 192, label: "192x192", desc: "PWA 应用图标" },
  { size: 256, label: "256x256", desc: "PWA 大型图标" },
  { size: 512, label: "512x512", desc: "PWA 超大图标" },
];

interface GeneratedIcon {
  size: number;
  dataUrl: string;
}

export default function FaviconGeneratorPage() {
  const [image, setImage] = useState<string | null>(null);
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48, 180, 192]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setGeneratedIcons([]);
    };
    reader.readAsDataURL(file);
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((prev) =>
      prev.includes(size)
        ? prev.filter((s) => s !== size)
        : [...prev, size]
    );
  };

  const selectAll = () => {
    setSelectedSizes(faviconSizes.map((s) => s.size));
  };

  const clearAll = () => {
    setSelectedSizes([]);
  };

  const generateFavicons = useCallback(() => {
    if (!image || selectedSizes.length === 0) return;

    setIsGenerating(true);

    const img = new Image();
    img.onload = () => {
      const results: GeneratedIcon[] = [];

      selectedSizes.forEach((size) => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 高质量缩放
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // 计算居中裁剪
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size - img.width * scale) / 2;
        const y = (size - img.height * scale) / 2;

        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

        results.push({
          size,
          dataUrl: canvas.toDataURL("image/png"),
        });
      });

      // 按尺寸排序
      results.sort((a, b) => a.size - b.size);
      setGeneratedIcons(results);
      setIsGenerating(false);
    };
    img.src = image;
  }, [image, selectedSizes]);

  const downloadSingle = (icon: GeneratedIcon) => {
    const link = document.createElement("a");
    link.download = `favicon-${icon.size}x${icon.size}.png`;
    link.href = icon.dataUrl;
    link.click();
  };

  const downloadAll = () => {
    generatedIcons.forEach((icon, index) => {
      setTimeout(() => downloadSingle(icon), index * 200);
    });
  };

  const clearImage = () => {
    setImage(null);
    setGeneratedIcons([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <ToolLayout
      title="Favicon 生成器"
      description="从图片生成多种尺寸的 favicon 图标，支持 16x16 到 512x512，一键批量下载"
      icon={ImagePlus}
      category="图片工具"
      slug="favicon-generator"
      toolId="favicon-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <ImagePlus className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">Favicon 生成</span>
          </div>
          <div className="flex-1" />
          {generatedIcons.length > 0 && (
            <button
              onClick={downloadAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              <Download className="w-4 h-4" />
              批量下载
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 上传区 */}
        {!image ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#27272a] hover:border-purple-500/50 rounded-2xl p-12 text-center cursor-pointer transition-colors"
          >
            <Upload className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-white font-medium mb-2">点击上传图片</p>
            <p className="text-sm text-slate-500">
              支持 PNG、JPG、WebP 等格式，建议上传正方形图片
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-6 p-4 bg-[#09090b] border border-[#27272a] rounded-2xl">
            <div className="w-20 h-20 rounded-xl bg-[#18181b] flex items-center justify-center overflow-hidden flex-shrink-0">
              <img
                src={image}
                alt="上传的图片"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium">已上传图片</p>
              <p className="text-sm text-slate-500 mt-1">
                选择尺寸后点击生成按钮生成 favicon
              </p>
            </div>
            <button
              onClick={clearImage}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 尺寸选择 */}
        {image && (
          <>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-300">
                  选择尺寸 ({selectedSizes.length})
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={selectAll}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    全选
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-xs text-slate-500 hover:text-slate-400"
                  >
                    清空
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {faviconSizes.map((item) => (
                  <button
                    key={item.size}
                    onClick={() => toggleSize(item.size)}
                    className={`p-4 rounded-xl text-center transition-all ${
                      selectedSizes.includes(item.size)
                        ? "bg-purple-500/20 border border-purple-500/30"
                        : "bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46]"
                    }`}
                  >
                    <div
                      className={`text-lg font-bold font-mono mb-1 ${
                        selectedSizes.includes(item.size)
                          ? "text-purple-400"
                          : "text-white"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-xs text-slate-500">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={generateFavicons}
              disabled={selectedSizes.length === 0 || isGenerating}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25 disabled:shadow-none"
            >
              {isGenerating ? "生成中..." : `生成 ${selectedSizes.length} 个尺寸的 Favicon`}
            </button>
          </>
        )}

        {/* 生成结果 */}
        {generatedIcons.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              生成结果 ({generatedIcons.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {generatedIcons.map((icon) => (
                <div
                  key={icon.size}
                  className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 text-center group"
                >
                  <div className="flex items-center justify-center h-20 mb-3">
                    <img
                      src={icon.dataUrl}
                      alt={`${icon.size}x${icon.size}`}
                      className="max-w-full max-h-full"
                      style={{
                        imageRendering: icon.size < 64 ? "pixelated" : "auto",
                      }}
                    />
                  </div>
                  <div className="text-sm font-mono text-white mb-2">
                    {icon.size}x{icon.size}
                  </div>
                  <button
                    onClick={() => downloadSingle(icon)}
                    className="w-full py-1.5 text-xs bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    下载
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 上传正方形图片效果最佳，工具会自动按比例缩放填充</li>
          <li>• 支持 10 种常用尺寸，从 16x16 到 512x512</li>
          <li>• 32x32 是标准 favicon 尺寸，180x180 用于 iOS 主屏图标</li>
          <li>• 点击「批量下载」可一次性下载所有选中尺寸的图标</li>
        </ul>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
