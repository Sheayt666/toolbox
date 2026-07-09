import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PPT转PDF - 在线PPT转PDF工具 | 99在线工具",
  description:
    "在线将PPT演示文稿转换为PDF文件，支持pptx格式，保持排版效果",
  keywords: [
    "PPT转PDF",
    "在线PPT转PDF",
    "PPT转PDF工具",
    "免费PPT转PDF",
  ],
  openGraph: {
    title: "PPT转PDF - 在线PPT转PDF工具 | 99在线工具",
    description:
      "在线将PPT演示文稿转换为PDF文件，支持pptx格式，保持排版效果",
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
