import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF页面旋转 - 在线PDF页面旋转工具 | 工具箱",
  description:
    "在线旋转PDF页面，支持90度/180度/270度旋转，可选择指定页面",
  keywords: [
    "PDF页面旋转",
    "在线PDF页面旋转",
    "PDF页面旋转工具",
    "免费PDF页面旋转",
  ],
  openGraph: {
    title: "PDF页面旋转 - 在线PDF页面旋转工具 | 工具箱",
    description:
      "在线旋转PDF页面，支持90度/180度/270度旋转，可选择指定页面",
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
