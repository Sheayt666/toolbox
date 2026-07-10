"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  Check,
  X,
  Zap,
  Users,
  Gift,
  Clock,
  ChevronRight,
  Star,
  Shield,
  Sparkles,
  MessageCircle,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

const plans = [
  {
    name: "月卡VIP",
    price: 19,
    original: 39,
    period: "月",
    daily: 0.63,
    features: [
      { text: "全部500+工具去水印", included: true },
      { text: "每日无限次使用", included: true },
      { text: "批量处理功能", included: true },
      { text: "历史记录保存7天", included: true },
      { text: "12款付费工具包", included: false },
      { text: "专属微信交流群", included: false },
      { text: "API接口权限", included: false },
    ],
    gradient: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/25",
    btnColor: "from-blue-500 to-cyan-500",
    popular: false,
    icon: Zap,
  },
  {
    name: "年卡VIP",
    price: 99,
    original: 468,
    period: "年",
    daily: 0.27,
    features: [
      { text: "全部500+工具去水印", included: true },
      { text: "每日无限次使用", included: true },
      { text: "批量处理功能", included: true },
      { text: "历史记录永久保存", included: true },
      { text: "12款付费工具包全解锁", included: true },
      { text: "专属微信交流群", included: true },
      { text: "每月新增工具优先体验", included: true },
    ],
    gradient: "from-amber-500/20 to-orange-500/10",
    border: "border-amber-500/40",
    btnColor: "from-amber-500 to-orange-500",
    popular: true,
    badge: "最受欢迎 · 省78%",
    icon: Crown,
  },
  {
    name: "企业版",
    price: 299,
    original: 999,
    period: "年",
    daily: 0.82,
    features: [
      { text: "年卡全部功能", included: true },
      { text: "API接口调用权限", included: true },
      { text: "团队协作（5人）", included: true },
      { text: "商用授权许可", included: true },
      { text: "定制工具需求", included: true },
      { text: "专属客户经理", included: true },
      { text: "SLA服务保障", included: true },
    ],
    gradient: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/25",
    btnColor: "from-emerald-500 to-teal-500",
    popular: false,
    icon: Users,
  },
];

const faqs = [
  {
    q: "VIP会员和免费用户有什么区别？",
    a: "VIP会员可享受全部500+工具去水印、每日无限次使用、批量处理功能、历史记录保存等高级功能。年卡VIP还可解锁全部12款付费工具包，加入专属微信交流群，每月优先体验新增工具。",
  },
  {
    q: "购买后如何使用？",
    a: "购买后请将付款截图发送至QQ 2629676609或微信，我们会在24小时内为您开通VIP权限。VIP权限与您的QQ/微信账号绑定，登录后自动生效。",
  },
  {
    q: "可以退款吗？",
    a: "VIP会员为虚拟商品，购买后不支持7天无理由退款。如有文件使用问题，我们提供补发服务。建议先使用免费版体验工具功能后再决定是否购买。",
  },
  {
    q: "年卡和月卡可以切换吗？",
    a: "可以随时升级。月卡用户补差价即可升级为年卡。年卡到期后可续费，续费享受老用户优惠价。",
  },
  {
    q: "企业版支持开发票吗？",
    a: "企业版支持开具增值税普通发票。购买后联系客服提供开票信息即可。",
  },
];

export default function VIPPage() {
  const [timeLeft, setTimeLeft] = useState({ h: 5, m: 59, s: 59 });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.08] to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/[0.1] rounded-full blur-[100px]" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 text-xs font-bold text-amber-300 bg-amber-500/10 rounded-full border border-amber-500/20">
            <Crown className="w-3.5 h-3.5" />
            VIP会员限时特惠
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            开通VIP，<span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">解锁全部高级功能</span>
          </h1>

          <p className="text-base text-slate-400 max-w-xl mx-auto mb-6">
            500+工具去水印 · 批量处理 · 无限制使用 · 12款付费工具包全解锁
          </p>

          {/* Countdown */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#18181b] border border-amber-500/20 rounded-lg">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-400">优惠剩余：</span>
            <span className="font-mono font-bold text-amber-300 text-lg">
              {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
            </span>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const PIcon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border-2 ${plan.border} bg-gradient-to-b ${plan.gradient} p-6 ${
                    plan.popular ? "md:-translate-y-3 md:scale-105 shadow-2xl shadow-amber-500/10" : ""
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full whitespace-nowrap shadow-lg">
                      {plan.badge}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-5">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${plan.btnColor} flex items-center justify-center shadow-lg`}>
                      <PIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-white">{plan.name}</span>
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-4xl font-extrabold text-white">¥{plan.price}</span>
                    <span className="text-sm text-slate-400">/{plan.period}</span>
                    <span className="text-sm text-slate-600 line-through">¥{plan.original}</span>
                  </div>
                  <p className="text-xs text-amber-300/80 mb-5">折合每天仅 ¥{plan.daily}</p>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`flex items-center gap-2.5 text-sm ${f.included ? "text-slate-200" : "text-slate-600"}`}>
                        {f.included ? (
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-slate-700 flex-shrink-0" />
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#purchase"
                    className={`block w-full py-3 text-center text-sm font-bold text-white bg-gradient-to-r ${plan.btnColor} rounded-xl hover:opacity-90 transition-all shadow-lg`}
                  >
                    立即开通 {plan.name}
                  </a>
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-3 mt-8 text-sm text-slate-500">
            <div className="flex -space-x-2">
              {["from-primary-500 to-accent-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500"].map((g, i) => (
                <div key={i} className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} border-2 border-[#09090b]`} />
              ))}
            </div>
            <span>已有 <span className="text-amber-400 font-bold">3,200+</span> 位用户开通VIP</span>
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              4.9分好评
            </span>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">VIP专属权益</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "去水印", desc: "全部工具输出无水印" },
              { icon: Zap, title: "批量处理", desc: "一次性处理多个文件" },
              { icon: Clock, title: "无限使用", desc: "不限次数自由使用" },
              { icon: Gift, title: "工具包解锁", desc: "12款付费工具全免费" },
              { icon: MessageCircle, title: "专属社群", desc: "VIP微信群交流答疑" },
              { icon: TrendingUp, title: "优先体验", desc: "新工具上线先人一步" },
            ].map((b, i) => {
              const BIcon = b.icon;
              return (
                <div key={i} className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <BIcon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Purchase Section */}
      <section id="purchase" className="pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#18181b] rounded-2xl border border-amber-500/20 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 px-6 py-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                立即开通VIP
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="bg-white rounded-xl p-3 shadow-xl">
                  <div className="w-36 h-36 bg-[#f5f5f5] rounded-lg overflow-hidden">
                    <img src="/wechat-pay.jpg" alt="微信支付" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-center text-xs text-slate-600 mt-2 font-medium">微信扫码支付</p>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
                    <span className="text-sm text-slate-400">选择套餐：</span>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 text-xs font-bold text-blue-300 bg-blue-500/10 border border-blue-500/25 rounded">月卡 ¥19</span>
                      <span className="px-3 py-1 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded">年卡 ¥99</span>
                      <span className="px-3 py-1 text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded">企业 ¥299</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mb-3 leading-relaxed">
                    1. 扫码支付对应金额<br />
                    2. 将付款截图发送至 <span className="text-white font-medium">QQ 2629676609</span><br />
                    3. 24小时内开通VIP权限
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 justify-center sm:justify-start">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      安全支付
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      24小时开通
                    </span>
                    <span className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      补发保障
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">常见问题</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#1c1c1f] transition-colors"
                >
                  <span className="text-sm font-medium text-white">{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform flex-shrink-0 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/20 via-orange-500/10 to-red-500/15 border border-amber-500/20 p-8 sm:p-10 text-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-white mb-2">还在犹豫什么？</h2>
              <p className="text-slate-400 mb-5 text-sm">
                每天¥0.27，解锁500+工具全部高级功能
              </p>
              <a
                href="#purchase"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-4 h-4" />
                立即开通VIP
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Back to home */}
      <div className="text-center pb-12">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
