import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片对比度调整 - 在线图片对比度调整工具 | 工具箱",
  description:
    "在线调整图片对比度，增强或降低对比，让图片更有层次感",
  keywords: [
    "对比度调整",
    "图片对比度",
    "增强对比",
    "对比调节",
  ],
  openGraph: {
    title: "图片对比度调整 - 在线图片对比度调整工具 | 工具箱",
    description:
      "在线调整图片对比度，增强或降低对比，让图片更有层次感",
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
