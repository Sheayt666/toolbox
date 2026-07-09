import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF按页分割 - 在线PDF按页分割工具 | 99在线工具",
  description:
    "将PDF的每一页单独保存为一个文件，一键批量分割下载",
  keywords: [
    "PDF按页分割",
    "在线PDF按页分割",
    "PDF按页分割工具",
    "免费PDF按页分割",
  ],
  openGraph: {
    title: "PDF按页分割 - 在线PDF按页分割工具 | 99在线工具",
    description:
      "将PDF的每一页单独保存为一个文件，一键批量分割下载",
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
