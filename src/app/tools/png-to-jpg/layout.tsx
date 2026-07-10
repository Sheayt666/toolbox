import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PNG转JPG - 在线PNG转JPG工具 | 99在线工具",
  description:
    "在线将PNG图片转换为JPG格式，支持自定义质量，本地处理安全可靠",
  keywords: [
    "PNG转JPG",
    "PNG转JPEG",
    "图片格式转换",
    "在线转换",
  ],
  openGraph: {
    title: "PNG转JPG - 在线PNG转JPG工具 | 99在线工具",
    description:
      "在线将PNG图片转换为JPG格式，支持自定义质量，本地处理安全可靠",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/png-to-jpg",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
