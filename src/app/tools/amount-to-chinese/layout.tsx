import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "金额大写转换 - 数字转人民币大写在线工具 | 99在线工具",
  description:
    "免费在线金额大写转换工具，将数字金额转换为人民币中文大写（壹贰叁肆伍陆柒捌玖拾佰仟万亿元角分），支持整数和小数，实时转换，最大支持万亿级别。",
  keywords: ["金额大写转换", "人民币大写", "数字转大写", "金额大写", "壹贰叁肆伍", "财务金额大写", "在线金额转换"],
  openGraph: {
    title: "金额大写转换 - 数字转人民币大写在线工具 | 99在线工具",
    description:
      "免费在线金额大写转换工具，将数字金额转换为人民币中文大写，支持整数和小数，实时转换。",
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
