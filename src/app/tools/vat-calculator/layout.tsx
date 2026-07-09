import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "增值税计算器 - 含税不含税在线计算 | 99在线工具",
  description:
    "免费在线增值税计算器，支持含税价和不含税价互转，覆盖常见税率，快速计算增值税额。",
  keywords: [
    "增值税计算器",
    "增值税计算",
    "含税价计算",
    "不含税价",
    "税额计算",
  ],
  openGraph: {
    title: "增值税计算器 - 含税不含税在线计算 | 99在线工具",
    description:
      "免费在线增值税计算器，支持含税不含税价互转。",
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
