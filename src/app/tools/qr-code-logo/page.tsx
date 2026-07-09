"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { QrCode, Upload, Download, Trash2, ImageIcon, Check } from "lucide-react";
import QRCode from "qrcode";

export default function QrCodeLogoPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("https://example.com");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // percentage
  const [size, setSize] = useState(300);
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [errorLevel, setErrorLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateQR = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!text.trim()) {
      setError("请输入要生成二维码的内容");
      return;
    }
    setError("");

    const opts = {
      width: size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      errorCorrectionLevel: errorLevel,
    };

    QRCode.toCanvas(canvas, text, opts, (err) => {
      if (err) {
        setError(err.message || "生成二维码失败");
        return;
      }

      // Add logo if exists
      if (logoImage) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const logo = new Image();
        logo.onload = () => {
          const logoPixelSize = (size * logoSize) / 100;
          const logoX = (size - logoPixelSize) / 2;
          const logoY = (size - logoPixelSize) / 2;

          // White background for logo
          const padding = logoPixelSize * 0.1;
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoPixelSize + padding * 2,
            logoPixelSize + padding * 2
          );

          // Draw logo with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(logo, logoX, logoY, logoPixelSize, logoPixelSize);
        };
        logo.src = logoImage;
      }
    });
  }, [text, size, foregroundColor, backgroundColor, errorLevel, logoImage, logoSize]);

  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 100);
    return () => clearTimeout(timer);
  }, [generateQR]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qrcode-logo-${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <ToolLayout
      title="带Logo二维码生成器"
      description="生成自定义 Logo 的二维码，支持调整颜色、尺寸和容错率，打造品牌专属二维码"
      icon={QrCode}
      category="图片工具"
      slug="qr-code-logo"
      toolId="qr-code-logo"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-medium text-white">Logo 二维码</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={downloadPNG}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-teal-500/25"
          >
            <Download className="w-4 h-4" />
            下载 PNG
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 flex items-center justify-center bg-white rounded-2xl border border-[#27272a] p-8">
            <div className="relative">
              <canvas ref={canvasRef} className="max-w-full" />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Logo 上传 */}
          <div className="w-full md:w-64 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Logo 图片
              </label>
              {!logoImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#27272a] hover:border-teal-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">点击上传 Logo</p>
                  <p className="text-xs text-slate-600 mt-1">支持 PNG/JPG/SVG</p>
                </div>
              ) : (
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                      <img
                        src={logoImage}
                        alt="Logo"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">已上传 Logo</p>
                      <button
                        onClick={removeLogo}
                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mt-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        移除
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {logoImage && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-slate-400">Logo 大小</label>
                  <span className="text-sm font-mono text-teal-400">{logoSize}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={35}
                  value={logoSize}
                  onChange={(e) => setLogoSize(Number(e.target.value))}
                  className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
                <p className="text-xs text-slate-600 mt-2">
                  建议不超过 30%，以免影响扫码
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* 内容输入 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            二维码内容
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入网址、文本或其他内容"
            rows={2}
            className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none resize-none placeholder-slate-600"
          />
        </div>

        {/* 设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">尺寸</label>
              <span className="text-sm font-mono text-teal-400">{size}px</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={50}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
          </div>

          <div>
            <label className="text-sm text-slate-300 mb-2 block">容错级别</label>
            <div className="grid grid-cols-4 gap-2">
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setErrorLevel(level)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    errorLevel === level
                      ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                      : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-600 mt-2">
              带 Logo 建议使用 H 级（最高容错）
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-slate-400 w-16">前景色</span>
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-sm text-slate-400 w-16">背景色</span>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-white font-mono text-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 上传 Logo 图片后自动嵌入二维码中心，打造品牌专属二维码</li>
          <li>• 建议使用 H 级容错（约 30% 容错率），确保带 Logo 也能正常扫描</li>
          <li>• Logo 大小建议不超过二维码的 25-30%</li>
          <li>• 支持自定义前景色和背景色，注意保持足够对比度</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
