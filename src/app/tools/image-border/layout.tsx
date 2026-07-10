import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片加边框 - 在线图片加边框工具 | 99在线工具",
  description:
    "在线给图片添加边框，自定义边框颜色、宽度和圆角，美化图片",
  keywords: [
    "图片边框",
    "加边框",
    "边框美化",
    "图片装饰",
  ],
  openGraph: {
    title: "图片加边框 - 在线图片加边框工具 | 99在线工具",
    description:
      "在线给图片添加边框，自定义边框颜色、宽度和圆角，美化图片",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-border",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
