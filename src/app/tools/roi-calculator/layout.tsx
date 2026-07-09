import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ROI计算器 - 投资回报率在线计算 | 工具箱",
  description:
    "免费在线投资回报率(ROI)计算器，计算投资收益和年化收益率，评估投资表现。",
  keywords: [
    "ROI计算器",
    "投资回报率",
    "年化收益率",
    "投资收益计算",
    "收益率计算",
  ],
  openGraph: {
    title: "ROI计算器 - 投资回报率在线计算 | 工具箱",
    description:
      "免费在线投资回报率计算器，计算ROI和年化收益率。",
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
