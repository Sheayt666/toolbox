import { Suspense } from "react";
import type { Metadata } from "next";
import CategoryContent from "@/components/CategoryContent";
import { categories, getCategoryBySlug } from "@/lib/tools";

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

  return {
    title: `${category.name} - 99在线工具`,
    description: `浏览${category.name}分类下的所有在线工具，精选优质工具，助力高效工作`,
    keywords: [category.name, "在线工具", "工具箱", "99在线工具"],
  };
}

export default function CategoryPage() {
  return (
    <Suspense fallback={null}>
      <CategoryContent />
    </Suspense>
  );
}
