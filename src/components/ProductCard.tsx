"use client";

import Link from "next/link";
import { ShoppingCart, Star, Users, ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  badge?: string;
  icon: LucideIcon;
  gradient: string;
  features?: string[];
  salesCount?: number;
  rating?: number;
  size?: "sm" | "md" | "lg";
  onBuyClick?: () => void;
}

export default function ProductCard({
  id,
  name,
  description,
  price,
  originalPrice,
  category,
  badge,
  icon: Icon,
  gradient,
  features = [],
  salesCount,
  rating,
  size = "md",
  onBuyClick,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const discount = Math.round((1 - price / originalPrice) * 100);

  const sizeClasses = {
    sm: {
      card: "p-4",
      cover: "h-28",
      icon: "w-10 h-10",
      title: "text-base",
      desc: "text-xs",
      price: "text-xl",
    },
    md: {
      card: "p-6",
      cover: "h-40",
      icon: "w-14 h-14",
      title: "text-lg",
      desc: "text-sm",
      price: "text-2xl",
    },
    lg: {
      card: "p-7",
      cover: "h-48",
      icon: "w-16 h-16",
      title: "text-xl",
      desc: "text-base",
      price: "text-3xl",
    },
  };

  const s = sizeClasses[size];

  return (
    <div
      className={`group relative bg-white dark:bg-slate-800/40 rounded-2xl ${s.card} border border-slate-200/80 dark:border-slate-700/50 hover:border-primary-300/60 dark:hover:border-primary-600/40 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.3)] transition-all duration-300 hover:-translate-y-1 flex flex-col`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover / Icon */}
      <div className="relative mb-5">
        <div
          className={`w-full ${s.cover} rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center relative overflow-hidden`}
        >
          <Icon className={`${s.icon} text-white/95 relative z-10 transition-transform duration-500 ${isHovered ? "scale-110" : ""}`} />
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          
          {/* Shine effect on hover */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 ${isHovered ? "translate-x-full" : ""}`} />
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-white text-red-500 text-xs font-bold rounded-full shadow-lg backdrop-blur-sm">
              {badge}
            </span>
          </div>
        )}

        {/* Discount badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
            -{discount}%
          </span>
        </div>
      </div>

      {/* Category */}
      <div className="mb-2">
        <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 rounded-full">
          {category}
        </span>
      </div>

      {/* Title */}
      <Link
        href={`/products/${id}`}
        className={`${s.title} font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-1`}
      >
        {name}
      </Link>

      {/* Description */}
      <p className={`${s.desc} text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1`}>
        {description}
      </p>

      {/* Features - show for md and lg sizes */}
      {size !== "sm" && features.length > 0 && (
        <div className="mb-4 space-y-1.5">
          {features.slice(0, 2).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">{feature}</span>
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      {(salesCount || rating) && size !== "sm" && (
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 dark:text-slate-400">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300">{rating}</span>
            </div>
          )}
          {salesCount && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{salesCount.toLocaleString()}人已购</span>
            </div>
          )}
        </div>
      )}

      {/* Price + Action */}
      <div className="flex items-end justify-between gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`${s.price} font-bold text-slate-900 dark:text-white`}>
              ¥{price}
            </span>
            <span className="text-xs text-slate-400 line-through">
              ¥{originalPrice}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/products/${id}`}
            className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors inline-flex items-center gap-1"
          >
            详情
            <ChevronRight className="w-3 h-3" />
          </Link>
          <button
            onClick={onBuyClick}
            className="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 rounded-lg transition-all shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30 inline-flex items-center gap-1"
          >
            <ShoppingCart className="w-3 h-3" />
            购买
          </button>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-gradient-to-br from-primary-500/5 to-accent-500/5" />
    </div>
  );
}
