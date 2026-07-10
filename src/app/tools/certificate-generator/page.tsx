"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Award, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const THEMES = [
  { name: "金色经典", border: "#d4af37", accent: "#b8860b", bg: "#fffbeb" },
  { name: "红色喜庆", border: "#dc2626", accent: "#991b1b", bg: "#fef2f2" },
  { name: "蓝色商务", border: "#2563eb", accent: "#1e40af", bg: "#eff6ff" },
  { name: "紫色优雅", border: "#9333ea", accent: "#6b21a8", bg: "#faf5ff" },
];

export default function CertificateGeneratorPage() {
  const [title, setTitle] = useState("荣 誉 证 书");
  const [recipient, setRecipient] = useState("张三");
  const [award, setAward] = useState("优秀员工");
  const [org, setOrg] = useState("99在线工具");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [themeIdx, setThemeIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = THEMES[themeIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 800, H = 560;
    canvas.width = W; canvas.height = H;
    // bg
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(40, 40, W - 80, H - 80);
    // outer border
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 6;
    ctx.strokeRect(40, 40, W - 80, H - 80);
    // inner border
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, W - 112, H - 112);
    // corner decorations
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].forEach(([x, y], i) => {
      ctx.beginPath();
      const dx = i % 2 === 0 ? 30 : -30;
      const dy = i < 2 ? 30 : -30;
      ctx.moveTo(x + dx, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy);
      ctx.stroke();
    });
    // title
    ctx.fillStyle = theme.border;
    ctx.font = "bold 48px serif";
    ctx.textAlign = "center";
    ctx.fillText(title, W / 2, 150);
    // decorative line
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(W / 2 - 160, 175); ctx.lineTo(W / 2 + 160, 175); ctx.stroke();
    // recipient label
    ctx.fillStyle = "#374151";
    ctx.font = "22px serif";
    ctx.fillText("兹证明 / 授予", W / 2, 230);
    // recipient name
    ctx.fillStyle = theme.accent;
    ctx.font = "bold 42px serif";
    ctx.fillText(recipient, W / 2, 295);
    // underline
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(W / 2 - 120, 310); ctx.lineTo(W / 2 + 120, 310); ctx.stroke();
    // award text
    ctx.fillStyle = "#374151";
    ctx.font = "24px serif";
    ctx.fillText(`「${award}」荣誉称号`, W / 2, 360);
    ctx.font = "18px serif";
    ctx.fillText("特发此证，以资鼓励。", W / 2, 400);
    // org
    ctx.fillStyle = theme.border;
    ctx.font = "bold 20px serif";
    ctx.textAlign = "right";
    ctx.fillText(org, W - 100, 470);
    // date
    ctx.fillStyle = "#6b7280";
    ctx.font = "16px serif";
    ctx.fillText(date, W - 100, 500);
    // seal circle
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(W - 130, 450, 45, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = theme.border;
    ctx.font = "bold 13px serif";
    ctx.textAlign = "center";
    ctx.fillText("荣誉", W - 130, 446);
    ctx.fillText("印章", W - 130, 462);
  }, [title, recipient, award, org, date, themeIdx]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `certificate-${recipient}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="证书生成器"
      description="在线生成荣誉证书"
      icon={Award}
      category="生成工具"
      slug="certificate-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">证书标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">获得者姓名</label>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">荣誉名称</label>
            <input value={award} onChange={(e) => setAward(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">颁发机构</label>
            <input value={org} onChange={(e) => setOrg(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">颁发日期</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">证书风格</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setThemeIdx(i)}
                className={`px-3 py-1.5 text-xs rounded-lg border ${themeIdx === i ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
          <Download className="w-4 h-4" /> 下载证书
        </button>
      </div>
    </ToolLayout>
  );
}
