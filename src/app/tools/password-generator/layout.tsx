import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "密码生成器 - 在线随机安全密码 | 99在线工具",
  description:
    "免费在线密码生成器，生成安全的随机密码，可自定义长度、字符类型和强度，保护账号安全。",
  keywords: [
    "密码生成器",
    "随机密码",
    "安全密码",
    "强密码生成",
    "在线密码生成",
  ],
  openGraph: {
    title: "密码生成器 - 在线随机安全密码 | 99在线工具",
    description:
      "免费在线密码生成器，生成安全的随机密码，可自定义长度、字符类型和强度，保护账号安全。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/password-generator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
