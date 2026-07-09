import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF转Excel - 在线PDF转Excel工具 | 工具箱",
  description:
    "在线从PDF中提取表格数据并转换为Excel格式，支持复制和下载",
  keywords: [
    "PDF转Excel",
    "在线PDF转Excel",
    "PDF转Excel工具",
    "免费PDF转Excel",
  ],
  openGraph: {
    title: "PDF转Excel - 在线PDF转Excel工具 | 工具箱",
    description:
      "在线从PDF中提取表格数据并转换为Excel格式，支持复制和下载",
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
