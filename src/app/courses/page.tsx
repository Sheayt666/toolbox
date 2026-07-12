"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  sceneCourses,
  courseCategories,
  difficultyConfig,
  type SceneCourse,
} from "@/lib/sceneCourses";
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Clock,
  Layers,
  ArrowRight,
  Home,
  BookOpen,
  Wrench,
  CheckCircle,
  GraduationCap,
} from "lucide-react";

export default function CoursesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredCourses = useMemo(() => {
    if (activeCategory === "全部") return sceneCourses;
    return sceneCourses.filter((c) => c.category === activeCategory);
  }, [activeCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                首页
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <li>
              <span className="text-slate-300 font-medium">工具实战课程</span>
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 gradient-bg-hero" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="relative py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-primary-300 bg-primary-500/15 rounded-full border border-primary-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                10 个场景化课程
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5" />
                免费学习
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-3 tracking-tight">
              工具实战课程 📚
            </h1>
            <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
              10 个场景化工具课程，从入门到精通。每个课程串联多个工具，带你完成一条完整的工作流，
              真正学会把工具组合起来解决实际问题。
            </p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 mr-1">
              <Layers className="w-3.5 h-3.5" />
              分类:
            </span>
            {courseCategories.map((cat) => {
              const isActive = activeCategory === cat;
              const count =
                cat === "全部"
                  ? sceneCourses.length
                  : sceneCourses.filter((c) => c.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isActive
                      ? "text-white bg-primary-500/20 border-primary-500/40 shadow-[0_0_16px_rgba(168,85,247,0.15)]"
                      : "text-slate-400 bg-[#18181b]/60 border-[#27272a] hover:text-white hover:bg-[#27272a] hover:border-[#3f3f46]"
                  }`}
                >
                  {cat}
                  <span
                    className={`text-[10px] ${isActive ? "text-primary-300" : "text-slate-600"}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course, i) => (
            <CourseCard
              key={course.id}
              course={course}
              expanded={expandedId === course.id}
              onToggle={() => toggleExpand(course.id)}
              index={i}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-accent-500/20 border border-primary-500/20 p-8 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-medium text-primary-300 bg-primary-500/10 rounded-full border border-primary-500/20">
              <GraduationCap className="w-3.5 h-3.5" />
              学以致用
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 tracking-tight">
              学完课程，立刻动手实操
            </h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-5">
              每个步骤都配有详细的操作指引，点击「开始学习」即可跳转到第一个工具开始练习。
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
            >
              浏览全部工具
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Course Card ----------------------------- */

interface CourseCardProps {
  course: SceneCourse;
  expanded: boolean;
  onToggle: () => void;
  index: number;
}

function CourseCard({ course, expanded, onToggle, index }: CourseCardProps) {
  const diff = difficultyConfig[course.difficulty];
  const firstStep = course.steps[0];

  return (
    <div
      className={`group relative flex flex-col rounded-xl border bg-[#18181b] transition-all animate-fade-in ${
        expanded
          ? "border-primary-500/40 shadow-[0_0_24px_rgba(168,85,247,0.12)]"
          : "border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1c1c1f]"
      }`}
      style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
    >
      {/* glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      {/* Header */}
      <button
        onClick={onToggle}
        className="relative text-left p-5"
        aria-expanded={expanded}
      >
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-md border ${diff.className}`}
          >
            {diff.label}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            {course.estimatedMinutes} 分钟
          </span>
        </div>

        <h3 className="text-base font-semibold text-white group-hover:text-primary-400 transition-colors mb-1.5 leading-snug">
          {course.name}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {course.steps.length} 个步骤
          </span>
          <span className="w-px h-3 bg-[#27272a]" />
          <span className="inline-flex items-center gap-1">
            <Wrench className="w-3 h-3" />
            {course.category}
          </span>
        </div>
      </button>

      {/* Expanded steps */}
      {expanded && (
        <div className="relative px-5 pb-5">
          <div className="border-t border-[#27272a] pt-4">
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-primary-400" />
              <span className="text-xs font-medium text-primary-400">学习步骤</span>
            </div>
            <ol className="space-y-3">
              {course.steps.map((step, idx) => (
                <li key={step.toolId + idx} className="relative pl-7">
                  {/* step connector */}
                  <span className="absolute left-0 top-0 w-5 h-5 rounded-full bg-primary-500/15 border border-primary-500/30 flex items-center justify-center text-[10px] font-bold text-primary-300">
                    {idx + 1}
                  </span>
                  {idx < course.steps.length - 1 && (
                    <span className="absolute left-[9px] top-5 bottom-[-12px] w-px bg-[#27272a]" />
                  )}
                  <div className="pb-1">
                    <Link
                      href={step.toolPath}
                      className="text-sm font-medium text-slate-200 hover:text-primary-400 transition-colors"
                    >
                      {step.toolName}
                    </Link>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      {step.instruction}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Start learning button */}
            <Link
              href={firstStep.toolPath}
              className="mt-4 inline-flex items-center justify-center w-full gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
            >
              开始学习
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Expand hint footer (only when collapsed) */}
      {!expanded && (
        <div className="relative px-5 pb-4 mt-auto">
          <button
            onClick={onToggle}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-400 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            查看步骤详情
          </button>
        </div>
      )}
    </div>
  );
}
