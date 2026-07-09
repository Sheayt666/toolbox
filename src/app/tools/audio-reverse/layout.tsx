import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音频倒放 - 在线音频倒放工具 | 99在线工具",
  description:
    "在线将音频倒放播放，一键生成倒放效果，趣味音频处理工具",
  keywords: [
    "音频倒放",
    "在线音频倒放",
    "音频倒放工具",
    "免费音频倒放",
  ],
  openGraph: {
    title: "音频倒放 - 在线音频倒放工具 | 99在线工具",
    description:
      "在线将音频倒放播放，一键生成倒放效果，趣味音频处理工具",
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
