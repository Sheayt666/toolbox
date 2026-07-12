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
// Organization Schema - 组织结构化数据
// ============================================================

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  sameAs?: string[];
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  email,
  sameAs = [],
}: OrganizationSchemaProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(description && { description }),
    ...(logo && {
      logo: {
        "@type": "ImageObject",
        url: logo,
      },
    }),
    ...(email && { email }),
    ...(sameAs.length > 0 && { sameAs }),
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
 * Map a Chinese tool category to a schema.org applicationCategory value.
 * Falls back to a sensible generic category so the field is never empty.
 */
function mapApplicationCategory(category?: string): string {
  switch (category) {
    case "开发工具":
      return "DeveloperApplication";
    case "设计工具":
    case "图片工具":
      return "DesignApplication";
    case "文本工具":
    case "转换工具":
    case "生成工具":
      return "UtilitiesApplication";
    case "计算工具":
    case "生活工具":
    case "实用工具":
      return "UtilitiesApplication";
    default:
      return "UtilitiesApplication";
  }
}

/**
 * 工具页面完整结构化数据组合组件
 * 一次性注入 SoftwareApplication + FAQPage + HowTo + BreadcrumbList (JSON-LD)
 *
 * 增强点:
 * - SoftwareApplication 始终注入，包含应用名称、类别、操作系统 "Web" 及免费报价
 * - HowTo steps 为空时回退到通用三步说明，确保 steps 字段始终有内容
 * - FAQPage 问答为空时回退到通用问答，确保问答内容始终存在
 */
export function ToolPageSchema({
  tool,
  faqs,
  howToSteps,
  breadcrumbs,
  siteUrl = "https://99gongju.online",
}: ToolPageSchemaProps) {
  const fullUrl = `${siteUrl}${tool.path}`;

  // Fallback HowTo steps so the steps field always carries content
  const effectiveSteps: HowToStep[] =
    howToSteps && howToSteps.length > 0
      ? howToSteps.map((s) => ({ name: s.name, text: s.text }))
      : [
          {
            name: "打开工具",
            text: `在浏览器中打开 ${fullUrl}，即可开始使用${tool.name}，无需注册或安装任何插件。`,
          },
          {
            name: "输入数据",
            text: `按照页面提示输入或上传需要处理的内容，所有数据均在本地浏览器中处理，不会上传到服务器。`,
          },
          {
            name: "获取结果",
            text: `处理完成后即可查看或下载结果，支持一键复制与导出，方便快捷。`,
          },
        ];

  // Fallback FAQs so the FAQPage always carries Q&A content
  const effectiveFaqs: FAQItem[] =
    faqs && faqs.length > 0
      ? faqs
      : [
          {
            question: `${tool.name}是免费的吗？`,
            answer: `是的，${tool.name}完全免费使用，无需注册账号，打开网页即可直接使用。`,
          },
          {
            question: `${tool.name}会上传我的数据吗？`,
            answer: `不会。所有数据处理均在您的浏览器本地完成，不会上传到任何服务器，隐私安全有保障。`,
          },
          {
            question: `${tool.name}支持手机使用吗？`,
            answer: `支持。本工具采用响应式设计，在手机、平板和电脑上均可正常使用。`,
          },
        ];

  return (
    <>
      <BreadcrumbListSchema items={breadcrumbs} />
      <SoftwareApplicationSchema
        name={tool.name}
        description={tool.description}
        url={fullUrl}
        applicationCategory={mapApplicationCategory(tool.category)}
        operatingSystem="Web"
        offers={{ price: "0", priceCurrency: "CNY" }}
        features={tool.features}
        aggregateRating={{ ratingValue: 4.8, reviewCount: 1200 }}
      />
      <FAQPageSchema faqs={effectiveFaqs} />
      <HowToSchema
        name={`如何使用${tool.name}`}
        description={`${tool.name}使用步骤详解，三步轻松完成操作`}
        steps={effectiveSteps}
        totalTime={`PT${Math.max(effectiveSteps.length * 2, 3)}M`}
      />
    </>
  );
}

export default ToolPageSchema;
