"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Sparkles, Download, Type, Image as ImageIcon } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const SIZES = [16, 32, 48, 64, 128, 180];

function drawFavicon(canvas: HTMLCanvasElement, size: number, opts: { mode: "text" | "emoji"; content: string; bg: string; fg: string; shape: "square" | "rounded" | "circle"; fontSize: number }) {
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = opts.bg;
  if (opts.shape === "circle") {
    ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.fill();
  } else if (opts.shape === "rounded") {
    const r = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(size, 0, size, size, r);
    ctx.arcTo(size, size, 0, size, r);
    ctx.arcTo(0, size, 0, 0, r);
    ctx.arcTo(0, 0, size, 0, r);
    ctx.closePath(); ctx.fill();
  } else {
    ctx.fillRect(0, 0, size, size);
  }
  ctx.fillStyle = opts.fg;
  ctx.font = `${opts.fontSize * size}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(opts.content, size / 2, size / 2 + size * 0.04);
}

export default function FaviconGeneratorProPage() {
  const [mode, setMode] = useState<"text" | "emoji">("text");
  const [content, setContent] = useState("T");
  const [bg, setBg] = useState("#6366f1");
  const [fg, setFg] = useState("#ffffff");
  const [shape, setShape] = useState<"square" | "rounded" | "circle">("rounded");
  const [fontSize, setFontSize] = useState(0.55);
  const previewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      drawFavicon(previewRef.current, 128, { mode, content, bg, fg, shape, fontSize });
    }
  }, [mode, content, bg, fg, shape, fontSize]);

  const downloadAll = () => {
    SIZES.forEach((s, i) => {
      setTimeout(() => {
        const c = document.createElement("canvas");
        drawFavicon(c, s, { mode, content, bg, fg, shape, fontSize });
        const a = document.createElement("a");
        a.href = c.toDataURL("image/png");
        a.download = `favicon-${s}x${s}.png`;
        a.click();
      }, i * 200);
    });
  };

  const downloadIco = () => {
    // 生成单尺寸 ico 格式（含 ICO 文件头 + 单张 32x32 PNG）
    const c = document.createElement("canvas");
    drawFavicon(c, 32, { mode, content, bg, fg, shape, fontSize });
    c.toBlob(async (blob) => {
      if (!blob) return;
      const pngData = new Uint8Array(await blob.arrayBuffer());
      const ico = new Uint8Array(6 + 16 + pngData.length);
      const dv = new DataView(ico.buffer);
      dv.setUint16(0, 0, true); // reserved
      dv.setUint16(2, 1, true); // type ICO
      dv.setUint16(4, 1, true); // count
      dv.setUint8(6, 32); dv.setUint8(7, 32); // w/h
      dv.setUint8(8, 0); // palette
      dv.setUint8(9, 0); // reserved
      dv.setUint16(10, 1, true); // planes
      dv.setUint16(12, 32, true); // bpp
      dv.setUint32(14, pngData.length, true); // size
      dv.setUint32(18, 22, true); // offset
      ico.set(pngData, 22);
      const url = URL.createObjectURL(new Blob([ico]));
      const a = document.createElement("a");
      a.href = url; a.download = "favicon.ico"; a.click();
    }, "image/png");
  };

  return (
    <ToolLayout
      title="Favicon生成器"
      description="生成多尺寸网站图标"
      icon={Sparkles}
      category="设计工具"
      slug="favicon-generator-pro"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">内容类型</label>
            <div className="flex gap-2">
              <button onClick={() => { setMode("text"); setContent("T"); }} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg border ${mode === "text" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <Type className="w-4 h-4" /> 文字
              </button>
              <button onClick={() => { setMode("emoji"); setContent("🚀"); }} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm rounded-lg border ${mode === "emoji" ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                <ImageIcon className="w-4 h-4" /> 表情
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">{mode === "text" ? "文字（1-2字符）" : "表情符号"}</label>
            <input value={content} onChange={(e) => setContent(mode === "text" ? e.target.value.slice(0, 2) : e.target.value)} className={inputClass + " text-center text-lg"} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">背景色</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">前景色</label>
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent cursor-pointer" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">形状</label>
            <select value={shape} onChange={(e) => setShape(e.target.value as typeof shape)} className={inputClass + " h-10"}>
              <option value="square">方形</option>
              <option value="rounded">圆角</option>
              <option value="circle">圆形</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">字号 {Math.round(fontSize * 100)}%</label>
            <input type="range" min={30} max={80} value={fontSize * 100} onChange={(e) => setFontSize(Number(e.target.value) / 100)} className="w-full accent-primary-500 mt-3.5" />
          </div>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-6 flex flex-col items-center gap-4">
          <canvas ref={previewRef} className="rounded" />
          <div className="flex items-end gap-4">
            {SIZES.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <FaviconThumb size={s} opts={{ mode, content, bg, fg, shape, fontSize }} />
                <span className="text-xs text-slate-600">{s}px</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={downloadAll} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
            <Download className="w-4 h-4" /> 下载全部 PNG
          </button>
          <button onClick={downloadIco} className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-200 text-sm font-medium rounded-lg">
            <Download className="w-4 h-4" /> 下载 ICO
          </button>
        </div>
      </div>
    </ToolLayout>
  );
}

function FaviconThumb({ size, opts }: { size: number; opts: { mode: "text" | "emoji"; content: string; bg: string; fg: string; shape: "square" | "rounded" | "circle"; fontSize: number } }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawFavicon(ref.current, size, opts);
  }, [size, opts]);
  return <canvas ref={ref} className="border border-[#27272a] rounded" style={{ width: Math.max(size, 16), height: Math.max(size, 16) }} />;
}
