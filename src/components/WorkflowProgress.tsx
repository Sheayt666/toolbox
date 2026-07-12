"use client";

/**
 * WorkflowProgress — 工作流进度条组件
 *
 * 职责：
 * - 顶部进度条显示「第 X / N 步」与完成百分比
 * - 水平步骤指示器（圆点 + 连线）：已完成绿色 / 当前紫色 / 未到灰色
 * - 当前步骤展示工具名与数据流向引导
 * - 「上一步」「完成本步骤」「跳过」操作
 * - 全部完成时展示完成报告并调用 recordWorkflowComplete()
 *
 * 该组件读取 localStorage 中的工作流进度，若无活动工作流则渲染 null。
 * 使用 useSyncExternalStore 订阅 localStorage 变更（SSR 安全、无水合不匹配）。
 */

import { useSyncExternalStore, useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  SkipForward,
  X,
  ArrowRight,
  PartyPopper,
  Clock,
  RotateCcw,
  Share2,
  ArrowLeft,
  Layers,
} from "lucide-react";
import {
  getWorkflowTemplate,
  completeStep,
  skipStep,
  goToStep,
  clearWorkflowProgress,
  shareWorkflow,
  type WorkflowProgress as WorkflowProgressData,
} from "@/lib/workflowEngine";
import { recordWorkflowComplete } from "@/lib/gamification";

const STORAGE_CHANGE_EVENT = "toolbox-storage-change";
const PROGRESS_KEY = "wf_progress";

/* ---------- 外部存储订阅（useSyncExternalStore） ---------- */
// 订阅 localStorage 的 `toolbox-storage-change` 自定义事件与原生 storage 事件。
// 返回稳定的原始字符串快照（primitive），避免对象引用不稳定导致的重渲染循环。

function subscribeProgress(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(STORAGE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getProgressRawSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(PROGRESS_KEY);
}

function getServerSnapshot(): null {
  return null;
}

export default function WorkflowProgress() {
  const router = useRouter();
  // 完成上报是否已执行（避免重复调用 recordWorkflowComplete）
  const recordedRef = useRef(false);
  const [copied, setCopied] = useState(false);

  // 订阅 localStorage 中的工作流进度
  const progressRaw = useSyncExternalStore(
    subscribeProgress,
    getProgressRawSnapshot,
    getServerSnapshot
  );

  const progress = useMemo<WorkflowProgressData | null>(() => {
    if (!progressRaw) return null;
    try {
      return JSON.parse(progressRaw) as WorkflowProgressData;
    } catch {
      return null;
    }
  }, [progressRaw]);

  const template = progress
    ? getWorkflowTemplate(progress.templateId)
    : undefined;

  // 切换/清除工作流时重置上报标记（ref 变更不触发重渲染，无 lint 问题）
  const templateId = progress?.templateId ?? null;
  useEffect(() => {
    recordedRef.current = false;
  }, [templateId]);

  /* ---------- 派生数据 ---------- */
  const total = template?.steps.length ?? 0;
  const currentStepIndex = progress?.currentStep ?? 0;
  const currentStep =
    template && currentStepIndex < total
      ? template.steps[currentStepIndex]
      : undefined;
  const completedSet = new Set(progress?.completedSteps ?? []);
  const completedCount = completedSet.size;
  // 完成：指针越界（走到了 steps.length）
  const isComplete = total > 0 && currentStepIndex >= total;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  /* ---------- 完成时上报（仅一次，纯外部副作用） ---------- */
  useEffect(() => {
    if (isComplete && !recordedRef.current) {
      recordedRef.current = true;
      recordWorkflowComplete();
    }
  }, [isComplete]);

  /* ---------- 操作处理 ---------- */
  // 引擎函数会写入 localStorage 并派发事件，useSyncExternalStore 自动同步，
  // 因此这里不再手动 setState(progress)。

  // 完成当前步骤并推进
  const handleComplete = () => {
    if (!template || !progress) return;
    const idx = progress.currentStep;
    const next = completeStep(idx);
    if (!next) return;
    const nextIdx = idx + 1;
    if (nextIdx < total) {
      // 跳转到下一步对应工具
      router.push(template.steps[nextIdx].toolPath);
    }
    // nextIdx >= total 时 isComplete 会自动变为 true，展示完成报告
    // （完成时间由引擎写入 progress.endTime）
  };

  // 跳过当前步骤
  const handleSkip = () => {
    if (!template || !progress) return;
    const idx = progress.currentStep;
    const next = skipStep(idx);
    if (!next) return;
    const nextIdx = idx + 1;
    if (nextIdx < total) {
      router.push(template.steps[nextIdx].toolPath);
    }
  };

  // 上一步
  const handlePrev = () => {
    if (!template || !progress) return;
    const idx = progress.currentStep;
    if (idx <= 0) return;
    const next = goToStep(idx - 1);
    if (!next) return;
    router.push(template.steps[idx - 1].toolPath);
  };

  // 退出工作流
  const handleExit = () => {
    clearWorkflowProgress();
  };

  // 重新开始（清除后回到模板页）
  const handleRestart = () => {
    clearWorkflowProgress();
    router.push("/workflows");
  };

  // 分享
  const handleShare = async () => {
    if (!template) return;
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
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // 用户取消分享或复制失败 — 忽略
    }
  };

  /* ---------- 渲染守卫 ---------- */
  // 无活动工作流时不渲染任何内容（SSR 阶段 progressRaw 也为 null）
  if (!progress || !template) return null;

  /* ---------- 完成报告 ---------- */
  if (isComplete) {
    // 从引擎写入的存储值计算耗时（纯读取，无 Date.now()）
    const displayMin = progress.endTime
      ? Math.max(1, Math.round((progress.endTime - progress.startTime) / 60000))
      : 1;
    return (
      <div className="sticky top-16 z-40 animate-slide-down">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="bg-gradient-to-br from-emerald-500/15 via-[#18181b] to-accent-500/10 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-accent-500 flex items-center justify-center shadow-lg shadow-emerald-500/25 flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  工作流已完成
                  <span className="text-xs font-normal text-emerald-400">
                    +1 成就进度
                  </span>
                </h3>
                <p className="text-sm text-slate-400 mt-0.5 truncate">
                  {template.name} · 共 {total} 步 · 完成 {completedCount} 步 ·
                  用时约 {displayMin} 分钟
                </p>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-all flex-1 sm:flex-none"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      分享
                    </>
                  )}
                </button>
                <button
                  onClick={handleRestart}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-3 text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg hover:opacity-90 transition-all flex-1 sm:flex-none"
                >
                  <RotateCcw className="w-4 h-4" />
                  再来一个
                </button>
                <button
                  onClick={handleExit}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] transition-all"
                  aria-label="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 步骤回顾 */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {template.steps.map((step, i) => {
                const done = completedSet.has(i);
                return (
                  <div
                    key={step.toolId}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
                      done
                        ? "border-emerald-500/30 bg-emerald-500/5 text-slate-300"
                        : "border-[#27272a] bg-[#18181b] text-slate-500"
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 ${
                        done
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {done ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <SkipForward className="w-3 h-3" />
                      )}
                    </span>
                    <span className="truncate">{step.toolName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- 进行中 ---------- */
  return (
    <div className="sticky top-16 z-40 animate-slide-down">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="bg-[#18181b]/95 backdrop-blur-xl border border-[#27272a] rounded-2xl shadow-xl overflow-hidden">
          {/* 顶部：标题 + 进度文本 + 退出 */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 pt-3.5 pb-2">
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-accent-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-white truncate">
                {template.name}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-xs font-medium text-accent-400">
                第 {currentStepIndex + 1} / {total} 步
              </span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">{percent}%</span>
              <button
                onClick={handleExit}
                className="w-6 h-6 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-[#27272a] transition-all"
                aria-label="退出工作流"
                title="退出工作流"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 进度条 */}
          <div className="px-4 sm:px-5 pb-2">
            <div className="h-1.5 w-full bg-[#27272a] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-500 to-primary-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* 步骤指示器（圆点 + 连线） */}
          <div className="px-4 sm:px-5 pb-3">
            <div className="flex items-center">
              {template.steps.map((step, i) => {
                const done = completedSet.has(i);
                const isCurrent = i === currentStepIndex;
                return (
                  <div
                    key={step.toolId}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    {/* 圆点 */}
                    <div className="relative flex items-center justify-center flex-shrink-0">
                      {isCurrent && (
                        <span className="absolute inline-flex h-5 w-5 rounded-full bg-accent-500/30 animate-ping" />
                      )}
                      <span
                        className={`relative inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold transition-all ${
                          done
                            ? "bg-emerald-500 text-white"
                            : isCurrent
                            ? "bg-accent-500 text-white ring-2 ring-accent-500/30"
                            : "bg-slate-700 text-slate-500"
                        }`}
                        title={step.stepLabel}
                      >
                        {done ? <Check className="w-3 h-3" /> : i + 1}
                      </span>
                    </div>
                    {/* 连线 */}
                    {i < total - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${
                          done ? "bg-emerald-500" : "bg-slate-700"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 当前步骤引导 */}
          {currentStep && (
            <div className="px-4 sm:px-5 pb-3.5 border-t border-[#27272a] pt-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* 左：步骤信息 */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-accent-400">
                        {currentStep.stepLabel}
                      </span>
                      <Link
                        href={currentStep.toolPath}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-accent-400 transition-colors group"
                      >
                        {currentStep.toolName}
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                    {/* 数据流向引导 */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                      {currentStep.dataInput && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#27272a]">
                          <ArrowLeft className="w-2.5 h-2.5" />
                          输入：{currentStep.dataInput}
                        </span>
                      )}
                      {currentStep.dataOutput && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#27272a]">
                          <ArrowRight className="w-2.5 h-2.5" />
                          产出：{currentStep.dataOutput}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 右：操作按钮 */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={handlePrev}
                    disabled={currentStepIndex <= 0}
                    className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-300 bg-[#18181b] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    上一步
                  </button>
                  <Link
                    href={currentStep.toolPath}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-medium text-white bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg hover:opacity-90 transition-all"
                  >
                    打开工具
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={handleSkip}
                    className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-all"
                    title="跳过本步骤"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    跳过
                  </button>
                  <button
                    onClick={handleComplete}
                    className="inline-flex items-center gap-1 h-8 px-3 text-xs font-semibold text-white bg-emerald-500/90 hover:bg-emerald-500 rounded-lg transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    完成本步
                  </button>
                </div>
              </div>

              {/* 预计剩余 */}
              <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600">
                <Clock className="w-3 h-3" />
                <span>
                  剩余 {total - currentStepIndex - 1} 步 · 已完成{" "}
                  {completedCount} / {total}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
