import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF转图片 - 在线PDF转图片工具 | 99在线工具",
  description:
    "在线将PDF每页转换为图片，支持JPG/PNG格式，高质量输出，批量下载",
  keywords: [
    "PDF转图片",
    "在线PDF转图片",
    "PDF转图片工具",
    "免费PDF转图片",
  ],
  openGraph: {
    title: "PDF转图片 - 在线PDF转图片工具 | 99在线工具",
    description:
      "在线将PDF每页转换为图片，支持JPG/PNG格式，高质量输出，批量下载",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/pdf-to-image",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
