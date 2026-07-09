"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ChevronRight,
  Home,
  Grid3X3,
  Hash,
  type LucideIcon,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { getCategoryBySlug, categories, getToolsByCategory } from "@/lib/tools";

export default function CategoryContent() {
  const params = useParams();
  const slug = params.slug as string;

  const category = getCategoryBySlug(slug);

  if (!category || slug === "all") {
    notFound();
  }

  const categoryTools = useMemo(() => {
    return getToolsByCategory(category.name);
  }, [category.name]);

  const CatIcon = category.icon || Grid3X3;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Hero Section - 99工具 style */}
      <section className="relative overflow-hidden pt-10 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0f] to-[#09090b]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary-500/[0.1] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-xs">
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
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  全部工具
                </Link>
              </li>
              <ChevronRight className="w-3 h-3 text-slate-700" />
              <li>
                <span className="text-slate-300 font-medium">
                  {category.name}
                </span>
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-xl shadow-primary-500/25 mb-4">
              <CatIcon className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-medium text-primary-400 mb-4">
              <Hash className="w-3 h-3" />
              {categoryTools.length} 款工具
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight leading-[1.2]">
              {category.name}
            </h1>
            <p className="text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
              浏览 {category.name} 分类下的所有在线工具，精选优质工具，助力高效工作
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation - 99工具 tag style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex flex-wrap gap-1.5 justify-center">
          {categories
            .filter((c) => c.slug !== "all")
            .map((cat) => {
              const CatTagIcon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    cat.slug === slug
                      ? "text-white bg-primary-500/20 border border-primary-500/30"
                      : "text-slate-400 bg-[#18181b]/60 border border-transparent hover:text-white hover:bg-[#27272a] hover:border-[#3f3f46]"
                  }`}
                >
                  <CatTagIcon className="w-3 h-3 opacity-70" />
                  {cat.name}
                </Link>
              );
            })}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            全部工具 <span className="text-slate-500 font-normal">({categoryTools.length})</span>
          </h2>
        </div>

        {categoryTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryTools.map((tool, index) => (
              <div
                key={tool.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 20, 200)}ms` }}
              >
                <ToolCard
                  href={`/tools/${tool.id}`}
                  icon={tool.icon as LucideIcon}
                  name={tool.name}
                  description={tool.description}
                  color={tool.color}
                  category={tool.category}
                  isPopular={index < 3}
                  verified={index % 5 === 0}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center">
              <Grid3X3 className="w-7 h-7 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              暂无工具
            </h3>
            <p className="text-slate-400 mb-5">该分类下暂无工具，敬请期待</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
            >
              返回首页
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
