import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF分割工具 - 在线PDF分割 | 工具箱",
  description:
    "在线将PDF文件分割为多个文件，支持按页数分割和指定范围分割，本地处理安全可靠",
  keywords: [
    "PDF分割",
    "在线PDF分割",
    "PDF分割工具",
    "免费PDF分割",
  ],
  openGraph: {
    title: "PDF分割工具 - 在线PDF分割 | 工具箱",
    description:
      "在线将PDF文件分割为多个文件，支持按页数分割和指定范围分割，本地处理安全可靠",
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
