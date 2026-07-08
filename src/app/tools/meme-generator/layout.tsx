import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "表情包生成器 - 在线表情包制作工具 | 工具箱",
  description:
    "免费在线表情包生成器，给图片添加顶部和底部文字，支持多种模板，自定义字体大小、颜色、描边，一键生成搞笑表情包，本地处理安全可靠。",
  keywords: [
    "表情包生成器",
    "表情包制作",
    "表情包在线制作",
    "图片加字",
    "表情包模板",
    "搞笑表情包",
    "表情包生成",
    "图片加文字",
  ],
  openGraph: {
    title: "表情包生成器 - 在线表情包制作工具 | 工具箱",
    description:
      "免费在线表情包生成器，给图片添加文字，支持多种模板，自定义字体大小、颜色、描边。",
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
