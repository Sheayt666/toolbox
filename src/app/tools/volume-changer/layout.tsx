import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "音量调整 - 在线音量调整工具 | 99在线工具",
  description:
    "在线调整音频音量大小，支持增大和减小音量，精确控制分贝",
  keywords: [
    "音量调整",
    "在线音量调整",
    "音量调整工具",
    "免费音量调整",
  ],
  openGraph: {
    title: "音量调整 - 在线音量调整工具 | 99在线工具",
    description:
      "在线调整音频音量大小，支持增大和减小音量，精确控制分贝",
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
