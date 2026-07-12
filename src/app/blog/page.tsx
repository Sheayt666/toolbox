import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight, ChevronRight, Home } from "lucide-react";
import { BreadcrumbListSchema } from "@/components/SEOSchema";
import BlogListClient from "./BlogListClient";

// Edge runtime for static export compatibility
export const runtime = "edge";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const metadata: Metadata = {
  title: "博客 - 实用技巧与深度指南",
  description:
    "分享开发工具、图片处理、密码安全、配色设计等实用技巧和深度指南，帮助你提升工作效率和专业技能。",
  keywords: [
    "博客",
    "工具教程",
    "JSON格式化",
    "图片压缩",
    "二维码生成",
    "密码安全",
    "配色方案",
    "在线工具",
  ],
  openGraph: {
    title: "博客 - 实用技巧与深度指南 | 99在线工具",
    description:
      "分享开发工具、图片处理、密码安全、配色设计等实用技巧和深度指南，帮助你提升工作效率和专业技能。",
    type: "website",
    locale: "zh_CN",
    url: `${siteUrl}/blog`,
  },
  alternates: {
    canonical: "/blog",
  },
};

const breadcrumbs = [
  { name: "首页", url: siteUrl },
  { name: "博客", url: `${siteUrl}/blog` },
];

export default function BlogPage() {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* BreadcrumbList structured data */}
      <BreadcrumbListSchema items={breadcrumbs} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">
              博客
            </span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>博客文章</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
              实用技巧与<span className="gradient-text">深度指南</span>
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              分享开发工具、安全知识、运营技巧和设计经验，帮助你提升工作效率和专业技能。
            </p>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogListClient />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                探索更多实用工具
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                除了博客文章，我们还提供 500+ 免费在线工具，助你提升工作效率。
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
