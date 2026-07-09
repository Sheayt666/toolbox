import Link from "next/link";
import { Wrench, Heart, Mail, Code2, MessageCircle } from "lucide-react";
import { categories, getAllTools, getToolsByCategory } from "@/lib/tools";

export default function Footer() {
  const allTools = getAllTools();

  const mainCategories = categories
    .filter((c) => c.id !== "all")
    .slice(0, 4)
    .map((cat) => ({
      ...cat,
      tools: getToolsByCategory(cat.name).slice(0, 4),
    }));

  return (
    <footer className="bg-[#0d0d0f] border-t border-[#27272a]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Wrench className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                99在线工具
              </span>
            </Link>
            <p className="text-sm text-slate-500 max-w-xs mb-5 leading-relaxed">
              发现最好用的在线工具，精选全球优质工具资源，让工作和生活更高效。
            </p>

            {/* Stats */}
            <div className="flex items-center gap-5 mb-5">
              <div>
                <div className="text-lg font-bold text-white">{allTools.length}+</div>
                <div className="text-xs text-slate-500 mt-0.5">免费工具</div>
              </div>
              <div className="w-px h-8 bg-[#27272a]" />
              <div>
                <div className="text-lg font-bold text-white">{categories.length - 1}</div>
                <div className="text-xs text-slate-500 mt-0.5">工具分类</div>
              </div>
              <div className="w-px h-8 bg-[#27272a]" />
              <div>
                <div className="text-lg font-bold text-white">100%</div>
                <div className="text-xs text-slate-500 mt-0.5">免费使用</div>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-slate-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Code2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-slate-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="mailto:hello@99工具.com"
                className="p-2 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-slate-400 hover:text-white transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          {mainCategories.map((cat) => {
            const CatIcon = cat.icon;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-md bg-primary-500/10 flex items-center justify-center">
                    <CatIcon className="w-3.5 h-3.5 text-primary-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {cat.name}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {cat.tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={`/tools/${tool.id}`}
                        className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Resources */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-md bg-primary-500/10 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-primary-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-white">资源</h3>
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                  产品推荐
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                  隐私政策
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-700 group-hover:bg-primary-500 transition-colors" />
                  使用条款
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#27272a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">
              © 2026 99在线工具. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                用心打造
              </span>
              <span className="text-[#27272a]">·</span>
              <span>持续更新</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
