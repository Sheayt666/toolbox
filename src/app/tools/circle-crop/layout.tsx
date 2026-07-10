import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "圆形头像裁剪 - 在线图片圆形裁剪工具 | 99在线工具",
  description:
    "免费在线圆形头像裁剪工具，支持缩放、拖动、边框设置，多种形状（圆形、圆角矩形、六边形），一键生成透明背景头像。",
  keywords: [
    "圆形裁剪",
    "头像裁剪",
    "圆形头像",
    "图片裁剪",
    "头像制作",
    "圆形图片",
    "六边形头像",
    "圆角头像",
    "在线裁剪",
  ],
  openGraph: {
    title: "圆形头像裁剪 - 在线图片圆形裁剪工具 | 99在线工具",
    description:
      "免费在线圆形头像裁剪工具，支持多种形状，缩放拖动调整，一键生成头像。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/circle-crop",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
