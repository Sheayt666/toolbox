"use client";

/**
 * 工作流模板页 — /workflows
 *
 * 展示 4 个分类（电商 / 开发 / 设计 / 办公）共 10 个预设工作流模板。
 * 支持搜索与分类筛选；点击「开始工作流」会初始化进度并跳转到第一个工具。
 *
 * 因需搜索 / 筛选等客户端交互，故使用 "use client"。
 */

import {
  useSyncExternalStore,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Layers,
  ArrowRight,
  Share2,
  Check,
  Sparkles,
  ShoppingBag,
  Code2,
  Palette,
  FileText,
  Zap,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import {
  workflowTemplates,
  startWorkflow,
  shareWorkflow,
  getWorkflowProgress,
  getWorkflowTemplate,
  type WorkflowTemplate,
} from "@/lib/workflowEngine";
import WorkflowProgress from "@/components/WorkflowProgress";

/* ---------- 外部存储订阅（useSyncExternalStore） ---------- */
// 订阅 localStorage 工作流进度变更；返回稳定的原始字符串（templateId），避免对象引用不稳。

const STORAGE_CHANGE_EVENT = "toolbox-storage-change";

function subscribeProgress(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getActiveTemplateIdSnapshot(): string | null {
  return getWorkflowProgress()?.templateId ?? null;
}

// 订阅 URL 变更（前进/后退），用于读取分享参数 ?wf=
function subscribeLocation(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getSharedIdSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("wf");
}

function getNullServerSnapshot(): null {
  return null;
}

/* ---------- 分类元信息（图标 + 配色） ---------- */
const categoryConfig: Record<
  WorkflowTemplate["category"],
  { icon: LucideIcon; label: string; accent: string; badge: string; dot: string }
> = {
  ecommerce: {
    icon: ShoppingBag,
    label: "电商运营",
    accent: "from-rose-500 to-pink-500",
    badge: "text-rose-400 bg-rose-500/10",
    dot: "bg-rose-500",
  },
  developer: {
    icon: Code2,
    label: "开发效率",
    accent: "from-sky-500 to-cyan-500",
    badge: "text-sky-400 bg-sky-500/10",
    dot: "bg-sky-500",
  },
  design: {
    icon: Palette,
    label: "设计创作",
    accent: "from-accent-500 to-primary-500",
    badge: "text-accent-400 bg-accent-500/10",
    dot: "bg-accent-500",
  },
  office: {
    icon: FileText,
    label: "办公文档",
    accent: "from-amber-500 to-orange-500",
    badge: "text-amber-400 bg-amber-500/10",
    dot: "bg-amber-500",
  },
};

/* ---------- 难度配色 ---------- */
const difficultyStyle: Record<string, string> = {
  入门: "text-emerald-400 bg-emerald-500/10",
  进阶: "text-amber-400 bg-amber-500/10",
  高级: "text-rose-400 bg-rose-500/10",
};

type FilterCategory = "all" | WorkflowTemplate["category"];

const filterTabs: { key: FilterCategory; label: string; icon: LucideIcon }[] = [
  { key: "all", label: "全部", icon: Layers },
  { key: "ecommerce", label: "电商运营", icon: ShoppingBag },
  { key: "developer", label: "开发效率", icon: Code2 },
  { key: "design", label: "设计创作", icon: Palette },
  { key: "office", label: "办公文档", icon: FileText },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 当前活动工作流模板 id（来自 localStorage）— SSR 安全
  const activeTemplateId = useSyncExternalStore(
    subscribeProgress,
    getActiveTemplateIdSnapshot,
    getNullServerSnapshot
  );
  // 分享的工作流 id（来自 URL ?wf=）— SSR 安全
  const sharedId = useSyncExternalStore(
    subscribeLocation,
    getSharedIdSnapshot,
    getNullServerSnapshot
  );

  // 设置页面标题（纯外部副作用，符合 effect 用途）
  useEffect(() => {
    document.title = "工作流模板 | 99在线工具";
  }, []);

  /* ---------- 筛选 ---------- */
  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workflowTemplates.filter((t) => {
      const matchCategory =
        activeCategory === "all" || t.category === activeCategory;
      if (!matchCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.steps.some(
          (s) =>
            s.toolName.toLowerCase().includes(q) ||
            s.stepLabel.toLowerCase().includes(q)
        )
      );
    });
  }, [query, activeCategory]);

  /* ---------- 开始工作流 ---------- */
  const handleStart = useCallback(
    (template: WorkflowTemplate) => {
      const progress = startWorkflow(template.id);
      if (!progress) return;
      // 跳转到第一个工具
      const firstStep = template.steps[0];
      if (firstStep) {
        router.push(firstStep.toolPath);
      }
    },
    [router]
  );

  /* ---------- 分享 ---------- */
  const handleShare = useCallback(
    async (e: React.MouseEvent, template: WorkflowTemplate) => {
      e.preventDefault();
      e.stopPropagation();
      const url = shareWorkflow(template.id);
      try {
        if (navigator.share) {
          await navigator.share({
            title: template.name,
            text: template.description,
            url,
          });
        } else {
          await navigator.clipboard.writeText(url);
          setCopiedId(template.id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      } catch {
        // 忽略
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* 顶部活动工作流进度条（恢复进行中的工作流） */}
      <WorkflowProgress />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* 面包屑 */}
        <nav className="mb-6 flex items-center gap-1.5 text-xs">
          <Link
            href="/"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            首页
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-700" />
          <span className="text-slate-300 font-medium">工作流模板</span>
        </nav>

        {/* Hero */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#27272a] bg-gradient-to-br from-accent-500/10 via-[#18181b] to-[#18181b] p-6 sm:p-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-xs font-medium text-accent-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              路线C · 工作流引擎
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
              <span className="gradient-text">工具工作流</span>
              <span className="text-white">模板</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed mb-5">
              把多个工具串联成一条完整流程，按步骤引导完成复杂任务。工具间数据通过
              localStorage 自动传递，无需手动复制粘贴。
            </p>

            {/* 搜索框 */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索工作流名称、描述或工具..."
                className="w-full h-11 pl-10 pr-4 text-sm bg-[#18181b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/10 transition-all"
              />
            </div>

            {/* 统计 */}
            <div className="flex items-center gap-4 mt-5 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-300">
                  {workflowTemplates.length}
                </span>
                个模板
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-medium text-slate-300">4</span>
                个分类
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                数据自动传递
              </span>
            </div>
          </div>
        </div>

        {/* 分享提示横幅 */}
        {sharedId && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl border border-accent-500/30 bg-accent-500/5 animate-slide-down">
            <Share2 className="w-5 h-5 text-accent-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium">
                有人分享了工作流给你
              </p>
              <p className="text-xs text-slate-400 truncate">
                {getWorkflowTemplate(sharedId)?.name ?? sharedId}
              </p>
            </div>
            {getWorkflowTemplate(sharedId) && (
              <button
                onClick={() => {
                  const t = getWorkflowTemplate(sharedId)!;
                  handleStart(t);
                }}
                className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium text-white bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg hover:opacity-90 transition-all flex-shrink-0"
              >
                立即开始
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* 分类筛选 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 -mx-1 px-1">
          {filterTabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-sm font-medium rounded-lg border transition-all whitespace-nowrap ${
                  active
                    ? "text-white bg-accent-500/15 border-accent-500/40"
                    : "text-slate-400 bg-[#18181b] border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 模板列表 */}
        {filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mb-4">
              <Search className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-sm text-slate-400 mb-1">没有找到匹配的工作流</p>
            <p className="text-xs text-slate-600">
              试试更换关键词或选择其它分类
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredTemplates.map((template, idx) => (
              <TemplateCard
                key={template.id}
                template={template}
                index={idx}
                isActive={activeTemplateId === template.id}
                isShared={sharedId === template.id}
                copied={copiedId === template.id}
                onStart={handleStart}
                onShare={handleShare}
              />
            ))}
          </div>
        )}

        {/* 底部说明 */}
        <div className="mt-12 p-5 rounded-2xl border border-[#27272a] bg-[#18181b]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-500/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">
                工作流如何运作？
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                每个工作流由若干工具步骤组成。点击「开始工作流」后会自动跳转到第一个工具，
                完成后点击「完成本步」即可进入下一步，工具间产出的数据会通过浏览器
                localStorage 自动传递给后续步骤。你也可以随时「跳过」某一步或「上一步」回退。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 模板卡片 ============ */

interface TemplateCardProps {
  template: WorkflowTemplate;
  index: number;
  isActive: boolean;
  isShared: boolean;
  copied: boolean;
  onStart: (t: WorkflowTemplate) => void;
  onShare: (e: React.MouseEvent, t: WorkflowTemplate) => void;
}

function TemplateCard({
  template,
  index,
  isActive,
  isShared,
  copied,
  onStart,
  onShare,
}: TemplateCardProps) {
  const cfg = categoryConfig[template.category];
  const CategoryIcon = cfg.icon;
  const difficulty = template.difficulty ?? "入门";

  return (
    <div
      className={`group relative flex flex-col rounded-2xl border bg-[#18181b] p-5 transition-all hover:shadow-xl hover:shadow-accent-500/5 animate-fade-in-up ${
        isShared
          ? "border-accent-500/50 ring-1 ring-accent-500/20"
          : isActive
          ? "border-emerald-500/40"
          : "border-[#27272a] hover:border-[#3f3f46]"
      }`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {/* 顶部：图标 + 分类 + 状态 */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cfg.accent} flex items-center justify-center flex-shrink-0 shadow-lg`}
          >
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${cfg.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            {isShared && (
              <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-accent-400 bg-accent-500/10">
                <Share2 className="w-2.5 h-2.5" />
                分享
              </span>
            )}
            {isActive && (
              <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-emerald-400 bg-emerald-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                进行中
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => onShare(e, template)}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-[#27272a] transition-all flex-shrink-0"
          aria-label="分享工作流"
          title="分享工作流"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 标题 + 描述 */}
      <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
        {template.name}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
        {template.description}
      </p>

      {/* 步骤预览 */}
      <div className="mb-4">
        <div className="flex items-center gap-1 flex-wrap">
          {template.steps.map((step, i) => (
            <div key={step.toolId} className="flex items-center">
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 bg-[#27272a]/60"
                title={step.stepLabel}
              >
                {step.toolName}
              </span>
              {i < template.steps.length - 1 && (
                <ArrowRight className="w-2.5 h-2.5 text-slate-600 mx-0.5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 元信息 */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-4">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" />
          {template.steps.length} 步
        </span>
        <span className="text-slate-700">·</span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          约 {template.estimatedMinutes ?? 5} 分钟
        </span>
        <span className="text-slate-700">·</span>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded font-medium ${difficultyStyle[difficulty] ?? difficultyStyle["入门"]}`}
        >
          {difficulty}
        </span>
      </div>

      {/* 操作按钮 */}
      <div className="mt-auto flex items-center gap-2">
        <button
          onClick={() => onStart(template)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 px-4 text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg hover:opacity-90 transition-all"
        >
          {isActive ? "继续工作流" : "开始工作流"}
          <ArrowRight className="w-4 h-4" />
        </button>
        <Link
          href={template.steps[0]?.toolPath ?? "/workflows"}
          className="inline-flex items-center justify-center h-9 px-3 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-all"
          title="仅查看第一个工具"
        >
          预览
        </Link>
      </div>
    </div>
  );
}
