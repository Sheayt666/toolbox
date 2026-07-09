import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "复利计算器 - 在线复利收益计算 | 工具箱",
  description:
    "免费在线复利计算器，支持年/季/月/日复利，快速计算投资收益，查看年度收益明细，助您规划投资理财。",
  keywords: [
    "复利计算器",
    "复利计算",
    "利滚利",
    "投资收益计算",
    "理财计算器",
  ],
  openGraph: {
    title: "复利计算器 - 在线复利收益计算 | 工具箱",
    description:
      "免费在线复利计算器，支持年/季/月/日复利，快速计算投资收益。",
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
