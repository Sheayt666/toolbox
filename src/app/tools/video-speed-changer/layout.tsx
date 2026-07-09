import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频变速 - 在线视频变速工具 | 工具箱",
  description:
    "在线调整视频播放速度，支持0.25x-4x变速，保持音频同步",
  keywords: [
    "视频变速",
    "在线视频变速",
    "视频变速工具",
    "免费视频变速",
  ],
  openGraph: {
    title: "视频变速 - 在线视频变速工具 | 工具箱",
    description:
      "在线调整视频播放速度，支持0.25x-4x变速，保持音频同步",
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
