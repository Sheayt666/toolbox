import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据容量换算器 - KB/MB/GB/TB/字节转换",
  description: "快速在线数据容量换算工具，支持字节、KB、MB、GB、TB、PB、比特等多种数据存储单位换算",
  keywords: ["数据容量", "GB转MB", "字节换算", "单位换算"],
};

export default function DataSizeConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
