import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductById, products } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    return {
      title: "产品未找到 - 99在线工具",
      description: "抱歉，您访问的产品不存在",
    };
  }

  return {
    title: `${product.name} - 99在线工具数字产品`,
    description: product.description,
    keywords: [product.name, product.category, "数字产品", "效率工具"],
    openGraph: {
      title: `${product.name} - 99在线工具数字产品`,
      description: product.description,
      type: "website",
      locale: "zh_CN",
    },
  };
}

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient productId={id} />;
}
