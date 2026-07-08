import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片抠图工具 - 在线背景移除 | 工具箱",
  description:
    "免费在线图片抠图工具，一键移除图片背景，支持色度键抠图、容差调整、边缘羽化，生成透明背景PNG图片。",
  keywords: [
    "图片抠图",
    "背景移除",
    "抠图工具",
    "在线抠图",
    "透明背景",
    "色度键",
    "绿幕抠图",
    "PNG透明",
    "一键抠图",
    "背景去除",
  ],
  openGraph: {
    title: "图片抠图工具 - 在线背景移除 | 工具箱",
    description:
      "免费在线图片抠图工具，一键移除图片背景，支持色度键抠图和边缘羽化。",
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
