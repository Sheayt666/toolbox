"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Server, Search } from "lucide-react";

interface Port {
  port: number;
  protocol: string;
  service: string;
  description: string;
}

const PORTS: Port[] = [
  { port: 20, protocol: "TCP", service: "FTP-DATA", description: "文件传输协议-数据端口" },
  { port: 21, protocol: "TCP", service: "FTP", description: "文件传输协议-控制端口" },
  { port: 22, protocol: "TCP", service: "SSH", description: "安全外壳协议" },
  { port: 23, protocol: "TCP", service: "Telnet", description: "远程登录协议" },
  { port: 25, protocol: "TCP", service: "SMTP", description: "简单邮件传输协议" },
  { port: 53, protocol: "TCP/UDP", service: "DNS", description: "域名系统" },
  { port: 67, protocol: "UDP", service: "DHCP", description: "动态主机配置协议-服务端" },
  { port: 68, protocol: "UDP", service: "DHCP", description: "动态主机配置协议-客户端" },
  { port: 69, protocol: "UDP", service: "TFTP", description: "简单文件传输协议" },
  { port: 80, protocol: "TCP", service: "HTTP", description: "超文本传输协议" },
  { port: 110, protocol: "TCP", service: "POP3", description: "邮局协议版本3" },
  { port: 119, protocol: "TCP", service: "NNTP", description: "网络新闻传输协议" },
  { port: 123, protocol: "UDP", service: "NTP", description: "网络时间协议" },
  { port: 143, protocol: "TCP", service: "IMAP", description: "互联网消息访问协议" },
  { port: 161, protocol: "UDP", service: "SNMP", description: "简单网络管理协议" },
  { port: 162, protocol: "UDP", service: "SNMP-TRAP", description: "SNMP陷阱" },
  { port: 389, protocol: "TCP", service: "LDAP", description: "轻量级目录访问协议" },
  { port: 443, protocol: "TCP", service: "HTTPS", description: "安全超文本传输协议" },
  { port: 445, protocol: "TCP", service: "SMB", description: "服务器消息块协议" },
  { port: 465, protocol: "TCP", service: "SMTPS", description: "SMTP over SSL" },
  { port: 500, protocol: "UDP", service: "IKE", description: "Internet密钥交换" },
  { port: 514, protocol: "UDP", service: "Syslog", description: "系统日志" },
  { port: 587, protocol: "TCP", service: "SMTP", description: "邮件提交端口" },
  { port: 636, protocol: "TCP", service: "LDAPS", description: "LDAP over SSL" },
  { port: 873, protocol: "TCP", service: "rsync", description: "远程同步" },
  { port: 993, protocol: "TCP", service: "IMAPS", description: "IMAP over SSL" },
  { port: 995, protocol: "TCP", service: "POP3S", description: "POP3 over SSL" },
  { port: 1080, protocol: "TCP", service: "SOCKS", description: "SOCKS代理" },
  { port: 1194, protocol: "UDP", service: "OpenVPN", description: "OpenVPN" },
  { port: 1433, protocol: "TCP", service: "SQL Server", description: "Microsoft SQL Server" },
  { port: 1521, protocol: "TCP", service: "Oracle", description: "Oracle数据库" },
  { port: 1723, protocol: "TCP", service: "PPTP", description: "点对点隧道协议" },
  { port: 2049, protocol: "TCP/UDP", service: "NFS", description: "网络文件系统" },
  { port: 3306, protocol: "TCP", service: "MySQL", description: "MySQL数据库" },
  { port: 3389, protocol: "TCP", service: "RDP", description: "远程桌面协议" },
  { port: 5432, protocol: "TCP", service: "PostgreSQL", description: "PostgreSQL数据库" },
  { port: 5900, protocol: "TCP", service: "VNC", description: "虚拟网络计算" },
  { port: 6379, protocol: "TCP", service: "Redis", description: "Redis数据库" },
  { port: 8080, protocol: "TCP", service: "HTTP-Alt", description: "HTTP替代端口" },
  { port: 8443, protocol: "TCP", service: "HTTPS-Alt", description: "HTTPS替代端口" },
  { port: 9090, protocol: "TCP", service: "WebSocket", description: "WebSocket端口" },
  { port: 27017, protocol: "TCP", service: "MongoDB", description: "MongoDB数据库" },
];

export default function TcpPortsListPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return PORTS;
    return PORTS.filter(
      (p) => String(p.port).includes(query) || p.service.toLowerCase().includes(query.toLowerCase()) || p.description.includes(query) || p.protocol.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <ToolLayout title="TCP端口大全" description="查询常用TCP/UDP端口号及其对应的服务和用途" icon={Server} category="查询工具" slug="tcp-ports-list">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索端口号、服务名或描述..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#27272a] text-slate-400">
                <th className="text-left py-3 px-3 font-medium">端口</th>
                <th className="text-left py-3 px-3 font-medium">协议</th>
                <th className="text-left py-3 px-3 font-medium">服务</th>
                <th className="text-left py-3 px-3 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b border-[#1e1e21] hover:bg-[#1c1c1f] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-primary-400">{p.port}</td>
                  <td className="py-3 px-3"><span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">{p.protocol}</span></td>
                  <td className="py-3 px-3 text-white font-medium">{p.service}</td>
                  <td className="py-3 px-3 text-slate-400">{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && <div className="text-center py-12 text-slate-500">未找到匹配结果</div>}
      </div>
    </ToolLayout>
  );
}
