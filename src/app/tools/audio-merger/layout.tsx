import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音频合并 - 在线音频合并工具 | 工具箱",
  description:
    "在线合并多个音频文件，支持不同格式，可调整顺序和添加间隔",
  keywords: [
    "音频合并",
    "在线音频合并",
    "音频合并工具",
    "免费音频合并",
  ],
  openGraph: {
    title: "音频合并 - 在线音频合并工具 | 工具箱",
    description:
      "在线合并多个音频文件，支持不同格式，可调整顺序和添加间隔",
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
