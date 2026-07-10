import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片拼接 - 在线图片拼接工具 | 99在线工具",
  description:
    "在线多张图片拼接，支持横向和纵向拼接，自定义间距和背景色",
  keywords: [
    "图片拼接",
    "长图拼接",
    "横向拼接",
    "纵向拼接",
  ],
  openGraph: {
    title: "图片拼接 - 在线图片拼接工具 | 99在线工具",
    description:
      "在线多张图片拼接，支持横向和纵向拼接，自定义间距和背景色",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-collage",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
