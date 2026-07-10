import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "重量单位换算器 - 千克/克/磅/盎司/斤",
  description: "快速在线重量单位换算工具，支持千克、克、毫克、吨、磅、盎司、斤、两等多种重量单位",
  keywords: ["重量换算", "千克转磅", "斤换算", "单位换算"],
  alternates: {
    canonical: "/tools/weight-converter",
  },
};

export default function WeightConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
