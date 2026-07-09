import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "随机数生成器 - 在线生成指定范围随机数 | 99在线工具",
  description:
    "免费在线随机数生成器，支持自定义范围、批量生成、去重功能，快速生成随机数字。",
  keywords: ["随机数生成器", "随机数", "随机数字", "随机数在线生成", "随机数工具"],
  openGraph: {
    title: "随机数生成器 - 在线生成指定范围随机数 | 99在线工具",
    description:
      "免费在线随机数生成器，支持自定义范围、批量生成、去重功能。",
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
