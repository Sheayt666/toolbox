import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown编辑器 - 在线实时预览 | 99在线工具",
  description:
    "免费在线Markdown编辑器，实时预览渲染效果，支持导出HTML，三种视图模式，写文章写文档神器。",
  keywords: [
    "Markdown编辑器",
    "Markdown预览",
    "在线Markdown",
    "Markdown转HTML",
  ],
  openGraph: {
    title: "Markdown编辑器 - 在线实时预览 | 99在线工具",
    description:
      "免费在线Markdown编辑器，实时预览渲染效果，支持导出HTML，三种视图模式，写文章写文档神器。",
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
