import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "最大公约数/最小公倍数计算器 - GCD/LCM在线计算",
  description: "在线最大公约数(GCD)和最小公倍数(LCM)计算器，支持多位数计算，展示质因数分解过程",
  keywords: ["最大公约数", "最小公倍数", "GCD", "LCM", "质因数分解"],
  alternates: {
    canonical: "/tools/gcd-lcm-calculator",
  },
};

export default function GcdLcmCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
