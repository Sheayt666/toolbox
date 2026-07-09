import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SVG转PNG - 在线SVG转PNG工具 | 工具箱",
  description:
    "在线将SVG矢量图转换为PNG位图，支持自定义尺寸和背景色，高清输出",
  keywords: [
    "SVG转PNG",
    "SVG转换",
    "矢量图转位图",
    "高清输出",
  ],
  openGraph: {
    title: "SVG转PNG - 在线SVG转PNG工具 | 工具箱",
    description:
      "在线将SVG矢量图转换为PNG位图，支持自定义尺寸和背景色，高清输出",
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
