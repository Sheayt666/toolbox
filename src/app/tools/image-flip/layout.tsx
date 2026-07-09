import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片翻转工具 - 在线图片翻转工具工具 | 工具箱",
  description:
    "在线翻转图片，支持水平翻转和垂直翻转，实时预览效果，一键下载",
  keywords: [
    "图片翻转",
    "水平翻转",
    "垂直翻转",
    "镜像翻转",
  ],
  openGraph: {
    title: "图片翻转工具 - 在线图片翻转工具工具 | 工具箱",
    description:
      "在线翻转图片，支持水平翻转和垂直翻转，实时预览效果，一键下载",
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
