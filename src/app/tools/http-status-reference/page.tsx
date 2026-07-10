"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Network, Search } from "lucide-react";

interface HttpStatus {
  code: number;
  name: string;
  category: string;
  description: string;
}

const STATUSES: HttpStatus[] = [
  { code: 100, name: "Continue", category: "1xx 信息", description: "客户端应继续发送请求" },
  { code: 101, name: "Switching Protocols", category: "1xx 信息", description: "服务器同意切换协议" },
  { code: 200, name: "OK", category: "2xx 成功", description: "请求成功" },
  { code: 201, name: "Created", category: "2xx 成功", description: "请求成功并创建了新资源" },
  { code: 204, name: "No Content", category: "2xx 成功", description: "请求成功但无内容返回" },
  { code: 206, name: "Partial Content", category: "2xx 成功", description: "服务器已处理部分GET请求" },
  { code: 301, name: "Moved Permanently", category: "3xx 重定向", description: "资源已永久移动到新位置" },
  { code: 302, name: "Found", category: "3xx 重定向", description: "资源临时移动到新位置" },
  { code: 304, name: "Not Modified", category: "3xx 重定向", description: "资源未修改，使用缓存" },
  { code: 307, name: "Temporary Redirect", category: "3xx 重定向", description: "临时重定向，保持请求方法" },
  { code: 308, name: "Permanent Redirect", category: "3xx 重定向", description: "永久重定向，保持请求方法" },
  { code: 400, name: "Bad Request", category: "4xx 客户端错误", description: "请求语法错误，服务器无法理解" },
  { code: 401, name: "Unauthorized", category: "4xx 客户端错误", description: "请求需要身份验证" },
  { code: 403, name: "Forbidden", category: "4xx 客户端错误", description: "服务器拒绝请求" },
  { code: 404, name: "Not Found", category: "4xx 客户端错误", description: "请求的资源不存在" },
  { code: 405, name: "Method Not Allowed", category: "4xx 客户端错误", description: "请求方法不被允许" },
  { code: 408, name: "Request Timeout", category: "4xx 客户端错误", description: "请求超时" },
  { code: 409, name: "Conflict", category: "4xx 客户端错误", description: "请求冲突" },
  { code: 413, name: "Payload Too Large", category: "4xx 客户端错误", description: "请求体过大" },
  { code: 414, name: "URI Too Long", category: "4xx 客户端错误", description: "请求的URI过长" },
  { code: 415, name: "Unsupported Media Type", category: "4xx 客户端错误", description: "不支持的媒体类型" },
  { code: 429, name: "Too Many Requests", category: "4xx 客户端错误", description: "请求过多，被限流" },
  { code: 500, name: "Internal Server Error", category: "5xx 服务器错误", description: "服务器内部错误" },
  { code: 501, name: "Not Implemented", category: "5xx 服务器错误", description: "服务器不支持请求的功能" },
  { code: 502, name: "Bad Gateway", category: "5xx 服务器错误", description: "网关错误" },
  { code: 503, name: "Service Unavailable", category: "5xx 服务器错误", description: "服务不可用" },
  { code: 504, name: "Gateway Timeout", category: "5xx 服务器错误", description: "网关超时" },
  { code: 505, name: "HTTP Version Not Supported", category: "5xx 服务器错误", description: "不支持HTTP版本" },
];

const CATEGORY_COLORS: Record<string, string> = {
  "1xx 信息": "text-blue-400 bg-blue-500/10",
  "2xx 成功": "text-emerald-400 bg-emerald-500/10",
  "3xx 重定向": "text-yellow-400 bg-yellow-500/10",
  "4xx 客户端错误": "text-orange-400 bg-orange-500/10",
  "5xx 服务器错误": "text-red-400 bg-red-500/10",
};

export default function HttpStatusReferencePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return STATUSES;
    return STATUSES.filter(
      (s) => String(s.code).includes(query) || s.name.toLowerCase().includes(query.toLowerCase()) || s.description.includes(query) || s.category.includes(query)
    );
  }, [query]);

  return (
    <ToolLayout title="HTTP状态码速查" description="快速查询HTTP状态码含义及使用场景说明" icon={Network} category="查询工具" slug="http-status-reference">
      <div className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索状态码、名称或描述..."
            className="w-full pl-10 pr-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        <div className="mb-4 text-sm text-slate-400">共 {filtered.length} 条结果</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((s) => (
            <div key={s.code} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold font-mono text-white">{s.code}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${CATEGORY_COLORS[s.category]}`}>{s.category}</span>
              </div>
              <div className="text-sm font-medium text-primary-400 mb-1">{s.name}</div>
              <div className="text-sm text-slate-400">{s.description}</div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">未找到匹配结果</div>
        )}
      </div>
    </ToolLayout>
  );
}
