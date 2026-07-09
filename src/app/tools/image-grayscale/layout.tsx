import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片黑白/灰度 - 在线图片黑白/灰度工具 | 工具箱",
  description:
    "在线将图片转为黑白灰度效果，支持灰度强度调节，经典黑白滤镜",
  keywords: [
    "图片黑白",
    "灰度图",
    "黑白滤镜",
    "图片去色",
  ],
  openGraph: {
    title: "图片黑白/灰度 - 在线图片黑白/灰度工具 | 工具箱",
    description:
      "在线将图片转为黑白灰度效果，支持灰度强度调节，经典黑白滤镜",
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
