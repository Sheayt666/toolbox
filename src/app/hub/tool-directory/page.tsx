import type { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  BookOpen,
  Info,
  ShieldCheck,
  Layers,
  Grid3X3,
  Gift,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Wrench,
} from "lucide-react";
import { tools, categories, getToolsByCategory } from "@/lib/tools";
import { BreadcrumbListSchema, FAQPageSchema } from "@/components/SEOSchema";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const metadata: Metadata = {
  title: "工具大全 - 500+在线工具集合 | 99在线工具",
  description:
    "99在线工具大全（99gongju.online）收录500+款在线工具，涵盖开发、图片、PDF、文本、计算、设计等14大分类，工具齐全，分类清晰，免费使用，是您首选的在线工具大全平台。",
  keywords: ["工具大全", "在线工具大全", "工具集合", "工具箱", "实用工具大全", "99在线工具"],
  alternates: { canonical: "/hub/tool-directory" },
  openGraph: {
    title: "工具大全 - 500+在线工具集合 | 99在线工具",
    description:
      "99在线工具大全（99gongju.online）收录500+款在线工具，涵盖开发、图片、PDF、文本、计算、设计等14大分类，工具齐全，分类清晰，免费使用，是您首选的在线工具大全平台。",
    url: `${siteUrl}/hub/tool-directory`,
    type: "website",
    siteName: "99在线工具",
    locale: "zh_CN",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "工具大全 - 500+在线工具集合 | 99在线工具",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "工具大全 - 500+在线工具集合 | 99在线工具",
    description:
      "99在线工具大全（99gongju.online）收录500+款在线工具，涵盖开发、图片、PDF、文本、计算、设计等14大分类，工具齐全，分类清晰，免费使用，是您首选的在线工具大全平台。",
    images: [`${siteUrl}/og-image.png`],
  },
};

const faqs = [
  {
    question: "99在线工具大全包含哪些分类？",
    answer:
      "99在线工具大全包含14大分类：计算工具、文本工具、生成工具、转换工具、设计工具、图片工具、生活工具、开发工具、PDF工具、查询工具、教育学习、金融理财、健康医疗、视频音频。每个分类下都有数十款精选工具，全面覆盖工作、学习和生活场景。",
  },
  {
    question: "工具大全中的工具是免费使用的吗？",
    answer:
      "是的，99在线工具大全中的所有500+款工具完全免费，无需注册账号，无需付费解锁任何功能。我们坚持免费开放的宗旨，致力于为用户提供最全面的免费工具集合。",
  },
  {
    question: "工具大全会持续更新吗？",
    answer:
      "会的。99在线工具大全会持续新增实用工具和优化现有功能。我们关注用户需求和技术趋势，定期添加新的工具分类和工具类型，力求打造最全面、最实用的在线工具大全平台。您可以收藏本站，随时发现新工具。",
  },
  {
    question: "如何在工具大全中快速找到需要的工具？",
    answer:
      "您可以通过三种方式快速定位工具：1）使用首页搜索框，输入工具名称或功能关键词搜索；2）按14大分类浏览，点击分类卡片查看该分类下所有工具；3）访问工具总览页查看按分类分组的全部工具列表。每种方式都能帮助您高效找到目标工具。",
  },
  {
    question: "工具大全支持哪些设备使用？",
    answer:
      "99在线工具大全采用响应式Web设计，支持所有具备浏览器的设备，包括Windows电脑、Mac、Linux桌面、Android手机、iPhone、平板电脑等。大部分工具在手机上也能流畅使用，无需安装任何APP，随时随地打开即用。",
  },
];

export default function ToolDirectoryPage() {
  const categoryList = categories.filter((c) => c.id !== "all");
  const popularTools = tools.slice(8, 20);

  return (
    <>
      <BreadcrumbListSchema
        items={[
          { name: "首页", url: `${siteUrl}/` },
          { name: "工具大全", url: `${siteUrl}/hub/tool-directory` },
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
              <Grid3X3 className="w-3.5 h-3.5" />
              14大分类 · 工具齐全
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-[1.2]">
              工具大全 - 500+在线工具集合
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mb-8">
              99在线工具大全收录 {tools.length}+ 款实用工具，涵盖开发、图片、PDF、文本、计算、设计等 {categoryList.length} 大分类，分类清晰，工具齐全，一站式满足所有工具需求
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
              { value: `${tools.length}+`, label: "收录工具", icon: Wrench, color: "from-primary-500 to-accent-500" },
              { value: `${categoryList.length}`, label: "工具分类", icon: Layers, color: "from-blue-500 to-cyan-500" },
              { value: "100%", label: "免费开放", icon: Gift, color: "from-emerald-500 to-teal-500" },
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
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">精选工具</span>
            <span className="text-xs text-slate-500 ml-1">工具大全中的优质工具</span>
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

      {/* 分类导览 - 带工具数量 */}
      <section className="pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">分类体系</span>
            <span className="text-xs text-slate-500 ml-1">{categoryList.length}大分类，层次清晰</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryList.map((cat) => {
              const CatIcon = cat.icon;
              const count = getToolsByCategory(cat.name).length;
              const sampleTools = getToolsByCategory(cat.name).slice(0, 3);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group bg-[#18181b] rounded-xl border border-[#27272a] p-5 hover:border-[#3f3f46] hover:bg-[#1c1c1f] transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                      <CatIcon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {cat.name}
                      </div>
                      <div className="text-xs text-slate-500">{count} 款工具</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sampleTools.map((t) => (
                      <span key={t.id} className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-[#09090b]/60">
                        {t.name}
                      </span>
                    ))}
                    {count > 3 && (
                      <span className="text-[10px] text-primary-400 px-1.5 py-0.5">
                        +{count - 3}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO 深度内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20 space-y-10 lg:space-y-14">
        {/* 什么是工具大全 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              什么是工具大全
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              工具大全是指将多种类型的实用工具按照功能分类、系统性地整合在一个平台上的工具集合。与单一功能的工具网站不同，工具大全强调的是工具的全面性和分类的系统性，让用户能够在一个平台内找到所需的各种工具，而无需在多个网站之间来回切换。99在线工具大全正是这样一个一站式工具集合平台，收录了 {tools.length}+ 款实用工具，覆盖14大分类。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              一个优秀的工具大全需要具备三个核心特征：第一是工具数量多、种类全，能够覆盖用户各方面的需求；第二是分类体系科学合理，让用户能够快速定位到目标工具；第三是使用体验统一流畅，所有工具都遵循一致的交互模式，降低学习成本。99在线工具大全在这三个方面都做了精心设计，力求为用户提供最佳的工具使用体验。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              工具大全的价值在于效率提升和便捷体验。当您遇到一个需要处理的任务时，比如压缩一张图片、格式化一段JSON代码、转换一个PDF文件，在工具大全平台上只需几步操作就能完成，而不需要分别搜索不同的工具网站、适应不同的界面和操作方式。统一的平台、一致的体验、丰富的工具，这就是99在线工具大全为您提供的核心价值。
            </p>
          </div>
        </section>

        {/* 工具大全的分类体系 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              工具大全的分类体系
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              99在线工具大全将 {tools.length}+ 款工具科学地划分为14大分类，每个分类都围绕特定的使用场景和功能领域进行组织。计算工具涵盖房贷计算、个税计算、BMI计算等各类数值运算；文本工具提供字符统计、大小写转换、文本去重等文字处理功能；开发工具集合了JSON格式化、正则测试、Base64编解码等程序员常用工具。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              图片工具是工具大全中使用频率最高的分类之一，包括图片压缩、裁剪、格式转换、背景去除等功能；PDF工具涵盖PDF转Word、PDF合并拆分、Excel转PDF等文档处理需求；设计工具为设计师提供颜色选择器、渐变生成器、CSS代码生成等专业工具。此外，转换工具、生成工具、查询工具、生活工具、教育学习、金融理财、健康医疗、视频音频等分类也各有特色，共同构成了完整的工具大全体系。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              这种分类体系的设计原则是：以用户需求为导向，以功能相似性为依据，让每个分类内的工具都具有关联性，方便用户在找到目标工具的同时，也能发现同类型的其他有用工具。例如，当您在开发工具分类中使用JSON格式化工具时，可能还会注意到旁边的正则表达式测试工具和Base64编解码工具，这些都是开发过程中常用的配套工具。
            </p>
          </div>
          {/* 分类内链 */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categoryList.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-sm text-zinc-700 dark:text-zinc-300 hover:border-emerald-300 dark:hover:border-emerald-600/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                {cat.name}
                <span className="text-xs text-slate-500">({getToolsByCategory(cat.name).length})</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 如何使用工具大全 */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              如何使用工具大全
            </h2>
          </div>
          <div className="space-y-4">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              使用99在线工具大全非常简单。第一种方式是按分类浏览：在工具大全页面或首页，您可以看到14个分类卡片，每个卡片显示分类名称和工具数量。点击您感兴趣的分类，即可进入该分类的专属页面，查看分类下的所有工具列表。这种方式适合有明确工具类型需求但不确定具体工具名称的用户。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第二种方式是使用搜索功能：在首页搜索框中输入工具名称或功能关键词，如"图片压缩""JSON格式化""PDF转Word"等，系统会智能匹配相关工具并展示搜索结果。这种方式适合已经知道自己需要什么功能、希望快速定位工具的用户。搜索支持中英文关键词和自然语言描述。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第三种方式是浏览全部工具列表：访问工具总览页面，所有 {tools.length}+ 款工具按分类分组展示，您可以滚动浏览所有工具，发现可能之前不知道但非常有用的工具。这种方式适合想要全面了解平台工具种类的用户，也是发现新工具的好方法。无论使用哪种方式，找到工具后点击即可进入工具页面开始使用，所有工具免费且无需注册。
            </p>
          </div>
        </section>

        {/* 99在线工具大全的特色 */}
        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              99在线工具大全的特色
            </h2>
          </div>
          <div className="space-y-4 mb-8">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              99在线工具大全致力于打造最全面、最实用的在线工具集合平台。我们的第一大特色是工具齐全——{tools.length}+ 款工具覆盖14大分类，从开发编程到日常生活的各类需求都能满足。无论是程序员需要的代码格式化工具，还是普通用户需要的图片压缩工具，亦或是学生需要的教育学习工具，都能在工具大全中找到。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第二大特色是分类科学。我们将工具按功能领域划分为14大分类，每个分类内的工具都具有功能关联性，方便用户按需查找和发现同类工具。分类体系层次清晰，命名直观，即使第一次访问的用户也能快速理解分类含义并找到目标工具。同时，每个分类页面都提供了详细的分类介绍和工具列表，帮助用户全面了解该分类的工具内容。
            </p>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              第三大特色是体验一致。工具大全中所有工具都遵循统一的界面设计语言和交互模式，用户学会了使用一个工具，就能快速上手其他工具。统一的暗色主题设计不仅美观，还能在长时间使用时减轻视觉疲劳。此外，所有工具都免费使用、无需注册、数据本地处理，这些一致的使用体验让工具大全成为一个值得信赖和长期使用的平台。
            </p>
          </div>
          {/* 内链到其他hub页面 */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link href="/hub/online-tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              在线工具
            </Link>
            <Link href="/hub/free-tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <Gift className="w-3.5 h-3.5" />
              免费工具
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
              <Grid3X3 className="w-3.5 h-3.5" />
              全部工具
            </Link>
          </div>
          <div className="pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
            <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
              99在线工具大全（99gongju.online）——您的首选在线工具集合平台，{tools.length}+ 款工具，14大分类，全部免费，持续更新。收藏本站，让工具大全成为您高效工作和便捷生活的得力助手。
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              工具大全常见问题
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
            探索完整的工具大全
          </h2>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            {tools.length}+ 款工具，{categoryList.length} 大分类，一站式工具集合平台
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
