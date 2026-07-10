import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "房贷计算器 - 等额本息/等额本金在线计算 | 99在线工具",
  description:
    "免费在线房贷计算器，支持等额本息、等额本金两种还款方式，精确计算月供、总利息、还款总额，助您规划购房贷款。",
  keywords: [
    "房贷计算器",
    "等额本息",
    "等额本金",
    "房贷月供计算",
    "贷款计算器",
  ],
  openGraph: {
    title: "房贷计算器 - 等额本息/等额本金在线计算 | 99在线工具",
    description:
      "免费在线房贷计算器，支持等额本息、等额本金两种还款方式，精确计算月供、总利息、还款总额。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/mortgage-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
