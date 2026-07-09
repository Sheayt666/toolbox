import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  posts,
  getPostBySlug,
  getRelatedPosts,
} from "@/lib/posts";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, BookOpen, ShoppingBag } from "lucide-react";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export const runtime = "edge";
export const dynamicParams = false;

// 生成静态路径
export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 生成SEO元数据
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "文章未找到 - 工具箱博客",
      description: "抱歉，您访问的文章不存在。",
    };
  }

  return {
    title: `${post.title} - 工具箱博客`,
    description: post.excerpt,
    keywords: [post.category, post.title, "工具箱", "在线工具"],
    authors: [{ name: "工具箱" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      locale: "zh_CN",
      publishedTime: post.date,
      tags: [post.category],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug, 3);
  const featuredProducts = getFeaturedProducts(3);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 min-h-screen">
      {/* Article Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 dark:to-transparent" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-400/15 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回博客列表
          </Link>

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
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              阅读约 {post.readTime} 分钟
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              工具箱博客
            </span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 lg:p-12 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            {/* Article HTML content */}
            <div
              className="prose prose-zinc dark:prose-invert max-w-none
                prose-headings:text-zinc-900 dark:prose-headings:text-white
                prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:font-bold prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-zinc-900 dark:prose-h3:text-white
                prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:my-4
                prose-p:text-base sm:prose-p:text-lg
                prose-strong:text-zinc-900 dark:prose-strong:text-white prose-strong:font-semibold
                prose-ul:my-4 prose-ul:pl-6 prose-ul:space-y-2
                prose-li:text-zinc-700 dark:prose-li:text-zinc-300 prose-li:text-base sm:prose-li:text-lg
                prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
              "
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

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
                        {formatDate(relatedPost.date)}
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

      {/* Recommended Products */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm font-medium mb-4">
              <ShoppingBag className="w-4 h-4" />
              效率提升
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-3">
              精选数字产品
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              搭配这些优质数字产品，让你的工作效率更上一层楼
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
              >
                <div className="relative p-6 pb-4">
                  <div
                    className={`w-full h-40 rounded-xl bg-gradient-to-br ${product.gradient} flex items-center justify-center relative overflow-hidden`}
                  >
                    <product.icon className="w-16 h-16 text-white/90 relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                  </div>
                  {product.badge && (
                    <div className="absolute top-8 left-8">
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
                        {product.badge}
                      </span>
                    </div>
                  )}
                </div>
                <div className="px-6 pb-4 flex-1 flex flex-col">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-0.5 rounded-full">
                      {product.category}
                    </span>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                      ¥{product.price}
                    </span>
                    <span className="text-sm text-zinc-400 line-through">
                      ¥{product.originalPrice}
                    </span>
                  </div>
                </div>
                <div className="px-6 pb-6 mt-auto">
                  <Link
                    href={`/products/${product.id}`}
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all text-center inline-flex items-center justify-center gap-1.5 text-sm"
                  >
                    立即查看
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                12+ 免费在线工具，JSON格式化、正则测试、二维码生成、密码生成器等，即开即用。
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
