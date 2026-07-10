import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  Gift,
  Zap,
  Heart,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Unlock,
} from "lucide-react";
import { tools, categories, getToolsByCategory } from "@/lib/tools";
import { BreadcrumbListSchema, FAQPageSchema } from "@/components/SEOSchema";

export const runtime = "edge";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const metadata: Metadata = {
  title: "免费工具 - 完全免费的在线工具 | 99在线工具",
  description:
    "99在线工具提供500+款完全免费的在线工具，无需注册，无需付费，无使用次数限制。包括图片压缩、PDF转换、JSON格式化、二维码生成等，所有功能永久免费，打开即用。",
  keywords: ["免费工具", "免费在线工具", "免费工具箱", "无需注册工具", "在线免费工具", "99在线工具"],
  alternates: { canonical: "/hub/free-tools" },
  openGraph: {
    title: "免费工具 - 完全免费的在线工具 | 99在线工具",
    description:
      "99在线工具提供500+款完全免费的在线工具，无需注册，无需付费，无使用次数限制。包括图片压缩、PDF转换、JSON格式化、二维码生成等，所有功能永久免费，打开即用。",
    url: `${siteUrl}/hub/free-tools`,
    type: "website",
    siteName: "99在线工具",
    locale: "zh_CN",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "免费工具 - 完全免费的在线工具 | 99在线工具",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "免费工具 - 完全免费的在线工具 | 99在线工具",
    description:
      "99在线工具提供500+款完全免费的在线工具，无需注册，无需付费，无使用次数限制。包括图片压缩、PDF转换、JSON格式化、二维码生成等，所有功能永久免费，打开即用。",
    images: [`${siteUrl}/og-image.png`],
  },
};

const faqs = [
  {
    question: "99在线工具的免费工具真的完全免费吗？",
    answer:
      "是的，99在线工具平台上的所有500+款工具完全免费，没有任何隐藏费用。您无需注册账号、无需付费订阅、无需提供支付信息，打开网页即可直接使用所有功能。我们不设使用次数限制，不锁定高级功能，真正做到了完全免费开放。",
  },
  {
    question: "免费工具会有功能限制吗？",
    answer:
      "不会。99在线工具的所有免费工具功能完整，没有功能阉割或限制。每款工具都提供完整的处理能力，不设文件大小限制（取决于您设备的性能），不设使用次数限制，不添加水印。我们认为优质的工具应该人人可用，因此坚持免费且无限制地提供所有功能。",
  },
  {
    question: "免费工具需要注册账号才能使用吗？",
    answer:
      "不需要。99在线工具的所有工具均无需注册账号、无需登录即可直接使用。我们尊重用户的隐私和时间，不设置任何使用门槛。打开工具页面即可立即开始使用，用完即走，高效便捷。您的使用数据也不会被收集用于商业目的。",
  },
  {
    question: "免费工具会植入广告吗？",
    answer:
      "99在线工具平台坚持无广告原则，所有工具页面干净清爽，不会弹出广告窗口，不会在工具界面中植入横幅广告或弹窗。我们希望为用户提供纯粹、高效的工具使用体验，不受广告干扰。如果您觉得工具好用，欢迎分享给朋友或打赏支持我们持续运营。",
  },
  {
    question: "免费工具会一直免费下去吗？",
    answer:
      "会的。免费开放是99在线工具的核心宗旨和长期承诺。我们将持续以免费形式提供所有现有工具和未来新增的工具。平台的运营成本通过用户自愿打赏来覆盖，不会转为付费模式。您可以放心地将99在线工具作为长期使用的工具平台。",
  },
];

export default function FreeToolsPage() {
  const categoryList = categories.filter((c) => c.id !== "all");
  const popularTools = tools.slice(16, 28);

  return (
    <>
      <BreadcrumbListSchema
        items={[
          { name: "首页", url: `${siteUrl}/` },
          { name: "免费工具", url: `${siteUrl}/hub/free-tools` },
        ]}
      />
      <FAQPageSchema faqs={faqs} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/[0.12] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-xs font-medium text-emerald-300 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Gift className="w-3.5 h-3.5" />
              完全免费 · 无需注册
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              免费工具 - 完全免费的在线工具
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              99在线工具提供 {tools.length}+ 款完全免费的在线工具，无需注册，无需付费，无使用次数限制，无广告干扰，打开即用，数据本地处理保护隐私
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/tools"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20"
              >
                浏览全部免费工具
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
              { value: `${tools.length}+`, label: "免费工具", icon: Gift, color: "from-emerald-500 to-teal-500" },
              { value: "0", label: "注册要求", icon: Unlock, color: "from-blue-500 to-cyan-500" },
              { value: "0", label: "广告干扰", icon: Heart, color: "from-rose-500 to-pink-500" },
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

      {/* 热门免费工具 */}
      <section className="pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">热门免费工具</span>
            <span className="text-xs text-slate-500 ml-1">全部免费，无需注册</span>
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
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                      {tool.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">{tool.category}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
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
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">免费工具分类</span>
            <span className="text-xs text-slate-500 ml-1">{categoryList.length}大分类全部免费</span>
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
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-all">
                    <CatIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                      {cat.name}
                    </div>
                    <div className="text-xs text-slate-500">{count} 个免费工具</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO 深度内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
        {/* 什么是免费在线工具 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              什么是免费在线工具
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              免费在线工具是指用户可以无需支付任何费用、无需注册账号即可直接在浏览器中使用的Web工具。这类工具通常由开发者或团队出于公益、推广或技术实践的目的开发运营，为互联网用户提供便捷的工具服务。99在线工具平台正是这样一个免费在线工具集合，收录了 {tools.length}+ 款工具，全部免费开放使用。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              与付费工具或需要注册才能使用的工具不同，真正的免费在线工具应该具备以下特征：第一，无需注册账号，打开网页即可使用；第二，无功能限制，所有功能完整可用，不设使用次数或文件大小限制；第三，无广告干扰，工具界面干净清爽，不会弹窗或植入广告影响使用体验；第四，无隐私风险，用户数据在本地处理，不会被收集或用于商业目的。99在线工具平台严格遵循这些原则，为用户提供真正免费的在线工具服务。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              免费在线工具的存在极大降低了用户使用各类工具的门槛。无论是需要压缩一张图片、转换一个PDF文件、格式化一段代码，还是生成一个二维码、计算一个个税金额，都可以通过免费在线工具轻松完成，而不需要购买专业软件或注册各种服务账号。这种开放共享的理念让互联网工具更加普惠，让每个人都能享受到技术带来的便利。
            </p>
          </div>
        </section>

        {/* 免费工具的优势 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              免费工具的优势
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Unlock, title: "零门槛使用", desc: "无需注册账号，无需填写个人信息，打开网页即可使用所有功能，真正零门槛。" },
              { icon: Gift, title: "完全免费", desc: "所有工具永久免费，不设使用次数限制，不锁定高级功能，无任何隐藏费用。" },
              { icon: ShieldCheck, title: "隐私安全", desc: "数据在浏览器本地处理，不上传服务器，不收集用户信息，全面保护隐私。" },
              { icon: Heart, title: "无广告干扰", desc: "工具页面干净清爽，无弹窗广告，无横幅广告，提供纯粹高效的使用体验。" },
              { icon: Zap, title: "即开即用", desc: "无需下载安装软件，浏览器打开即用，支持电脑和手机，随时随地可用。" },
              { icon: CheckCircle2, title: "功能完整", desc: "每款工具都提供完整功能，不做功能阉割，不添加水印，专业级处理效果。" },
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

        {/* 如何使用免费工具 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              如何使用免费工具
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              使用99在线工具的免费工具非常简单，整个过程不需要任何注册或登录操作。第一步，通过分类浏览或关键词搜索找到您需要的工具。您可以在首页使用搜索框输入工具名称或功能关键词，也可以通过14大分类导航浏览找到目标工具。每种方式都能快速定位到您需要的免费工具。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第二步，点击工具卡片进入工具页面。每个工具页面都有清晰的使用说明和输入区域，界面简洁直观。根据工具类型，您可能需要在输入框中填写文本内容、上传文件、设置参数等。工具页面的操作指引会告诉您具体需要做什么，即使第一次使用也能轻松上手。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第三步，点击执行按钮，工具会自动处理您的输入并实时显示结果。处理完成后，您可以一键复制结果到剪贴板，或下载导出处理后的文件。整个过程在浏览器本地完成，不涉及服务器上传，既快速又安全。用完工具后无需做任何清理操作，直接关闭页面或切换到其他工具即可。所有 {tools.length}+ 款工具都是同样的简单流程，免费且无限制使用。
            </p>
          </div>
        </section>

        {/* 99在线工具的免费承诺 */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-emerald-200 dark:border-emerald-800/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              99在线工具的免费承诺
            </h2>
          </div>
          <div className="space-y-4 mb-8">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              99在线工具（99gongju.online）郑重承诺：平台上的所有 {tools.length}+ 款在线工具永久免费开放，不会转为付费模式，不会设置使用门槛。我们相信优质的工具应该人人可用，互联网的精神在于开放和共享。因此，从平台创立之初，我们就确立了"完全免费、无需注册、无广告干扰"的运营原则，并会始终坚持这一原则。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              我们的免费承诺具体体现在以下几个方面：第一，所有工具功能完整免费，不设基础版和高级版之分，不存在需要付费才能解锁的功能；第二，无需注册账号，不需要您提供邮箱、手机号等个人信息，打开网页就能使用；第三，无使用次数限制，您可以无限次使用任何工具，不会出现"今日免费额度已用完"的提示；第四，不在工具中植入广告，保持页面干净清爽；第五，处理结果不添加水印，导出文件保持原始质量。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              平台的运营成本通过用户自愿打赏来覆盖，我们不强制收费，也不以限制功能来倒逼用户付费。如果您觉得工具好用，欢迎通过打赏支持我们持续开发和维护；如果暂时不打赏，也完全不影响您使用所有工具功能。我们将继续秉持免费开放的初心，不断新增和优化工具，让99在线工具成为大家值得信赖的免费工具平台。
            </p>
          </div>
          {/* 内链到其他hub页面 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/hub/online-tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-emerald-100 dark:border-emerald-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              在线工具
            </Link>
            <Link href="/hub/tool-directory" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-emerald-100 dark:border-emerald-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
              <BookOpen className="w-3.5 h-3.5" />
              工具大全
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-emerald-100 dark:border-emerald-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all">
              <Gift className="w-3.5 h-3.5" />
              全部工具
            </Link>
          </div>
          {/* 分类内链 */}
          <div className="pt-6 border-t border-emerald-100 dark:border-emerald-900/20">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">免费工具分类</h3>
            <div className="flex flex-wrap gap-2">
              {categoryList.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/60 dark:bg-zinc-900/30 border border-emerald-100/50 dark:border-emerald-900/15 text-xs text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
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
              免费工具常见问题
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-600/50 transition-colors"
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
        <section className="bg-gradient-to-br from-emerald-600/20 via-emerald-500/10 to-teal-500/20 border border-emerald-500/20 rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
            开始使用免费工具
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            {tools.length}+ 款免费在线工具，无需注册，无广告，打开即用
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all"
            >
              浏览全部免费工具
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
