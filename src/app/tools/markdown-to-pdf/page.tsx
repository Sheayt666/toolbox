"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileDown, Printer, Info, Eraser } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

function renderMarkdown(md: string): string {
  let html = md;
  html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
  html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');

  html = html.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><code>${code.trim()}</code></pre>`);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  html = html.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  html = html.replace(/^---+$/gim, '<hr />');

  html = html.replace(/^\s*[-*+] (.+)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  html = html.replace(/^\s*\d+\. (.+)$/gim, '<li class="ol-item">$1</li>');
  html = html.replace(/(<li class="ol-item">[\s\S]*?<\/li>)(?!\s*<li)/g, '<ol>$1</ol>');
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  html = html.replace(/^\|(.+)\|$/gim, (match) => {
    const cells = match.split("|").filter(c => c.trim());
    if (cells.some(c => /^[-:]+$/.test(c.trim()))) return "";
    return cells.map(c => `<td>${c.trim()}</td>`).join("");
  });

  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;
  html = html.replace(/<p>(<h[1-5]>)/g, "$1");
  html = html.replace(/(<\/h[1-5]>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ul>)/g, "$1");
  html = html.replace(/(<\/ul>)<\/p>/g, "$1");
  html = html.replace(/<p>(<ol>)/g, "$1");
  html = html.replace(/(<\/ol>)<\/p>/g, "$1");
  html = html.replace(/<p>(<pre>)/g, "$1");
  html = html.replace(/(<\/pre>)<\/p>/g, "$1");
  html = html.replace(/<p>(<blockquote>)/g, "$1");
  html = html.replace(/(<\/blockquote>)<\/p>/g, "$1");
  html = html.replace(/<p><hr \/><\/p>/g, "<hr />");
  html = html.replace(/<p>\s*<\/p>/g, "");

  return html;
}

const sampleMd = `# 文档标题

## 简介
这是一段**加粗**和*斜体*文字示例。

## 功能列表
- 功能一
- 功能二
- 功能三

## 代码示例
\`\`\`
function hello() {
  console.log("Hello World");
}
\`\`\`

## 引用
> 这是一段引用文字。

---

## 结语
点击下方按钮即可将此文档导出为PDF。`;

export default function MarkdownToPdfPage() {
  const [markdown, setMarkdown] = useState(sampleMd);
  const [fontSize, setFontSize] = useState(14);
  const [pageFormat, setPageFormat] = useState<"A4" | "Letter">("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<"narrow" | "normal" | "wide">("normal");

  const renderedHtml = useMemo(() => renderMarkdown(markdown), [markdown]);

  const margins = {
    narrow: "10mm",
    normal: "20mm",
    wide: "30mm",
  };

  const generatePdf = () => {
    const printWin = window.open("", "_blank");
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Markdown文档</title>
        <style>
          @page {
            size: ${pageFormat} ${orientation};
            margin: ${margins[margin]};
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
            font-size: ${fontSize}px;
            line-height: 1.8;
            color: #1a1a1a;
            max-width: 100%;
          }
          h1 { font-size: ${fontSize * 2}px; margin: 24px 0 16px; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          h2 { font-size: ${fontSize * 1.5}px; margin: 20px 0 12px; }
          h3 { font-size: ${fontSize * 1.25}px; margin: 16px 0 8px; }
          h4, h5 { font-size: ${fontSize * 1.1}px; margin: 12px 0 6px; }
          p { margin: 8px 0; }
          ul, ol { margin: 8px 0; padding-left: 24px; }
          li { margin: 4px 0; }
          code {
            font-family: "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 0.9em;
          }
          pre {
            background: #f5f5f5;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 12px 0;
          }
          pre code { background: none; padding: 0; }
          blockquote {
            border-left: 4px solid #ddd;
            padding-left: 16px;
            margin: 12px 0;
            color: #666;
          }
          hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
          a { color: #0066cc; text-decoration: none; }
          table { border-collapse: collapse; width: 100%; margin: 12px 0; }
          td { border: 1px solid #ddd; padding: 8px; }
          strong { font-weight: 700; }
          em { font-style: italic; }
          del { text-decoration: line-through; }
        </style>
      </head>
      <body>
        ${renderedHtml}
      </body>
      </html>
    `);
    printWin.document.close();
    setTimeout(() => {
      printWin.focus();
      printWin.print();
    }, 500);
  };

  return (
    <ToolLayout
      title="Markdown转PDF"
      description="将Markdown文档转换为PDF，支持自定义字号、页面格式和边距"
      icon={FileDown}
      category="PDF工具"
      slug="markdown-to-pdf"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300 font-medium mb-1">Markdown转PDF工具</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              输入Markdown文本，实时预览渲染效果，点击导出按钮通过浏览器打印功能生成PDF。支持自定义字号、页面格式（A4/Letter）、方向和边距。
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-500 block mb-2">字号</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={10}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <span className="text-xs text-slate-400 font-mono w-8">{fontSize}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-2">页面格式</label>
            <select
              value={pageFormat}
              onChange={(e) => setPageFormat(e.target.value as "A4" | "Letter")}
              className={inputClass}
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 block mb-2">方向</label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as "portrait" | "landscape")}
              className={inputClass}
            >
              <option value="portrait">纵向</option>
              <option value="landscape">横向</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">边距</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { v: "narrow", l: "窄" },
              { v: "normal", l: "正常" },
              { v: "wide", l: "宽" },
            ] as const).map((m) => (
              <button
                key={m.v}
                onClick={() => setMargin(m.v)}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  margin === m.v ? "bg-primary-500 text-white" : "bg-[#0a0a0b] border border-[#27272a] text-slate-400 hover:text-white"
                }`}
              >
                {m.l}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">Markdown 输入</label>
              <button
                onClick={() => setMarkdown("")}
                className="text-xs text-slate-500 hover:text-white inline-flex items-center gap-1"
              >
                <Eraser className="w-3.5 h-3.5" /> 清空
              </button>
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="在此输入Markdown文本..."
              rows={16}
              className={inputClass + " resize-y font-mono text-xs"}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">PDF 预览</label>
            <div className="bg-white rounded-lg p-6 overflow-y-auto" style={{ height: "380px" }}>
              <div
                className="text-slate-800"
                style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={generatePdf}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg"
        >
          <Printer className="w-4 h-4" />
          导出为PDF
        </button>

        <p className="text-xs text-slate-600 text-center">
          点击按钮后会打开打印窗口，请在目标中选择"另存为PDF"以保存文件
        </p>
      </div>
    </ToolLayout>
  );
}
