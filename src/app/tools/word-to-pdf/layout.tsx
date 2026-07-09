import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word转PDF - 在线Word转PDF工具 | 99在线工具",
  description:
    "在线将Word文档转换为PDF文件，支持doc和docx格式，保持文档格式，本地处理安全可靠",
  keywords: [
    "Word转PDF",
    "在线Word转PDF",
    "Word转PDF工具",
    "免费Word转PDF",
  ],
  openGraph: {
    title: "Word转PDF - 在线Word转PDF工具 | 99在线工具",
    description:
      "在线将Word文档转换为PDF文件，支持doc和docx格式，保持文档格式，本地处理安全可靠",
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
