"use client";

import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Copy,
  Check,
  Trash2,
  FileText,
  Eye,
  Edit3,
  Code,
} from "lucide-react";

// Simple Markdown Parser
function parseMarkdown(text: string): string {
  if (!text) return "";

  let html = text;

  // Escape HTML first (basic protection)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks (```...```)
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_, code) =>
      `<pre class="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-xl overflow-x-auto text-sm my-4 font-mono"><code>${code.trim()}</code></pre>`
  );

  // Inline code (`...`)
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-slate-200 dark:bg-slate-800 text-pink-600 dark:text-pink-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>'
  );

  // Headings
  html = html.replace(/^###### (.+)$/gm, '<h6 class="text-sm font-bold my-3 text-slate-800 dark:text-slate-200">$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5 class="text-base font-bold my-3 text-slate-800 dark:text-slate-200">$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4 class="text-lg font-bold my-3 text-slate-800 dark:text-slate-200">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold my-4 text-slate-800 dark:text-slate-200">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold my-5 text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-200 dark:border-slate-700">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold my-6 text-slate-900 dark:text-slate-100 pb-3 border-b-2 border-slate-200 dark:border-slate-700">$1</h1>');

  // Blockquotes (must be before list processing)
  // Process multi-line blockquotes
  const lines = html.split("\n");
  const processed: string[] = [];
  let inBlockquote = false;
  let blockquoteContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^&gt;\s?/.test(line)) {
      if (!inBlockquote) {
        inBlockquote = true;
        blockquoteContent = "";
      }
      blockquoteContent += line.replace(/^&gt;\s?/, "") + "\n";
    } else {
      if (inBlockquote) {
        processed.push(
          `<blockquote class="border-l-4 border-indigo-400 dark:border-indigo-500 pl-4 my-4 text-slate-600 dark:text-slate-400 italic bg-indigo-50/50 dark:bg-indigo-900/10 py-3 pr-4 rounded-r-lg">${blockquoteContent.trim()}</blockquote>`
        );
        inBlockquote = false;
        blockquoteContent = "";
      }
      processed.push(line);
    }
  }
  if (inBlockquote) {
    processed.push(
      `<blockquote class="border-l-4 border-indigo-400 dark:border-indigo-500 pl-4 my-4 text-slate-600 dark:text-slate-400 italic bg-indigo-50/50 dark:bg-indigo-900/10 py-3 pr-4 rounded-r-lg">${blockquoteContent.trim()}</blockquote>`
    );
  }
  html = processed.join("\n");

  // Horizontal rule
  html = html.replace(
    /^---\s*$/gm,
    '<hr class="my-6 border-slate-200 dark:border-slate-700" />'
  );
  html = html.replace(
    /^\*\*\*\s*$/gm,
    '<hr class="my-6 border-slate-200 dark:border-slate-700" />'
  );

  // Unordered lists (* or - or +)
  html = html.replace(
    /^([\t ]*)[*\-+] (.+)$/gm,
    (_, indent, content) => {
      const level = Math.floor(indent.length / 2);
      return `<ul data-level="${level}" class="list-disc list-inside my-2 pl-4 text-slate-700 dark:text-slate-300 space-y-1"><li>${content}</li></ul>`;
    }
  );

  // Ordered lists (1. 2. etc)
  html = html.replace(
    /^([\t ]*)\d+\. (.+)$/gm,
    (_, indent, content) => {
      const level = Math.floor(indent.length / 2);
      return `<ol data-level="${level}" class="list-decimal list-inside my-2 pl-4 text-slate-700 dark:text-slate-300 space-y-1"><li>${content}</li></ol>`;
    }
  );

  // Bold (**text** or __text__)
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>'
  );
  html = html.replace(
    /__([^_]+)__/g,
    '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>'
  );

  // Italic (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // Strikethrough (~~text~~)
  html = html.replace(
    /~~([^~]+)~~/g,
    '<del class="line-through text-slate-500 dark:text-slate-500">$1</del>'
  );

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 hover:underline">$1</a>'
  );

  // Images ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
  );

  // Paragraphs (wrap remaining text lines in <p>)
  // Split by double newlines, process each block
  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Skip if already starts with a block-level tag
      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<ul") ||
        trimmed.startsWith("<ol") ||
        trimmed.startsWith("<hr") ||
        trimmed.startsWith("<div") ||
        trimmed.startsWith("<img")
      ) {
        return trimmed;
      }
      // Handle single line items that are already list items
      if (trimmed.startsWith("<li>")) {
        return trimmed;
      }
      // Wrap plain text in paragraph
      return `<p class="my-3 leading-relaxed text-slate-700 dark:text-slate-300">${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  return html;
}

const SAMPLE_MARKDOWN = `# Markdown 编辑器使用指南

欢迎使用 **Markdown 编辑器*！这是一个支持实时预览的在线 Markdown 编辑工具

## 基本语法

### 文本格式

你可以使用**粗体**和斜体*、~~删除线~~等格式

### 列表

无序列表
- 第一项
- 第二项
  - 嵌套项
- 第三项

有序列表
1. 第一项
2. 第二项
3. 第三项

### 引用

> 这是一段引用文字
> 可以包含多行内容

### 代码

行内代码：\`const greeting = "Hello World"\`

代码块：
\`\`\`
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

### 链接和图片

[访问 GitHub](https://github.com)

### 分割线

---

## 更多功能

点击工具栏的按钮可以快速
1. **复制 HTML** - 将渲染后的HTML 代码复制到剪贴板
2. **清空** - 清空编辑区内容
3. **示例模板** - 加载示例 Markdown 文本

享受写作吧！
`;

export default function MarkdownPage() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">("split");

  const html = useMemo(() => parseMarkdown(markdown), [markdown]);

  const handleCopyHtml = useCallback(async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("复制失败", e);
    }
  }, [html]);

  const handleClear = useCallback(() => {
    setMarkdown("");
  }, []);

  const handleLoadSample = useCallback(() => {
    setMarkdown(SAMPLE_MARKDOWN);
  }, []);

  return (
    <ToolLayout
      title="Markdown 编辑器"
      description="实时预览Markdown，支持导出HTML，所见即所得的编辑体验"
      icon={FileText}
      category="文本工具"
      slug="markdown"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("edit")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === "edit"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === "split"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Code className="w-4 h-4" />
              分屏
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === "preview"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Eye className="w-4 h-4" />
              预览
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <FileText className="w-4 h-4" />
              示例模板
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
            <button
              onClick={handleCopyHtml}
              disabled={!html}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制 HTML
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor and Preview */}
        <div
          className={`grid gap-0 ${
            viewMode === "split"
              ? "grid-cols-1 lg:grid-cols-2 lg:divide-x divide-zinc-200 dark:divide-zinc-800"
              : "grid-cols-1"
          }`}
        >
          {/* Editor */}
          {(viewMode === "edit" || viewMode === "split") && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Markdown 编辑
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-500">
                  {markdown.length} 字符
                </span>
              </div>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                placeholder="在此输入 Markdown 文本..."
                spellCheck={false}
                className="w-full min-h-[500px] h-[calc(100vh-320px)] max-h-[700px] p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all code-editor"
              />
            </div>
          )}

          {/* Preview */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  实时预览
                </label>
              </div>
              <div
                className="w-full min-h-[500px] h-[calc(100vh-320px)] max-h-[700px] p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto markdown-preview"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          支持常用Markdown 语法
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-indigo-700 dark:text-indigo-400">
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              # H1 ~ ###### H6
            </span>{" "}
            标题
          </div>
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              **粗体** *斜体*
            </span>{" "}
            文本格式
          </div>
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              - / 1.
            </span>{" "}
            有序/无序列表
          </div>
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              [text](url)
            </span>{" "}
            链接
          </div>
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              `code` / ```
            </span>{" "}
            代码
          </div>
          <div>
            <span className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1.5 py-0.5 rounded">
              &gt; 引用
            </span>{" "}
            引用
          </div>
        </div>
        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3">
          所有渲染都在浏览器本地完成，您的数据不会上传到服务器。
        </p>
      </div>
    </ToolLayout>
  );
}
