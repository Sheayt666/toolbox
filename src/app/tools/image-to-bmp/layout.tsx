import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片转BMP - 在线图片转BMP工具 | 99在线工具",
  description:
    "在线将图片转换为BMP位图格式，无损位图格式，兼容老旧系统",
  keywords: [
    "图片转BMP",
    "BMP转换",
    "位图转换",
    "格式转换",
  ],
  openGraph: {
    title: "图片转BMP - 在线图片转BMP工具 | 99在线工具",
    description:
      "在线将图片转换为BMP位图格式，无损位图格式，兼容老旧系统",
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
