import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "长度单位换算器 - 米/千米/厘米/英寸/英尺",
  description: "快速在线长度单位换算工具，支持米、千米、厘米、毫米、英寸、英尺、码、英里、海里等多种长度单位",
  keywords: ["长度换算", "米转厘米", "英寸换算", "单位换算"],
};

export default function LengthConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
