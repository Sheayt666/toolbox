"use client";

import { useState, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { MailPlus, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const THEMES = [
  { name: "中国红", main: "#b91c1c", accent: "#fbbf24", bg: "#fffbeb", text: "#7f1d1d" },
  { name: "玫瑰金", main: "#be185d", accent: "#f9a8d4", bg: "#fdf2f8", text: "#831843" },
  { name: "天空蓝", main: "#0369a1", accent: "#7dd3fc", bg: "#f0f9ff", text: "#0c4a6e" },
  { name: "森林绿", main: "#15803d", accent: "#86efac", bg: "#f0fdf4", text: "#14532d" },
];

export default function InvitationCardPage() {
  const [type, setType] = useState<"wedding" | "birthday" | "party">("wedding");
  const [title, setTitle] = useState("婚礼邀请");
  const [host, setHost] = useState("张三 & 李四");
  const [content, setContent] = useState("谨订于 2026 年 6 月 18 日\n敬备喜宴 恭请光临");
  const [time, setTime] = useState("2026-06-18 18:00");
  const [location, setLocation] = useState("北京市朝阳区××大酒店");
  const [themeIdx, setThemeIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const theme = THEMES[themeIdx];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 480, H = 640;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, W, H);
    // decorative border
    ctx.strokeStyle = theme.main; ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = theme.accent; ctx.lineWidth = 2;
    ctx.strokeRect(34, 34, W - 68, H - 68);
    // top icon circle
    ctx.fillStyle = theme.main;
    ctx.beginPath(); ctx.arc(W / 2, 110, 38, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "28px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const icon = type === "wedding" ? "囍" : type === "birthday" ? "寿" : "邀";
    ctx.fillText(icon, W / 2, 110);
    // title
    ctx.fillStyle = theme.text;
    ctx.font = "bold 40px serif"; ctx.textAlign = "center";
    ctx.fillText(title, W / 2, 200);
    // divider
    ctx.strokeStyle = theme.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 - 80, 230); ctx.lineTo(W / 2 + 80, 230); ctx.stroke();
    // host
    ctx.fillStyle = theme.main;
    ctx.font = "bold 32px serif";
    ctx.fillText(host, W / 2, 285);
    // content lines
    ctx.fillStyle = theme.text;
    ctx.font = "20px serif";
    content.split("\n").forEach((line, i) => {
      ctx.fillText(line, W / 2, 350 + i * 32);
    });
    // info box
    const infoY = 350 + content.split("\n").length * 32 + 30;
    ctx.fillStyle = theme.main;
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("时间", W / 2, infoY);
    ctx.fillStyle = theme.text;
    ctx.font = "16px sans-serif";
    ctx.fillText(time, W / 2, infoY + 26);
    ctx.fillStyle = theme.main;
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("地点", W / 2, infoY + 60);
    ctx.fillStyle = theme.text;
    ctx.font = "15px sans-serif";
    ctx.fillText(location, W / 2, infoY + 86);
    // footer
    ctx.fillStyle = theme.accent;
    ctx.font = "14px serif";
    ctx.fillText("诚邀您莅临 共襄盛举", W / 2, H - 60);
  }, [type, title, host, content, time, location, themeIdx]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `invitation-${type}.png`;
    a.click();
  };

  return (
    <ToolLayout
      title="电子请柬生成"
      description="在线生成电子请柬"
      icon={MailPlus}
      category="生成工具"
      slug="invitation-card"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          {[
            { v: "wedding", l: "婚礼" },
            { v: "birthday", l: "生日" },
            { v: "party", l: "聚会" },
          ].map((t) => (
            <button key={t.v} onClick={() => setType(t.v as typeof type)} className={`flex-1 px-3 py-2 text-sm rounded-lg border ${type === t.v ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
              {t.l}请柬
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">标题</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">主办人</label>
            <input value={host} onChange={(e) => setHost(e.target.value)} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs text-slate-400 mb-1.5 block">正文（换行分段）</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} className={inputClass + " resize-y"} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">时间</label>
            <input value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">地点</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">主题</label>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t, i) => (
              <button key={t.name} onClick={() => setThemeIdx(i)} className={`px-3 py-1.5 text-xs rounded-lg border ${themeIdx === i ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 flex items-center justify-center overflow-auto">
          <canvas ref={canvasRef} className="max-w-full rounded shadow-2xl" />
        </div>

        <button onClick={download} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg">
          <Download className="w-4 h-4" /> 下载请柬
        </button>
      </div>
    </ToolLayout>
  );
}
