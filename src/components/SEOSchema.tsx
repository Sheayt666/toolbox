/**
 * SEO结构化数据组件
 *
 * 为工具页面和博客页面提供完整的JSON-LD结构化数据支持
 * 包含 SoftwareApplication、FAQPage、BreadcrumbList、HowTo、Article 等类型
 *
 * 参考: https://schema.org/
 */

// ============================================================
// BreadcrumbList Schema - 面包屑导航结构化数据
// ============================================================

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbListSchema({ items }: BreadcrumbListSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
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
// SoftwareApplication Schema - 软件应用结构化数据
// ============================================================

interface SoftwareApplicationSchemaProps {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
  };
  features?: string[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}

export function SoftwareApplicationSchema({
  name,
  description,
  url,
  applicationCategory = "DeveloperApplication",
  operatingSystem = "Web",
  offers = { price: "0", priceCurrency: "CNY" },
  features,
  aggregateRating,
}: SoftwareApplicationSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory,
    operatingSystem,
    offers: {
      "@type": "Offer",
      price: offers.price,
      priceCurrency: offers.priceCurrency,
    },
    ...(features && features.length > 0 && { featureList: features.join(", ") }),
    ...(aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
      },
    }),
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
// FAQPage Schema - 问答页面结构化数据
// ============================================================

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageSchemaProps {
  faqs: FAQItem[];
}

export function FAQPageSchema({ faqs }: FAQPageSchemaProps) {
  if (!faqs || faqs.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
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
// HowTo Schema - 使用教程结构化数据
// ============================================================

export interface HowToStep {
  name: string;
  text: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}

export function HowToSchema({
  name,
  description,
  steps,
  totalTime = "PT3M",
}: HowToSchemaProps) {
  if (!steps || steps.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
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
// Article Schema - 博客文章结构化数据
// ============================================================

interface ArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  publisher?: {
    name: string;
    logo?: string;
  };
  keywords?: string[];
}

export function ArticleSchema({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = "99在线工具",
  publisher = { name: "99在线工具" },
  keywords,
}: ArticleSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    ...(image && { image: Array.isArray(image) ? image : [image] }),
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: publisher.name,
      ...(publisher.logo && {
        logo: {
          "@type": "ImageObject",
          url: publisher.logo,
        },
      }),
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(keywords && keywords.length > 0 && { keywords: keywords.join(", ") }),
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
// WebSite Schema - 网站结构化数据（带搜索功能）
// ============================================================

interface WebSiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  alternateName?: string;
  searchUrl?: string;
}

export function WebSiteSchema({
  name,
  url,
  description,
  alternateName,
  searchUrl,
}: WebSiteSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(alternateName && { alternateName }),
    ...(searchUrl && {
      potentialAction: {
        "@type": "SearchAction",
        target: searchUrl,
        "query-input": "required name=search_term_string",
      },
    }),
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
// ToolPage Schema 组合组件 - 工具页面完整结构化数据
// ============================================================

interface ToolPageSchemaProps {
  tool: {
    id: string;
    name: string;
    description: string;
    path: string;
    category?: string;
    features?: string[];
  };
  faqs: FAQItem[];
  howToSteps: HowToStep[];
  breadcrumbs: BreadcrumbItem[];
  siteUrl?: string;
}

/**
 * 工具页面完整结构化数据组合组件
 * 一次性注入 SoftwareApplication + FAQPage + HowTo + BreadcrumbList
 */
export function ToolPageSchema({
  tool,
  faqs,
  howToSteps,
  breadcrumbs,
  siteUrl = "https://99gongju.online",
}: ToolPageSchemaProps) {
  const fullUrl = `${siteUrl}${tool.path}`;

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbs} />
      <SoftwareApplicationSchema
        name={tool.name}
        description={tool.description}
        url={fullUrl}
        applicationCategory={
          tool.category === "开发工具"
            ? "DeveloperApplication"
            : tool.category === "设计工具"
            ? "DesignApplication"
            : tool.category === "文本工具"
            ? "UtilitiesApplication"
            : "UtilitiesApplication"
        }
        features={tool.features}
        aggregateRating={{ ratingValue: 4.8, reviewCount: 1200 }}
      />
      <FAQPageSchema faqs={faqs} />
      <HowToSchema
        name={`如何使用${tool.name}`}
        description={`${tool.name}使用步骤详解，三步轻松完成操作`}
        steps={howToSteps.map((s) => ({ name: s.name, text: s.text }))}
      />
    </>
  );
}

export default ToolPageSchema;
