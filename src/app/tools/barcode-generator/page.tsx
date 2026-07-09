"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Barcode, Download, Copy, Check, Settings } from "lucide-react";

// Code128 barcode generator using Canvas
function generateCode128(text: string): number[] {
  // Simple Code128B encoding
  const code128B: Record<string, number> = {};
  // Code128 B set: space (0x20) to ~ (0x7E)
  for (let i = 0; i < 96; i++) {
    code128B[String.fromCharCode(32 + i)] = i;
  }

  const startCodeB = 104;
  const stopCode = 106;

  // Pattern definitions for Code128 (simplified - 107 patterns)
  // Each pattern is 6 bars + 6 spaces = 11 modules, stop is 13 modules
  // These are the standard Code128 barcode patterns
  const patterns = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
    "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
    "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
    "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
    "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
    "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
    "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
    "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
    "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
    "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
    "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
    "211214", "211232", "2331112", // stop pattern (13 modules)
  ];

  const bars: number[] = [];

  // Start code B
  const startPattern = patterns[startCodeB];
  for (let i = 0; i < startPattern.length; i++) {
    const width = parseInt(startPattern[i]);
    bars.push(i % 2 === 0 ? width : -width); // positive = bar, negative = space
  }

  // Data characters
  let checksum = startCodeB;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = code128B[char] ?? 0;
    checksum += code * (i + 1);

    const pattern = patterns[code];
    for (let j = 0; j < pattern.length; j++) {
      const width = parseInt(pattern[j]);
      bars.push(j % 2 === 0 ? width : -width);
    }
  }

  // Check digit
  checksum = checksum % 103;
  const checkPattern = patterns[checksum];
  for (let i = 0; i < checkPattern.length; i++) {
    const width = parseInt(checkPattern[i]);
    bars.push(i % 2 === 0 ? width : -width);
  }

  // Stop code
  const stopPattern = patterns[stopCode];
  for (let i = 0; i < stopPattern.length; i++) {
    const width = parseInt(stopPattern[i]);
    bars.push(i % 2 === 0 ? width : -width);
  }

  return bars;
}

type BarcodeFormat = "code128";

export default function BarcodeGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("HELLO WORLD");
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [showText, setShowText] = useState(true);
  const [barColor, setBarColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const drawBarcode = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Validate text - only ASCII printable
    if (!/^[\x20-\x7E]*$/.test(text)) {
      setError("条形码仅支持 ASCII 可打印字符");
      return;
    }
    setError("");

    const bars = generateCode128(text);

    // Calculate total width
    const totalModules = bars.reduce((sum, b) => sum + Math.abs(b), 0);
    const totalWidth = totalModules * barWidth;
    const textHeight = showText ? 30 : 0;

    canvas.width = totalWidth + 40; // 20px padding on each side
    canvas.height = height + textHeight + 20;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw bars
    ctx.fillStyle = barColor;
    let x = 20; // start with left padding
    for (const bar of bars) {
      const w = Math.abs(bar) * barWidth;
      if (bar > 0) {
        ctx.fillRect(x, 10, w, height);
      }
      x += w;
    }

    // Text
    if (showText) {
      ctx.fillStyle = barColor;
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(text, canvas.width / 2, canvas.height - 5);
    }
  }, [text, barWidth, height, showText, barColor, bgColor]);

  useEffect(() => {
    drawBarcode();
  }, [drawBarcode]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `barcode-${Date.now()}.png`;
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

  return (
    <ToolLayout
      title="条形码生成器"
      description="在线生成 Code128 条形码，自定义宽度、高度和颜色，支持 PNG 下载和复制"
      icon={Barcode}
      category="图片工具"
      slug="barcode-generator"
      toolId="barcode-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Barcode className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">条形码</span>
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
          >
            <Download className="w-4 h-4" />
            下载 PNG
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预览区 */}
        <div className="bg-white rounded-2xl border border-[#27272a] p-8 flex items-center justify-center min-h-[200px] overflow-auto">
          {error ? (
            <div className="text-red-500 text-sm">{error}</div>
          ) : (
            <canvas ref={canvasRef} className="max-w-full" />
          )}
        </div>

        {/* 内容输入 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            条形码内容
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            maxLength={50}
            placeholder="输入条形码内容（ASCII 字符）"
            className="w-full px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none placeholder-slate-600"
          />
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
        </div>

        {/* 参数设置 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-500" />
                条码宽度
              </label>
              <span className="text-sm font-mono text-blue-400">{barWidth}px</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={barWidth}
              onChange={(e) => setBarWidth(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300">条码高度</label>
              <span className="text-sm font-mono text-blue-400">{height}px</span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">条颜色</span>
              <input
                type="color"
                value={barColor}
                onChange={(e) => setBarColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">背景色</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
              />
            </div>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showText}
                onChange={(e) => setShowText(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-blue-500 focus:ring-blue-500/50"
              />
              <span className="text-sm text-slate-300">显示下方文字</span>
            </label>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 Code128 格式，可编码 ASCII 可打印字符（空格到 ~）</li>
          <li>• 调整条码宽度可改变条形码的整体宽度和可识别距离</li>
          <li>• 建议使用默认黑白配色以确保最佳扫描效果</li>
          <li>• 支持下载 PNG 图片或直接复制到剪贴板</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
