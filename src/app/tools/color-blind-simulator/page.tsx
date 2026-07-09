"use client";

import { useState, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Eye, Upload, Image as ImageIcon } from "lucide-react";

type ColorBlindType = "normal" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const blindTypes: { id: ColorBlindType; name: string; desc: string }[] = [
  { id: "normal", name: "正常视觉", desc: "普通人眼看到的颜色" },
  { id: "protanopia", name: "红色盲", desc: "无法感知红色光" },
  { id: "deuteranopia", name: "绿色盲", desc: "无法感知绿色光" },
  { id: "tritanopia", name: "蓝色盲", desc: "无法感知蓝色光" },
  { id: "achromatopsia", name: "全色盲", desc: "完全无法感知颜色" },
];

// 色盲模拟矩阵
function applyColorBlindFilter(r: number, g: number, b: number, type: ColorBlindType): [number, number, number] {
  switch (type) {
    case "protanopia": // 红色盲
      return [
        r * 0.567 + g * 0.433 + b * 0.0,
        r * 0.558 + g * 0.442 + b * 0.0,
        r * 0.0 + g * 0.242 + b * 0.758,
      ];
    case "deuteranopia": // 绿色盲
      return [
        r * 0.625 + g * 0.375 + b * 0.0,
        r * 0.7 + g * 0.3 + b * 0.0,
        r * 0.0 + g * 0.3 + b * 0.7,
      ];
    case "tritanopia": // 蓝色盲
      return [
        r * 0.95 + g * 0.05 + b * 0.0,
        r * 0.0 + g * 0.433 + b * 0.567,
        r * 0.0 + g * 0.475 + b * 0.525,
      ];
    case "achromatopsia": // 全色盲
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      return [gray, gray, gray];
    default:
      return [r, g, b];
  }
}

export default function ColorBlindSimulatorPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [blindType, setBlindType] = useState<ColorBlindType>("deuteranopia");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showComparison, setShowComparison] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImageUrl(url);
      setShowComparison(false);
    };
    reader.readAsDataURL(file);
  };

  const simulateColorBlind = () => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxWidth = 600;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const [nr, ng, nb] = applyColorBlindFilter(data[i], data[i + 1], data[i + 2], blindType);
        data[i] = Math.round(nr);
        data[i + 1] = Math.round(ng);
        data[i + 2] = Math.round(nb);
      }

      ctx.putImageData(imageData, 0, 0);
      setShowComparison(true);
    };
    img.src = imageUrl;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  return (
    <ToolLayout
      title="色盲模拟器"
      description="模拟不同类型色盲用户看到的效果，帮助设计师创建更具包容性的作品"
      icon={Eye}
      category="设计工具"
      slug="color-blind-simulator"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-cyan-500/25">
          <div className="flex items-center gap-2 mb-6">
            <Eye className="w-5 h-5" />
            <h2 className="text-base font-semibold">色盲模拟器</h2>
          </div>

          <div
            className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:bg-white/10 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {imageUrl ? (
              <div className="flex items-center justify-center gap-3">
                <ImageIcon className="w-8 h-8" />
                <div className="text-left">
                  <div className="font-medium">已选择图片</div>
                  <div className="text-sm text-white/70">点击更换图片</div>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-10 h-10 mx-auto mb-3 opacity-70" />
                <div className="font-medium mb-1">点击或拖拽上传图片</div>
                <div className="text-sm text-white/70">支持 PNG、JPG、GIF 等格式</div>
              </div>
            )}
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

        {/* 类型选择 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">选择色盲类型</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {blindTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setBlindType(type.id);
                  if (imageUrl) setTimeout(simulateColorBlind, 50);
                }}
                className={`p-3 rounded-xl border transition-all text-left ${
                  blindType === type.id
                    ? "border-cyan-500 bg-cyan-500/10"
                    : "border-[#27272a] hover:border-[#3f3f46] bg-[#09090b]"
                }`}
              >
                <div className="text-sm font-medium text-white">{type.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{type.desc}</div>
              </button>
            ))}
          </div>

          {imageUrl && (
            <button
              onClick={simulateColorBlind}
              className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
            >
              开始模拟
            </button>
          )}
        </div>

        {/* 对比展示 */}
        {showComparison && (
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
            <div className="px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
              <h3 className="text-base font-semibold text-white">对比效果</h3>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="p-4 border-r border-[#27272a]">
                <div className="text-xs text-slate-500 mb-2 text-center">原始图像</div>
                <img src={imageUrl ?? undefined} alt="original" className="w-full rounded-lg" />
              </div>
              <div className="p-4">
                <div className="text-xs text-slate-500 mb-2 text-center">{blindTypes.find(b => b.id === blindType)?.name}</div>
                <canvas ref={canvasRef} className="w-full rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {/* 颜色测试示例 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-4">常用配色色盲友好度测试</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {[
              "#ef4444", "#f97316", "#eab308", "#22c55e",
              "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
              "#6366f1", "#14b8a6", "#f43f5e", "#84cc16",
            ].map((color) => {
              const rgb = parseInt(color.slice(1), 16);
              const r = (rgb >> 16) & 255;
              const g = (rgb >> 8) & 255;
              const b = rgb & 255;
              const [nr, ng, nb] = applyColorBlindFilter(r, g, b, blindType);
              const simulated = `rgb(${Math.round(nr)}, ${Math.round(ng)}, ${Math.round(nb)})`;
              return (
                <div key={color} className="space-y-1">
                  <div
                    className="h-10 rounded-t-lg"
                    style={{ backgroundColor: color }}
                  />
                  <div
                    className="h-10 rounded-b-lg"
                    style={{ backgroundColor: simulated }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>↑ 原始颜色</span>
            <span>↓ {blindTypes.find(b => b.id === blindType)?.name}视角</span>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
