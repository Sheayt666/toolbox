import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "颜色转换器 - HEX/RGB/HSL互转 | 工具箱",
  description:
    "免费在线颜色转换器，HEX、RGB、HSL颜色格式互转，在线调色板工具，配色方案建议，设计师必备。",
  keywords: [
    "颜色转换",
    "HEX转RGB",
    "RGB转HEX",
    "HSL转换",
    "在线调色板",
  ],
  openGraph: {
    title: "颜色转换器 - HEX/RGB/HSL互转 | 工具箱",
    description:
      "免费在线颜色转换器，HEX、RGB、HSL颜色格式互转，在线调色板工具，配色方案建议，设计师必备。",
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
