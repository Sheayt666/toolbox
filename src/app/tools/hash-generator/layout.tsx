import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "哈希生成器 - MD5/SHA在线计算 | 99在线工具",
  description:
    "免费在线哈希生成器，支持MD5、SHA-1、SHA-256、SHA-384、SHA-512等多种哈希算法，实时计算。",
  keywords: [
    "哈希生成",
    "MD5加密",
    "SHA256",
    "哈希计算",
    "在线哈希工具",
  ],
  openGraph: {
    title: "哈希生成器 - MD5/SHA在线计算 | 99在线工具",
    description:
      "免费在线哈希生成器，支持MD5、SHA-1、SHA-256、SHA-384、SHA-512等多种哈希算法，实时计算。",
    type: "website",
    locale: "zh_CN",
  },
  alternates: {
    canonical: "/tools/hash-generator",
  },
};

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
