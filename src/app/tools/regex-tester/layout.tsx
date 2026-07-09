import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "正则表达式测试工具 - 在线调试 | 99在线工具",
  description:
    "免费在线正则表达式测试工具，实时测试匹配结果，高亮显示匹配文本，支持多种flags，调试正则表达式神器。",
  keywords: [
    "正则表达式",
    "正则测试",
    "regex测试",
    "正则调试",
    "在线正则工具",
  ],
  openGraph: {
    title: "正则表达式测试工具 - 在线调试 | 99在线工具",
    description:
      "免费在线正则表达式测试工具，实时测试匹配结果，高亮显示匹配文本，支持多种flags，调试正则表达式神器。",
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
