"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ticket, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const THEMES = [
  { name: "喜庆红", main: "#dc2626", accent: "#fbbf24", bg: "#fef2f2" },
  { name: "海洋蓝", main: "#2563eb", accent: "#06b6d4", bg: "#eff6ff" },
  { name: "森林绿", main: "#16a34a", accent: "#facc15", bg: "#f0fdf4" },
  { name: "优雅紫", main: "#9333ea", accent: "#ec4899", bg: "#faf5ff" },
  { name: "暗夜黑", main: "#1f2937", accent: "#f59e0b", bg: "#f9fafb" },
];

function randomCode(len: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function CouponGeneratorPage() {
  const [title, setTitle] = useState("限时优惠");
  const [subtitle, setSubtitle] = useState("满 200 减 50");
  const [code, setCode] = useState("SAVE50");
  const [desc, setDesc] = useState("有效期至 2026-12-31");
  const [themeIdx, setThemeIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = THEMES[themeIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 600, H = 320;
    canvas.width = W; canvas.height = H;
    // bg
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, W, H);
    // main band
    ctx.fillStyle = theme.main;
    ctx.fillRect(0, 0, W, 200);
    // accent strip
    ctx.fillStyle = theme.accent;
    ctx.fillRect(0, 200, W, 8);
    // perforation circles
    ctx.fillStyle = theme.bg;
    ctx.beginPath(); ctx.arc(0, 200, 18, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W, 200, 18, 0, Math.PI * 2); ctx.fill();
    // dashed line
    ctx.strokeStyle = theme.main;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(30, 200); ctx.lineTo(W - 30, 200); ctx.stroke();
    ctx.setLineDash([]);
    // title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(title, W / 2, 90);
    // subtitle
    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = theme.accent;
    ctx.fillText(subtitle, W / 2, 140);
    // code label
    ctx.fillStyle = theme.main;
    ctx.font = "14px sans-serif";
    ctx.fillText("优惠码", W / 2, 240);
    // code box
    ctx.strokeStyle = theme.main;
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 120, 250, 240, 44);
    ctx.fillStyle = theme.main;
    ctx.font = "bold 26px monospace";
    ctx.fillText(code, W / 2, 282);
    // desc
    ctx.fillStyle = "#6b7280";
    ctx.font = "13px sans-serif";
    ctx.fillText(desc, W / 2, 308);
  }, [title, subtitle, code, desc, themeIdx]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `coupon-${code}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="优惠券生成器"
      description="生成促销优惠券图片"
      icon={Ticket}
      category="生成工具"
      slug="coupon-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">主标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">副标题</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">优惠码</label>
            <div className="flex gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputClass + " font-mono"} />
              <button onClick={() => setCode(randomCode(8))} className="px-3 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 text-xs rounded-lg whitespace-nowrap">随机</button>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">说明文字</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">主题配色</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border ${themeIdx === i ? "border-primary-500/50 bg-primary-500/10" : "border-[#27272a] bg-[#0a0a0b]"}`}
              >
                <span className="flex gap-0.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.main }} />
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                </span>
                <span className={themeIdx === i ? "text-primary-400" : "text-slate-400"}>{t.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
          <Download className="w-4 h-4" /> 下载优惠券
        </button>
      </div>
    </ToolLayout>
  );
}
