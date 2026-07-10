"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Zap,
  Lock,
  Sparkles,
  ChevronRight,
  Users,
  Clock,
  Flame,
  Gift,
  CheckCircle,
  Star,
  TrendingUp,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";

// ============================================================
// 1. VIP升级横幅 - 工具内容顶部紧凑横幅
// ============================================================
export function VIPUpgradeBanner({ category }: { category?: string }) {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-red-500/15 border border-amber-500/25 p-3 sm:p-4 mb-4">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="relative flex items-center gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
          <Crown className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">VIP会员限时特惠</span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">省70%</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
            解锁全部500+工具高级功能 · 去水印 · 批量处理 · 无限制使用
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-amber-300">{pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}</span>
          </div>
          <Link
            href="/vip"
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
          >
            立即开通
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 2. 付费产品推荐卡 - 工具内容下方分类匹配推荐
// ============================================================
interface PaidProductCardProps {
  products: Array<{
    id: string;
    name: string;
    shortName?: string;
    price: number;
    originalPrice: number;
    description: string;
    icon: LucideIcon;
    gradient: string;
    salesCount: number;
    rating: number;
  }>;
  onPurchase?: () => void;
}

export function PaidProductRecommendation({ products, onPurchase }: PaidProductCardProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="rounded-2xl border border-primary-500/20 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500/15 to-accent-500/15 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-bold text-white">解锁完整版 · 效率提升10倍</span>
        </div>
        <Link href="/products" className="text-xs text-primary-400 hover:underline font-medium">
          全部产品 →
        </Link>
      </div>

      {/* Products */}
      <div className="bg-[#18181b] p-4 space-y-3">
        {products.map((product) => {
          const PIcon = product.icon;
          return (
            <div
              key={product.id}
              className="flex items-center gap-4 p-3 sm:p-4 rounded-xl bg-[#0f0f12] border border-[#27272a] hover:border-primary-500/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center flex-shrink-0`}>
                <PIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{product.shortName || product.name}</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-amber-400">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    {product.rating}
                  </span>
                  <span className="text-[10px] text-slate-500">已售{product.salesCount}+</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 truncate">{product.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-bold text-primary-400">¥{product.price}</span>
                  <span className="text-xs text-slate-600 line-through">¥{product.originalPrice}</span>
                </div>
                <button
                  onClick={onPurchase}
                  className="px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-md hover:from-primary-600 hover:to-accent-600 transition-all"
                >
                  立即购买
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 3. 私域捕获CTA - 微信公众号引导
// ============================================================
export function PrivateDomainCTA() {
  const [showQR, setShowQR] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#18181b] to-teal-500/10 border border-emerald-500/20 p-4 sm:p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-white">免费领取工具使用手册</span>
            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">限时免费</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            关注公众号回复「<span className="text-emerald-400 font-medium">工具</span>」领取500+工具使用教程合集
          </p>
        </div>
        <button
          onClick={() => setShowQR(!showQR)}
          className="flex-shrink-0 px-3 sm:px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-all whitespace-nowrap"
        >
          {showQR ? "收起" : "关注领取"}
        </button>
      </div>

      {showQR && (
        <div className="mt-4 pt-4 border-t border-emerald-500/15 flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-white rounded-xl p-3 flex-shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-[#f5f5f5] rounded-lg flex items-center justify-center">
              <img src="/wechat-pay.jpg" alt="公众号二维码" className="w-full h-full object-cover rounded-lg" />
            </div>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-white mb-1">微信扫码关注公众号</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              · 每周更新工具使用技巧<br />
              · 专属VIP优惠码抢先领<br />
              · 工具使用问题随时解答
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 4. 社会认同徽章 - 购买数据展示
// ============================================================
export function SocialProofBadge() {
  const [count, setCount] = useState(237);

  useEffect(() => {
    const baseCount = 237;
    const randomAdd = Math.floor(Math.random() * 20) + 5;
    setCount(baseCount + randomAdd);
    const timer = setInterval(() => {
      setCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-center gap-3 py-2 text-xs text-slate-500">
      <div className="flex -space-x-2">
        {[
          "from-primary-500 to-accent-500",
          "from-blue-500 to-cyan-500",
          "from-emerald-500 to-teal-500",
          "from-amber-500 to-orange-500",
        ].map((g, i) => (
          <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${g} border-2 border-[#18181b] flex items-center justify-center`}>
            <Users className="w-3 h-3 text-white" />
          </div>
        ))}
      </div>
      <span>
        今日已有 <span className="text-primary-400 font-bold">{count}</span> 位用户购买付费产品
      </span>
      <span className="flex items-center gap-1 text-emerald-400">
        <TrendingUp className="w-3 h-3" />
        持续增长中
      </span>
    </div>
  );
}

// ============================================================
// 5. VIP定价卡片 - 三档定价
// ============================================================
export function VIPPricingCards() {
  const plans = [
    {
      name: "月卡VIP",
      price: 19,
      original: 39,
      period: "/月",
      features: [
        "全部工具去水印",
        "每日无限次使用",
        "批量处理功能",
        "历史记录保存7天",
      ],
      gradient: "from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/25",
      btnColor: "from-blue-500 to-cyan-500",
      popular: false,
      icon: Zap,
    },
    {
      name: "年卡VIP",
      price: 99,
      original: 468,
      period: "/年",
      features: [
        "月卡全部功能",
        "12款付费工具包全解锁",
        "专属微信交流群",
        "每月新增工具优先体验",
        "历史记录永久保存",
        "优先客服支持",
      ],
      gradient: "from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/40",
      btnColor: "from-amber-500 to-orange-500",
      popular: true,
      icon: Crown,
      badge: "最受欢迎 · 省78%",
    },
    {
      name: "企业版",
      price: 299,
      original: 999,
      period: "/年",
      features: [
        "年卡全部功能",
        "API接口调用权限",
        "团队协作（5人）",
        "商用授权许可",
        "定制工具需求",
        "专属客户经理",
      ],
      gradient: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/25",
      btnColor: "from-emerald-500 to-teal-500",
      popular: false,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {plans.map((plan) => {
        const PIcon = plan.icon;
        return (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 ${plan.border} bg-gradient-to-b ${plan.gradient} p-6 ${
              plan.popular ? "md:-translate-y-3 md:scale-105 shadow-2xl shadow-amber-500/10" : ""
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${plan.btnColor} flex items-center justify-center`}>
                <PIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-white">{plan.name}</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-extrabold text-white">¥{plan.price}</span>
              <span className="text-sm text-slate-400">{plan.period}</span>
              <span className="text-sm text-slate-600 line-through">¥{plan.original}</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              折合每天仅 ¥{(plan.price / (plan.period.includes("年") ? 365 : 30)).toFixed(2)}
            </p>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/vip"
              className={`block w-full py-3 text-center text-sm font-bold text-white bg-gradient-to-r ${plan.btnColor} rounded-xl hover:opacity-90 transition-all`}
            >
              立即开通 {plan.name}
            </Link>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 6. 功能锁定提示 - VIP功能预览锁定
// ============================================================
export function FeatureLockPrompt({ featureName }: { featureName: string }) {
  return (
    <div className="rounded-xl bg-[#0f0f12] border border-dashed border-primary-500/30 p-5 text-center">
      <div className="inline-flex w-12 h-12 rounded-xl bg-primary-500/10 items-center justify-center mb-3">
        <Lock className="w-6 h-6 text-primary-400" />
      </div>
      <p className="text-sm font-semibold text-white mb-1">{featureName} 是 VIP 专属功能</p>
      <p className="text-xs text-slate-500 mb-4">开通VIP会员即可解锁全部高级功能</p>
      <Link
        href="/vip"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-accent-600 transition-all"
      >
        <Crown className="w-4 h-4" />
        开通VIP解锁
      </Link>
    </div>
  );
}

// ============================================================
// 7. 限时优惠弹窗 - 首次访问触发
// ============================================================
export function LimitedOfferPopup() {
  const [show, setShow] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("offer_seen");
    if (!seen && !closed) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("offer_seen", "1");
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [closed]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={() => { setShow(false); setClosed(true); }}
    >
      <div
        className="relative max-w-sm w-full bg-gradient-to-b from-[#1a1a1f] to-[#131316] rounded-2xl border border-amber-500/30 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => { setShow(false); setClosed(true); }}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-[#27272a] text-slate-400 hover:text-white transition-colors text-sm"
        >
          ✕
        </button>

        <div className="text-center">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center mb-4 shadow-xl shadow-amber-500/20">
            <Gift className="w-8 h-8 text-white" />
          </div>

          <div className="inline-block px-3 py-1 text-[10px] font-bold text-amber-300 bg-amber-500/15 rounded-full border border-amber-500/25 mb-3">
            🎉 新用户专享优惠
          </div>

          <h3 className="text-xl font-bold text-white mb-2">VIP年卡立减50元</h3>
          <p className="text-sm text-slate-400 mb-4">
            500+工具高级功能全解锁<br />
            原价¥149，今日仅需<span className="text-amber-400 font-bold text-lg">¥99</span>
          </p>

          <div className="bg-[#0f0f12] rounded-xl p-3 mb-4">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>优惠剩余时间：</span>
              <CountdownTimer />
            </div>
          </div>

          <Link
            href="/vip"
            onClick={() => { setShow(false); setClosed(true); }}
            className="block w-full py-3 text-center text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
          >
            🚀 立即抢购优惠
          </Link>

          <button
            onClick={() => { setShow(false); setClosed(true); }}
            className="mt-3 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            不了，谢谢
          </button>
        </div>
      </div>
    </div>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ h: 5, m: 59, s: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 5; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="font-mono font-bold text-amber-300">
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  );
}
