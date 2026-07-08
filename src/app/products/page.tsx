"use client";

import { useState } from "react";
import {
  Sparkles,
  ShoppingCart,
  Zap,
  Shield,
  RefreshCcw,
  Users,
  Star,
  TrendingUp,
  Filter,
  type LucideIcon,
  MessageCircle,
} from "lucide-react";
import { products, productCategories, trustBadges } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import PurchaseModal from "@/components/PurchaseModal";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);

  const filteredProducts = products.filter(
    (product) =>
      activeCategory === "all" || product.category === activeCategory
  );

  const badgeIcons: LucideIcon[] = [Shield, Zap, RefreshCcw, Users];

  const handleBuy = () => {
    setIsPurchaseOpen(true);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
      />

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/60 via-slate-50 to-slate-50 dark:from-indigo-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-primary-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-accent-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-grid opacity-[0.2] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span>精选数字产品，付款后立即交付</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              数字产品
              <span className="gradient-text">好物精选</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              精心打磨的高质量数字产品，AI提示词、Notion模板、开发者工具包、设计素材等，
              助力效率提升，让你的工作事半功倍。
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {products.length}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  精选产品
                </div>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  4.9
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  平均评分
                </div>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  1万+
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  用户信赖
                </div>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/50">
                <div className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  7天
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  无理由退款
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-slate-600 dark:text-slate-400">
              {trustBadges.map((badge, i) => {
                const BadgeIcon = badgeIcons[i];
                return (
                  <div key={i} className="flex items-center gap-2">
                    <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                    <span>{badge.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRODUCTS SECTION ============ */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-5 h-5 text-primary-500" />
                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                  产品分类
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                浏览全部产品
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>
                共 <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredProducts.length}</span> 款产品
              </span>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {productCategories.map((category) => {
              const CatIcon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <CatIcon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className="animate-fade-in-up"
              >
                <ProductCard
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
                  onBuyClick={handleBuy}
                />
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Filter className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-lg">
                该分类暂无产品
              </p>
              <button
                onClick={() => setActiveCategory("all")}
                className="mt-3 text-primary-600 dark:text-primary-400 font-medium hover:underline"
              >
                查看全部产品
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ============ WHY CHOOSE US ============ */}
      <section className="py-16 lg:py-20 bg-white dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              为什么选择我们
            </div>
            <h2 className="text-2xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              品质保障，放心购买
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              我们致力于提供最优质的数字产品和最佳的购买体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "即时交付",
                desc: "付款后立即获取产品，无需等待，马上开始使用",
                color: "from-amber-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "7天无理由退款",
                desc: "购买后7天内不满意，随时申请全额退款",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: RefreshCcw,
                title: "终身免费更新",
                desc: "产品持续更新优化，购买后享受终身免费更新",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: MessageCircle,
                title: "贴心客服",
                desc: "微信/QQ/邮箱多渠道客服，及时解答您的疑问",
                color: "from-purple-500 to-pink-500",
              },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={i}
                  className="relative group bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/50 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-all"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                  >
                    <ItemIcon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 p-10 lg:p-14 text-center">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 bg-grid opacity-10" />

            <div className="relative">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4">
                有问题？联系我们
              </h2>
              <p className="text-primary-100 text-lg lg:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                对产品有任何疑问，或者需要定制服务？
                欢迎添加微信咨询，我们会竭诚为您服务。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleBuy}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl shadow-black/10 hover:shadow-2xl hover:shadow-black/15 hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  立即选购
                </button>
                <button
                  onClick={handleBuy}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  微信咨询
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-primary-100 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>7天无理由退款</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span>即时交付</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span>品质保证</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>上万用户信赖</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
