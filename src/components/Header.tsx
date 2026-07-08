"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { BookOpen, ChevronDown, ChevronRight, Code2, FileText, Grid3X3, Home, Info, Menu, Palette, Search, Sparkles, ShoppingBag, TrendingUp, Wrench, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { tools, categories, getCategorySlugByName } from "@/lib/tools";
import { useRouter } from "next/navigation";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const filteredTools = tools.filter(
    (tool) =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredTools.length > 0) {
      router.push(filteredTools[0].path);
      setShowSearchResults(false);
      setSearchQuery("");
    }
  };

  const handleToolClick = (path: string) => {
    router.push(path);
    setShowSearchResults(false);
    setSearchQuery("");
    setIsMenuOpen(false);
  };

  // Get tools by category for dropdown
  const toolsByCategory = categories
    .filter((c) => c.id !== "all")
    .map((cat) => ({
      ...cat,
      tools: tools.filter((t) => t.category === cat.id).slice(0, 5),
    }));

  const categoryIcons: Record<string, React.ElementType> = {
    "开发工具": Code2,
    "设计工具": Palette,
    "文本工具": FileText,
    "实用工具": Sparkles,
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200/60 dark:border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white">
              工具<span className="gradient-text">箱</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <nav className="flex items-center gap-1 mr-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <Home className="w-4 h-4" />
                首页
              </Link>

              {/* Category Dropdown */}
              <div ref={categoryRef} className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                >
                  <Grid3X3 className="w-4 h-4" />
                  工具分类
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[520px] bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 animate-slide-down">
                    <div className="grid grid-cols-2 gap-4">
                      {toolsByCategory.map((cat) => {
                        const CatIcon = categoryIcons[cat.id] || Grid3X3;
                        return (
                          <div key={cat.id} className="space-y-2">
                            <Link
                              href={`/category/${getCategorySlugByName(cat.id)}`}
                              onClick={() => setIsCategoryOpen(false)}
                              className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                            >
                              <CatIcon className="w-4 h-4 text-primary-500" />
                              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                {cat.name}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 ml-auto" />
                            </Link>
                            <div className="space-y-0.5">
                              {cat.tools.map((tool) => {
                                const ToolIcon = tool.icon;
                                return (
                                  <button
                                    key={tool.id}
                                    onClick={() => handleToolClick(tool.path)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors text-left"
                                  >
                                    <ToolIcon className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{tool.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <Link
                        href="/#tools"
                        onClick={() => setIsCategoryOpen(false)}
                        className="flex items-center justify-center gap-1.5 w-full py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        查看全部工具
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/blog"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <BookOpen className="w-4 h-4" />
                博客
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                数字产品
              </Link>
            </nav>

            {/* Search Bar - Desktop */}
            <div ref={searchRef} className="relative w-72 xl:w-80">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                  />
                </div>
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-slide-down">
                  {filteredTools.length > 0 ? (
                    <div className="py-1 max-h-80 overflow-y-auto">
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        搜索结果 ({filteredTools.length})
                      </div>
                      {filteredTools.slice(0, 6).map((tool) => {
                        const ToolIcon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => handleToolClick(tool.path)}
                            className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-3"
                          >
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                              <ToolIcon className="w-4.5 h-4.5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                {tool.name}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {tool.description}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 flex-shrink-0">
                              {tool.category}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        没有找到匹配的工具
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <ThemeToggle />
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 lg:hidden">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                // Scroll to top and focus search on mobile - we'll open menu with search
                setIsMenuOpen(true);
              }}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="搜索"
            >
              <Search className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="菜单"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md animate-slide-down">
          <div className="px-4 py-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Mobile Search */}
            <div ref={searchRef} className="relative">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="搜索工具..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(true);
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 outline-none transition-all"
                    autoFocus
                  />
                </div>
              </form>

              {searchQuery && filteredTools.length > 0 && (
                <div className="mt-2 space-y-1">
                  {filteredTools.slice(0, 5).map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToolClick(tool.path)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                      >
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                          <ToolIcon className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {tool.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Navigation Links */}
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Home className="w-5 h-5 text-primary-500" />
                <span className="font-medium">首页</span>
              </Link>
              <Link
                href="/#tools"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Grid3X3 className="w-5 h-5 text-primary-500" />
                <span className="font-medium">全部工具</span>
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <BookOpen className="w-5 h-5 text-primary-500" />
                <span className="font-medium">博客</span>
              </Link>
              <Link
                href="/products"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                <span className="font-medium">数字产品</span>
              </Link>
              <Link
                href="/#about"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Info className="w-5 h-5 text-primary-500" />
                <span className="font-medium">关于我们</span>
              </Link>
            </div>

            {/* Categories in Mobile Menu */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                工具分类
              </h3>
              {toolsByCategory.map((cat) => {
                const CatIcon = categoryIcons[cat.id] || Grid3X3;
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1.5">
                      <CatIcon className="w-4 h-4 text-primary-500" />
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {cat.name}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pl-4">
                      {cat.tools.map((tool) => (
                        <button
                          key={tool.id}
                          onClick={() => handleToolClick(tool.path)}
                          className="flex items-center gap-1.5 px-2 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left truncate"
                        >
                          <tool.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate text-xs">{tool.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Popular Tools Quick Access */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 px-3">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  热门工具
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {tools.slice(0, 4).map((tool) => {
                  const ToolIcon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool.path)}
                      className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                        <ToolIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                        {tool.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
