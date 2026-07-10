import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "体积单位换算器 - 升/毫升/加仑/立方米",
  description: "快速在线体积单位换算工具，支持升、毫升、立方米、加仑、夸脱、品脱等多种体积单位",
  keywords: ["体积换算", "升转毫升", "加仑换算", "单位换算"],
  alternates: {
    canonical: "/tools/volume-converter",
  },
};

export default function VolumeConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
