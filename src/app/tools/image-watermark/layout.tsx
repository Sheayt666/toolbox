import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片加水印 - 在线文字/图片水印工具 | 工具箱",
  description:
    "免费在线图片加水印工具，支持文字水印和图片水印，可调节字体、大小、颜色、透明度、位置和旋转角度，本地处理安全可靠。",
  keywords: [
    "图片加水印",
    "文字水印",
    "图片水印",
    "在线加水印",
    "水印工具",
    "版权保护",
    "图片防盗",
    "Logo水印",
  ],
  openGraph: {
    title: "图片加水印 - 在线文字/图片水印工具 | 工具箱",
    description:
      "免费在线图片加水印工具，支持文字水印和图片水印，可调节字体、大小、颜色、透明度。",
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
