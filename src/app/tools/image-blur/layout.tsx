import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片模糊像素化 - 在线高斯模糊马赛克 | 99在线工具",
  description:
    "免费在线图片模糊和像素化工具，支持高斯模糊（强度可调）、马赛克像素化（像素大小可调）、局部模糊，实时预览效果，本地处理安全可靠。",
  keywords: [
    "图片模糊",
    "在线模糊图片",
    "马赛克工具",
    "像素化",
    "高斯模糊",
    "图片打码",
    "模糊处理",
    "局部模糊",
    "隐私保护",
    "图片马赛克",
  ],
  openGraph: {
    title: "图片模糊像素化 - 在线高斯模糊马赛克 | 99在线工具",
    description:
      "免费在线图片模糊和像素化工具，支持高斯模糊、马赛克像素化、局部模糊，实时预览效果。",
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
