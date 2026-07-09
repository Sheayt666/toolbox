import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音频变速 - 在线音频变速工具 | 99在线工具",
  description:
    "在线调整音频播放速度，支持0.25x-4x变速，可保持音调不变",
  keywords: [
    "音频变速",
    "在线音频变速",
    "音频变速工具",
    "免费音频变速",
  ],
  openGraph: {
    title: "音频变速 - 在线音频变速工具 | 99在线工具",
    description:
      "在线调整音频播放速度，支持0.25x-4x变速，可保持音调不变",
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
