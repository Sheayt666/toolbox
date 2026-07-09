import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "倒计时/计时器 - 在线秒表倒计时工具 | 99在线工具",
  description:
    "免费在线倒计时和秒表工具，支持多组倒计时、精准秒表计时，满足学习、工作、运动等多种场景。",
  keywords: ["倒计时", "计时器", "秒表", "在线倒计时", "在线计时器"],
  openGraph: {
    title: "倒计时/计时器 - 在线秒表倒计时工具 | 99在线工具",
    description:
      "免费在线倒计时和秒表工具，支持多组倒计时、精准秒表计时。",
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
