import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF转Word - 在线PDF转Word工具 | 99在线工具",
  description:
    "在线将PDF文件转换为Word文档，提取文本内容，支持编辑和下载",
  keywords: [
    "PDF转Word",
    "在线PDF转Word",
    "PDF转Word工具",
    "免费PDF转Word",
  ],
  openGraph: {
    title: "PDF转Word - 在线PDF转Word工具 | 99在线工具",
    description:
      "在线将PDF文件转换为Word文档，提取文本内容，支持编辑和下载",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/pdf-to-word",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
