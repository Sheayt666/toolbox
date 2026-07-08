import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "文本对比工具 - 在线代码文章差异对比 | 工具箱",
  description:
    "免费在线文本对比工具，支持逐字符对比和逐行对比，差异高亮显示（新增绿色、删除红色），左右两栏布局，实时对比两段文本的差异。",
  keywords: ["文本对比", "diff工具", "代码对比", "文章对比", "差异对比", "在线diff", "文本差异"],
  openGraph: {
    title: "文本对比工具 - 在线代码文章差异对比 | 工具箱",
    description:
      "免费在线文本对比工具，支持逐字符对比和逐行对比，差异高亮显示，左右两栏布局。",
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
