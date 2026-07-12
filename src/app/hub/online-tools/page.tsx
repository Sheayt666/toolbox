import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  Zap,
  Gift,
  Globe,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { tools, categories, getToolsByCategory } from "@/lib/tools";
import { BreadcrumbListSchema, FAQPageSchema } from "@/components/SEOSchema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const metadata: Metadata = {
  title: "在线工具 - 免费在线工具集合 | 99在线工具",
  description:
    "在线工具就上99在线工具（99gongju.online），提供500+款免费在线工具，包括JSON格式化、图片压缩、PDF转换、二维码生成等，无需安装，打开即用。",
  keywords: ["在线工具", "免费在线工具", "web工具", "线上工具", "99在线工具"],
  alternates: { canonical: "/hub/online-tools" },
  openGraph: {
    title: "在线工具 - 免费在线工具集合 | 99在线工具",
    description:
      "在线工具就上99在线工具（99gongju.online），提供500+款免费在线工具，包括JSON格式化、图片压缩、PDF转换、二维码生成等，无需安装，打开即用。",
    url: `${siteUrl}/hub/online-tools`,
    type: "website",
    siteName: "99在线工具",
    locale: "zh_CN",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "在线工具 - 免费在线工具集合 | 99在线工具",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "在线工具 - 免费在线工具集合 | 99在线工具",
    description:
      "在线工具就上99在线工具（99gongju.online），提供500+款免费在线工具，包括JSON格式化、图片压缩、PDF转换、二维码生成等，无需安装，打开即用。",
    images: [`${siteUrl}/og-image.png`],
  },
};

const faqs = [
  {
    question: "什么是在线工具？",
    answer:
      "在线工具是指运行在浏览器中、无需下载安装即可使用的网页版工具。用户只需打开网页链接，就能直接使用各种功能，如格式转换、图片处理、文本编辑、数据计算等。在线工具不占用本地存储空间，跨平台兼容，是现代高效办公和日常生活的得力助手。",
  },
  {
    question: "在线工具和桌面软件有什么区别？",
    answer:
      "在线工具无需下载安装，打开浏览器即可使用，不占用磁盘空间，且自动更新最新版本。桌面软件需要下载安装到本地，可能占用较多系统资源。在线工具跨平台兼容性更好，在Windows、Mac、Linux甚至手机上都能使用，而桌面软件通常需要针对不同平台分别开发。此外，99在线工具的大多数工具在浏览器本地处理数据，隐私安全性同样有保障。",
  },
  {
    question: "在线工具安全吗？会泄露我的数据吗？",
    answer:
      "99在线工具的绝大多数工具采用浏览器本地处理技术，您的文件和数据在本地浏览器中处理完成，不会上传到服务器。这意味着您的数据始终在自己的设备上，不会泄露给第三方。我们建议在处理重要文件前先做好备份，以确保数据安全。",
  },
  {
    question: "在线工具需要联网才能使用吗？",
    answer:
      "首次打开工具页面时需要联网加载，但加载完成后大多数工具可以在离线状态下继续使用（只要不关闭浏览器标签页）。由于数据处理在本地完成，实际使用过程中不依赖网络连接，处理速度取决于您设备的性能。",
  },
  {
    question: "99在线工具平台有多少款在线工具？",
    answer:
      "99在线工具平台目前收录了500+款免费在线工具，覆盖开发工具、图片工具、PDF工具、文本工具、计算工具、设计工具、转换工具、生成工具、查询工具、生活工具、教育学习、金融理财、健康医疗、视频音频等14大分类，并且持续更新中，力求满足各类使用场景需求。",
  },
];

export default function OnlineToolsPage() {
  const categoryList = categories.filter((c) => c.id !== "all");
  const popularTools = tools.slice(0, 12);

  return (
    <>
      <BreadcrumbListSchema
        items={[
          { name: "首页", url: `${siteUrl}/` },
          { name: "在线工具", url: `${siteUrl}/hub/online-tools` },
        ]}
      />
      <FAQPageSchema faqs={faqs} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-500/[0.12] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-xs font-medium text-primary-300 bg-primary-500/10 rounded-full border border-primary-500/20">
              <Globe className="w-3.5 h-3.5" />
              浏览器即开即用
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              在线工具 - 免费在线工具集合
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              99在线工具提供 {tools.length}+ 款免费在线工具，涵盖开发、设计、图片、PDF、文本等 14 大分类，无需安装任何软件，打开浏览器即可使用
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/20"
              >
                浏览全部工具
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-all"
              >
                搜索工具
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据 */}
      <section className="pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: `${tools.length}+`, label: "在线工具", icon: Sparkles, color: "from-primary-500 to-accent-500" },
              { value: "14", label: "工具分类", icon: BookOpen, color: "from-blue-500 to-cyan-500" },
              { value: "100%", label: "永久免费", icon: Gift, color: "from-emerald-500 to-teal-500" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 text-center"
                >
                  <div className={`w-10 h-10 mx-auto rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 热门工具推荐 */}
      <section className="pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">热门在线工具</span>
            <span className="text-xs text-slate-500 ml-1">用户使用频率最高的工具</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {popularTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="group flex items-center gap-3 p-4 bg-[#18181b] rounded-xl border border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{tool.category}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 分类导览 */}
      <section className="pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">分类导览</span>
            <span className="text-xs text-slate-500 ml-1">14大分类全面覆盖</span>
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

      {/* SEO 深度内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
        {/* 什么是在线工具 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              什么是在线工具
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              在线工具是指基于Web技术开发的、运行在浏览器中的实用工具程序。与传统桌面软件不同，在线工具无需下载安装到本地计算机，用户只需通过浏览器访问对应的网页地址，即可直接使用工具提供的各项功能。在线工具涵盖了格式转换、数据处理、图片编辑、文本处理、代码开发、计算查询等多种类型，已经成为现代互联网用户日常工作和生活中不可或缺的效率工具。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              随着Web技术的不断发展，现代在线工具的功能已经非常强大，许多原本需要专业软件才能完成的任务，现在通过浏览器中的在线工具就能轻松实现。例如图片压缩、PDF转换、音频处理、视频编辑等，都可以在不安装任何软件的情况下在线完成。99在线工具平台正是基于这一趋势，为用户精心收录了 {tools.length}+ 款实用的在线工具，覆盖14大分类，满足不同场景的使用需求。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              在线工具的核心优势在于便捷性和可及性。无论您使用的是Windows电脑、Mac笔记本、Linux系统，还是手机和平板设备，只要有浏览器就能使用在线工具。这种跨平台特性使得在线工具成为处理临时任务的理想选择——不需要为了偶尔使用一次的功能去下载安装一个完整的软件，打开网页即可完成操作，用完即走，高效便捷。
            </p>
          </div>
        </section>

        {/* 在线工具的优势 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              在线工具的优势
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Zap, title: "即开即用，无需安装", desc: "在线工具最大的优势是无需下载安装，打开浏览器输入网址即可使用，不占用磁盘空间，不修改系统配置。" },
              { icon: Globe, title: "跨平台兼容", desc: "无论是Windows、Mac、Linux还是移动设备，只要有浏览器就能使用，真正做到一次开发到处运行。" },
              { icon: ShieldCheck, title: "数据安全隐私", desc: "99在线工具的大多数工具在浏览器本地处理数据，文件不上传服务器，确保您的隐私和敏感信息安全。" },
              { icon: Gift, title: "免费使用无门槛", desc: "所有在线工具完全免费，无需注册账号，没有使用次数限制，没有功能锁定，真正开放共享。" },
              { icon: CheckCircle2, title: "自动更新无感", desc: "在线工具的更新在服务器端完成，用户每次访问的都是最新版本，无需手动下载更新包。" },
              { icon: BookOpen, title: "工具种类丰富", desc: "从开发工具到生活工具，从图片处理到PDF转换，500+款工具覆盖工作生活的方方面面。" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 如何选择在线工具 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              如何选择在线工具
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              面对互联网上众多的在线工具，如何选择靠谱好用的工具是一个重要问题。首先，要关注工具的数据安全性。优质的在线工具应该采用浏览器本地处理技术，用户数据不上传服务器，这样能最大程度保护隐私。99在线工具平台的所有工具都遵循这一原则，确保您的文件和数据安全。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              其次，要考虑工具的易用性和功能性。好的在线工具应该界面简洁、操作直观，同时功能完善、处理效果出色。99在线工具为每款工具都配备了详细的使用说明，工具界面设计简洁明了，即使是非技术人员也能轻松上手。此外，工具的处理速度和稳定性也是重要考量因素，我们的工具基于现代Web技术构建，运行流畅稳定。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              最后，建议选择工具集合型平台而非零散的单个工具网站。99在线工具平台收录了 {tools.length}+ 款工具，覆盖14大分类，您可以在一个平台上找到几乎所有需要的在线工具，无需在多个网站之间来回切换。统一的界面风格和一致的操作体验，也让使用过程更加顺畅高效。收藏99在线工具，随时随地享受便捷的在线工具服务。
            </p>
          </div>
        </section>

        {/* 99在线工具的特色 */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              99在线工具的特色
            </h2>
          </div>
          <div className="space-y-4 mb-8">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              99在线工具（99gongju.online）是一个专注于提供优质在线工具的免费平台。我们的特色在于工具种类齐全、使用体验流畅、数据安全有保障。平台收录的 {tools.length}+ 款在线工具覆盖了从开发编程到日常生活的各个领域，无论您是程序员、设计师、学生还是办公人员，都能在这里找到所需的工具。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              与其他在线工具网站相比，99在线工具有三大核心优势：第一，完全免费且无广告干扰，我们坚持开放共享的理念，所有工具免费使用，不设任何门槛；第二，数据本地处理，绝大多数工具的计算和处理在浏览器中完成，用户文件不上传服务器，隐私安全有保障；第三，持续更新迭代，我们不断新增实用工具并优化现有功能，确保平台始终保持活力和竞争力。
            </p>
          </div>
          {/* 内链到其他hub页面 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/hub/tool-directory" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <BookOpen className="w-3.5 h-3.5" />
              工具大全
            </Link>
            <Link href="/hub/free-tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <Gift className="w-3.5 h-3.5" />
              免费工具
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              全部工具
            </Link>
          </div>
          {/* 分类内链 */}
          <div className="pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">热门分类</h3>
            <div className="flex flex-wrap gap-2">
              {categoryList.slice(0, 7).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/60 dark:bg-zinc-900/30 border border-indigo-100/50 dark:border-indigo-900/15 text-xs text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              在线工具常见问题
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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

        {/* 底部CTA */}
        <section className="bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-accent-500/20 border border-primary-500/20 rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            开始使用在线工具
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            {tools.length}+ 款免费在线工具等你探索，无需注册，打开即用
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
            >
              浏览全部工具
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-all"
            >
              返回首页
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
