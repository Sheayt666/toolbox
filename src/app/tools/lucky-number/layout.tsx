import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "幸运数字生成 - 彩票号码抽奖号码生成器 | 工具箱",
  description:
    "免费在线幸运数字生成器，支持双色球、大乐透、七星彩等彩票号码生成，也可自定义抽奖号码。",
  keywords: ["幸运数字生成", "彩票号码生成", "双色球", "大乐透", "抽奖号码"],
  openGraph: {
    title: "幸运数字生成 - 彩票号码抽奖号码生成器 | 工具箱",
    description:
      "免费在线幸运数字生成器，支持双色球、大乐透等彩票号码生成，自定义抽奖号码。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
