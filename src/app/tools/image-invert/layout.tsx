import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片反色 - 在线图片反色工具 | 99在线工具",
  description:
    "在线图片颜色反转，负片效果，所有颜色取反，创造独特视觉效果",
  keywords: [
    "图片反色",
    "颜色反转",
    "负片效果",
    "底片效果",
  ],
  openGraph: {
    title: "图片反色 - 在线图片反色工具 | 99在线工具",
    description:
      "在线图片颜色反转，负片效果，所有颜色取反，创造独特视觉效果",
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
