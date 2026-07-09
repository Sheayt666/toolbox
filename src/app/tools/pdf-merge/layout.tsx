import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF合并工具 - 在线合并多个PDF文件 | 99在线工具",
  description:
    "免费在线PDF合并工具，支持将多个PDF文件合并为一个PDF，拖拽调整顺序，本地处理安全可靠，一键下载合并后的PDF文件。",
  keywords: [
    "PDF合并",
    "在线PDF合并",
    "合并PDF",
    "PDF文件合并",
    "多个PDF合并",
    "PDF合并工具",
    "PDF拼接",
  ],
  openGraph: {
    title: "PDF合并工具 - 在线合并多个PDF文件 | 99在线工具",
    description:
      "免费在线PDF合并工具，支持将多个PDF文件合并为一个PDF，拖拽调整顺序，本地处理安全可靠。",
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
