import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "科学计算器 - 三角函数/对数/指数/阶乘在线计算",
  description: "功能强大的在线科学计算器，支持三角函数、反三角函数、对数、指数、阶乘、开方、记忆功能等多种科学计算",
  keywords: ["科学计算器", "三角函数", "对数计算", "在线计算器"],
  alternates: {
    canonical: "/tools/scientific-calculator",
  },
};

export default function ScientificCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
