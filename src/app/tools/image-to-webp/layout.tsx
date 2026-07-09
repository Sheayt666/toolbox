import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片转WebP - 在线图片转WebP工具 | 99在线工具",
  description:
    "在线将图片转换为WebP格式，高压缩率高质量，大幅减小图片体积",
  keywords: [
    "图片转WebP",
    "WebP转换",
    "图片压缩",
    "格式转换",
  ],
  openGraph: {
    title: "图片转WebP - 在线图片转WebP工具 | 99在线工具",
    description:
      "在线将图片转换为WebP格式，高压缩率高质量，大幅减小图片体积",
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
