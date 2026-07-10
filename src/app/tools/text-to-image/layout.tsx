import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文字转图片 - 在线文字生成图片 | 99在线工具",
  description:
    "免费在线文字转图片工具，自定义文字内容、字体大小颜色、背景渐变、内边距圆角阴影，多种预设样式，一键生成社交媒体配图。",
  keywords: [
    "文字转图片",
    "文字生成图片",
    "文字配图",
    "文字海报",
    "在线文字转图",
    "文字图片生成器",
    "社交媒体配图",
    "封面图制作",
    "代码分享图",
    "名言图片生成",
  ],
  openGraph: {
    title: "文字转图片 - 在线文字生成图片 | 99在线工具",
    description:
      "免费在线文字转图片工具，自定义字体颜色背景渐变，多种预设样式。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/text-to-image",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
