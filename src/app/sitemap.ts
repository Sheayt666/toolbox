import { MetadataRoute } from "next";
import { tools } from "@/lib/tools";
import { posts } from "@/lib/posts";
import { getToolSeoContent } from "@/data/toolSeoContent";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://toolbox.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // 首页
  const homePage = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1,
  };

  // 博客列表页
  const blogPage = {
    url: `${baseUrl}/blog`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
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
    blogPage,
    ...toolUrls,
    ...blogUrls,
  ];
}
