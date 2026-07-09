import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF转文本 - 在线PDF转文本工具 | 工具箱",
  description:
    "在线提取PDF中的文本内容，支持复制和下载，本地处理安全可靠",
  keywords: [
    "PDF转文本",
    "在线PDF转文本",
    "PDF转文本工具",
    "免费PDF转文本",
  ],
  openGraph: {
    title: "PDF转文本 - 在线PDF转文本工具 | 工具箱",
    description:
      "在线提取PDF中的文本内容，支持复制和下载，本地处理安全可靠",
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
