import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片旋转翻转 - 在线任意角度旋转 | 99在线工具",
  description:
    "免费在线图片旋转翻转工具，支持顺时针逆时针90度旋转、任意角度旋转、水平翻转、垂直翻转，实时预览效果，一键下载。",
  keywords: [
    "图片旋转",
    "在线图片旋转",
    "图片翻转",
    "水平翻转",
    "垂直翻转",
    "旋转图片",
    "任意角度旋转",
    "图片镜像",
    "照片旋转",
    "图片方向调整",
  ],
  openGraph: {
    title: "图片旋转翻转 - 在线任意角度旋转 | 99在线工具",
    description:
      "免费在线图片旋转翻转工具，支持任意角度旋转、水平垂直翻转，实时预览效果。",
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
