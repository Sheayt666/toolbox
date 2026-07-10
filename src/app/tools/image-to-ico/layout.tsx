import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片转ICO图标 - 在线图片转ICO图标工具 | 99在线工具",
  description:
    "在线将图片转换为ICO图标格式，支持多种尺寸，适用于网站favicon",
  keywords: [
    "图片转ICO",
    "ICO转换",
    "图标制作",
    "favicon",
  ],
  openGraph: {
    title: "图片转ICO图标 - 在线图片转ICO图标工具 | 99在线工具",
    description:
      "在线将图片转换为ICO图标格式，支持多种尺寸，适用于网站favicon",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/image-to-ico",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
