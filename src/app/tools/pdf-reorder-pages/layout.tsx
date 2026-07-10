import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF页面重排 - 在线PDF页面重排工具 | 99在线工具",
  description:
    "在线调整PDF页面顺序，拖拽排序，一键生成新PDF文件",
  keywords: [
    "PDF页面重排",
    "在线PDF页面重排",
    "PDF页面重排工具",
    "免费PDF页面重排",
  ],
  openGraph: {
    title: "PDF页面重排 - 在线PDF页面重排工具 | 99在线工具",
    description:
      "在线调整PDF页面顺序，拖拽排序，一键生成新PDF文件",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/pdf-reorder-pages",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
