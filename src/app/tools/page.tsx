import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Sparkles,
  BookOpen,
  Wrench,
  ListOrdered,
  ChevronRight,
  ShieldCheck,
  Zap,
  Gift,
  ArrowRight,
  Info,
  HelpCircle,
} from "lucide-react";
import { tools, categories, getToolsByCategory } from "@/lib/tools";
import { BreadcrumbListSchema, FAQPageSchema } from "@/components/SEOSchema";

export const runtime = "edge";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const metadata: Metadata = {
  title: "在线工具大全 - 500+免费在线工具 | 99在线工具",
  description:
    "99在线工具大全（99gongju.online）提供500+款免费在线工具，包括开发工具、图片工具、PDF工具、文本工具、计算工具等14大分类，无需注册，打开即用，数据本地处理安全可靠。",
  keywords: [
    "在线工具",
    "工具大全",
    "免费工具",
    "在线工具箱",
    "工具集合",
    "99在线工具",
    "实用工具",
    "web工具",
  ],
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "在线工具大全 - 500+免费在线工具 | 99在线工具",
    description:
      "99在线工具大全（99gongju.online）提供500+款免费在线工具，包括开发工具、图片工具、PDF工具、文本工具、计算工具等14大分类，无需注册，打开即用，数据本地处理安全可靠。",
    url: `${siteUrl}/tools`,
    type: "website",
    siteName: "99在线工具",
    locale: "zh_CN",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "在线工具大全 - 99在线工具",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "在线工具大全 - 500+免费在线工具 | 99在线工具",
    description:
      "99在线工具大全（99gongju.online）提供500+款免费在线工具，包括开发工具、图片工具、PDF工具、文本工具、计算工具等14大分类，无需注册，打开即用，数据本地处理安全可靠。",
    images: [`${siteUrl}/og-image.png`],
  },
};

const faqs = [
  {
    question: "99在线工具大全有多少款工具？",
    answer:
      "99在线工具大全目前收录了500+款免费在线工具，覆盖计算工具、文本工具、生成工具、转换工具、设计工具、图片工具、生活工具、开发工具、PDF工具、查询工具、教育学习、金融理财、健康医疗、视频音频共14大分类，并且持续更新中。",
  },
  {
    question: "使用这些在线工具需要注册或付费吗？",
    answer:
      "不需要。99在线工具大全的所有工具完全免费，无需注册账号，无需下载安装，打开浏览器即可直接使用。我们坚持免费开放的宗旨，让每个人都能便捷地使用优质在线工具。",
  },
  {
    question: "我的数据会上传到服务器吗？安全吗？",
    answer:
      "99在线工具大全的绝大多数工具采用浏览器本地处理技术，您的文件和数据不会上传到服务器，处理过程在本地完成，确保隐私安全。建议在处理敏感文件前先备份原始文件。",
  },
  {
    question: "如何在99在线工具大全中快速找到需要的工具？",
    answer:
      "您可以通过以下方式快速找到工具：1）使用首页搜索框输入关键词搜索；2）按分类浏览，点击对应的分类卡片查看该分类下的所有工具；3）通过本页面的全部工具列表按分类查找。所有工具都有清晰的中文名称和描述，方便快速定位。",
  },
  {
    question: "99在线工具大全支持手机使用吗？",
    answer:
      "支持。99在线工具大全采用响应式设计，完美适配手机、平板和电脑等各种设备。大部分工具在手机浏览器中都能正常使用，无需安装任何APP，随时随地打开即用。",
  },
];

export default function ToolsPage() {
  const categoryList = categories.filter((c) => c.id !== "all");

  return (
    <>
      {/* 结构化数据 */}
      <BreadcrumbListSchema
        items={[
          { name: "首页", url: `${siteUrl}/` },
          { name: "工具大全", url: `${siteUrl}/tools` },
        ]}
      />
      <FAQPageSchema faqs={faqs} />

      {/* Hero 区域 */}
      <section className="relative overflow-hidden pt-14 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/[0.12] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-xs font-medium text-primary-300 bg-primary-500/10 rounded-full border border-primary-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              500+ 免费在线工具
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              在线工具大全
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              精选 {tools.length}+ 款实用在线工具，涵盖开发、设计、图片、PDF、文本、计算等 14 大分类，无需注册，打开即用，数据本地处理安全可靠
            </p>

            {/* 搜索引导 */}
            <Link
              href="/?q="
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/20"
            >
              <Search className="w-4 h-4" />
              搜索工具
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 分类导航区 */}
      <section className="pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">分类导航</span>
            <span className="text-xs text-slate-500 ml-1">14大分类，快速定位所需工具</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryList.map((cat) => {
              const CatIcon = cat.icon;
              const count = getToolsByCategory(cat.name).length;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group flex items-center gap-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-accent-500/30 transition-all">
                    <CatIcon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                      {cat.name}
                    </div>
                    <div className="text-xs text-slate-500">{count} 个工具</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 全部工具列表 - 按分类分组 */}
      <section className="pb-16 lg:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <ListOrdered className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">全部工具</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              按分类浏览全部 {tools.length} 个工具
            </h2>
            <p className="text-slate-500 text-sm mt-2">
              覆盖 {categoryList.length} 大分类，每个工具均可免费使用
            </p>
          </div>

          <div className="space-y-8">
            {categoryList.map((cat) => {
              const CatIcon = cat.icon;
              const catTools = getToolsByCategory(cat.name);
              return (
                <div
                  key={cat.id}
                  className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 sm:p-6"
                >
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex items-center gap-2.5 mb-4 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                      <CatIcon className="w-4 h-4 text-primary-400" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-xs text-slate-500">({catTools.length})</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {catTools.map((tool) => {
                      const ToolIcon = tool.icon;
                      return (
                        <Link
                          key={tool.id}
                          href={tool.path}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#09090b]/60 border border-transparent hover:border-[#3f3f46] hover:bg-[#27272a]/40 transition-all group/tool"
                        >
                          <ToolIcon className="w-3.5 h-3.5 text-slate-500 group-hover/tool:text-primary-400 transition-colors flex-shrink-0" />
                          <span className="text-xs text-slate-400 group-hover/tool:text-white transition-colors truncate">
                            {tool.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO 深度内容区 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
        {/* 在线工具大全介绍 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              在线工具大全
            </h2>
          </div>
          <div className="prose prose-zinc dark:prose-invert max-w-none space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg">
              99在线工具大全（99gongju.online）是一个专业的免费在线工具集合平台，致力于为用户提供一站式在线工具服务。目前平台已收录超过 {tools.length} 款实用在线工具，覆盖计算工具、文本工具、生成工具、转换工具、设计工具、图片工具、生活工具、开发工具、PDF工具、查询工具、教育学习、金融理财、健康医疗、视频音频等 14 大分类，满足工作、学习、生活中的各类工具需求。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              作为一款免费的在线工具箱，99在线工具大全所有工具均无需注册、无需下载安装，打开浏览器即可直接使用。无论是程序员需要的 JSON 格式化、正则表达式测试、Base64 编解码等开发工具，还是设计师需要的颜色选择器、渐变生成器、图片压缩等设计工具，亦或是日常办公需要的 PDF 转换、文本处理、格式转换等效率工具，都能在这里找到。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              99在线工具大全采用浏览器本地处理技术，绝大多数工具的数据处理过程在用户的浏览器中完成，不会上传到服务器，全面保护用户隐私和数据安全。这意味着您可以放心地处理敏感文件和数据，无需担心信息泄露。平台持续更新和新增工具，力求打造最全面的在线工具集合，让每一次搜索和使用都能获得满意的体验。无论您是开发者、设计师、学生、办公人员还是普通网民，99在线工具大全都是您不可或缺的得力助手。
            </p>
          </div>
        </section>

        {/* 为什么选择99在线工具 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              为什么选择99在线工具
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">完全免费</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  所有 {tools.length}+ 款工具永久免费，无需注册账号，无需付费解锁，打开即用。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">隐私安全</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  数据本地处理，文件不上传服务器，全面保护您的隐私和敏感信息。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">打开即用</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  无需下载安装任何软件或插件，浏览器打开即可使用，支持手机和电脑。
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">工具齐全</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  14 大分类 {tools.length}+ 款工具持续更新，覆盖开发、设计、办公、生活全场景。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 在线工具使用指南 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              在线工具使用指南
            </h2>
          </div>
          <div className="space-y-6">
            {[
              {
                title: "浏览或搜索工具",
                desc: "您可以通过上方的分类导航浏览工具，也可以点击搜索按钮使用关键词搜索。支持中文工具名、英文关键词和功能描述搜索。",
              },
              {
                title: "选择并打开工具",
                desc: "找到需要的工具后，点击工具名称或卡片即可进入工具页面。每个工具页面都有详细的使用说明和输入区域。",
              },
              {
                title: "输入数据并执行操作",
                desc: "在工具页面的输入框中填入相应内容，或上传需要处理的文件。点击执行按钮，工具将自动处理并实时显示结果。",
              },
              {
                title: "复制或下载结果",
                desc: "处理完成后，您可以一键复制结果到剪贴板，或下载导出处理后的文件。所有操作均在浏览器本地完成，安全高效。",
              },
            ].map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                    {index + 1}
                  </div>
                  {index < 3 && (
                    <div className="w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent mx-auto mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              常见问题
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-colors"
              >
                <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer list-none">
                  <h3 className="text-base sm:text-lg font-medium text-zinc-900 dark:text-white pr-4">
                    {faq.question}
                  </h3>
                  <svg
                    className="w-5 h-5 text-zinc-400 group-open:rotate-180 transition-transform flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-4 sm:px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800">
                  <p className="pt-4 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* 底部SEO内链 */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              探索14大工具分类
            </h2>
          </div>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base mb-6">
            99在线工具大全提供 {tools.length}+ 款免费在线工具，覆盖 14 大分类。点击下方分类名称，探索更多工具：
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categoryList.map((cat) => {
              const CatIcon = cat.icon;
              const count = getToolsByCategory(cat.name).length;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all group"
                >
                  <CatIcon className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {cat.name}
                    </div>
                    <div className="text-xs text-slate-500">{count} 款工具</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
          <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
              99在线工具大全（99gongju.online）提供 {tools.length}+ 款免费在线工具，所有工具免费使用，无需注册，数据本地处理，安全可靠。收藏本站，随时使用更多实用在线工具。
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
