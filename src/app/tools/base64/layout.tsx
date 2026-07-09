import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Base64编码解码工具 - 在线转换 | 99在线工具",
  description:
    "免费在线Base64编码解码工具，支持文本和字符串的快速Base64转换，支持中文，数据本地处理安全可靠。",
  keywords: [
    "Base64编码",
    "Base64解码",
    "Base64转换",
    "在线Base64工具",
  ],
  openGraph: {
    title: "Base64编码解码工具 - 在线转换 | 99在线工具",
    description:
      "免费在线Base64编码解码工具，支持文本和字符串的快速Base64转换，支持中文，数据本地处理安全可靠。",
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
