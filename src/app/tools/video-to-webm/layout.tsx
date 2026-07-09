import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "视频转WebM - 在线视频转WebM工具 | 工具箱",
  description:
    "在线将视频转换为WebM格式，高压缩率高质量，大幅减小体积",
  keywords: [
    "视频转WebM",
    "在线视频转WebM",
    "视频转WebM工具",
    "免费视频转WebM",
  ],
  openGraph: {
    title: "视频转WebM - 在线视频转WebM工具 | 工具箱",
    description:
      "在线将视频转换为WebM格式，高压缩率高质量，大幅减小体积",
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
