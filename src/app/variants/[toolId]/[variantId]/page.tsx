import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { toolVariants, getVariant } from "@/lib/tool-variants";
import { getToolBySlug } from "@/lib/tools";
import {
  ChevronRight,
  Home,
  Wrench,
  ExternalLink,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import {
  BreadcrumbListSchema,
  FAQPageSchema,
  SoftwareApplicationSchema,
} from "@/components/SEOSchema";

// Only allow pre-generated params, return 404 for unknown variants
export const dynamicParams = false;

interface VariantPageProps {
  params: Promise<{ toolId: string; variantId: string }>;
}

// Generate static paths for all tool variants
export function generateStaticParams() {
  return toolVariants.map((variant) => ({
    toolId: variant.toolId,
    variantId: variant.variantId,
  }));
}

// Generate SEO metadata for each variant page
export async function generateMetadata({
  params,
}: VariantPageProps): Promise<Metadata> {
  const { toolId, variantId } = await params;
  const variant = getVariant(toolId, variantId);

  if (!variant) {
    return {
      title: "页面未找到",
      description: "抱歉，您访问的页面不存在。",
    };
  }

  return {
    title: variant.title,
    description: variant.description,
    keywords: variant.keywords,
    openGraph: {
      title: variant.title,
      description: variant.description,
      type: "website",
      locale: "zh_CN",
    },
    twitter: {
      card: "summary_large_image",
      title: variant.title,
      description: variant.description,
    },
    alternates: {
      canonical: `/variants/${toolId}/${variantId}`,
    },
  };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export default async function VariantPage({ params }: VariantPageProps) {
  const { toolId, variantId } = await params;
  const variant = getVariant(toolId, variantId);

  if (!variant) {
    notFound();
  }

  const tool = getToolBySlug(toolId);
  const embedUrl = `${siteUrl}/tools/${toolId}?embed=1`;
  const variantUrl = `${siteUrl}/variants/${toolId}/${variantId}`;

  const breadcrumbs = [
    { name: "首页", url: siteUrl },
    ...(tool
      ? [{ name: tool.name, url: `${siteUrl}${tool.path}` }]
      : []),
    { name: variant.title, url: variantUrl },
  ];

  // Get other variants of the same tool for cross-linking
  const otherVariants = toolVariants.filter(
    (v) => v.toolId === toolId && v.variantId !== variantId
  );

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Structured data: BreadcrumbList + FAQPage + SoftwareApplication */}
      <BreadcrumbListSchema items={breadcrumbs} />
      <FAQPageSchema faqs={variant.faqs} />
      {tool && (
        <SoftwareApplicationSchema
          name={variant.title}
          description={variant.description}
          url={variantUrl}
          applicationCategory="UtilitiesApplication"
        />
      )}

      {/* Header Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-8 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              首页
            </Link>
            {tool && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <Link
                  href={tool.path}
                  className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
                >
                  {tool.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
              {variant.title}
            </span>
          </nav>

          {/* Title and description */}
          <div className="flex items-start gap-4 mb-6">
            {tool && (
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0`}
              >
                <tool.icon className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mb-3 leading-tight">
                {variant.title}
              </h1>
              <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {variant.description}
              </p>
            </div>
          </div>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2">
            {variant.keywords.slice(0, 5).map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tool Embed (iframe) */}
      <section className="py-8 lg:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <Wrench className="w-4 h-4 text-indigo-500" />
                在线工具
              </div>
              {tool && (
                <Link
                  href={tool.path}
                  className="inline-flex items-center gap-1.5 text-sm text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors"
                >
                  在新页面打开
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            {/* Iframe embedding the tool with embed=1 param */}
            <iframe
              src={embedUrl}
              className="w-full"
              style={{ minHeight: "600px", border: "none" }}
              title={variant.title}
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 lg:py-16 bg-white dark:bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-indigo-500" />
            常见问题
          </h2>

          <div className="space-y-4">
            {variant.faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden"
              >
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                  <span className="text-base font-medium text-zinc-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronRight className="w-5 h-5 text-zinc-400 group-open:rotate-90 transition-transform shrink-0" />
                </summary>
                <div className="px-6 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Other Variants */}
      {otherVariants.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">
              相关变体
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherVariants.map((otherVariant) => (
                <Link
                  key={otherVariant.variantId}
                  href={`/variants/${otherVariant.toolId}/${otherVariant.variantId}`}
                  className="group flex items-center gap-4 bg-white dark:bg-zinc-800/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all"
                >
                  {tool && (
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center shrink-0`}
                    >
                      <tool.icon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {otherVariant.title}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-1">
                      {otherVariant.description}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                探索更多计算工具
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                除了{tool?.name || "计算工具"}，我们还提供 500+ 免费在线工具，覆盖多种场景。
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-black/10"
              >
                浏览全部工具
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
