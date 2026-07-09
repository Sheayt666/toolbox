import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "图片转Base64 - 在线图片编码转换 | 99在线工具",
  description:
    "免费在线图片转Base64工具，上传图片快速转换为Base64编码字符串，支持多种图片格式，本地处理安全可靠。",
  keywords: ["图片转Base64", "Base64图片", "图片编码", "在线转换", "Base64编码"],
  openGraph: {
    title: "图片转Base64 - 在线图片编码转换 | 99在线工具",
    description:
      "免费在线图片转Base64工具，上传图片快速转换为Base64编码字符串。",
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
