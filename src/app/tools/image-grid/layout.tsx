import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片拼接/长图拼接 - 在线多图拼接工具 | 99在线工具",
  description:
    "免费在线图片拼接工具，支持多张图片横向或纵向拼接，自定义间距、背景色、圆角，一键生成精美长图，本地处理安全可靠。",
  keywords: [
    "图片拼接",
    "长图拼接",
    "图片拼接工具",
    "在线拼接图片",
    "多图拼接",
    "横向拼接",
    "纵向拼接",
    "长图制作",
  ],
  openGraph: {
    title: "图片拼接/长图拼接 - 在线多图拼接工具 | 99在线工具",
    description:
      "免费在线图片拼接工具，支持多张图片横向或纵向拼接，自定义间距、背景色、圆角。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-grid",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
