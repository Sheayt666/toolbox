import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片格式转换 - 在线JPG/PNG/WebP互转 | 工具箱",
  description:
    "免费在线图片格式转换工具，支持JPG、PNG、WebP、BMP、GIF等多种格式互转，批量转换，质量可调，本地处理安全可靠。",
  keywords: [
    "图片格式转换",
    "JPG转PNG",
    "PNG转JPG",
    "WebP转换",
    "在线图片转换",
    "图片转换器",
    "格式转换",
    "批量图片转换",
  ],
  openGraph: {
    title: "图片格式转换 - 在线JPG/PNG/WebP互转 | 工具箱",
    description:
      "免费在线图片格式转换工具，支持JPG、PNG、WebP、BMP、GIF等多种格式互转。",
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
