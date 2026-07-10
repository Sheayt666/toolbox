import Link from "next/link";
import {
  Info,
  Sparkles,
  Target,
  ListOrdered,
  HelpCircle,
  ChevronRight,
  Wrench,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { tools, getCategorySlugByName, getToolsByCategory } from "@/lib/tools";
import type { ToolSEOContent } from "@/data/toolSeoContent";

interface ToolSEOContentProps {
  seoContent: ToolSEOContent;
  currentToolId?: string;
  currentToolName?: string;
  currentToolCategory?: string;
}

export default function ToolSEOContent({
  seoContent,
  currentToolId,
  currentToolName,
  currentToolCategory,
}: ToolSEOContentProps) {
  // 获取相关工具信息
  const relatedToolsData = seoContent.relatedTools
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 6);

  // 获取同分类工具用于内链（排除当前工具和相关工具）
  const categorySlug = currentToolCategory
    ? getCategorySlugByName(currentToolCategory)
    : "";
  const sameCategoryTools = currentToolCategory
    ? getToolsByCategory(currentToolCategory)
        .filter(
          (t) =>
            t.id !== currentToolId &&
            !seoContent.relatedTools.includes(t.id)
        )
        .slice(0, 8)
    : [];

  // 热门工具跨分类内链
  const popularCrossCategory = tools
    .filter(
      (t) =>
        t.id !== currentToolId &&
        t.category !== currentToolCategory &&
        !seoContent.relatedTools.includes(t.id)
    )
    .slice(0, 6);

  return (
    <div className="mt-12 lg:mt-16 space-y-10 lg:space-y-14">
      {/* 详细介绍 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <Info className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `${currentToolName}工具介绍` : "工具介绍"}
          </h2>
        </div>
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          {seoContent.detailedDescription.split("\n\n").map((paragraph, i) => (
            <p
              key={i}
              className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base sm:text-lg mb-4 last:mb-0"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* 功能特点 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `${currentToolName}的功能特点` : "功能特点"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {seoContent.features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 使用场景 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `${currentToolName}的使用场景` : "使用场景"}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seoContent.useCases.map((useCase, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-md transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
                {index + 1}
              </div>
              <span className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base">
                {useCase}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 使用步骤 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <ListOrdered className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `如何使用${currentToolName}` : "使用步骤"}
          </h2>
        </div>
        <div className="space-y-6">
          {seoContent.howToSteps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  {index + 1}
                </div>
                {index < seoContent.howToSteps.length - 1 && (
                  <div className="w-0.5 h-full bg-gradient-to-b from-blue-400 to-transparent mx-auto mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                  {step.step}
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 使用技巧 - 新增 */}
      {seoContent.proTips && seoContent.proTips.length > 0 && (
        <section className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-amber-200 dark:border-amber-800/30 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              {currentToolName ? `${currentToolName}使用技巧` : "使用技巧"}
            </h2>
          </div>
          <div className="space-y-4">
            {seoContent.proTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm border border-amber-100 dark:border-amber-900/20"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 text-white">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed pt-1">
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ问答 */}
      <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `${currentToolName}常见问题` : "常见问题"}
          </h2>
        </div>
        <div className="space-y-4">
          {seoContent.faqs.map((faq, index) => (
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

      {/* 相关工具推荐 */}
      {relatedToolsData.length > 0 && (
        <section className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-10 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              相关在线工具推荐
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedToolsData.map((tool) => {
              if (!tool) return null;
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all hover:-translate-y-0.5"
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 truncate">
                      {tool.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 工具百科 - SEO深度内容 + 核心词布局 + 内链网络 */}
      <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-6 sm:p-8 lg:p-10 border border-indigo-200 dark:border-indigo-800/30 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {currentToolName ? `${currentToolName}百科知识` : "工具百科"}
          </h2>
        </div>

        {/* 核心词布局段落 */}
        <div className="space-y-4 mb-8">
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
            {currentToolName}是99在线工具大全中的一款{currentToolCategory || "实用"}在线工具。作为一款免费的在线工具，它可以帮助用户快速完成{seoContent.useCases[0] || "日常任务"}。在99在线工具平台上，您可以找到500多款类似的免费在线工具，覆盖开发、设计、文本处理、图片处理、PDF处理、视频音频、转换、生成、查询、教育、财务、健康和生活等多个分类。
          </p>
          <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
            所有在线工具均无需注册、无需安装，打开即用。{currentToolName}与平台上的其他工具一样，采用浏览器本地处理技术，用户数据不会上传到服务器，确保隐私安全。如果您觉得{currentToolName}对您有帮助，可以收藏99在线工具大全，随时使用更多免费工具。
          </p>
        </div>

        {/* 同分类工具内链 */}
        {sameCategoryTools.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              更多{currentToolCategory || "相关"}在线工具
            </h3>
            <div className="flex flex-wrap gap-2">
              {sameCategoryTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-indigo-100 dark:border-indigo-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tool.name}
                  </Link>
                );
              })}
              {categorySlug && (
                <Link
                  href={`/category/${categorySlug}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/30 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all"
                >
                  查看全部{currentToolCategory} →
                </Link>
              )}
            </div>
          </div>
        )}

        {/* 跨分类热门工具内链 */}
        {popularCrossCategory.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              热门在线工具推荐
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularCrossCategory.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.path}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/70 dark:bg-zinc-900/40 border border-purple-100 dark:border-purple-900/20 text-sm text-zinc-700 dark:text-zinc-300 hover:border-purple-300 dark:hover:border-purple-600/50 hover:text-purple-600 dark:hover:text-purple-400 transition-all"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tool.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 底部SEO内链 */}
        <div className="mt-8 pt-6 border-t border-indigo-100 dark:border-indigo-900/20">
          <p className="text-sm text-zinc-500 dark:text-zinc-500 leading-relaxed">
            99在线工具大全（99gongju.online）提供500+款免费在线工具，包括
            <Link href="/category/dev" className="text-indigo-500 hover:underline mx-0.5">开发工具</Link>、
            <Link href="/category/image" className="text-indigo-500 hover:underline mx-0.5">图片工具</Link>、
            <Link href="/category/text" className="text-indigo-500 hover:underline mx-0.5">文本工具</Link>、
            <Link href="/category/calc" className="text-indigo-500 hover:underline mx-0.5">计算工具</Link>、
            <Link href="/category/pdf" className="text-indigo-500 hover:underline mx-0.5">PDF工具</Link>、
            <Link href="/category/design" className="text-indigo-500 hover:underline mx-0.5">设计工具</Link>、
            <Link href="/category/convert" className="text-indigo-500 hover:underline mx-0.5">转换工具</Link>、
            <Link href="/category/query" className="text-indigo-500 hover:underline mx-0.5">查询工具</Link>等14大分类。
            所有工具免费使用，无需注册，数据本地处理，安全可靠。
          </p>
        </div>
      </section>
    </div>
  );
}
