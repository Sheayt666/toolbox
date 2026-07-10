"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Pen, Download, RefreshCw } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const FONTS = [
  { name: "行楷", css: "'STKaiti', 'KaiTi', cursive" },
  { name: "楷体", css: "'STKaiti', 'KaiTi', serif" },
  { name: "宋体", css: "'STSong', 'SimSun', serif" },
  { name: "黑体", css: "'STHeiti', 'SimHei', sans-serif" },
  { name: "草书", css: "'STCaoshu', 'KaiTi', cursive" },
];

const COLORS = ["#1a1a1a", "#1e3a8a", "#991b1b", "#166534", "#78350f"];

export default function SignatureGeneratorPage() {
  const [name, setName] = useState("张三");
  const [fontIdx, setFontIdx] = useState(0);
  const [color, setColor] = useState(COLORS[0]);
  const [tilt, setTilt] = useState(-5);
  const [size, setSize] = useState(80);
  const [bgTransparent, setBgTransparent] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 400, H = 180;
    canvas.width = W; canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    if (!bgTransparent) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate((tilt * Math.PI) / 180);
    ctx.fillStyle = color;
    ctx.font = `${size}px ${FONTS[fontIdx].css}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 模拟笔触：多次绘制带轻微偏移产生手写感
    ctx.globalAlpha = 0.5;
    ctx.fillText(name, -1, -1);
    ctx.globalAlpha = 1;
    ctx.fillText(name, 0, 0);
    ctx.restore();
    // 装饰下划线
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const lineW = Math.min(280, name.length * size * 0.6);
    ctx.moveTo(W / 2 - lineW / 2, H - 30);
    ctx.bezierCurveTo(W / 2 - lineW / 4, H - 40, W / 2 + lineW / 4, H - 20, W / 2 + lineW / 2, H - 30);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }, [name, fontIdx, color, tilt, size, bgTransparent]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `signature-${name}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="艺术签名生成"
      description="在线生成个性艺术签名"
      icon={Pen}
      category="生成工具"
      slug="signature-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">签名文字</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} maxLength={8} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">字体风格</label>
            <select value={fontIdx} onChange={(e) => setFontIdx(Number(e.target.value))} className={inputClass}>
              {FONTS.map((f, i) => <option key={f.name} value={i}>{f.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">字号 {size}px</label>
            <input type="range" min={40} max={120} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">倾斜 {tilt}°</label>
            <input type="range" min={-30} max={30} value={tilt} onChange={(e) => setTilt(Number(e.target.value))} className="w-full accent-primary-500" />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">颜色</label>
            <div className="flex gap-1.5">
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 ${color === c ? "border-primary-400" : "border-transparent"}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setBgTransparent(!bgTransparent)} className={`px-3 py-1.5 text-xs rounded-lg border ${bgTransparent ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
            {bgTransparent ? "透明背景" : "白色背景"}
          </button>
          <button onClick={() => setTilt(Math.floor(Math.random() * 40 - 20))} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:text-white">
            <RefreshCw className="w-3.5 h-3.5" /> 随机倾斜
          </button>
        </div>

        <div className="rounded-lg border border-[#27272a] p-4 flex items-center justify-center" style={{ backgroundColor: bgTransparent ? "#0a0a0b" : "#ffffff", backgroundImage: bgTransparent ? "linear-gradient(45deg,#1a1a1d 25%,transparent 25%),linear-gradient(-45deg,#1a1a1d 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#1a1a1d 75%),linear-gradient(-45deg,transparent 75%,#1a1a1d 75%)" : "none", backgroundSize: "20px 20px", backgroundPosition: "0 0,0 10px,10px -10px,-10px 0" }}>
          <canvas ref={canvasRef} />
        </div>

        <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
          <Download className="w-4 h-4" /> 下载签名
        </button>
      </div>
    </ToolLayout>
  );
}
