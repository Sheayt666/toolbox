import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "理想体重计算器 - 多种公式计算理想体重",
  description: "使用Robinson、Miller、Devine、Hamwi等多种科学公式计算您的理想体重范围，快速准确",
  keywords: ["理想体重", "标准体重", "体重计算", "健康体重"],
};

export default function IdealWeightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
