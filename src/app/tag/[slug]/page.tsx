import { Suspense } from "react";
import type { Metadata } from "next";
import TagContent from "@/components/TagContent";
import { popularTags, getTagName, getToolsByTag } from "@/lib/tools";

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

  return {
    title: `${tagName}相关工具 - 99在线工具`,
    description: `精选${tagName}相关的在线工具，共${tools.length}款，免费使用，无需注册`,
    keywords: [tagName, "在线工具", "工具箱", "99在线工具"],
  };
}

export default function TagPage() {
  return (
    <Suspense fallback={null}>
      <TagContent />
    </Suspense>
  );
}
