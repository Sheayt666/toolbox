import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL编码解码工具 - 在线转义 | 99在线工具",
  description:
    "免费在线URL编码解码工具，快速处理URL特殊字符转义，支持encodeURIComponent和decodeURIComponent。",
  keywords: [
    "URL编码",
    "URL解码",
    "URL转义",
    "encodeURIComponent",
  ],
  openGraph: {
    title: "URL编码解码工具 - 在线转义 | 99在线工具",
    description:
      "免费在线URL编码解码工具，快速处理URL特殊字符转义，支持encodeURIComponent和decodeURIComponent。",
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
