import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文字转拼音 - 在线汉字拼音转换工具 | 99在线工具",
  description:
    "免费在线文字转拼音工具，支持带声调/不带声调、首字母模式、多种分隔符选择，实时转换，数据本地处理安全可靠。",
  keywords: [
    "文字转拼音",
    "汉字转拼音",
    "拼音转换",
    "中文拼音",
    "在线拼音工具",
  ],
  openGraph: {
    title: "文字转拼音 - 在线汉字拼音转换工具 | 99在线工具",
    description:
      "免费在线文字转拼音工具，支持带声调/不带声调、首字母模式、多种分隔符选择，实时转换，数据本地处理安全可靠。",
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
