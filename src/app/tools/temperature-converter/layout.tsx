import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "温度换算器 - 摄氏度/华氏度/开尔文",
  description: "快速在线温度单位换算工具，支持摄氏度、华氏度、开尔文、兰氏度、列氏度等多种温度单位",
  keywords: ["温度换算", "摄氏度转华氏度", "开尔文换算", "温度转换"],
};

export default function TemperatureConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
