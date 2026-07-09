"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wrench, Search, Menu, X, Sparkles, Hash } from "lucide-react";
import { categories, getAllTools } from "@/lib/tools";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 5);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allTools = getAllTools();
  const mainCategories = categories.filter((c) => c.id !== "all").slice(0, 6);

  const filteredTools = searchQuery
    ? allTools
        .filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090b]/80 backdrop-blur-xl border-b border-[#27272a]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + Stats */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-white" />
              </div>
              <span className="text-[17px] font-semibold text-white tracking-tight">
                99工具
              </span>
            </Link>

            {/* Stats - 99工具 style */}
            <div className="hidden md:flex items-center gap-1 text-[13px] text-slate-400">
              <span className="font-medium text-slate-300">{allTools.length}</span>
              <span>个工具</span>
              <span className="text-slate-600">·</span>
              <span className="font-medium text-slate-300">{categories.length - 1}</span>
              <span>个分类</span>
            </div>
          </div>

          {/* Center: Search - 99工具 style big search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(e.target.value.length > 0);
                }}
                onFocus={() => searchQuery && setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 150)}
                placeholder="搜索工具，如 PDF 压缩、图片转换..."
                className="w-full h-10 pl-10 pr-4 text-sm bg-[#18181b] text-slate-200 rounded-lg border border-[#27272a] focus:border-primary-500/50 focus:shadow-[0_0_0_3px_rgba(168,85,247,0.1)] outline-none transition-all placeholder:text-slate-500"
              />

              {/* Search dropdown */}
              {showSearch && filteredTools.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#18181b] rounded-xl border border-[#27272a] shadow-2xl overflow-hidden animate-slide-down z-50">
                  {filteredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.id}`}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-[#27272a] transition-colors"
                      onClick={() => setShowSearch(false)}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <tool.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {tool.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {tool.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Right: Nav + Buttons */}
          <div className="flex items-center gap-2">
            {/* Desktop category quick links */}
            <nav className="hidden xl:flex items-center gap-1">
              {mainCategories.slice(0, 4).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-[#18181b] rounded-md transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>

            {/* Pro button */}
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Pro
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-[#18181b] transition-colors"
              aria-label="菜单"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Category tags bar - 99工具 style #tags */}
        <div className="hidden lg:flex items-center gap-1.5 py-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-slate-500 mr-1 flex-shrink-0">热门分类:</span>
          {categories
            .filter((c) => c.id !== "all")
            .slice(0, 12)
            .map((cat) => {
              const CatIcon = cat.icon;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-all flex-shrink-0 ${
                    pathname === `/category/${cat.slug}`
                      ? "text-white bg-primary-500/20 border border-primary-500/30"
                      : "text-slate-400 bg-[#18181b]/60 border border-transparent hover:text-white hover:bg-[#27272a] hover:border-[#3f3f46]"
                  }`}
                >
                  <Hash className="w-3 h-3 opacity-70" />
                  {cat.name}
                </Link>
              );
            })}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#27272a] bg-[#09090b] animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full h-10 pl-10 pr-4 text-sm bg-[#18181b] text-slate-200 rounded-lg border border-[#27272a] outline-none placeholder:text-slate-500"
                />
              </div>
            </form>

            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-300 rounded-lg hover:bg-[#18181b] hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <cat.icon className="w-4 h-4 text-slate-500" />
                {cat.name}
              </Link>
            ))}

            <Link
              href="/products"
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-primary-400 rounded-lg hover:bg-primary-500/10 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Sparkles className="w-4 h-4" />
              Pro 会员
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
