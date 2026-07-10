import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "分数计算器 - 分数加减乘除运算",
  description: "在线分数计算器，支持分数的加减乘除运算，自动约分，显示最简分数和小数结果",
  keywords: ["分数计算器", "分数运算", "约分", "最简分数"],
  alternates: {
    canonical: "/tools/fraction-calculator",
  },
};

export default function FractionCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
