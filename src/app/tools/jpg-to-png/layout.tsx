import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG转PNG - 在线JPG转PNG工具 | 99在线工具",
  description:
    "在线将JPG图片转换为PNG格式，支持透明背景，无损转换",
  keywords: [
    "JPG转PNG",
    "JPEG转PNG",
    "图片格式转换",
    "无损转换",
  ],
  openGraph: {
    title: "JPG转PNG - 在线JPG转PNG工具 | 99在线工具",
    description:
      "在线将JPG图片转换为PNG格式，支持透明背景，无损转换",
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
