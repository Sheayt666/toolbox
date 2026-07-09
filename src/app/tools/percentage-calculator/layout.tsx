import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "百分比计算器 - 在线百分比计算工具 | 工具箱",
  description:
    "免费在线百分比计算器，支持求百分比值、求百分比、求总数三种模式，快速准确计算百分比。",
  keywords: [
    "百分比计算器",
    "百分比计算",
    "百分率计算",
    "比例计算",
    "百分数",
  ],
  openGraph: {
    title: "百分比计算器 - 在线百分比计算工具 | 工具箱",
    description:
      "免费在线百分比计算器，支持多种计算模式，快速准确。",
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
