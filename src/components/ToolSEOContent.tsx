import Link from "next/link";
import {
  Info,
  Sparkles,
  Target,
  ListOrdered,
  HelpCircle,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { tools } from "@/lib/tools";
import type { ToolSEOContent } from "@/data/toolSeoContent";

interface ToolSEOContentProps {
  seoContent: ToolSEOContent;
}

export default function ToolSEOContent({ seoContent }: ToolSEOContentProps) {
  // 获取相关工具信息
  const relatedToolsData = seoContent.relatedTools
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean)
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
            工具介绍
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
            功能特点
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
            使用场景
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
            使用步骤
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

      {/* FAQ问答 */}
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
              相关工具推荐
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
    </div>
  );
}
