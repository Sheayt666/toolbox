import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Excel转PDF - 在线Excel转PDF工具 | 工具箱",
  description:
    "在线将Excel表格转换为PDF文件，支持xlsx格式，保持表格格式",
  keywords: [
    "Excel转PDF",
    "在线Excel转PDF",
    "Excel转PDF工具",
    "免费Excel转PDF",
  ],
  openGraph: {
    title: "Excel转PDF - 在线Excel转PDF工具 | 工具箱",
    description:
      "在线将Excel表格转换为PDF文件，支持xlsx格式，保持表格格式",
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
