import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebP转PNG - 在线WebP转PNG工具 | 99在线工具",
  description:
    "在线将WebP图片转换为PNG格式，支持透明通道，高质量转换",
  keywords: [
    "WebP转PNG",
    "WebP转换",
    "图片格式转换",
    "透明图片",
  ],
  openGraph: {
    title: "WebP转PNG - 在线WebP转PNG工具 | 99在线工具",
    description:
      "在线将WebP图片转换为PNG格式，支持透明通道，高质量转换",
    type: "website",
    locale: "zh_CN",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
