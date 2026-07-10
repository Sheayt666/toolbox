import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI计算器 - 身体质量指数在线计算 | 99在线工具",
  description:
    "免费在线BMI计算器，根据身高体重计算身体质量指数，评估体重健康状况，给出专业健康建议。",
  keywords: ["BMI计算器", "身体质量指数", "体重指数", "健康体重", "BMI标准"],
  openGraph: {
    title: "BMI计算器 - 身体质量指数在线计算 | 99在线工具",
    description:
      "免费在线BMI计算器，根据身高体重计算身体质量指数，评估体重健康状况。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/bmi-calculator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
