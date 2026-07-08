"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const initialTheme = saved || "system";
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (t: "light" | "dark" | "system") => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = t === "dark" || (t === "system" && prefersDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  };

  const setThemeMode = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    localStorage.setItem("theme", mode);
    applyTheme(mode);
    setIsOpen(false);
  };

  // Simple toggle for mobile/small screens
  const toggleSimple = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setThemeMode(newTheme);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="relative hidden sm:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-105"
        aria-label="切换主题"
      >
        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 animate-slide-down z-50">
          <button
            onClick={() => setThemeMode("light")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              theme === "light"
                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Sun className="w-4 h-4" />
            浅色模式
          </button>
          <button
            onClick={() => setThemeMode("dark")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              theme === "dark"
                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Moon className="w-4 h-4" />
            深色模式
          </button>
          <button
            onClick={() => setThemeMode("system")}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
              theme === "system"
                ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            <Monitor className="w-4 h-4" />
            跟随系统
          </button>
        </div>
      )}
    </div>
  );
}

// Simple toggle for mobile
export function ThemeToggleSimple() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = saved ? saved === "dark" : prefersDark;
    setIsDark(shouldBeDark);
    document.documentElement.classList.toggle("dark", shouldBeDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
      aria-label="切换主题"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-600" />
      )}
    </button>
  );
}
