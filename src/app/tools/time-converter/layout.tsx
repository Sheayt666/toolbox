import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "时间单位换算器 - 秒/分钟/小时/天/年转换",
  description: "快速在线时间单位换算工具，支持毫秒、秒、分钟、小时、天、周、月、年等多种时间单位",
  keywords: ["时间换算", "小时转分钟", "天转秒", "单位换算"],
};

export default function TimeConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
