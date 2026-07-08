"use client";

import { useState, useEffect, useRef } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  QrCode,
  Download,
  Link as LinkIcon,
  Palette,
  Maximize2,
  Image as ImageIcon,
} from "lucide-react";
import QRCode from "qrcode";

type QrSize = "small" | "medium" | "large";

const sizeMap: Record<QrSize, { label: string; size: number; icon: string }> = {
  small: { label: "小", size: 200, icon: "S" },
  medium: { label: "中", size: 300, icon: "M" },
  large: { label: "大", size: 400, icon: "L" },
};

export default function QrCodePage() {
  const [text, setText] = useState("https://example.com");
  const [foregroundColor, setForegroundColor] = useState("#18181b");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [size, setSize] = useState<QrSize>("medium");
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!text.trim()) {
      setDataUrl("");
      setError("");
      return;
    }

    const opts = {
      width: sizeMap[size].size,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor,
      },
      errorCorrectionLevel: "M" as const,
    };

    QRCode.toDataURL(text, opts)
      .then((url: string) => {
        setDataUrl(url);
        setError("");
      })
      .catch((err: Error) => {
        setError(err.message || "生成二维码失败");
        setDataUrl("");
      });
  }, [text, foregroundColor, backgroundColor, size]);

  const downloadQrCode = () => {
    if (!dataUrl) return;

    const link = document.createElement("a");
    link.download = `qrcode-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const presetColors = [
    { fg: "#18181b", bg: "#ffffff", name: "经典黑白" },
    { fg: "#4f46e5", bg: "#ffffff", name: "靛蓝色" },
    { fg: "#059669", bg: "#ffffff", name: "翠绿色" },
    { fg: "#dc2626", bg: "#ffffff", name: "红色" },
    { fg: "#ffffff", bg: "#18181b", name: "反色" },
    { fg: "#8b5cf6", bg: "#f5f3ff", name: "紫色" },
  ];

  return (
    <ToolLayout
      title="二维码生成器"
      description="生成自定义二维码，支持颜色和尺寸调整，一键下载"
      icon={QrCode}
      category="实用工具"
      slug="qrcode"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：控制面板*/}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
            {/* 文本输入 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                <LinkIcon className="w-4 h-4 text-indigo-500" />
                输入文本或URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请输入要生成二维码的文本或链接.."
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                支持文本、URL、电话号码等任意内容
              </p>
            </div>

            {/* 尺寸选择 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                <Maximize2 className="w-4 h-4 text-indigo-500" />
                二维码尺寸
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(sizeMap) as QrSize[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSize(key)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                      size === key
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                    }`}
                  >
                    <span className="text-sm">{sizeMap[key].label}</span>
                    <span className="text-xs opacity-70">
                      {sizeMap[key].size}px
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 颜色设置 */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                <Palette className="w-4 h-4 text-indigo-500" />
                颜色设置
              </label>

              {/* 预设配色 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {presetColors.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setForegroundColor(preset.fg);
                      setBackgroundColor(preset.bg);
                    }}
                    className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                    title={preset.name}
                  >
                    <div className="flex">
                      <div
                        className="w-4 h-4 rounded-l-sm border border-zinc-300 dark:border-zinc-600"
                        style={{ backgroundColor: preset.fg }}
                      />
                      <div
                        className="w-4 h-4 rounded-r-sm border border-l-0 border-zinc-300 dark:border-zinc-600"
                        style={{ backgroundColor: preset.bg }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* 自定义颜色*/}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                    前景色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={foregroundColor}
                      onChange={(e) => setForegroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                    背景色
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 dark:border-slate-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 下载按钮 */}
            <button
              onClick={downloadQrCode}
              disabled={!dataUrl || !!error}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-zinc-300 disabled:to-zinc-400 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 disabled:shadow-none hover:shadow-indigo-500/40 transition-all active:scale-[0.98] disabled:active:scale-100"
            >
              <Download className="w-5 h-5" />
              下载 PNG 图片
            </button>
          </div>

          {/* 右侧：预览*/}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-medium text-slate-900 dark:text-slate-100">
                实时预览
              </h2>
            </div>

            <div
              className="flex items-center justify-center rounded-xl p-8 min-h-[350px]"
              style={{ backgroundColor: backgroundColor }}
            >
              <canvas ref={canvasRef} className="hidden" />

              {error ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              ) : dataUrl ? (
                <div className="flex flex-col items-center">
                  <img
                    src={dataUrl}
                    alt="二维码预览"
                    className="rounded-lg shadow-lg"
                  />
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    尺寸: {sizeMap[size].size} x {sizeMap[size].size} px
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    输入内容后自动生成
                  </p>
                </div>
              )}
            </div>

            {/* 提示信息 */}
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                小贴士
              </h3>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <li>• 二维码内容越多，图案越复杂，建议内容不超过500 字符</li>
                <li>• 前景色和背景色对比度过低可能导致扫描困难</li>
                <li>• 下载的图片为 PNG 格式，无损压缩，适合打印和分享</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
