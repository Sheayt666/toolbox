"use client";

// Edge runtime for the embed generator page.
export const runtime = "edge";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Copy,
  Check,
  Code2,
  Eye,
  ExternalLink,
  Code,
  Wrench,
} from "lucide-react";
import { getAllTools } from "@/lib/tools";

const SITE_URL = "https://99gongju.online";

type Theme = "dark" | "light";

export default function EmbedGeneratorPage() {
  const allTools = useMemo(() => getAllTools(), []);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>(allTools[0]?.id ?? "");
  const [width, setWidth] = useState<string>("600");
  const [height, setHeight] = useState<string>("500");
  const [theme, setTheme] = useState<Theme>("dark");
  const [copied, setCopied] = useState(false);

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allTools;
    return allTools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
    );
  }, [allTools, query]);

  const selectedTool =
    allTools.find((t) => t.id === selectedId) ?? allTools[0];

  // Build the public embed URL: https://99gongju.online/embed/{toolId}?theme=...
  const embedUrl = useMemo(() => {
    if (!selectedTool) return "";
    const url = new URL(`${SITE_URL}/embed/${selectedTool.id}`);
    url.searchParams.set("theme", theme);
    return url.toString();
  }, [selectedTool, theme]);

  // Relative preview URL so the live preview works in dev and prod.
  const previewSrc = useMemo(() => {
    if (!selectedTool) return "";
    return `/embed/${selectedTool.id}?theme=${theme}`;
  }, [selectedTool, theme]);

  // Build the <iframe> embed snippet for the user to copy.
  const embedCode = useMemo(() => {
    if (!selectedTool || !embedUrl) return "";
    const w = width.trim() || "100%";
    const h = height.trim() || "500";
    const wStyle = w.endsWith("%") ? w : `${w}px`;
    const hStyle = h.endsWith("%") ? h : `${h}px`;
    return `<iframe src="${embedUrl}" width="${w}" height="${h}" frameborder="0" style="border:0;width:${wStyle};height:${hStyle};" allowfullscreen loading="lazy" title="${selectedTool.name} - 99gongju.online"></iframe>`;
  }, [selectedTool, embedUrl, width, height]);

  const handleCopy = async () => {
    if (!embedCode) return;
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const ta = document.createElement("textarea");
      ta.value = embedCode;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
  };

  if (!selectedTool) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <p className="text-slate-400">No tools available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
            <Link href="/" className="hover:text-primary-400 transition-colors">
              首页
            </Link>
            <span>/</span>
            <span className="text-slate-400">嵌入工具</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Code className="w-8 h-8 text-primary-400" />
            嵌入代码生成器
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            选择任意工具，自定义尺寸与主题，生成 iframe 嵌入代码并复制到你的网站、博客或文档中。所有工具均在浏览器本地运行，嵌入后无需服务器支持。
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          {/* Tool picker */}
          <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-4 h-fit lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] flex flex-col">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索工具…"
                className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60"
              />
            </div>
            <div className="overflow-y-auto -mx-1 px-1 space-y-1 lg:flex-1">
              {filteredTools.map((t) => {
                const Icon = t.icon;
                const active = t.id === selectedTool.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                      active
                        ? "bg-primary-500/15 border border-primary-500/40"
                        : "border border-transparent hover:bg-[#27272a]/60"
                    }`}
                  >
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-md shrink-0"
                      style={{ backgroundColor: `${t.color}22`, color: t.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white truncate">
                        {t.name}
                      </span>
                      <span className="block text-xs text-slate-500 truncate">
                        {t.category}
                      </span>
                    </span>
                  </button>
                );
              })}
              {filteredTools.length === 0 && (
                <p className="text-sm text-slate-500 py-6 text-center">
                  没有匹配的工具
                </p>
              )}
            </div>
          </div>

          {/* Configuration + preview */}
          <div className="space-y-6 min-w-0">
            {/* Selected tool summary */}
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5">
              <div className="flex items-start gap-4">
                <span
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                  style={{
                    backgroundColor: `${selectedTool.color}22`,
                    color: selectedTool.color,
                  }}
                >
                  <selectedTool.icon className="w-6 h-6" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">
                    {selectedTool.name}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedTool.description}
                  </p>
                  <Link
                    href={`/embed/${selectedTool.id}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 mt-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    打开嵌入预览页
                  </Link>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary-400" />
                自定义选项
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <label className="block">
                  <span className="text-xs text-slate-400">宽度</span>
                  <input
                    type="text"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    placeholder="600 或 100%"
                    className="mt-1 w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">高度</span>
                  <input
                    type="text"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="500"
                    className="mt-1 w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/60"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-slate-400">主题</span>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as Theme)}
                    className="mt-1 w-full bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary-500/60"
                  >
                    <option value="dark">深色</option>
                    <option value="light">浅色</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Generated code */}
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-primary-400" />
                  嵌入代码
                </h3>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary-500/15 border border-primary-500/40 text-primary-300 hover:bg-primary-500/25 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      一键复制
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-[#09090b] border border-[#27272a] rounded-lg p-4 overflow-x-auto text-xs text-slate-300 whitespace-pre-wrap break-all">
                {embedCode}
              </pre>
            </div>

            {/* Live preview */}
            <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-400" />
                实时预览
              </h3>
              <div className="rounded-lg border border-[#27272a] bg-[#09090b] p-4 flex items-center justify-center">
                <iframe
                  key={previewSrc}
                  src={previewSrc}
                  title={`${selectedTool.name} preview`}
                  className="rounded-md border border-[#27272a]"
                  style={{
                    width: width.endsWith("%") ? width : `${Math.min(Number(width) || 600, 560)}px`,
                    height: `${Math.min(Number(height) || 500, 480)}px`,
                    maxWidth: "100%",
                  }}
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-500 mt-3">
                预览尺寸已按比例缩放以适应页面；实际嵌入尺寸由你设置的宽高决定。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
