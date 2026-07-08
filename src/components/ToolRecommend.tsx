"use client";

import { Code2, ExternalLink, MessageSquare, Palette, Plus, Sparkles } from "lucide-react";

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
}

export default function ToolRecommend({
  title = "AI 工具推荐",
}: ToolRecommendProps) {
  return (
    <section className="py-10 lg:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
