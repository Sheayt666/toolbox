import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片圆角/圆形裁剪 - 在线图片圆角/圆形裁剪工具 | 99在线工具",
  description:
    "在线给图片添加圆角或裁剪为圆形，自定义圆角大小，头像制作必备",
  keywords: [
    "圆角图片",
    "圆形裁剪",
    "圆角头像",
    "图片圆角",
  ],
  openGraph: {
    title: "图片圆角/圆形裁剪 - 在线图片圆角/圆形裁剪工具 | 99在线工具",
    description:
      "在线给图片添加圆角或裁剪为圆形，自定义圆角大小，头像制作必备",
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
