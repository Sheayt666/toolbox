"use client";

import { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  MessageCircle,
  QrCode,
  ExternalLink,
  Clock,
  Shield,
  Mail,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { purchaseContact, trustBadges } from "@/lib/products";
import { Zap, RefreshCcw, Users } from "lucide-react";

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productPrice?: number;
}

type TabType = "wechat" | "qq" | "xianyu";

export default function PurchaseModal({
  isOpen,
  onClose,
  productName = "",
  productPrice,
}: PurchaseModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("wechat");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: LucideIcon; color: string }[] = [
    { id: "wechat", label: "微信购买", icon: MessageCircle, color: "from-green-500 to-emerald-500" },
    { id: "qq", label: "QQ购买", icon: QrCode, color: "from-blue-500 to-sky-500" },
    { id: "xianyu", label: "闲鱼店铺", icon: ShoppingBag, color: "from-orange-500 to-amber-500" },
  ];

  const badgeIcons = [Shield, Zap, RefreshCcw, Users];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header gradient */}
        <div className="relative bg-gradient-to-br from-primary-500 to-accent-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8" />
            <h3 className="text-xl font-bold">购买方式</h3>
          </div>
          {productName && (
            <p className="text-primary-100 text-sm">
              您正在购买：<span className="font-medium">{productName}</span>
              {productPrice !== undefined && (
                <span className="ml-2 text-lg font-bold">¥{productPrice}</span>
              )}
            </p>
          )}
        </div>

        {/* Tab buttons */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                <TabIcon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-accent-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* WeChat Tab */}
          {activeTab === "wechat" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-2xl p-5 border border-green-200/50 dark:border-green-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">添加微信客服</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">复制微信号添加好友</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-green-200/50 dark:border-green-800/30">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">微信号</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-lg">
                      {purchaseContact.wechat}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(purchaseContact.wechat, "wechat")}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 ${
                      copiedField === "wechat"
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg hover:shadow-green-500/25"
                    }`}
                  >
                    {copiedField === "wechat" ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>添加时请备注「{productName || "购买产品"}」，方便快速处理</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>支持微信转账，付款后立即发货</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QQ Tab */}
          {activeTab === "qq" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-2xl p-5 border border-blue-200/50 dark:border-blue-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">QQ联系购买</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">复制QQ号添加好友</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-3 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">QQ号</p>
                    <p className="font-mono font-bold text-slate-900 dark:text-white text-lg">
                      {purchaseContact.qq}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(purchaseContact.qq, "qq")}
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 ${
                      copiedField === "qq"
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-r from-blue-500 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-500/25"
                    }`}
                  >
                    {copiedField === "qq" ? (
                      <>
                        <Check className="w-4 h-4" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        复制
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>添加时请备注「{productName || "购买产品"}」</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>支持QQ红包/转账，付款后立即发货</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Xianyu Tab */}
          {activeTab === "xianyu" && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-2xl p-5 border border-orange-200/50 dark:border-orange-800/30">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">闲鱼店铺购买</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">平台担保交易，安全放心</p>
                  </div>
                </div>

                <a
                  href={purchaseContact.xianyuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  打开闲鱼店铺
                </a>

                <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>搜索店铺「工具箱数字商店」找到对应产品</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>平台担保交易，确认收货后付款，安全有保障</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Email alternative */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">邮箱咨询</p>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {purchaseContact.email}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(purchaseContact.email, "email")}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-500 dark:text-slate-400"
              aria-label="复制邮箱"
            >
              {copiedField === "email" ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Response time */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4" />
            <span>客服响应时间：{purchaseContact.responseTime}</span>
          </div>
        </div>

        {/* Trust badges footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="grid grid-cols-4 gap-2">
            {trustBadges.map((badge, i) => {
              const BadgeIcon = badgeIcons[i];
              return (
                <div key={i} className="flex flex-col items-center gap-1 text-center">
                  <BadgeIcon className={`w-5 h-5 ${badge.color}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {badge.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
