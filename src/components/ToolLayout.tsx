"use client";

import Link from "next/link";
import {
  ChevronRight,
  Share2,
  Home,
  Grid3X3,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Bookmark,
  ExternalLink,
  Tag,
  ShieldAlert,
  Heart,
  Coffee,
  X,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { getCategorySlugByName, getPopularTools, getToolsByCategory, getAllTools, getToolTags, getToolBySlug, popularTags } from "@/lib/tools";
import ToolCard from "./ToolCard";
import ToolSEOContent from "./ToolSEOContent";
import { getOrCreateToolSeoContent } from "@/data/toolSeoContent";
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
  const [saved, setSaved] = useState(false);
  const [isRewardOpen, setIsRewardOpen] = useState(false);

  const SITE_URL = "https://99gongju.online";

  const categoryProductMap: Record<string, string> = {
    "开发工具": "开发",
    "设计工具": "设计",
    "文本工具": "效率",
    "实用工具": "效率",
    "图片工具": "设计",
    "计算工具": "效率",
    "转换工具": "效率",
    "生活工具": "效率",
    "生成工具": "AI工具",
  };

  const productCategory = category ? categoryProductMap[category] || "AI工具" : "AI工具";
  const recommendedProducts = getProductsByCategory(productCategory).slice(0, 2);
  const effectiveToolId = toolId || slug;
  const seoContent = effectiveToolId ? getOrCreateToolSeoContent(effectiveToolId) : undefined;

  const relatedTools = category
    ? getToolsByCategory(category).filter((t) => t.id !== slug).slice(0, 8)
    : [];

  const popularTools = getPopularTools().slice(0, 5);

  // 上一篇/下一篇导航
  const allTools = getAllTools();
  const currentIndex = allTools.findIndex((t) => t.id === slug);
  const prevTool = currentIndex > 0 ? allTools[currentIndex - 1] : null;
  const nextTool = currentIndex < allTools.length - 1 ? allTools[currentIndex + 1] : null;

  // 当前工具的标签
  const currentTool = slug ? getToolBySlug(slug) : undefined;
  const toolTags = currentTool ? getToolTags(currentTool) : [];

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

  const toolPageUrl = `${SITE_URL}/tools/${slug || ""}`;
  const categoryPageUrl = category ? `${SITE_URL}/category/${getCategorySlugByName(category)}` : "";

  const breadcrumbItems = [
    { name: "首页", url: SITE_URL },
    { name: "全部工具", url: `${SITE_URL}/#tools` },
  ];
  if (category) {
    breadcrumbItems.push({
      name: category,
      url: categoryPageUrl,
    });
  }
  breadcrumbItems.push({
    name: title,
    url: toolPageUrl,
  });

  return (
    <>
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />

      {seoContent && (
        <>
          <BreadcrumbListSchema items={breadcrumbItems} />
          <SoftwareApplicationSchema
            name={title}
            description={seoContent.metaDescription || description}
            url={toolPageUrl}
            applicationCategory="UtilityApplication"
            operatingSystem="Web"
            offers={{ price: "0", priceCurrency: "CNY" }}
            features={seoContent.features}
          />
          <FAQPageSchema
            faqs={seoContent.faqs.map((f) => ({
              question: f.question,
              answer: f.answer,
            }))}
          />
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

      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb - 99工具 minimal */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  首页
                </Link>
              </li>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  全部工具
                </Link>
              </li>
              {category && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-700" />
                  <li>
                    <Link
                      href={`/category/${getCategorySlugByName(category)}`}
                      className="text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <li>
                <span className="text-slate-300 font-medium truncate max-w-[200px]">
                  {title}
                </span>
              </li>
            </ol>
          </nav>

          {/* Tool Header - 99工具 style */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
              <div className="flex items-start gap-5">
                {Icon && (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-xl shadow-primary-500/25 flex-shrink-0">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  {/* Category tags */}
                  <div className="flex items-center gap-2 mb-2.5">
                    {category && (
                      <Link
                        href={`/category/${getCategorySlugByName(category)}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-primary-400 bg-primary-500/10 rounded-md hover:bg-primary-500/20 transition-colors"
                      >
                        #{category}
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-md">
                      <CheckCircle className="w-3 h-3" />
                      免费
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-white mb-2 tracking-tight leading-[1.2]">
                    {title}
                  </h1>
                  <p className="text-sm sm:text-[15px] text-slate-400 max-w-2xl leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>

              {/* Action buttons - 99工具 style */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${
                    saved
                      ? "text-primary-400 bg-primary-500/10 border-primary-500/30"
                      : "text-slate-400 bg-[#18181b] border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                  }`}
                  aria-label="收藏"
                >
                  <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 h-10 px-4 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-all"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
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
          </div>

          {/* Main Content + Sidebar */}
          <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-6">
            {/* Main Content */}
            <div className="space-y-6">
              {/* 温馨提示 */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-amber-400/90 font-medium mb-1.5">
                      💡 使用前请务必备份文件
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">
                      本工具输出由计算机算法自动生成，因网络故障、算法差异等原因，不保证结果完全符合预期。使用前请备份原始文件，修改后的文件可能无法恢复。因使用本工具导致的任何问题请自行承担，确认无误后再使用，且不得用于任何非法用途。
                    </p>
                    <Link
                      href="/disclaimer"
                      className="inline-flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
                    >
                      查看完整法律免责声明
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tool Content Card */}
              <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
                {children}
              </div>

              {/* 标签云 - SEO内链 */}
              {(toolTags.length > 0 || popularTags.length > 0) && (
                <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white">相关标签</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {toolTags.length > 0 &&
                      popularTags
                        .filter((t) => toolTags.includes(t.slug))
                        .map((tag) => (
                          <Link
                            key={tag.slug}
                            href={`/tag/${tag.slug}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-primary-400 bg-primary-500/10 rounded-md hover:bg-primary-500/20 transition-colors"
                          >
                            #{tag.name}
                          </Link>
                        ))}
                    {/* 热门标签补充 */}
                    {popularTags
                      .filter((t) => !toolTags.includes(t.slug))
                      .slice(0, 8)
                      .map((tag) => (
                        <Link
                          key={tag.slug}
                          href={`/tag/${tag.slug}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-400 bg-[#27272a] rounded-md hover:text-white hover:bg-[#3f3f46] transition-colors"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                  </div>
                </div>
              )}

              {/* 打赏支持 */}
              <div className="bg-gradient-to-br from-emerald-500/10 via-[#18181b] to-emerald-500/5 rounded-2xl border border-emerald-500/20 p-5 sm:p-6 overflow-hidden relative">
                {/* 装饰 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                  {/* 左侧文案 */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-2 justify-center sm:justify-start">
                      <Coffee className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-white">
                        觉得好用？请我喝杯咖啡 ☕
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      99在线工具坚持免费无广告，你的打赏是我持续维护更新的动力。
                      觉得好用欢迎收藏本站，分享给更多朋友~
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 justify-center sm:justify-start">
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5" />
                        收藏本站
                      </span>
                      <span className="w-px h-3 bg-[#27272a]" />
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        感谢打赏
                      </span>
                    </div>
                  </div>

                  {/* 右侧收款码 */}
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => setIsRewardOpen(true)}
                      className="block group relative bg-white rounded-xl p-3 shadow-xl shadow-emerald-500/10 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                      aria-label="点击放大二维码"
                    >
                      <div className="w-36 h-36 bg-[#f5f5f5] rounded-lg overflow-hidden relative">
                        <img
                          src="/wechat-pay.jpg"
                          alt="微信打赏"
                          className="w-full h-full object-cover"
                        />
                        {/* 悬停遮罩提示 */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                            <ZoomIn className="w-6 h-6 text-white" />
                            <span className="text-[10px] text-white font-medium">点击放大</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs text-slate-600 mt-2 font-medium">
                        微信扫码打赏
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* SEO Content */}
              {seoContent && (
                <ToolSEOContent
                  seoContent={seoContent}
                  currentToolId={toolId}
                  currentToolName={title}
                  currentToolCategory={category}
                />
              )}

              {/* Prev/Next Navigation - 内链SEO */}
              {(prevTool || nextTool) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {prevTool ? (
                    <Link
                      href={`/tools/${prevTool.id}`}
                      className="group flex items-center gap-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a] hover:border-primary-500/30 hover:bg-[#1c1c1f] transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400 rotate-180 group-hover:text-primary-400 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-0.5">上一个工具</div>
                        <div className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                          {prevTool.name}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  {nextTool ? (
                    <Link
                      href={`/tools/${nextTool.id}`}
                      className="group flex items-center justify-end gap-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a] hover:border-primary-500/30 hover:bg-[#1c1c1f] transition-all sm:text-right"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 mb-0.5">下一个工具</div>
                        <div className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                          {nextTool.name}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center flex-shrink-0 group-hover:bg-primary-500/20 transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-400 transition-colors" />
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              )}

              {/* Related Tools - Mobile */}
              {relatedTools.length > 0 && (
                <section className="lg:hidden">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-primary-400" />
                    <h2 className="text-lg font-bold text-white">
                      相关工具
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {relatedTools.slice(0, 4).map((tool) => (
                      <ToolCard
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        icon={tool.icon}
                        name={tool.name}
                        description={tool.description}
                        color={tool.color}
                        size="sm"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block space-y-4">
              {/* Related Tools */}
              {relatedTools.length > 0 && (
                <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white">
                      相关工具
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {relatedTools.slice(0, 5).map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={`/tools/${tool.id}`}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#27272a] transition-colors group"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <ToolIcon className="w-[18px] h-[18px] text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">
                              {tool.name}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
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
              <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-orange-400" />
                  <h3 className="text-sm font-semibold text-white">
                    热门工具
                  </h3>
                </div>
                <div className="space-y-1.5">
                  {popularTools.map((tool, index) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.id}
                        href={`/tools/${tool.id}`}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#27272a] transition-colors group"
                      >
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                          {index + 1}
                        </div>
                        <div
                          className={`w-8 h-8 rounded-md bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <ToolIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate group-hover:text-primary-400 transition-colors">
                            {tool.name}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Recommended Products */}
              {recommendedProducts.length > 0 && (
                <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-accent-400" />
                      <h3 className="text-sm font-semibold text-white">
                        精选推荐
                      </h3>
                    </div>
                    <Link
                      href="/products"
                      className="text-xs text-primary-400 hover:underline font-medium"
                    >
                      更多
                    </Link>
                  </div>
                  <div className="space-y-2.5">
                    {recommendedProducts.map((product) => {
                      const ProductIcon = product.icon;
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          onClick={() => setIsPurchaseOpen(true)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#27272a] transition-colors group border border-[#27272a]"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg bg-gradient-to-br ${product.gradient} flex items-center justify-center flex-shrink-0`}
                          >
                            <ProductIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {product.shortName || product.name}
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-primary-400">
                                ¥{product.price}
                              </span>
                              <span className="text-xs text-slate-600 line-through">
                                ¥{product.originalPrice}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA Card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-600/30 to-accent-600/20 border border-primary-500/20 p-5">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative">
                  <Sparkles className="w-6 h-6 text-primary-300 mb-3" />
                  <h3 className="text-base font-semibold text-white mb-1.5">
                    觉得好用？
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    收藏99在线工具，下次使用更方便
                  </p>
                  <button
                    onClick={handleShare}
                    className="w-full py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm font-medium text-white transition-colors border border-white/10"
                  >
                    分享给朋友
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* 打赏二维码放大弹窗 */}
      {isRewardOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsRewardOpen(false)}
        >
          <div
            className="relative bg-[#18181b] rounded-2xl border border-emerald-500/30 p-6 sm:p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setIsRewardOpen(false)}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-[#27272a] hover:bg-[#3f3f46] text-slate-400 hover:text-white transition-colors"
              aria-label="关闭"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 弹窗内容 */}
            <div className="flex flex-col items-center text-center">
              {/* 标题 */}
              <div className="flex items-center gap-2 mb-3">
                <Coffee className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">微信打赏支持</h3>
              </div>
              <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                感谢使用99在线工具，长按或扫描下方二维码即可打赏 ☕
              </p>

              {/* 大尺寸二维码 */}
              <div className="bg-white rounded-2xl p-4 shadow-xl">
                <div className="w-64 h-64 sm:w-72 sm:h-72 bg-[#f5f5f5] rounded-xl overflow-hidden">
                  <img
                    src="/wechat-pay.jpg"
                    alt="微信打赏二维码"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-center text-sm text-slate-600 mt-3 font-medium">
                  微信扫码打赏
                </p>
              </div>

              {/* 底部提示 */}
              <div className="flex items-center gap-4 mt-5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  收藏本站
                </span>
                <span className="w-px h-3 bg-[#27272a]" />
                <span className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" />
                  感谢支持
                </span>
                <span className="w-px h-3 bg-[#27272a]" />
                <span className="flex items-center gap-1.5">
                  <Coffee className="w-3.5 h-3.5" />
                  免费无广告
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
