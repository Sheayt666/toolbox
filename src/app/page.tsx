"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Shield,
  Search,
  TrendingUp,
  Code2,
  Palette,
  FileText,
  ChevronRight,
  Grid3X3,
  Star,
  Users,
  Clock,
  ArrowRight,
  Share2,
  ShoppingBag,
  Calculator,
  Sparkles,
  Hash,
  Ruler,
  type LucideIcon,
} from "lucide-react";
import { WebSiteStructuredData } from "@/components/StructuredData";
import ToolCard from "@/components/ToolCard";
import ProductCard from "@/components/ProductCard";
import PurchaseModal from "@/components/PurchaseModal";
import { tools, categories } from "@/lib/tools";
import { getFeaturedProducts } from "@/lib/products";

// Popular tool IDs - 精选最热门8款（按搜索量/用户需求排序）
const popularToolIds = [
  "mortgage-calculator",
  "tax-calculator",
  "image-compressor",
  "qrcode",
  "bmi-calculator",
  "json-formatter",
  "image-to-pdf",
  "avatar-generator",
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  const featuredProducts = getFeaturedProducts(3);

  const filteredTools = tools.filter((tool) => {
    const matchesCategory =
      activeCategory === "all" || tool.category === activeCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const popularTools = popularToolIds
    .map((id) => tools.find((t) => t.id === id))
    .filter(Boolean)
    .slice(0, 8);

  // 分类图标映射
  const categoryIcons: Record<string, LucideIcon> = {
    "计算工具": Calculator,
    "开发工具": Code2,
    "生成工具": Sparkles,
    "文本工具": FileText,
    "设计工具": Palette,
    "生活工具": Clock,
  };

  const categoryColors: Record<string, string> = {
    "计算工具": "from-blue-500 to-indigo-500",
    "开发工具": "from-cyan-500 to-blue-500",
    "生成工具": "from-violet-500 to-purple-500",
    "文本工具": "from-slate-500 to-gray-600",
    "设计工具": "from-pink-500 to-rose-500",
    "生活工具": "from-emerald-500 to-teal-500",
  };

  // 核心特性
  const features = [
    {
      icon: Zap,
      title: "极速响应",
      description: "所有工具在本地浏览器运行，无需上传服务器，毫秒级响应，秒出结果。",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Shield,
      title: "隐私安全",
      description: "您的数据只在本地处理，不会上传到任何服务器，完全保护您的隐私安全。",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Star,
      title: "完全免费",
      description: "所有工具永久免费，无需注册登录，打开即可使用，没有任何隐藏费用。",
      color: "from-violet-500 to-purple-500",
    },
  ];

  // 数据统计
  const stats = [
    { value: tools.length + "+", label: "免费工具", icon: Grid3X3 },
    { value: "6大分类", label: "覆盖全面", icon: Hash },
    { value: "99.9%", label: "在线可用", icon: Zap },
    { value: "0", label: "注册要求", icon: Shield },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />
      <WebSiteStructuredData
        name={process.env.NEXT_PUBLIC_SITE_NAME || "工具箱"}
        url={process.env.NEXT_PUBLIC_SITE_URL || "https://toolbox.example.com"}
        description={
          process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
          "免费在线工具箱，提供JSON格式化、Base64编解码、正则表达式测试、二维码生成、密码生成器等实用工具，无需注册即可使用。"
        }
      />

      {/* ============================================
          HERO SECTION - 大气简洁
          ============================================ */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        {/* 背景装饰 - 居中对称 */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/50 via-slate-50 to-slate-50 dark:from-indigo-950/20 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-1/4 w-[250px] h-[250px] bg-accent-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 right-1/4 w-[250px] h-[250px] bg-primary-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* 顶部标签 - 居中 */}
          <div className="w-full flex justify-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 text-sm font-medium text-slate-600 dark:text-slate-300 shadow-sm">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>{tools.length}+ 款免费在线工具 · 持续更新</span>
            </div>
          </div>

          {/* 主标题 - 居中对齐 */}
          <div className="w-full text-center mb-8 animate-fade-in-up stagger-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-slate-900 dark:text-white mb-4 leading-[1.1] tracking-tight">
              简单高效的
              <br className="sm:hidden" />
              <span className="gradient-text">在线工具箱</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              为开发者、设计师和日常用户打造的免费在线工具集合。
              无需注册，开箱即用，保护您的数据安全。
            </p>
          </div>

          {/* 核心特性 - 标题下方 */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 animate-fade-in-up stagger-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-xl px-5 py-4 border border-slate-200/50 dark:border-slate-700/30"
                >
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">
                      {feature.title}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {feature.description.split("。")[0]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 搜索框 - 居中 */}
          <div className="w-full max-w-2xl mb-12 animate-fade-in-up stagger-3">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl blur-md opacity-20" />
              <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-primary-500/10 border border-slate-200 dark:border-slate-700 p-3">
                <div className="flex items-center">
                  <div className="flex-1 flex items-center pl-5">
                    <Search className="w-6 h-6 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="搜索工具，如 房贷计算、二维码、JSON格式化..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base lg:text-lg text-center sm:text-left"
                    />
                  </div>
                  <Link
                    href="#tools"
                    className="hidden sm:flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-500/30 transition-all hover:scale-[1.02]"
                  >
                    浏览工具
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* 热门搜索 - 居中 */}
                <div className="flex flex-wrap items-center justify-center gap-2 px-5 pb-3 pt-2 border-t border-slate-100 dark:border-slate-700/50 mt-2">
                  <span className="text-xs text-slate-400">热门搜索:</span>
                  {["图片压缩", "房贷计算", "个税计算", "二维码生成", "JSON格式化", "图片转PDF"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-3 py-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 rounded-md hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 数据统计 - 居中对称 */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto animate-fade-in-up stagger-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  <div className="text-2xl sm:text-3xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          POPULAR TOOLS - 热门工具（大卡片展示）
          ============================================ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 区域标题 */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  最受欢迎
                </span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white">
                热门工具推荐
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-lg">
                用户最常用的工具，帮你快速完成日常任务
              </p>
            </div>
            <Link
              href="#tools"
              className="hidden sm:flex items-center gap-2 text-base font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              查看全部
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* 热门工具网格 - 大卡片更有冲击力 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularTools.map((tool, index) =>
              tool ? (
                <ToolCard
                  key={tool.id}
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  path={tool.path}
                  icon={tool.icon}
                  color={tool.color}
                  category={tool.category}
                  popular={index < 3}
                  size="lg"
                />
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          ALL TOOLS - 全部工具（按分类筛选）
          ============================================ */}
      <section id="tools" className="py-20 lg:py-28 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 区域标题 */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
              <Grid3X3 className="w-4 h-4" />
              全部工具
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              按分类浏览工具
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
              我们精心整理了各类实用工具，帮你高效完成工作
            </p>
          </div>

          {/* 分类标签 - 更宽松的间距 */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* 工具网格 - 宽松间距 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTools.map((tool, index) => (
              <div
                key={tool.id}
                style={{ animationDelay: `${index * 30}ms` }}
                className="animate-fade-in-up"
              >
                <ToolCard
                  id={tool.id}
                  name={tool.name}
                  description={tool.description}
                  path={tool.path}
                  icon={tool.icon}
                  color={tool.color}
                  category={tool.category}
                  size="md"
                />
              </div>
            ))}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xl">
                没有找到匹配的工具
              </p>
              <p className="text-slate-400 dark:text-slate-500 mt-2">
                试试其他关键词或浏览全部工具
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          FEATURES - 为什么选择我们
          ============================================ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 lg:mb-18">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              为什么选择我们
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              简洁、高效、安全的工具体验
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-lg">
              我们致力于提供最优质的在线工具体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="relative group bg-white dark:bg-slate-800/30 rounded-3xl p-10 border border-slate-200/60 dark:border-slate-700/50 hover:border-primary-200 dark:hover:border-primary-700/30 transition-all hover:shadow-2xl hover:shadow-primary-500/5"
                >
                  <div className="relative">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          DIGITAL PRODUCTS - 精选数字产品
          ============================================ */}
      <section id="digital-products" className="py-20 lg:py-28 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200/50 dark:border-amber-800/30 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
              <ShoppingBag className="w-4 h-4" />
              精选数字产品
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              优质数字产品，助力效率提升
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              精心打磨的数字产品，让你的工作效率更上一层楼
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                originalPrice={product.originalPrice}
                category={product.category}
                badge={product.badge}
                icon={product.icon}
                gradient={product.gradient}
                features={product.features}
                salesCount={product.salesCount}
                rating={product.rating}
                onBuyClick={() => setIsPurchaseOpen(true)}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              查看全部产品
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA SECTION - 行动召唤
          ============================================ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-12 lg:p-20 text-center">
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                开始使用工具箱
              </h2>
              <p className="text-primary-100 text-lg lg:text-xl mb-10 leading-relaxed">
                立即体验我们精心打造的在线工具，让工作更高效。
                收藏本站，随时需要随时使用。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="#tools"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 hover:scale-[1.02]"
                >
                  <Grid3X3 className="w-5 h-5" />
                  浏览全部工具
                </Link>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "工具箱 - 免费在线工具集合",
                        text: "发现一个超好用的在线工具箱，房贷计算、JSON格式化、二维码生成等工具全都有！",
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                >
                  <Share2 className="w-5 h-5" />
                  分享给朋友
                </button>
              </div>

              {/* 信任徽章 */}
              <div className="flex flex-wrap items-center justify-center gap-8 mt-12 text-primary-100">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>数据安全</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  <span>极速响应</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>完全免费</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
