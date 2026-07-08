"use client";

import Link from "next/link";
import {
  ChevronRight,
  Share2,
  ShoppingBag,
  Home,
  Grid3X3,
  Sparkles,
  Star,
  TrendingUp,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { tools, getCategorySlugByName } from "@/lib/tools";
import ToolCard from "./ToolCard";
import ToolSEOContent from "./ToolSEOContent";
import { getToolSeoContent } from "@/data/toolSeoContent";
import {
  BreadcrumbListSchema,
  SoftwareApplicationSchema,
  FAQPageSchema,
  HowToSchema,
} from "./SEOSchema";
import { getProductsByCategory } from "@/lib/products";
import PurchaseModal from "./PurchaseModal";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  icon?: LucideIcon;
  category?: string;
  slug?: string;
  toolId?: string;
}

export default function ToolLayout({
  children,
  title,
  description,
  icon: Icon,
  category,
  slug,
  toolId,
}: ToolLayoutProps) {
  const [copied, setCopied] = useState(false);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  // Map tool categories to product categories
  const categoryProductMap: Record<string, string> = {
    "开发工具": "开发",
    "设计工具": "设计",
    "文本工具": "效率",
    "实用工具": "效率",
  };

  // Get recommended products based on tool category
  const productCategory = category ? categoryProductMap[category] || "AI工具" : "AI工具";
  const recommendedProducts = getProductsByCategory(productCategory).slice(0, 2);

  // Get SEO content if toolId is provided
  const seoContent = toolId ? getToolSeoContent(toolId) : undefined;

  // Get related tools (use SEO content's related tools if available, otherwise fallback to same category)
  const relatedTools = seoContent
    ? seoContent.relatedTools
        .map((id) => tools.find((t) => t.id === id))
        .filter(Boolean)
        .slice(0, 6)
    : tools
        .filter((t) => t.category === category && t.id !== slug)
        .slice(0, 4);

  // Popular tools for sidebar
  const popularTools = tools.slice(0, 4);

  const handleShare = async () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: description,
        url: window.location.href,
      });
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  };

  // Build breadcrumb items for schema
  const breadcrumbItems = [
    { name: "首页", url: typeof window !== "undefined" ? window.location.origin : "" },
    { name: "全部工具", url: typeof window !== "undefined" ? `${window.location.origin}/#tools` : "" },
  ];
  if (category) {
    breadcrumbItems.push({ name: category, url: typeof window !== "undefined" ? `${window.location.origin}/category/${getCategorySlugByName(category)}` : "" });
  }
  breadcrumbItems.push({
    name: title,
    url: typeof window !== "undefined" ? window.location.href : "",
  });

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />
      {/* Structured Data / Schema Markup */}
      {seoContent && (
        <>
          <BreadcrumbListSchema items={breadcrumbItems} />
          <SoftwareApplicationSchema
            name={title}
            description={seoContent.metaDescription || description}
            url={currentUrl}
            applicationCategory="UtilityApplication"
            operatingSystem="Web"
            offers={{ price: "0", priceCurrency: "CNY" }}
            features={seoContent.features}
          />
          <FAQPageSchema faqs={seoContent.faqs.map((f) => ({
            question: f.question,
            answer: f.answer,
          }))} />
          <HowToSchema
            name={`${title}使用教程`}
            description={`如何使用${title}，详细步骤说明`}
            steps={seoContent.howToSteps.map((s, i) => ({
              name: s.step,
              text: s.description,
              position: i + 1,
            }))}
            totalTime={`PT${seoContent.howToSteps.length * 2}M`}
          />
        </>
      )}

      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  首页
                </Link>
              </li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <li>
                <Link
                  href="/#tools"
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  全部工具
                </Link>
              </li>
              {category && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
                  <li>
                    <Link
                      href={`/category/${getCategorySlugByName(category)}`}
                      className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <li>
                <span className="text-slate-900 dark:text-white font-medium truncate max-w-[200px]">
                  {title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Tool Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                {Icon && (
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25 flex-shrink-0">
                    <Icon className="w-7 h-7 lg:w-8 lg:h-8 text-white" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {category && (
                      <Link
                        href={`/category/${getCategorySlugByName(category)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
                      >
                        {category}
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                      <CheckCircle className="w-3 h-3" />
                      免费
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {title}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    分享
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Main Content + Sidebar Layout */}
          <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Tool Content - Above the fold */}
              <div className="animate-fade-in">
                {children}
              </div>

              {/* SEO Rich Content Section (tool-specific) */}
              {seoContent && <ToolSEOContent seoContent={seoContent} />}

              {/* Related Tools - Mobile shows here, desktop in sidebar */}
              {relatedTools.length > 0 && (
                <section className="lg:hidden">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-primary-500" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      相关工具
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedTools.map((tool) => {
                      if (!tool) return null;
                      return (
                        <ToolCard
                          key={tool.id}
                          id={tool.id}
                          name={tool.name}
                          description={tool.description}
                          path={tool.path}
                          icon={tool.icon}
                          color={tool.color}
                          size="sm"
                        />
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Desktop only */}
            <aside className="hidden lg:block space-y-6">
              {/* Related Tools */}
              {relatedTools.length > 0 && (
                <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      相关工具
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {relatedTools.map((tool) => {
                      if (!tool) return null;
                      const ToolIcon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.path}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <ToolIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {tool.name}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {tool.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Popular Tools */}
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    热门工具
                  </h3>
                </div>
                <div className="space-y-3">
                  {popularTools.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.id}
                        href={tool.path}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                          <ToolIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {tool.name}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Products */}
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      推荐产品
                    </h3>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    更多
                  </Link>
                </div>
                <div className="space-y-3">
                  {recommendedProducts.map((product) => {
                    const ProductIcon = product.icon;
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <ProductIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {product.shortName || product.name}
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                              ¥{product.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ¥{product.originalPrice}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Ad/CTA Placeholder */}
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <Star className="w-6 h-6 mb-3" />
                  <h3 className="text-lg font-bold mb-2">收藏工具箱</h3>
                  <p className="text-sm text-primary-100 mb-4">
                    按 Ctrl+D 收藏本站，下次使用更方便
                  </p>
                  <button
                    onClick={handleShare}
                    className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors border border-white/20"
                  >
                    分享给朋友
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
