"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Code, FileText, Download } from "lucide-react";

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  let md = html;

  // Remove script and style tags
  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "### $1\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "#### $1\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "##### $1\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "###### $1\n");

  // Bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");

  // Italic
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // Strikethrough
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, "~~$1~~");
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "~~$1~~");

  // Inline code
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");

  // Code blocks
  md = md.replace(/<pre[^>]*>[\s\S]*?<code[^>]*>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, "```\n$1\n```\n");

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, "![$1]($2)");

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    return content.trim().split("\n").map((line: string) => "> " + line.trim()).join("\n") + "\n";
  });

  // Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/gi, "---\n");

  // Line breaks
  md = md.replace(/<br\s*\/?>/gi, "  \n");

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "$1\n\n");

  // Unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    let items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n");
    return items + "\n";
  });

  // Ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 1;
    let items = content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => {
      return `${index++}. ${item}\n`;
    });
    return items + "\n";
  });

  // Divs and other containers - just remove tags
  md = md.replace(/<div[^>]*>/gi, "");
  md = md.replace(/<\/div>/gi, "\n");
  md = md.replace(/<span[^>]*>/gi, "");
  md = md.replace(/<\/span>/gi, "");

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  const txt = document.createElement("textarea");
  txt.innerHTML = md;
  md = txt.value;

  // Clean up multiple blank lines
  md = md.replace(/\n{3,}/g, "\n\n");
  md = md.trim();

  return md;
}

export default function HtmlToMarkdownPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const handleConvert = useCallback(() => {
    if (!input.trim()) {
      setOutput("");
      return;
    }
    setOutput(htmlToMarkdown(input));
  }, [input]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(`<h1>标题一级</h1>
<p>这是一段<strong>加粗</strong>和<em>斜体</em>的文本。</p>
<h2>列表</h2>
<ul>
  <li>项目一</li>
  <li>项目二</li>
  <li>项目三</li>
</ul>
<h2>代码</h2>
<p>这是<code>行内代码</code>示例。</p>
<pre><code>代码块
多行代码</code></pre>
<h2>链接</h2>
<p><a href="https://example.com">访问网站</a></p>
<blockquote>这是一段引用文字</blockquote>
<hr />
<p><del>删除线</del></p>`);
  }, []);

  return (
    <ToolLayout
      title="HTML 转 Markdown"
      description="在线 HTML 转 Markdown 工具，快速将 HTML 代码转换为 Markdown 文本"
      icon={Code}
      category="开发工具"
      slug="html-to-markdown"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium text-white">HTML → Markdown</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              加载示例
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">HTML 代码</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此输入 HTML 代码..."
            spellCheck={false}
            className="w-full h-[450px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-rose-500/25"
            >
              转换为 Markdown
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">Markdown</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Markdown 结果将显示在这里..."
            spellCheck={false}
            className="w-full h-[450px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制结果
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              disabled={!output}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="下载 Markdown 文件"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持常用 HTML 标签转换：标题、列表、加粗、斜体、代码、链接、图片等</li>
          <li>• 自动处理 HTML 实体解码，还原特殊字符</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
