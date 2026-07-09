import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "进制转换 - 二进制八进制十进制十六进制互转 | 99在线工具",
  description:
    "免费在线进制转换工具，支持二进制、八进制、十进制、十六进制之间的互相转换，实时计算。",
  keywords: ["进制转换", "二进制", "八进制", "十进制", "十六进制"],
  openGraph: {
    title: "进制转换 - 二进制八进制十进制十六进制互转 | 99在线工具",
    description:
      "免费在线进制转换工具，支持二进制、八进制、十进制、十六进制互相转换。",
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
