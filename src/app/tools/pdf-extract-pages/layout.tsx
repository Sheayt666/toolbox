import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF提取页面 - 在线PDF提取页面工具 | 工具箱",
  description:
    "从PDF中提取指定页面，支持页码范围选择，提取后另存为新PDF",
  keywords: [
    "PDF提取页面",
    "在线PDF提取页面",
    "PDF提取页面工具",
    "免费PDF提取页面",
  ],
  openGraph: {
    title: "PDF提取页面 - 在线PDF提取页面工具 | 工具箱",
    description:
      "从PDF中提取指定页面，支持页码范围选择，提取后另存为新PDF",
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
