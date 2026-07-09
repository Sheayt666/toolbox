import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "个税计算器 - 2026年最新个人所得税计算 | 99在线工具",
  description:
    "2026年最新个税计算器，支持专项附加扣除、年终奖计算，精确计算每月应缴个税和税后工资。",
  keywords: [
    "个税计算器",
    "个人所得税",
    "2026个税",
    "专项附加扣除",
    "税后工资计算",
  ],
  openGraph: {
    title: "个税计算器 - 2026年最新个人所得税计算 | 99在线工具",
    description:
      "2026年最新个税计算器，支持专项附加扣除、年终奖计算，精确计算每月应缴个税。",
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
