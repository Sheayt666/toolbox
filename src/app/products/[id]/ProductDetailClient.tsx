"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ShoppingCart,
  ArrowLeft,
  Shield,
  Zap,
  RefreshCcw,
  Star,
  Users,
  Clock,
  ChevronDown,
  ChevronUp,
  Gift,
  Package,
  ThumbsUp,
  MessageCircle,
  Award,
  type LucideIcon,
} from "lucide-react";
import {
  getProductById,
  getRelatedProducts,
  trustBadges,
} from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import PurchaseModal from "@/components/PurchaseModal";

interface ProductDetailClientProps {
  productId: string;
}

export default function ProductDetailClient({
  productId,
}: ProductDetailClientProps) {
  const product = getProductById(productId);
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  if (!product) {
    notFound();
  }

  const discount = Math.round(
    (1 - product.price / product.originalPrice) * 100
  );
  const relatedProducts = getRelatedProducts(product.id, 3);
  const ProductIcon = product.icon;

  const badgeIcons: LucideIcon[] = [Shield, Zap, RefreshCcw, Users];

  const handleBuy = () => {
    setIsPurchaseOpen(true);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <PurchaseModal
        isOpen={isPurchaseOpen}
        onClose={() => setIsPurchaseOpen(false)}
        productName={product.name}
        productPrice={product.price}
      />

      {/* Breadcrumb / Back */}
      <div className="bg-white dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回产品列表</span>
          </Link>
        </div>
      </div>

      {/* ============ HERO SECTION ============ */}
      <section className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b from-primary-50/40 via-transparent to-transparent dark:from-primary-950/20 dark:to-transparent`} />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: Product Visual */}
            <div className="relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md aspect-square">
                {/* Glow behind */}
                <div className={`absolute -inset-8 bg-gradient-to-br ${product.gradient} rounded-full blur-3xl opacity-20`} />

                {/* Main product visual */}
                <div
                  className={`relative w-full aspect-square rounded-3xl bg-gradient-to-br ${product.gradient} flex items-center justify-center overflow-hidden shadow-2xl`}
                >
                  <ProductIcon className="w-32 h-32 lg:w-40 lg:h-40 text-white/95 relative z-10" />
                  {/* Decorative elements */}
                  <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute bottom-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-6 left-6">
                      <span className="px-4 py-1.5 bg-white text-red-500 text-sm font-bold rounded-full shadow-lg">
                        {product.badge}
                      </span>
                    </div>
                  )}

                  {/* Discount badge */}
                  <div className="absolute top-6 right-6">
                    <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full shadow-lg">
                      省¥{product.originalPrice - product.price}
                    </span>
                  </div>
                </div>

                {/* Floating stats */}
                <div className="absolute -bottom-4 -left-2 lg:-left-6 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {product.reviews.slice(0, 3).map((r) => (
                      <div
                        key={r.id}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-800`}
                      >
                        {r.avatar}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(product.rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                      <span className="text-sm font-semibold text-slate-900 dark:text-white ml-1">
                        {product.rating}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.salesCount.toLocaleString()}+ 用户已购买
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="flex flex-col order-1 lg:order-2">
              {/* Category */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  数字产品 即时交付
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Description */}
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-2xl p-5 mb-6 border border-amber-200/50 dark:border-amber-800/30">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-5xl font-bold text-slate-900 dark:text-white">
                    ¥{product.price}
                  </span>
                  <span className="text-xl text-slate-400 line-through">
                    ¥{product.originalPrice}
                  </span>
                  <span className="px-2.5 py-1 bg-red-500 text-white text-sm font-bold rounded-lg">
                    {discount}% OFF
                  </span>
                </div>
                <p className="text-sm text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">限时优惠</span>，随时可能恢复原价
                </p>
              </div>

              {/* Quick features */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {product.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleBuy}
                  className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 text-center inline-flex items-center justify-center gap-2 text-lg group"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>立即购买</span>
                  <span className="text-sm opacity-80">¥{product.price}</span>
                </button>
                <p className="text-center text-sm text-slate-500 dark:text-slate-500">
                  支持微信/QQ/闲鱼购买，付款后立即交付
                </p>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-4 gap-2 pt-6 border-t border-slate-200 dark:border-slate-700">
                {trustBadges.map((badge, i) => {
                  const BadgeIcon = badgeIcons[i];
                  return (
                    <div key={i} className="text-center">
                      <div className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2`}>
                        <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {badge.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT ============ */}
      <section className="py-10 lg:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:gap-8">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Product Highlights */}
              <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    产品亮点
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {product.highlights.map((highlight, i) => {
                    const HighlightIcon = highlight.icon;
                    return (
                      <div
                        key={i}
                        className="p-5 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/30 hover:border-primary-300/50 dark:hover:border-primary-600/30 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                          <HighlightIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1.5">
                          {highlight.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {highlight.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Product Contents */}
              <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    产品包含内容
                  </h2>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  {product.longDescription}
                </p>

                <div className="space-y-4">
                  {product.contents.map((content, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      <div className="bg-slate-50 dark:bg-slate-700/30 px-5 py-3 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {content.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {content.description}
                        </p>
                      </div>
                      <div className="p-5">
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {content.items.map((item, j) => (
                            <li
                              key={j}
                              className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300"
                            >
                              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Suitable for */}
                <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-950/20 dark:to-accent-950/20 rounded-xl border border-primary-200/50 dark:border-primary-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    <h4 className="font-semibold text-slate-900 dark:text-white">适合人群</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.suitableFor.map((person, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"
                      >
                        {person}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Reviews */}
              <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                      <ThumbsUp className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      用户评价
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {product.rating}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      ({product.salesCount.toLocaleString()}+评价)
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  {product.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/30"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${product.gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                          {review.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white">
                              {review.name}
                            </h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-slate-300 dark:text-slate-600"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-13">
                        {review.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ */}
              <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6 lg:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center`}>
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    常见问题
                  </h2>
                </div>

                <div className="space-y-3">
                  {product.faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <span className="font-medium text-slate-900 dark:text-white">
                          {faq.question}
                        </span>
                        {openFaq === i ? (
                          <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        )}
                      </button>
                      {openFaq === i && (
                        <div className="px-5 pb-4 pt-0">
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Sticky */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Price Card */}
                <div className="bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 p-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">
                      ¥{product.price}
                    </span>
                    <span className="text-base text-slate-400 line-through">
                      ¥{product.originalPrice}
                    </span>
                    <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                      {discount}%OFF
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mb-5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    限时优惠中
                  </p>

                  <button
                    onClick={handleBuy}
                    className="w-full px-6 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-accent-600 transition-all shadow-lg shadow-primary-500/25 text-center inline-flex items-center justify-center gap-2 mb-3"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>立即购买</span>
                  </button>

                  <div className="space-y-2.5 pt-5 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span>即时交付，付款后立即获取</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>7天无理由退款保障</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <RefreshCcw className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span>{product.updateFrequency}，终身免费</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <Award className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span>交付方式：{product.deliveryMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Gift bonus */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-5 h-5" />
                      <h4 className="font-bold">今日下单福利</h4>
                    </div>
                    <p className="text-sm text-amber-100 mb-3">
                      现在购买赠送额外惊喜礼包，数量有限！
                    </p>
                    <button
                      onClick={handleBuy}
                      className="w-full py-2.5 bg-white text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition-colors text-sm"
                    >
                      立即抢购
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============ RELATED PRODUCTS ============ */}
      <section className="py-12 lg:py-16 bg-white dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">
              <Gift className="w-4 h-4" />
              更多精选
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              相关产品推荐
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              搭配购买效率更高，更多优质数字产品等你发现
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                description={p.description}
                price={p.price}
                originalPrice={p.originalPrice}
                category={p.category}
                badge={p.badge}
                icon={p.icon}
                gradient={p.gradient}
                features={p.features}
                salesCount={p.salesCount}
                rating={p.rating}
                onBuyClick={handleBuy}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============ BOTTOM CTA ============ */}
      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl p-8 lg:p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                还有疑问？联系客服咨询
              </h2>
              <p className="text-primary-100 text-base mb-6 max-w-xl mx-auto">
                对产品有任何疑问，欢迎添加微信咨询，我们会耐心解答您的所有问题。
              </p>
              <button
                onClick={handleBuy}
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-xl shadow-black/10"
              >
                <MessageCircle className="w-5 h-5" />
                添加微信咨询
              </button>
              <p className="text-primary-200 text-sm mt-4">
                客服响应时间：工作日 9:00-21:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile sticky buy bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 z-40">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                ¥{product.price}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ¥{product.originalPrice}
              </span>
            </div>
          </div>
          <button
            onClick={handleBuy}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            立即购买
          </button>
        </div>
      </div>
      <div className="lg:hidden h-20" />
    </div>
  );
}
