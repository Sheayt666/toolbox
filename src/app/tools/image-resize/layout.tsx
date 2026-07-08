import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片调整大小 - 在线像素百分比缩放 | 工具箱",
  description:
    "免费在线图片调整大小工具，支持按像素调整宽度高度、按百分比缩放，锁定宽高比，自定义输出质量，多格式输出，本地处理安全可靠。",
  keywords: [
    "图片调整大小",
    "图片尺寸调整",
    "在线改图尺寸",
    "图片缩放",
    "按比例缩放图片",
    "调整图片大小",
    "图片像素调整",
    "图片分辨率调整",
    "缩小图片",
    "放大图片",
  ],
  openGraph: {
    title: "图片调整大小 - 在线像素百分比缩放 | 工具箱",
    description:
      "免费在线图片调整大小工具，支持按像素和百分比缩放，锁定宽高比，多格式输出。",
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
