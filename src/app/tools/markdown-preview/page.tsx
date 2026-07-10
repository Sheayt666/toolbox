"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Check, Eye, Code2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function mdToHtml(md: string): string {
  if (!md.trim()) return "";
  const lines = md.split(/\r?\n/);
  let html = "";
  let inList = false;
  let inCode = false;
  let codeLang = "";

  const inline = (text: string) => {
    return text
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-[#27272a] rounded text-primary-300 text-[0.85em]">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/__([^_]+)__/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "<em>$1</em>")
      .replace(/~~([^~]+)~~/g, "<del>$1</del>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary-400 hover:underline" target="_blank" rel="noopener">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-2" />');
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html += "</code></pre>\n";
        inCode = false;
      } else {
        codeLang = line.trim().slice(3);
        html += `<pre class="bg-[#0a0a0b] border border-[#27272a] rounded-lg p-3 my-2 overflow-x-auto"><code class="text-sm text-slate-200">`;
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      html += escapeHtml(line) + "\n";
      continue;
    }
    if (/^#{1,6}\s/.test(line)) {
      if (inList) { html += "</ul>\n"; inList = false; }
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s/, "");
      const sizes = ["text-2xl", "text-xl", "text-lg", "text-base", "text-sm", "text-sm"];
      html += `<h${level} class="${sizes[level - 1] || "text-base"} font-bold text-white mt-4 mb-2">${inline(text)}</h${level}>\n`;
    } else if (/^>\s/.test(line)) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<blockquote class="border-l-4 border-primary-500 pl-3 text-slate-400 italic my-2">${inline(line.replace(/^>\s/, ""))}</blockquote>\n`;
    } else if (/^[-*+]\s/.test(line)) {
      if (!inList) { html += '<ul class="list-disc list-inside space-y-1 my-2 text-slate-200">\n'; inList = true; }
      html += `<li>${inline(line.replace(/^[-*+]\s/, ""))}</li>\n`;
    } else if (/^\d+\.\s/.test(line)) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<ol class="list-decimal list-inside space-y-1 my-2 text-slate-200"><li>${inline(line.replace(/^\d+\.\s/, ""))}</li></ol>\n`;
    } else if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += '<hr class="border-[#27272a] my-4" />\n';
    } else if (line.trim() === "") {
      if (inList) { html += "</ul>\n"; inList = false; }
    } else {
      if (inList) { html += "</ul>\n"; inList = false; }
      html += `<p class="text-slate-200 my-2 leading-relaxed">${inline(line)}</p>\n`;
    }
  }
  if (inList) html += "</ul>\n";
  if (inCode) html += "</code></pre>\n";
  return html;
}

export default function MarkdownPreviewPage() {
  const [md, setMd] = useState(`# Markdown 预览

这是一个 **Markdown** 实时预览工具。

## 功能特性
- 支持 *斜体*、**粗体**、~~删除线~~
- 支持 \`行内代码\`
- 支持 [链接](https://example.com)
- 支持列表

\`\`\`javascript
function hello() {
  console.log("Hello World");
}
\`\`\`

> 这是一段引用文字

1. 有序列表项一
2. 有序列表项二
`);
  const [view, setView] = useState<"split" | "preview" | "source">("split");
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => mdToHtml(md), [md]);

  const copy = () => {
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolLayout
      title="Markdown预览"
      description="实时预览Markdown渲染效果"
      icon={FileText}
      category="开发工具"
      slug="markdown-preview"
    >
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {[
              { v: "split", l: "分屏", I: Code2 },
              { v: "preview", l: "预览", I: Eye },
              { v: "source", l: "源码", I: FileText },
            ].map(({ v, l, I }) => (
              <button
                key={v}
                onClick={() => setView(v as typeof view)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  view === v ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"
                }`}
              >
                <I className="w-3.5 h-3.5" /> {l}
              </button>
            ))}
          </div>
          <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制HTML
          </button>
        </div>

        <div className={`grid gap-4 ${view === "split" ? "sm:grid-cols-2" : "grid-cols-1"}`}>
          {(view === "split" || view === "source") && (
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Markdown 源码</label>
              <textarea
                value={md}
                onChange={(e) => setMd(e.target.value)}
                rows={18}
                className={inputClass + " resize-y font-mono h-full"}
              />
            </div>
          )}
          {(view === "split" || view === "preview") && (
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">渲染预览</label>
              <div
                className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 min-h-[400px] overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: html || '<p class="text-slate-600">预览区域</p>' }}
              />
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
