import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF加密保护 - 在线PDF加密保护工具 | 工具箱",
  description:
    "在线为PDF文件添加密码保护，设置打开密码和权限密码，安全可靠",
  keywords: [
    "PDF加密保护",
    "在线PDF加密保护",
    "PDF加密保护工具",
    "免费PDF加密保护",
  ],
  openGraph: {
    title: "PDF加密保护 - 在线PDF加密保护工具 | 工具箱",
    description:
      "在线为PDF文件添加密码保护，设置打开密码和权限密码，安全可靠",
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
