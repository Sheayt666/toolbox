import type { Metadata } from "next";
import DisclaimerContent from "@/components/DisclaimerContent";

export const metadata: Metadata = {
  title: "免责声明 - 99在线工具",
  description: "99在线工具法律免责声明，使用本站工具前请仔细阅读。",
};

export default function DisclaimerPage() {
  return <DisclaimerContent />;
}
