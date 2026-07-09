import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF解锁 - 在线PDF解锁工具 | 99在线工具",
  description:
    "在线移除PDF文件的密码保护，输入密码后解锁下载",
  keywords: [
    "PDF解锁",
    "在线PDF解锁",
    "PDF解锁工具",
    "免费PDF解锁",
  ],
  openGraph: {
    title: "PDF解锁 - 在线PDF解锁工具 | 99在线工具",
    description:
      "在线移除PDF文件的密码保护，输入密码后解锁下载",
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
