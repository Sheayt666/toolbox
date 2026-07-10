/**
 * 分类页面结构化数据组件
 *
 * 为分类页面提供 JSON-LD 结构化数据支持：
 * - BreadcrumbListSchema：首页 > 分类 面包屑导航
 * - ItemListSchema：列出该分类下的所有工具
 * - CollectionPageSchema：分类集合页（内含 ItemList）
 *
 * 参考: https://schema.org/CollectionPage
 */

import type { Tool } from "@/lib/tools";

const DEFAULT_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://99gongju.online";

// ============================================================
// BreadcrumbList Schema - 面包屑导航结构化数据（首页 > 分类）
// ============================================================

interface BreadcrumbListSchemaProps {
  /** 分类名称 */
  categoryName: string;
  /** 分类 slug */
  categorySlug: string;
  /** 站点 URL */
  siteUrl?: string;
}

/**
 * BreadcrumbList 结构化数据
 * 用于告知搜索引擎当前页面的面包屑路径：首页 > 分类
 */
export function BreadcrumbListSchema({
  categoryName,
  categorySlug,
  siteUrl = DEFAULT_SITE_URL,
}: BreadcrumbListSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首页",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}/category/${categorySlug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============================================================
// ItemList Schema - 工具列表结构化数据
// ============================================================

interface ItemListSchemaProps {
  /** 分类名称 */
  categoryName: string;
  /** 分类 slug */
  categorySlug: string;
  /** 该分类下的所有工具 */
  tools: Tool[];
  /** 站点 URL */
  siteUrl?: string;
}

/**
 * ItemList 结构化数据
 * 列出该分类下的所有工具，便于搜索引擎理解分类内容
 */
export function ItemListSchema({
  categoryName,
  categorySlug,
  tools,
  siteUrl = DEFAULT_SITE_URL,
}: ItemListSchemaProps) {
  if (!tools || tools.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${categoryName} - 99在线工具`,
    url: `${siteUrl}/category/${categorySlug}`,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: tool.name,
      url: `${siteUrl}${tool.path}`,
      description: tool.description,
    })),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============================================================
// CollectionPage Schema - 分类集合页结构化数据
// ============================================================

interface CollectionPageSchemaProps {
  /** 分类名称 */
  categoryName: string;
  /** 分类 slug */
  categorySlug: string;
  /** 该分类下的所有工具 */
  tools: Tool[];
  /** 站点 URL */
  siteUrl?: string;
}

/**
 * CollectionPage 结构化数据
 * 描述分类集合页，内部包含 ItemList 列出该分类下的所有工具
 */
export function CollectionPageSchema({
  categoryName,
  categorySlug,
  tools,
  siteUrl = DEFAULT_SITE_URL,
}: CollectionPageSchemaProps) {
  const pageUrl = `${siteUrl}/category/${categorySlug}`;
  const toolCount = tools?.length ?? 0;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} - 99在线工具`,
    description: `99在线工具大全提供${toolCount}款${categoryName}，包括${
      toolCount > 0
        ? tools
            .slice(0, 5)
            .map((t) => t.name)
            .join("、")
        : categoryName
    }等实用在线工具，全部免费使用，无需注册。`,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "99在线工具",
      url: siteUrl,
    },
  };

  if (toolCount > 0) {
    data.mainEntity = {
      "@type": "ItemList",
      numberOfItems: toolCount,
      itemListElement: tools.map((tool, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: tool.name,
        url: `${siteUrl}${tool.path}`,
        description: tool.description,
      })),
    };
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default CollectionPageSchema;
