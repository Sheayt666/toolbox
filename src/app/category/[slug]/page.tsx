import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryContent from "@/components/CategoryContent";
import CategorySEOContent from "@/components/CategorySEOContent";
import {
  BreadcrumbListSchema,
  CollectionPageSchema,
} from "@/components/CategorySchema";
import {
  categories,
  getCategoryBySlug,
  getToolsByCategory,
} from "@/lib/tools";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return categories
    .filter((c) => c.slug !== "all")
    .map((category) => ({
      slug: category.slug,
    }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "分类未找到 - 99在线工具",
      description: "抱歉，您访问的分类不存在。",
    };
  }

  const categoryTools = getToolsByCategory(category.name);
  const toolCount = categoryTools.length;
  const toolNames = categoryTools
    .slice(0, 5)
    .map((t) => t.name)
    .join("、");

  const title = `${category.name} - ${toolCount}款免费在线工具`;
  const description = `99在线工具大全提供${toolCount}款${category.name}，包括${toolNames}等实用在线工具，全部免费使用，无需注册，打开即用，助力高效工作。`;

  return {
    title,
    description,
    keywords: [
      category.name,
      `${category.name}在线工具`,
      `${category.name}大全`,
      `${category.name}推荐`,
      "在线工具",
      "工具箱",
      "工具大全",
      "免费工具",
      "99在线工具",
    ],
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/category/${slug}`,
      type: "website",
      siteName: "99在线工具",
      locale: "zh_CN",
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: `${category.name} - 99在线工具`,
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  // 分类不存在或为 "all" 时，交由 CategoryContent 处理 notFound
  if (!category || slug === "all") {
    return (
      <Suspense fallback={null}>
        <CategoryContent />
      </Suspense>
    );
  }

  const categoryTools = getToolsByCategory(category.name);

  return (
    <>
      {/* 结构化数据：面包屑导航 */}
      <BreadcrumbListSchema
        categoryName={category.name}
        categorySlug={category.slug}
      />
      {/* 结构化数据：分类集合页（含工具 ItemList） */}
      <CollectionPageSchema
        categoryName={category.name}
        categorySlug={category.slug}
        tools={categoryTools}
      />
      <Suspense fallback={null}>
        <CategoryContent />
      </Suspense>
      {/* SEO 描述内容 */}
      <CategorySEOContent
        categoryName={category.name}
        categorySlug={category.slug}
        toolCount={categoryTools.length}
      />
    </>
  );
}
