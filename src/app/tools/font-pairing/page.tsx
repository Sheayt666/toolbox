"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Type, Copy, Check } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Pairing {
  id: string;
  scene: string;
  cn: { heading: string; body: string };
  en: { heading: string; body: string };
  desc: string;
  css: string;
}

const PAIRINGS: Pairing[] = [
  {
    id: "modern-tech", scene: "现代科技",
    cn: { heading: "思源黑体 / Noto Sans SC", body: "思源黑体" },
    en: { heading: "Inter", body: "Inter" },
    desc: "简洁现代的无衬线组合，适合科技产品、SaaS 网站，高可读性。",
    css: "font-family: 'Inter', 'Noto Sans SC', sans-serif;",
  },
  {
    id: "elegant-serif", scene: "优雅文艺",
    cn: { heading: "思源宋体 / Noto Serif SC", body: "思源宋体" },
    en: { heading: "Playfair Display", body: "Lora" },
    desc: "衬线字体组合，传递优雅与品质感，适合杂志、品牌官网。",
    css: "font-family: 'Playfair Display', 'Lora', 'Noto Serif SC', serif;",
  },
  {
    id: "playful-creative", scene: "活泼创意",
    cn: { heading: "阿里巴巴普惠体", body: "阿里巴巴普惠体" },
    en: { heading: "Poppins", body: "Nunito" },
    desc: "圆润友好的字体组合，适合儿童、教育、生活方式品牌。",
    css: "font-family: 'Poppins', 'Nunito', 'PingFang SC', sans-serif;",
  },
  {
    id: "business-formal", scene: "商务正式",
    cn: { heading: "苹方 / PingFang SC", body: "苹方" },
    en: { heading: "Roboto", body: "Open Sans" },
    desc: "经典商务字体组合，清晰专业，适合企业官网与文档。",
    css: "font-family: 'Roboto', 'Open Sans', 'PingFang SC', sans-serif;",
  },
  {
    id: "editorial-magazine", scene: "出版杂志",
    cn: { heading: "方正书宋", body: "方正黑体" },
    en: { heading: "Merriweather", body: "Source Sans Pro" },
    desc: "标题用厚重衬线、正文用清晰无衬线，长文阅读体验佳。",
    css: "font-family: 'Merriweather', 'Source Sans Pro', 'STSong', serif;",
  },
  {
    id: "minimal-clean", scene: "极简清爽",
    cn: { heading: "HarmonyOS Sans", body: "HarmonyOS Sans" },
    en: { heading: "Montserrat", body: "Karla" },
    desc: "几何感无衬线组合，留白友好，适合设计工作室与作品集。",
    css: "font-family: 'Montserrat', 'Karla', 'HarmonyOS Sans', sans-serif;",
  },
];

export default function FontPairingPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sample, setSample] = useState("设计改变生活 Design Changes Life");

  const copy = (p: Pairing) => {
    navigator.clipboard.writeText(p.css);
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <ToolLayout
      title="字体搭配推荐"
      description="中英文字体搭配组合推荐"
      icon={Type}
      category="设计工具"
      slug="font-pairing"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">预览文字</label>
          <input value={sample} onChange={(e) => setSample(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PAIRINGS.map((p) => (
            <div key={p.id} className="rounded-lg bg-[#0a0a0b] border border-[#27272a] overflow-hidden hover:border-[#3f3f46]">
              <div className="p-4" style={{ fontFamily: p.en.body }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-primary-500/10 text-primary-400">{p.scene}</span>
                  <span className="text-xs text-slate-500">{p.en.heading} + {p.en.body}</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: p.en.heading }}>{sample}</p>
                <p className="text-sm text-slate-400" style={{ fontFamily: p.en.body }}>{sample} · The quick brown fox jumps over the lazy dog.</p>
              </div>
              <div className="px-4 pb-3">
                <p className="text-xs text-slate-500 mb-2">{p.desc}</p>
                <div className="flex items-center justify-between gap-2 rounded bg-[#16161a] border border-[#1f1f23] p-2">
                  <code className="text-xs text-primary-300 font-mono truncate flex-1">{p.css}</code>
                  <button onClick={() => copy(p)} className="text-slate-400 hover:text-white flex-shrink-0">
                    {copiedId === p.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            搭配原则：标题与正文形成对比（衬线+无衬线 或 不同字重），保持整体协调。建议标题字号为正文的 2-3 倍，行高 1.5-1.7 之间。中文优先使用系统字体以保证加载速度。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
