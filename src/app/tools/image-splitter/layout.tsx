import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片分割九宫格 - 在线图片分割九宫格工具 | 工具箱",
  description:
    "在线图片九宫格分割，将一张图切成多块，社交媒体发图必备",
  keywords: [
    "九宫格切图",
    "图片分割",
    "切图工具",
    "九宫格",
  ],
  openGraph: {
    title: "图片分割九宫格 - 在线图片分割九宫格工具 | 工具箱",
    description:
      "在线图片九宫格分割，将一张图切成多块，社交媒体发图必备",
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
