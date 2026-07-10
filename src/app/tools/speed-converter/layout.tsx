import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "速度单位换算器 - 千米每小时/米每秒/英里每小时",
  description: "快速在线速度单位换算工具，支持米/秒、千米/时、英里/时、节、马赫、光速等多种速度单位",
  keywords: ["速度换算", "km/h转m/s", "马赫换算", "单位换算"],
  alternates: {
    canonical: "/tools/speed-converter",
  },
};

export default function SpeedConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
