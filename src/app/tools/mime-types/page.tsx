"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileType, Search, Copy, Check, BookOpen } from "lucide-react";

const cheatsheetData = [
  {
    category: "文本类型",
    items: [
      { code: "text/plain", title: "纯文本", desc: ".txt 纯文本文件", example: ".txt" },
      { code: "text/html", title: "HTML", desc: ".html .htm 超文本标记语言", example: ".html" },
      { code: "text/css", title: "CSS", desc: ".css 层叠样式表", example: ".css" },
      { code: "text/javascript", title: "JavaScript", desc: ".js JavaScript脚本", example: ".js" },
      { code: "text/csv", title: "CSV", desc: ".csv 逗号分隔值文件", example: ".csv" },
      { code: "text/xml", title: "XML", desc: ".xml 可扩展标记语言", example: ".xml" },
      { code: "text/markdown", title: "Markdown", desc: ".md Markdown文档", example: ".md" },
    ],
  },
  {
    category: "图片类型",
    items: [
      { code: "image/jpeg", title: "JPEG", desc: ".jpg .jpeg JPEG图片", example: ".jpg" },
      { code: "image/png", title: "PNG", desc: ".png 便携式网络图形", example: ".png" },
      { code: "image/gif", title: "GIF", desc: ".gif 图形交换格式", example: ".gif" },
      { code: "image/webp", title: "WebP", desc: ".webp WebP图片格式", example: ".webp" },
      { code: "image/svg+xml", title: "SVG", desc: ".svg 可缩放矢量图形", example: ".svg" },
      { code: "image/bmp", title: "BMP", desc: ".bmp 位图图像", example: ".bmp" },
      { code: "image/ico", title: "ICO", desc: ".ico 图标文件", example: ".ico" },
      { code: "image/tiff", title: "TIFF", desc: ".tif .tiff 标记图像文件格式", example: ".tiff" },
    ],
  },
  {
    category: "音频类型",
    items: [
      { code: "audio/mpeg", title: "MP3", desc: ".mp3 MPEG音频", example: ".mp3" },
      { code: "audio/wav", title: "WAV", desc: ".wav 波形音频", example: ".wav" },
      { code: "audio/ogg", title: "OGG", desc: ".ogg Ogg Vorbis音频", example: ".ogg" },
      { code: "audio/flac", title: "FLAC", desc: ".flac 无损音频压缩编码", example: ".flac" },
      { code: "audio/aac", title: "AAC", desc: ".aac 高级音频编码", example: ".aac" },
      { code: "audio/midi", title: "MIDI", desc: ".mid .midi 乐器数字接口", example: ".mid" },
    ],
  },
  {
    category: "视频类型",
    items: [
      { code: "video/mp4", title: "MP4", desc: ".mp4 MPEG-4视频", example: ".mp4" },
      { code: "video/webm", title: "WebM", desc: ".webm WebM视频", example: ".webm" },
      { code: "video/ogg", title: "OGG Video", desc: ".ogv Ogg视频", example: ".ogv" },
      { code: "video/avi", title: "AVI", desc: ".avi 音频视频交错格式", example: ".avi" },
      { code: "video/mpeg", title: "MPEG", desc: ".mpeg .mpg MPEG视频", example: ".mpeg" },
      { code: "video/quicktime", title: "QuickTime", desc: ".mov Apple QuickTime视频", example: ".mov" },
    ],
  },
  {
    category: "应用程序类型",
    items: [
      { code: "application/json", title: "JSON", desc: ".json JavaScript对象表示法", example: ".json" },
      { code: "application/xml", title: "XML", desc: ".xml 可扩展标记语言", example: ".xml" },
      { code: "application/pdf", title: "PDF", desc: ".pdf 便携式文档格式", example: ".pdf" },
      { code: "application/zip", title: "ZIP", desc: ".zip ZIP压缩文件", example: ".zip" },
      { code: "application/gzip", title: "Gzip", desc: ".gz Gzip压缩文件", example: ".gz" },
      { code: "application/x-tar", title: "TAR", desc: ".tar Tar归档文件", example: ".tar" },
      { code: "application/x-rar-compressed", title: "RAR", desc: ".rar RAR压缩文件", example: ".rar" },
      { code: "application/msword", title: "Word", desc: ".doc Microsoft Word文档", example: ".doc" },
      { code: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", title: "Word (2007+)", desc: ".docx Word Open XML文档", example: ".docx" },
      { code: "application/vnd.ms-excel", title: "Excel", desc: ".xls Microsoft Excel表格", example: ".xls" },
      { code: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", title: "Excel (2007+)", desc: ".xlsx Excel Open XML表格", example: ".xlsx" },
      { code: "application/octet-stream", title: "二进制流", desc: "未知类型的二进制数据", example: ".bin .exe" },
    ],
  },
  {
    category: "字体类型",
    items: [
      { code: "font/woff", title: "WOFF", desc: ".woff Web开放字体格式", example: ".woff" },
      { code: "font/woff2", title: "WOFF2", desc: ".woff2 WOFF 2.0字体", example: ".woff2" },
      { code: "font/ttf", title: "TTF", desc: ".ttf TrueType字体", example: ".ttf" },
      { code: "font/otf", title: "OTF", desc: ".otf OpenType字体", example: ".otf" },
    ],
  },
];

export default function MimeTypesPage() {
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
      title="MIME类型查询"
      description="MIME类型对照表，常用文件扩展名对应的MIME类型查询，支持双向搜索"
      toolId="mime-types"
      icon={FileType}
      category="开发工具"
      slug="mime-types"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索命令、代码或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>
        <div className="space-y-6">
          {filteredData.map((group, gi) => (
            <div key={gi} className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
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
                            <code className="px-2 py-0.5 bg-zinc-800 text-purple-400 text-sm font-mono rounded">
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
                        className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-purple-400 hover:bg-zinc-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
