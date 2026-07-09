import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片饱和度调整 - 在线图片饱和度调整工具 | 工具箱",
  description:
    "在线调整图片饱和度，增强色彩鲜艳度或转为黑白，自由控制色彩浓度",
  keywords: [
    "饱和度调整",
    "图片饱和度",
    "色彩增强",
    "色彩调节",
  ],
  openGraph: {
    title: "图片饱和度调整 - 在线图片饱和度调整工具 | 工具箱",
    description:
      "在线调整图片饱和度，增强色彩鲜艳度或转为黑白，自由控制色彩浓度",
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
