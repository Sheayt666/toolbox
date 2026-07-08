import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "字数统计 - 在线统计字符数字数行数段落 | 工具箱",
  description:
    "免费在线字数统计工具，实时统计字符数、字数、行数、段落数，中英文分开统计，支持复制粘贴。",
  keywords: ["字数统计", "字符数统计", "字数计算", "在线字数统计", "字符统计"],
  openGraph: {
    title: "字数统计 - 在线统计字符数字数行数段落 | 工具箱",
    description:
      "免费在线字数统计工具，实时统计字符数、字数、行数、段落数，中英文分开统计。",
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
