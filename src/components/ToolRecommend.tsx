"use client";

import Link from "next/link";
import {
  Code2,
  ExternalLink,
  MessageSquare,
  Palette,
  Sparkles,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { getNextSteps, type WorkflowStep } from "@/lib/toolWorkflows";

interface RecommendItem {
  id: string;
  name: string;
  description: string;
  tag: string;
  tagColor: string;
  icon: React.ElementType;
  iconBg: string;
  url: string;
}

const recommendItems: RecommendItem[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    description: "AI助手提升效率，智能对话、写作、编程、分析样样精通",
    tag: "热门",
    tagColor:
      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
    icon: MessageSquare,
    iconBg: "from-emerald-500 to-teal-500",
    url: "#",
  },
  {
    id: "claude",
    name: "Claude",
    description: "长文本处理最强，支持超长上下文，深度分析和写作首选",
    tag: "推荐",
    tagColor:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    icon: Sparkles,
    iconBg: "from-orange-500 to-amber-500",
    url: "#",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "AI绘画神器，高品质图像生成，设计师创意灵感来源",
    tag: "设计",
    tagColor:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon: Palette,
    iconBg: "from-purple-500 to-pink-500",
    url: "#",
  },
  {
    id: "cursor",
    name: "Cursor",
    description: "AI编程助手，智能代码补全和重构，提升开发效率数倍",
    tag: "开发者",
    tagColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    icon: Code2,
    iconBg: "from-blue-500 to-cyan-500",
    url: "#",
  },
];

interface ToolRecommendProps {
  title?: string;
  /** When provided, renders an ordered "next step" workflow section above the recommendations. */
  toolId?: string;
}

/**
 * WorkflowStepCard
 *
 * Renders a single step in a tool workflow chain. Shows the 1-based step
 * number so visitors can follow the recommended usage order.
 */
function WorkflowStepCard({ stepData }: { stepData: WorkflowStep }) {
  const { step, tool, current } = stepData;
  const StepIcon: LucideIcon = tool.icon;

  return (
    <Link
      href={`/tools/${tool.id}`}
      aria-disabled={current}
      tabIndex={current ? -1 : 0}
      className={`group relative flex flex-col p-4 rounded-xl border transition-all ${
        current
          ? "border-primary-500/40 bg-primary-500/10 cursor-default"
          : "border-[#27272a] bg-[#18181b] hover:border-primary-500/30 hover:bg-[#1c1c1f]"
      }`}
    >
      {/* Step number badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
            current
              ? "bg-primary-500 text-white"
              : "bg-[#27272a] text-slate-400 group-hover:bg-primary-500/20 group-hover:text-primary-400"
          }`}
        >
          {step}
        </span>
        {current && (
          <span className="text-[10px] font-semibold text-primary-400 bg-primary-500/10 px-1.5 py-0.5 rounded">
            当前
          </span>
        )}
      </div>

      {/* Tool icon + name */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}
        >
          <StepIcon className="w-[18px] h-[18px] text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white truncate group-hover:text-primary-400 transition-colors">
            {tool.name}
          </div>
          <div className="text-[11px] text-slate-500 truncate">
            {tool.category}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {tool.description}
      </p>

      {!current && (
        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary-400">
          前往使用
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      )}
    </Link>
  );
}

export default function ToolRecommend({
  title = "AI 工具推荐",
  toolId,
}: ToolRecommendProps) {
  // Resolve the workflow "next steps" for the current tool (if any).
  const nextSteps: WorkflowStep[] = toolId ? getNextSteps(toolId, 4) : [];

  return (
    <section className="py-10 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Workflow chain recommendations ("next step" mode) */}
        {nextSteps.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <h2 className="text-lg font-bold text-white">下一步推荐</h2>
              <span className="text-xs text-slate-500">按使用顺序串联</span>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              完成当前工具后，你可能还需要以下工具，按推荐顺序使用效率更高
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {nextSteps.map((stepData) => (
                <WorkflowStepCard
                  key={stepData.tool.id}
                  stepData={stepData}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category / AI recommendations */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-200/50 dark:border-violet-800/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI 精选推荐
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            精选优质AI工具和服务，助力提升工作效率
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {recommendItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-white dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/50 hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:shadow-xl hover:shadow-primary-500/10 transition-all hover:-translate-y-1"
              >
                <div className="absolute top-4 right-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.tagColor}`}>
                    {item.tag}
                  </span>
                </div>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400">
                  <span>了解更多</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
