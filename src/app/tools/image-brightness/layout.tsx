import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片亮度调整 - 在线图片亮度调整工具 | 99在线工具",
  description:
    "在线调整图片亮度，支持增加和降低亮度，实时预览效果",
  keywords: [
    "亮度调整",
    "图片亮度",
    "调亮图片",
    "调暗图片",
  ],
  openGraph: {
    title: "图片亮度调整 - 在线图片亮度调整工具 | 99在线工具",
    description:
      "在线调整图片亮度，支持增加和降低亮度，实时预览效果",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-brightness",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
