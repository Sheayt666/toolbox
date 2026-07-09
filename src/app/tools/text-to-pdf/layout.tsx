import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文本转PDF - 在线文本转PDF工具 | 工具箱",
  description:
    "在线将文本内容转换为PDF文件，支持自定义字体、页面大小和边距",
  keywords: [
    "文本转PDF",
    "在线文本转PDF",
    "文本转PDF工具",
    "免费文本转PDF",
  ],
  openGraph: {
    title: "文本转PDF - 在线文本转PDF工具 | 工具箱",
    description:
      "在线将文本内容转换为PDF文件，支持自定义字体、页面大小和边距",
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
