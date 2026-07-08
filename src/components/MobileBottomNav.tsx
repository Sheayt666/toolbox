"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Sparkles, Search, User } from "lucide-react";
import { useState } from "react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [showSearchHint, setShowSearchHint] = useState(false);

  const navItems = [
    { href: "/", icon: Home, label: "首页" },
    { href: "/#tools", icon: Grid3X3, label: "工具" },
    { href: "/#ai-tools", icon: Sparkles, label: "AI推荐" },
    { href: "/blog", icon: Search, label: "博客" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800/60 safe-area-bottom">
      <div className="flex items-center justify-around py-1.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 px-2 rounded-xl transition-all ${
                active
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  active
                    ? "bg-primary-50 dark:bg-primary-900/30 scale-110"
                    : ""
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
