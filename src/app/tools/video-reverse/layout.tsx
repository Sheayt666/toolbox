import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频倒放 - 在线视频倒放工具 | 99在线工具",
  description:
    "在线将视频倒放播放，一键生成倒放效果，创意视频制作工具",
  keywords: [
    "视频倒放",
    "在线视频倒放",
    "视频倒放工具",
    "免费视频倒放",
  ],
  openGraph: {
    title: "视频倒放 - 在线视频倒放工具 | 99在线工具",
    description:
      "在线将视频倒放播放，一键生成倒放效果，创意视频制作工具",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/video-reverse",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
