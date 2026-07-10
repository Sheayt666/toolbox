import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "体脂率计算器 - 在线体脂率估算 | 99在线工具",
  description:
    "免费在线体脂率计算器，使用美国海军体脂公式，通过围度数据估算体脂率，了解身体脂肪含量。",
  keywords: [
    "体脂率计算器",
    "体脂率计算",
    "体脂计算",
    "身体脂肪率",
    "体脂百分比",
  ],
  openGraph: {
    title: "体脂率计算器 - 在线体脂率估算 | 99在线工具",
    description:
      "免费在线体脂率计算器，使用美国海军体脂公式估算体脂率。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/body-fat-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
