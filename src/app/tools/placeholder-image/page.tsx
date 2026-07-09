"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Image, Download, Copy, Check, Settings } from "lucide-react";

export default function PlaceholderImagePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState("#27272a");
  const [textColor, setTextColor] = useState("#71717a");
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(24);
  const [copied, setCopied] = useState(false);

  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = Math.min(width, 800);
    canvas.height = Math.min(height, 600);

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border pattern
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const step = 20;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Text
    const displayText = text || `${width} x ${height}`;
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
  }, [width, height, bgColor, textColor, text, fontSize]);

  useEffect(() => {
    drawImage();
  }, [drawImage]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `placeholder-${width}x${height}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => b && resolve(b), "image/png")
      );
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const copyUrl = () => {
    const url = `https://placehold.co/${width}x${height}/${bgColor.replace("#", "")}/${textColor.replace("#", "")}?text=${encodeURIComponent(text || `${width}x${height}`)}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { w: 200, h: 200, label: "200x200 头像" },
    { w: 400, h: 300, label: "400x300 缩略图" },
    { w: 800, h: 600, label: "800x600 大图" },
    { w: 1200, h: 630, label: "1200x630 OG图" },
    { w: 1920, h: 1080, label: "1920x1080 全屏" },
    { w: 1080, h: 1080, label: "1080x1080 正方形" },
  ];

  return (
    <ToolLayout
      title="占位图生成器"
      description="快速生成自定义尺寸和颜色的占位图片，用于设计原型和开发测试，支持下载和复制"
      icon={Image}
      category="图片工具"
      slug="placeholder-image"
      toolId="placeholder-image"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-medium text-white">占位图</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={copyImage}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制图片
              </>
            )}
          </button>
          <button
            onClick={downloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-pink-500/25"
          >
            <Download className="w-4 h-4" />
            下载 PNG
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="bg-[#09090b] rounded-2xl border border-[#27272a] p-8 flex items-center justify-center overflow-auto">
          <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-lg" />
        </div>

        {/* 尺寸预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            快速尺寸
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {presets.map((p) => (
              <button
                key={p.label}
                onClick={() => {
                  setWidth(p.w);
                  setHeight(p.h);
                }}
                className="px-3 py-2 bg-[#09090b] border border-[#27272a] hover:border-pink-500/30 rounded-xl text-xs text-slate-400 hover:text-pink-400 transition-colors text-center"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 尺寸设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">宽度 (px)</label>
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(Math.max(10, Math.min(2000, Number(e.target.value) || 10)))}
              min={10}
              max={2000}
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">高度 (px)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(Math.max(10, Math.min(2000, Number(e.target.value) || 10)))}
              min={10}
              max={2000}
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none"
            />
          </div>
        </div>

        {/* 颜色和文字 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-slate-400 w-16">背景色</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-slate-400 w-16">文字色</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">
              自定义文字（留空显示尺寸）
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入占位图上显示的文字"
              className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 outline-none placeholder-slate-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-400">文字大小</label>
              <span className="text-sm font-mono text-pink-400">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={10}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>

        {/* 其他操作 */}
        <div className="flex gap-3">
          <button
            onClick={copyUrl}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" />
            复制 Placehold.co URL
          </button>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 自定义尺寸、颜色和文字，快速生成占位图片</li>
          <li>• 支持 PNG 下载和复制到剪贴板，方便直接使用</li>
          <li>• 提供 6 种常用尺寸预设，一键应用</li>
          <li>• 也可以复制 Placehold.co 格式的 URL 用于在线引用</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
