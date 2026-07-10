import { Suspense } from "react";
import type { Metadata } from "next";
import TagContent from "@/components/TagContent";
import TagSEOContent from "@/components/TagSEOContent";
import { BreadcrumbListSchema } from "@/components/SEOSchema";
import { CollectionPageSchema } from "@/components/CategorySchema";
import { popularTags, getTagName, getToolsByTag } from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

export const dynamicParams = false;

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return popularTags.map((tag) => ({
    slug: tag.slug,
  }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tagName = getTagName(slug);
  const tools = getToolsByTag(slug);
  const toolCount = tools.length;
  const toolNames = tools
    .slice(0, 5)
    .map((t) => t.name)
    .join("、");

  const title = `${tagName}相关工具 - ${toolCount}款免费在线工具`;
  const description = `精选${toolCount}款${tagName}相关的在线工具${
    toolCount > 0 ? `，包括${toolNames}等` : ""
  }，全部免费使用，无需注册，打开即用，助力高效完成${tagName}任务。`;

  return {
    title,
    description,
    keywords: [
      tagName,
      `${tagName}在线工具`,
      `${tagName}工具大全`,
      `${tagName}推荐`,
      `${tagName}免费工具`,
      "在线工具",
      "工具箱",
      "工具大全",
      "免费工具",
      "99在线工具",
    ],
    alternates: {
      canonical: `/tag/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/tag/${slug}`,
      type: "website",
      siteName: "99在线工具",
      locale: "zh_CN",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${tagName} - 99在线工具`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const tagName = getTagName(slug);
  const tools = getToolsByTag(slug);

  return (
    <>
      {/* 结构化数据：面包屑导航（首页 > 标签 > 当前标签） */}
      <BreadcrumbListSchema
        items={[
          { name: "首页", url: `${siteUrl}/` },
          { name: "标签", url: `${siteUrl}/` },
          { name: tagName, url: `${siteUrl}/tag/${slug}` },
        ]}
      />
      {/* 结构化数据：标签集合页（含工具 ItemList） */}
      <CollectionPageSchema
        categoryName={tagName}
        categorySlug={slug}
        tools={tools}
      />
      <Suspense fallback={null}>
        <TagContent />
      </Suspense>
      {/* SEO 描述内容 */}
      <TagSEOContent
        tagName={tagName}
        tagSlug={slug}
        toolCount={tools.length}
      />
    </>
  );
}
