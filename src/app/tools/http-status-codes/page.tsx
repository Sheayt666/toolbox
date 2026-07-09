"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Globe, Search, Copy, Check, BookOpen } from "lucide-react";

const cheatsheetData = [
  {
    category: "1xx - 信息响应",
    items: [
      { code: "100", title: "Continue", desc: "继续。服务器已收到请求头，客户端应继续发送请求体" },
      { code: "101", title: "Switching Protocols", desc: "切换协议。服务器根据客户端请求切换到更高版本协议" },
      { code: "102", title: "Processing", desc: "处理中。服务器已接受请求，但尚未处理完成" },
      { code: "103", title: "Early Hints", desc: "早期提示。用于在最终响应之前返回一些链接资源" },
    ],
  },
  {
    category: "2xx - 成功响应",
    items: [
      { code: "200", title: "OK", desc: "成功。请求已成功处理" },
      { code: "201", title: "Created", desc: "已创建。请求成功并且服务器创建了新的资源" },
      { code: "202", title: "Accepted", desc: "已接受。服务器已接受请求，但尚未处理" },
      { code: "204", title: "No Content", desc: "无内容。服务器成功处理了请求，但不需要返回任何实体内容" },
      { code: "206", title: "Partial Content", desc: "部分内容。服务器成功处理了部分GET请求" },
    ],
  },
  {
    category: "3xx - 重定向",
    items: [
      { code: "301", title: "Moved Permanently", desc: "永久移动。请求的资源已永久移动到新位置" },
      { code: "302", title: "Found", desc: "临时移动。请求的资源临时从不同的URI响应请求" },
      { code: "303", title: "See Other", desc: "查看其他位置。对应当前请求的响应可以在另一个URI上找到" },
      { code: "304", title: "Not Modified", desc: "未修改。资源未被修改，客户端可以使用缓存的版本" },
      { code: "307", title: "Temporary Redirect", desc: "临时重定向。请求应使用另一个URI，但将来的请求仍应使用原始URI" },
      { code: "308", title: "Permanent Redirect", desc: "永久重定向。资源已永久移动到新位置" },
    ],
  },
  {
    category: "4xx - 客户端错误",
    items: [
      { code: "400", title: "Bad Request", desc: "错误请求。服务器无法理解请求的格式" },
      { code: "401", title: "Unauthorized", desc: "未授权。请求需要用户验证" },
      { code: "403", title: "Forbidden", desc: "禁止访问。服务器拒绝执行请求" },
      { code: "404", title: "Not Found", desc: "未找到。服务器找不到请求的资源" },
      { code: "405", title: "Method Not Allowed", desc: "方法不允许。请求方法不被服务器支持" },
      { code: "408", title: "Request Timeout", desc: "请求超时。服务器等待请求超时" },
      { code: "409", title: "Conflict", desc: "冲突。请求与服务器的当前状态冲突" },
      { code: "410", title: "Gone", desc: "已删除。请求的资源已永久删除" },
      { code: "413", title: "Payload Too Large", desc: "负载过大。请求体超过服务器愿意处理的大小" },
      { code: "415", title: "Unsupported Media Type", desc: "不支持的媒体类型。请求的格式不受支持" },
      { code: "422", title: "Unprocessable Entity", desc: "不可处理的实体。请求格式正确但语义错误" },
      { code: "429", title: "Too Many Requests", desc: "请求过多。用户在一定时间内发送了太多请求" },
    ],
  },
  {
    category: "5xx - 服务器错误",
    items: [
      { code: "500", title: "Internal Server Error", desc: "服务器内部错误。服务器遇到了意外情况" },
      { code: "501", title: "Not Implemented", desc: "未实现。服务器不支持当前请求所需的功能" },
      { code: "502", title: "Bad Gateway", desc: "错误网关。服务器作为网关或代理，从上游服务器收到无效响应" },
      { code: "503", title: "Service Unavailable", desc: "服务不可用。服务器暂时无法处理请求" },
      { code: "504", title: "Gateway Timeout", desc: "网关超时。服务器作为网关或代理，未及时收到上游响应" },
      { code: "505", title: "HTTP Version Not Supported", desc: "HTTP版本不受支持。服务器不支持请求使用的HTTP版本" },
    ],
  },
];

export default function HttpStatusCodesPage() {
  const [search, setSearch] = useState("");
  const [copiedItem, setCopiedItem] = useState("");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(text);
    setTimeout(() => setCopiedItem(""), 1500);
  };

  const filteredData = cheatsheetData.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(search.toLowerCase()))
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <ToolLayout
      title="HTTP状态码查询"
      description="HTTP状态码大全查询，1xx/2xx/3xx/4xx/5xx状态码含义详解，支持搜索"
      toolId="http-status-codes"
      icon={Globe}
      category="开发工具"
      slug="http-status-codes"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索命令、代码或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          />
        </div>
        <div className="space-y-6">
          {filteredData.map((group, gi) => (
            <div key={gi} className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {group.category}
                  </h3>
                  <span className="text-xs text-zinc-500">
                    ({group.items.length})
                  </span>
                </div>
              </div>
              <div className="divide-y divide-zinc-800">
                {group.items.map((item, ii) => (
                  <div
                    key={ii}
                    className="p-4 hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {item.code && (
                            <code className="px-2 py-0.5 bg-zinc-800 text-blue-400 text-sm font-mono rounded">
                              {item.code}
                            </code>
                          )}
                          <span className="font-medium text-zinc-200 text-sm">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{item.desc}</p>
                        {item.example && (
                          <pre className="mt-2 p-2 bg-zinc-900 rounded-lg text-xs text-zinc-500 overflow-x-auto">
                            {item.example}
                          </pre>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(item.code || item.title)}
                        className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-blue-400 hover:bg-zinc-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="复制"
                      >
                        {copiedItem === (item.code || item.title) ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            未找到匹配的结果
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
