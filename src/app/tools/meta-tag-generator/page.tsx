"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileCode, Copy, Check, Code2 } from "lucide-react";

interface MetaConfig {
  title: string;
  description: string;
  keywords: string;
  author: string;
  robots: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  ogType: "website" | "article" | "profile" | "product";
  twitterCard: "summary" | "summary_large_image" | "app" | "player";
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  charset: string;
  viewport: string;
  themeColor: string;
  canonical: string;
  includeOG: boolean;
  includeTwitter: boolean;
  includeBasic: boolean;
}

export default function MetaTagGeneratorPage() {
  const [config, setConfig] = useState<MetaConfig>({
    title: "工具箱 - 在线工具集合",
    description: "一站式在线工具箱，提供图片处理、文本转换、开发工具等多种实用工具",
    keywords: "在线工具,工具箱,图片处理,文本转换,开发工具",
    author: "",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "https://example.com/og-image.png",
    ogUrl: "https://example.com",
    ogType: "website",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: "https://example.com/twitter-image.png",
    charset: "UTF-8",
    viewport: "width=device-width, initial-scale=1.0",
    themeColor: "#09090b",
    canonical: "https://example.com/page",
    includeOG: true,
    includeTwitter: true,
    includeBasic: true,
  });
  const [copied, setCopied] = useState(false);

  const generateMetaTags = useCallback((): string => {
    const tags: string[] = [];

    // Basic meta
    if (config.includeBasic) {
      if (config.charset) {
        tags.push(`<meta charset="${config.charset}">`);
      }
      if (config.viewport) {
        tags.push(`<meta name="viewport" content="${config.viewport}">`);
      }
      if (config.title) {
        tags.push(`<title>${config.title}</title>`);
        tags.push(`<meta name="title" content="${config.title}">`);
      }
      if (config.description) {
        tags.push(`<meta name="description" content="${config.description}">`);
      }
      if (config.keywords) {
        tags.push(`<meta name="keywords" content="${config.keywords}">`);
      }
      if (config.author) {
        tags.push(`<meta name="author" content="${config.author}">`);
      }
      if (config.robots) {
        tags.push(`<meta name="robots" content="${config.robots}">`);
      }
      if (config.themeColor) {
        tags.push(`<meta name="theme-color" content="${config.themeColor}">`);
      }
      if (config.canonical) {
        tags.push(`<link rel="canonical" href="${config.canonical}">`);
      }
    }

    // Open Graph
    if (config.includeOG) {
      const ogTitle = config.ogTitle || config.title;
      const ogDesc = config.ogDescription || config.description;

      tags.push("");
      tags.push("<!-- Open Graph / Facebook -->");
      tags.push(`<meta property="og:type" content="${config.ogType}">`);
      tags.push(`<meta property="og:url" content="${config.ogUrl}">`);
      tags.push(`<meta property="og:title" content="${ogTitle}">`);
      tags.push(`<meta property="og:description" content="${ogDesc}">`);
      tags.push(`<meta property="og:image" content="${config.ogImage}">`);
    }

    // Twitter
    if (config.includeTwitter) {
      const twTitle = config.twitterTitle || config.ogTitle || config.title;
      const twDesc = config.twitterDescription || config.ogDescription || config.description;

      tags.push("");
      tags.push("<!-- Twitter -->");
      tags.push(`<meta property="twitter:card" content="${config.twitterCard}">`);
      tags.push(`<meta property="twitter:url" content="${config.ogUrl}">`);
      tags.push(`<meta property="twitter:title" content="${twTitle}">`);
      tags.push(`<meta property="twitter:description" content="${twDesc}">`);
      tags.push(`<meta property="twitter:image" content="${config.twitterImage}">`);
    }

    return tags.join("\n");
  }, [config]);

  const metaCode = generateMetaTags();

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(metaCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [metaCode]);

  const updateConfig = <K extends keyof MetaConfig>(key: K, value: MetaConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ToolLayout
      title="Meta 标签生成器"
      description="在线生成 HTML Meta 标签，支持 SEO 基础标签、Open Graph、Twitter Card，一键复制代码"
      icon={FileCode}
      category="生成工具"
      slug="meta-tag-generator"
      toolId="meta-tag-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">Meta 标签</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制代码
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 类型切换 */}
        <div className="flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors">
            <input
              type="checkbox"
              checked={config.includeBasic}
              onChange={(e) => updateConfig("includeBasic", e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-violet-500 focus:ring-violet-500/50"
            />
            <span className="text-sm text-slate-300">基础 SEO</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors">
            <input
              type="checkbox"
              checked={config.includeOG}
              onChange={(e) => updateConfig("includeOG", e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-violet-500 focus:ring-violet-500/50"
            />
            <span className="text-sm text-slate-300">Open Graph</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46] rounded-xl transition-colors">
            <input
              type="checkbox"
              checked={config.includeTwitter}
              onChange={(e) => updateConfig("includeTwitter", e.target.checked)}
              className="w-4 h-4 rounded border-[#27272a] bg-[#09090b] text-violet-500 focus:ring-violet-500/50"
            />
            <span className="text-sm text-slate-300">Twitter Card</span>
          </label>
        </div>

        {/* 基础设置 */}
        {config.includeBasic && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 bg-violet-500 rounded-full" />
              基础 SEO 标签
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">页面标题</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => updateConfig("title", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">描述</label>
                <input
                  type="text"
                  value={config.description}
                  onChange={(e) => updateConfig("description", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">关键词（逗号分隔）</label>
                <input
                  type="text"
                  value={config.keywords}
                  onChange={(e) => updateConfig("keywords", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">作者</label>
                <input
                  type="text"
                  value={config.author}
                  onChange={(e) => updateConfig("author", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Robots</label>
                <select
                  value={config.robots}
                  onChange={(e) => updateConfig("robots", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none cursor-pointer"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">主题色</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => updateConfig("themeColor", e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-[#27272a]"
                  />
                  <input
                    type="text"
                    value={config.themeColor}
                    onChange={(e) => updateConfig("themeColor", e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 mb-1.5 block">Canonical URL</label>
                <input
                  type="text"
                  value={config.canonical}
                  onChange={(e) => updateConfig("canonical", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Open Graph */}
        {config.includeOG && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-500 rounded-full" />
              Open Graph
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">OG 类型</label>
                <select
                  value={config.ogType}
                  onChange={(e) => updateConfig("ogType", e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none cursor-pointer"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="profile">profile</option>
                  <option value="product">product</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">OG URL</label>
                <input
                  type="text"
                  value={config.ogUrl}
                  onChange={(e) => updateConfig("ogUrl", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">OG 标题（留空使用页面标题）</label>
                <input
                  type="text"
                  value={config.ogTitle}
                  onChange={(e) => updateConfig("ogTitle", e.target.value)}
                  placeholder="留空自动使用页面标题"
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder-slate-600"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">OG 描述（留空使用页面描述）</label>
                <input
                  type="text"
                  value={config.ogDescription}
                  onChange={(e) => updateConfig("ogDescription", e.target.value)}
                  placeholder="留空自动使用页面描述"
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder-slate-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 mb-1.5 block">OG 图片 URL</label>
                <input
                  type="text"
                  value={config.ogImage}
                  onChange={(e) => updateConfig("ogImage", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Twitter */}
        {config.includeTwitter && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-1 h-4 bg-sky-500 rounded-full" />
              Twitter Card
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Card 类型</label>
                <select
                  value={config.twitterCard}
                  onChange={(e) => updateConfig("twitterCard", e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none cursor-pointer"
                >
                  <option value="summary">summary</option>
                  <option value="summary_large_image">summary_large_image</option>
                  <option value="app">app</option>
                  <option value="player">player</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Twitter 标题</label>
                <input
                  type="text"
                  value={config.twitterTitle}
                  onChange={(e) => updateConfig("twitterTitle", e.target.value)}
                  placeholder="留空自动使用 OG 标题"
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none placeholder-slate-600"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 mb-1.5 block">Twitter 图片 URL</label>
                <input
                  type="text"
                  value={config.twitterImage}
                  onChange={(e) => updateConfig("twitterImage", e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 生成的代码 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            生成的 Meta 标签
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 max-h-96 overflow-auto">
            <pre className="font-mono text-sm text-violet-300 whitespace-pre">
              {metaCode}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• Meta 标签放在 HTML 的 head 部分，用于描述网页信息</li>
          <li>• 标题和描述是 SEO 最重要的两个标签，建议精心撰写</li>
          <li>• Open Graph 标签控制网页在社交媒体分享时的展示效果</li>
          <li>• Twitter Card 专门针对 Twitter/X 平台的分享样式</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
