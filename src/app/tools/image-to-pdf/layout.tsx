import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片转PDF - 在线图片合并PDF | 工具箱",
  description:
    "免费在线图片转PDF工具，支持单图和多图合并PDF，可调整页面大小（A4/Letter/原图），本地处理安全可靠，一键生成PDF文件。",
  keywords: [
    "图片转PDF",
    "图片合并PDF",
    "JPG转PDF",
    "PNG转PDF",
    "在线图片转PDF",
    "多张图片转PDF",
    "图片生成PDF",
    "在线PDF生成",
  ],
  openGraph: {
    title: "图片转PDF - 在线图片合并PDF | 工具箱",
    description:
      "免费在线图片转PDF工具，支持单图和多图合并PDF，可调整页面大小。",
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
