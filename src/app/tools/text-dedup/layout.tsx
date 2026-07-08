import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文字去重 - 去除重复行和空白行 | 工具箱",
  description:
    "免费在线文字去重工具，去除重复行、空白行、多余空格，支持保留首次出现或最后出现的行。",
  keywords: ["文字去重", "去重工具", "去除重复行", "去除空白行", "在线去重"],
  openGraph: {
    title: "文字去重 - 去除重复行和空白行 | 工具箱",
    description:
      "免费在线文字去重工具，去除重复行、空白行、多余空格，支持多种去重模式。",
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
