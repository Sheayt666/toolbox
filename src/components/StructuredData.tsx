/**
 * 结构化数据组件
 *
 * 用于向页面注入 JSON-LD 结构化数据，提升 SEO 效果
 * 支持 WebSite、Organization 等常用类型
 */

interface WebSiteStructuredDataProps {
  /** 网站名称 */
  name: string;
  /** 网站 URL */
  url: string;
  /** 网站描述（可选） */
  description?: string;
  /** 备选名称（可选） */
  alternateName?: string;
}

/**
 * WebSite 类型结构化数据
 * 用于告知搜索引擎这是一个网站
 *
 * 参考: https://schema.org/WebSite
 */
export function WebSiteStructuredData({
  name,
  url,
  description,
  alternateName,
}: WebSiteStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(alternateName && { alternateName }),
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface OrganizationStructuredDataProps {
  /** 组织名称 */
  name: string;
  /** 组织官网 URL */
  url: string;
  /** Logo URL（可选） */
  logo?: string;
  /** 社交媒体链接（可选） */
  sameAs?: string[];
}

/**
 * Organization 类型结构化数据
 * 用于描述网站所属组织信息
 *
 * 参考: https://schema.org/Organization
 */
export function OrganizationStructuredData({
  name,
  url,
  logo,
  sameAs,
}: OrganizationStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    ...(sameAs && sameAs.length > 0 && { sameAs }),
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default WebSiteStructuredData;
