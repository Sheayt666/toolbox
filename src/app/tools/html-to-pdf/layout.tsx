import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML转PDF - 在线HTML转PDF工具 | 99在线工具",
  description:
    "在线将HTML代码转换为PDF文件，支持粘贴HTML或输入URL，一键生成",
  keywords: [
    "HTML转PDF",
    "在线HTML转PDF",
    "HTML转PDF工具",
    "免费HTML转PDF",
  ],
  openGraph: {
    title: "HTML转PDF - 在线HTML转PDF工具 | 99在线工具",
    description:
      "在线将HTML代码转换为PDF文件，支持粘贴HTML或输入URL，一键生成",
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
