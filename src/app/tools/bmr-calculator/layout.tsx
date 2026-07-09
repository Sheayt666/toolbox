import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMR计算器 - 基础代谢率在线计算 | 99在线工具",
  description:
    "免费在线基础代谢率(BMR)计算器，使用Mifflin-St Jeor公式，计算每日静息消耗热量，助您科学管理体重。",
  keywords: [
    "BMR计算器",
    "基础代谢率",
    "基础代谢计算",
    "热量消耗",
    "代谢率计算",
  ],
  openGraph: {
    title: "BMR计算器 - 基础代谢率在线计算 | 99在线工具",
    description:
      "免费在线基础代谢率计算器，计算每日热量消耗。",
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
