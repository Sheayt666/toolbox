import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UUID生成器 - 在线批量生成 | 工具箱",
  description:
    "免费在线UUID生成器，支持UUID v1和v4版本，可批量生成1-100个UUID，一键复制，无需注册。",
  keywords: [
    "UUID生成",
    "UUID v4",
    "UUID v1",
    "批量UUID",
    "在线UUID生成器",
  ],
  openGraph: {
    title: "UUID生成器 - 在线批量生成 | 工具箱",
    description:
      "免费在线UUID生成器，支持UUID v1和v4版本，可批量生成1-100个UUID，一键复制，无需注册。",
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
