import { MetadataRoute } from "next";
import { tools, categories, popularTags } from "@/lib/tools";
import { posts } from "@/lib/posts";
import { getToolSeoContent } from "@/data/toolSeoContent";

export const dynamic = "force-static";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export default function sitemap(): MetadataRoute.Sitemap {
  // 首页
  const homePage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  };

  // 分类页面（排除"全部"）
  const categoryUrls = categories
    .filter((c) => c.slug !== "all")
    .map((category) => ({
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  // 标签页面
  const tagUrls = popularTags.map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 博客列表页
  const blogPage = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  };

  // 产品列表页
  const productsPage = {
    url: `${baseUrl}/products`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  };

  // 工具页面 - 使用SEO内容中的优先级
  const toolUrls = tools.map((tool) => {
    const seoContent = getToolSeoContent(tool.id);
    return {
      url: `${baseUrl}${tool.path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: seoContent ? 0.8 : 0.7,
    };
  });

  // 博客文章页面
  const blogUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    homePage,
    ...categoryUrls,
    ...tagUrls,
    blogPage,
    productsPage,
    ...toolUrls,
    ...blogUrls,
  ];
}
