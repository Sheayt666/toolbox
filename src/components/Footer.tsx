import Link from "next/link";
import {
  Wrench,
  Heart,
  Mail,
  Code2,
  Bird,
  Palette,
  FileText,
  Sparkles,
  BookOpen,
  Shield,
} from "lucide-react";
import { tools, categories } from "@/lib/tools";

export default function Footer() {
  // Group tools by category
  const toolsByCategory = categories
    .filter((c) => c.id !== "all")
    .map((cat) => ({
      ...cat,
      tools: tools.filter((t) => t.category === cat.id).slice(0, 4),
    }));

  const categoryIcons: Record<string, React.ElementType> = {
    "开发工具": Code2,
    "设计工具": Palette,
    "文本工具": FileText,
    "实用工具": Sparkles,
  };

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                工具<span className="gradient-text">箱</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
              免费、简洁、高效的在线工具箱。为开发者、设计师和日常用户提供实用的在线工具，所有工具完全免费，无需注册即可使用。
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">{tools.length}+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">免费工具</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">100%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">免费使用</div>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">0</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">注册要求</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                aria-label="GitHub"
              >
                <Code2 className="w-4.5 h-4.5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 dark:hover:bg-sky-900/30 text-slate-600 dark:text-slate-400 hover:text-sky-500 transition-all"
                aria-label="Twitter"
              >
                <Bird className="w-4.5 h-4.5" />
              </a>
              <a
                href="mailto:hello@toolbox.com"
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all"
                aria-label="Email"
              >
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Tool Categories */}
          {toolsByCategory.map((cat) => {
            const CatIcon = categoryIcons[cat.id] || Sparkles;
            return (
              <div key={cat.id}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                    <CatIcon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                </div>
                <ul className="space-y-2.5">
                  {cat.tools.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={tool.path}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                      >
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                        {tool.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {/* Resources Column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                资源
              </h3>
            </div>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                  博客文章
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                  产品推荐
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="#privacy"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                  隐私政策
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors flex items-center gap-1.5 group"
                >
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-primary-500 group-hover:w-1.5 transition-all" />
                  使用条款
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              © 2026 工具箱. 保留所有权利.
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" />
                数据安全
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                用心打造
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
