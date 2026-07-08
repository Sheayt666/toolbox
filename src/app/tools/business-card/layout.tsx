import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "名片生成器 - 在线制作电子名片图片 | 工具箱",
  description:
    "免费在线名片生成器，多种模板风格，自定义配色，实时预览，一键下载电子名片图片，本地处理安全可靠。",
  keywords: [
    "名片生成器",
    "电子名片",
    "名片制作",
    "名片设计",
    "在线名片工具",
  ],
  openGraph: {
    title: "名片生成器 - 在线制作电子名片图片 | 工具箱",
    description:
      "免费在线名片生成器，多种模板风格，自定义配色，实时预览，一键下载电子名片图片，本地处理安全可靠。",
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
