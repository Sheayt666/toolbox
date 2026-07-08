"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ChevronRight,
  Home,
  Grid3X3,
  Sparkles,
  ArrowRight,
  Calculator,
  Type,
  Wand2,
  ArrowLeftRight,
  Coffee,
  Code2,
  type LucideIcon,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { tools, getCategoryBySlug, categories } from "@/lib/tools";

// Category descriptions and icons
const categoryMeta: Record<string, { description: string; icon: LucideIcon }> = {
  calculator: {
    description: "各类在线计算器，包括房贷、个税、BMI、年龄、单位换算等实用计算工具",
    icon: Calculator,
  },
  text: {
    description: "文本处理工具，包括大小写转换、字数统计、Markdown编辑等文字处理功能",
    icon: Type,
  },
  generator: {
    description: "在线生成器，包括二维码、密码、UUID、哈希值等一键生成工具",
    icon: Wand2,
  },
  converter: {
    description: "格式转换工具，包括Base64、URL编码、进制转换等数据格式互转",
    icon: ArrowLeftRight,
  },
  life: {
    description: "日常生活实用工具，包括倒计时、纪念日、番茄钟等生活辅助工具",
    icon: Coffee,
  },
  developer: {
    description: "开发者必备工具，包括JSON格式化、正则测试、时间戳转换等开发效率工具",
    icon: Code2,
  },
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const category = getCategoryBySlug(slug);

  // If category not found or is "all", show 404
  if (!category || slug === "all") {
    notFound();
  }

  const meta = categoryMeta[slug] || {
    description: `浏览${category.name}分类下的所有在线工具`,
    icon: Grid3X3,
  };

  const MetaIcon = meta.icon;

  const categoryTools = useMemo(() => {
    return tools.filter((tool) => tool.category === category.name);
  }, [category.name]);

  // Get other categories for exploration section
  const otherCategories = categories.filter(
    (c) => c.slug !== slug && c.slug !== "all"
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-slate-50 to-slate-50 dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-[300px] h-[300px] bg-accent-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1.5 text-sm">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  首页
                </Link>
              </li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <li>
                <Link
                  href="/#tools"
                  className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                  全部工具
                </Link>
              </li>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
              <li>
                <span className="text-slate-900 dark:text-white font-medium">
                  {category.name}
                </span>
              </li>
            </ol>
          </nav>

          {/* Category Header */}
          <div className="text-center max-w-3xl mx-auto animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 mb-5">
              <MetaIcon className="w-8 h-8" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-primary-600 dark:text-primary-400 shadow-sm mb-5">
              <Sparkles className="w-4 h-4" />
              <span>{categoryTools.length} 款工具</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
              {category.name}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-10">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories
            .filter((c) => c.slug !== "all")
            .map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  cat.slug === slug
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md shadow-primary-500/25"
                    : "bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600/50 hover:text-primary-600 dark:hover:text-primary-400"
                }`}
              >
                {cat.name}
              </Link>
            ))}
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            全部 {category.name}
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            共 {categoryTools.length} 款
          </span>
        </div>

        {categoryTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categoryTools.map((tool, index) => (
              <div
                key={tool.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ToolCard
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  path={tool.path}
                  icon={tool.icon as LucideIcon}
                  color={tool.color}
                  category={tool.category}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-200/60 dark:border-slate-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              暂无工具
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              该分类下暂无工具，敬请期待
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-primary-500/25 transition-all"
            >
              返回首页
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Explore Other Categories */}
        {otherCategories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
              探索其他分类
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {otherCategories.map((cat) => {
                const catMeta = categoryMeta[cat.slug] || {
                  icon: Grid3X3,
                };
                const CatIcon = catMeta.icon;
                const catToolCount = tools.filter(
                  (t) => t.category === cat.name
                ).length;
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="group p-5 bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-center"
                  >
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CatIcon className="w-6 h-6 text-primary-500" />
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {catToolCount} 款工具
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
