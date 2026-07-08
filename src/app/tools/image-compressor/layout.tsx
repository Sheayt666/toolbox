import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片压缩工具 - 在线JPG/PNG/WebP压缩 | 工具箱",
  description:
    "免费在线图片压缩工具，支持JPG、PNG、WebP格式，调整压缩质量，实时预览压缩效果，本地处理安全可靠，一键下载压缩后的图片。",
  keywords: [
    "图片压缩",
    "在线图片压缩",
    "JPG压缩",
    "PNG压缩",
    "WebP压缩",
    "图片压缩工具",
    "压缩图片大小",
    "在线压缩图片",
  ],
  openGraph: {
    title: "图片压缩工具 - 在线JPG/PNG/WebP压缩 | 工具箱",
    description:
      "免费在线图片压缩工具，支持JPG、PNG、WebP格式，调整压缩质量，实时预览压缩效果。",
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
