import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  blogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from "@/lib/blog-posts";
import { getToolBySlug } from "@/lib/tools";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Tag,
  ChevronRight,
  Home,
  Wrench,
} from "lucide-react";
import {
  ArticleSchema,
  BreadcrumbListSchema,
} from "@/components/SEOSchema";

// Only allow pre-generated params, return 404 for unknown slugs
export const dynamicParams = false;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all blog posts
export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

// Generate SEO metadata for each blog post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到",
      description: "抱歉，您访问的文章不存在。",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: [...post.tags, post.category, "99在线工具", "在线工具"],
    authors: [{ name: "99在线工具" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      locale: "zh_CN",
      publishedTime: post.publishDate,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Estimate reading time based on content length (Chinese characters)
const estimateReadTime = (content: string): number => {
  const charCount = content.length;
  // Average reading speed: ~400 Chinese characters per minute
  return Math.max(3, Math.ceil(charCount / 400));
};

// Escape HTML special characters to prevent injection
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Parse inline Markdown: bold (**text**) and inline code (`code`)
function parseInlineMarkdown(text: string): string {
  let result = escapeHtml(text);

  // Inline code: `code`
  result = result.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-indigo-600 dark:text-indigo-400 text-sm font-mono">$1</code>'
  );

  // Bold: **text**
  result = result.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-zinc-900 dark:text-white">$1</strong>'
  );

  return result;
}

// A simple hand-written Markdown to HTML parser.
// Supports: headings (##, ###), paragraphs, unordered lists (-),
// ordered lists (1.), code blocks (```), bold (**), inline code (`).
function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const htmlParts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Code block: ```
    if (line.trim().startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // Skip closing ```
      htmlParts.push(
        `<pre class="my-4 p-4 rounded-xl bg-zinc-900 dark:bg-black/50 border border-zinc-800 dark:border-zinc-700/50 overflow-x-auto"><code class="text-sm font-mono text-zinc-300 dark:text-zinc-200">${codeLines.join("\n")}</code></pre>`
      );
      continue;
    }

    // Heading: ## or ###
    const headingMatch = line.match(/^(#{2,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = parseInlineMarkdown(headingMatch[2]);
      if (level === 2) {
        htmlParts.push(
          `<h2 class="text-2xl font-bold mt-8 mb-4 text-zinc-900 dark:text-white">${text}</h2>`
        );
      } else {
        htmlParts.push(
          `<h3 class="text-xl font-semibold mt-6 mb-3 text-zinc-900 dark:text-white">${text}</h3>`
        );
      }
      i++;
      continue;
    }

    // Unordered list: - item
    if (line.match(/^-\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^-\s+/)) {
        const itemText = parseInlineMarkdown(lines[i].replace(/^-\s+/, ""));
        listItems.push(
          `<li class="text-zinc-700 dark:text-zinc-300 leading-relaxed">${itemText}</li>`
        );
        i++;
      }
      htmlParts.push(
        `<ul class="my-4 pl-6 space-y-2 list-disc">${listItems.join("")}</ul>`
      );
      continue;
    }

    // Ordered list: 1. item
    if (line.match(/^\d+\.\s+/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const itemText = parseInlineMarkdown(
          lines[i].replace(/^\d+\.\s+/, "")
        );
        listItems.push(
          `<li class="text-zinc-700 dark:text-zinc-300 leading-relaxed">${itemText}</li>`
        );
        i++;
      }
      htmlParts.push(
        `<ol class="my-4 pl-6 space-y-2 list-decimal">${listItems.join("")}</ol>`
      );
      continue;
    }

    // Paragraph (default)
    const paragraphText = parseInlineMarkdown(line);
    htmlParts.push(
      `<p class="text-zinc-700 dark:text-zinc-300 leading-relaxed my-4 text-base sm:text-lg">${paragraphText}</p>`
    );
    i++;
  }

  return htmlParts.join("\n");
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedBlogPosts(slug, 3);
  const relatedTool = getToolBySlug(post.relatedToolId);
  const readTime = estimateReadTime(post.content);
  const htmlContent = markdownToHtml(post.content);

  const breadcrumbs = [
    { name: "首页", url: siteUrl },
    { name: "博客", url: `${siteUrl}/blog` },
    { name: post.title, url: `${siteUrl}/blog/${post.slug}` },
  ];

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Structured data: Article + BreadcrumbList */}
      <ArticleSchema
        title={post.title}
        description={post.excerpt}
        url={`${siteUrl}/blog/${post.slug}`}
        datePublished={post.publishDate}
        keywords={post.tags}
      />
      <BreadcrumbListSchema items={breadcrumbs} />

      {/* Article Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Breadcrumb navigation */}
          <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 mb-8 flex-wrap">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              首页
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <Link
              href="/blog"
              className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              博客
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-700 dark:text-zinc-300 font-medium line-clamp-1">
              {post.title}
            </span>
          </nav>

          {/* Category tag */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
              <Tag className="w-3.5 h-3.5" />
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.publishDate)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              阅读约 {readTime} 分钟
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Rendered Markdown content */}
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

            {/* Article tags */}
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          </article>

          {/* Related Tool Card */}
          {relatedTool && (
            <div className="mt-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col sm:flex-row items-center gap-6">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${relatedTool.color} flex items-center justify-center shrink-0`}
                  >
                    <relatedTool.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium mb-2">
                      <Wrench className="w-3 h-3" />
                      相关工具
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      {relatedTool.name}
                    </h3>
                    <p className="text-indigo-100 text-sm">
                      {relatedTool.description}
                    </p>
                  </div>
                  <Link
                    href={relatedTool.path}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg shrink-0"
                  >
                    立即使用
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Back to list button */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600/50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              返回博客列表
            </Link>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 lg:py-16 bg-white dark:bg-zinc-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
                相关推荐
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                更多同分类的优质文章
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="tool-card group bg-white dark:bg-zinc-800/50 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 flex flex-col"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500" />

                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                        <Tag className="w-3 h-3" />
                        {relatedPost.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>

                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 flex-1">
                      {relatedPost.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-700/50">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(relatedPost.publishDate)}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-indigo-500 dark:text-indigo-400">
                        阅读
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                试试我们的在线工具
              </h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
                500+ 免费在线工具，JSON格式化、图片压缩、二维码生成、密码生成器等，即开即用。
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-xl shadow-black/10"
              >
                浏览全部工具
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
