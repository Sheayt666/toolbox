import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片复古怀旧 - 在线图片复古怀旧工具 | 99在线工具",
  description:
    "在线给图片添加复古怀旧滤镜，经典棕褐色调，老照片效果",
  keywords: [
    "复古滤镜",
    "怀旧效果",
    "棕褐色",
    "老照片",
  ],
  openGraph: {
    title: "图片复古怀旧 - 在线图片复古怀旧工具 | 99在线工具",
    description:
      "在线给图片添加复古怀旧滤镜，经典棕褐色调，老照片效果",
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
