import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "折扣计算器 - 打折价格在线计算 | 99在线工具",
  description:
    "免费在线折扣计算器，快速计算打折后的价格和节省金额，支持常见折扣一键切换，购物比价必备工具。",
  keywords: [
    "折扣计算器",
    "打折计算",
    "折扣计算",
    "优惠计算",
    "购物计算器",
  ],
  openGraph: {
    title: "折扣计算器 - 打折价格在线计算 | 99在线工具",
    description:
      "免费在线折扣计算器，快速计算打折后的价格和节省金额。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/discount-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
