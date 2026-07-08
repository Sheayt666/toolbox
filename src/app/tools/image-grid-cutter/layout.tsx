import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "九宫格切图 - 在线图片切割工具 | 工具箱",
  description:
    "免费在线九宫格切图工具，将图片切成九宫格，支持自定义行列数（2x2、3x3、4x4等）和圆形裁剪，拖拽上传，实时预览，一键打包下载切好的图片。",
  keywords: [
    "九宫格切图",
    "图片切割",
    "朋友圈九宫格",
    "在线切图",
    "图片分割",
    "九宫格图片",
    "图片九宫格",
    "圆形切图",
  ],
  openGraph: {
    title: "九宫格切图 - 在线图片切割工具 | 工具箱",
    description:
      "免费在线九宫格切图工具，支持自定义行列数和圆形裁剪，拖拽上传，实时预览，一键下载。",
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
