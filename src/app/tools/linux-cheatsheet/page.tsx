"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Terminal, Search, Copy, Check, BookOpen } from "lucide-react";

const cheatsheetData = [
  {
    category: "文件操作",
    items: [
      { code: "ls", title: "列出文件", desc: "列出当前目录的文件和目录", example: "ls -la" },
      { code: "cd <dir>", title: "切换目录", desc: "切换到指定目录", example: "cd /home/user" },
      { code: "pwd", title: "当前路径", desc: "显示当前工作目录的完整路径", example: "pwd" },
      { code: "mkdir <dir>", title: "创建目录", desc: "创建新目录", example: "mkdir new_folder" },
      { code: "rm <file>", title: "删除文件", desc: "删除指定文件", example: "rm file.txt" },
      { code: "rm -r <dir>", title: "删除目录", desc: "递归删除目录及其内容", example: "rm -r old_folder" },
      { code: "cp <src> <dst>", title: "复制", desc: "复制文件或目录", example: "cp file.txt backup.txt" },
      { code: "mv <src> <dst>", title: "移动/重命名", desc: "移动或重命名文件", example: "mv old.txt new.txt" },
      { code: "touch <file>", title: "创建文件", desc: "创建空文件或更新时间戳", example: "touch readme.md" },
      { code: "cat <file>", title: "查看文件", desc: "显示文件内容", example: "cat config.json" },
      { code: "head <file>", title: "文件头部", desc: "显示文件前几行", example: "head -20 log.txt" },
      { code: "tail <file>", title: "文件尾部", desc: "显示文件最后几行", example: "tail -f app.log" },
    ],
  },
  {
    category: "权限管理",
    items: [
      { code: "chmod <perm> <file>", title: "修改权限", desc: "修改文件或目录的权限", example: "chmod 755 script.sh" },
      { code: "chown <user> <file>", title: "修改所有者", desc: "修改文件的所有者", example: "chown user:group file.txt" },
      { code: "chgrp <group> <file>", title: "修改组", desc: "修改文件所属用户组", example: "chgrp dev file.txt" },
      { code: "sudo <cmd>", title: "超级用户", desc: "以管理员权限执行命令", example: "sudo apt update" },
      { code: "su <user>", title: "切换用户", desc: "切换到指定用户", example: "su root" },
    ],
  },
  {
    category: "进程管理",
    items: [
      { code: "ps", title: "进程状态", desc: "显示当前运行的进程", example: "ps aux" },
      { code: "top", title: "实时监控", desc: "实时显示系统进程信息", example: "top" },
      { code: "htop", title: "增强监控", desc: "增强版的进程监控工具", example: "htop" },
      { code: "kill <pid>", title: "终止进程", desc: "终止指定PID的进程", example: "kill 1234" },
      { code: "kill -9 <pid>", title: "强制终止", desc: "强制终止进程", example: "kill -9 1234" },
      { code: "pkill <name>", title: "按名终止", desc: "按名称终止进程", example: "pkill firefox" },
      { code: "&", title: "后台运行", desc: "在后台运行命令", example: "python script.py &" },
      { code: "jobs", title: "后台任务", desc: "显示当前shell的后台任务", example: "jobs" },
    ],
  },
  {
    category: "网络操作",
    items: [
      { code: "ping <host>", title: "测试连通性", desc: "测试与主机的网络连通性", example: "ping google.com" },
      { code: "curl <url>", title: "网络请求", desc: "发送HTTP请求并显示响应", example: "curl https://api.example.com" },
      { code: "wget <url>", title: "下载文件", desc: "从网络下载文件", example: "wget https://example.com/file.zip" },
      { code: "ifconfig / ip a", title: "网络接口", desc: "显示网络接口配置", example: "ip addr show" },
      { code: "netstat", title: "网络状态", desc: "显示网络连接和端口", example: "netstat -tlnp" },
      { code: "ss", title: "套接字统计", desc: "显示套接字统计信息", example: "ss -tlnp" },
      { code: "ssh <user@host>", title: "远程连接", desc: "通过SSH连接到远程主机", example: "ssh user@192.168.1.100" },
      { code: "scp <src> <dst>", title: "远程复制", desc: "通过SSH安全复制文件", example: "scp file.txt user@host:/path/" },
    ],
  },
  {
    category: "查找与搜索",
    items: [
      { code: "find <path> -name <name>", title: "查找文件", desc: "按名称查找文件", example: "find . -name \"*.js\"" },
      { code: "grep <pattern> <file>", title: "文本搜索", desc: "在文件中搜索匹配的文本", example: 'grep "error" app.log' },
      { code: "grep -r <pattern> <dir>", title: "递归搜索", desc: "递归搜索目录中的文件", example: 'grep -r "TODO" src/' },
      { code: "locate <name>", title: "快速查找", desc: "通过数据库快速查找文件", example: "locate config.json" },
      { code: "which <cmd>", title: "查找命令", desc: "查找命令的位置", example: "which node" },
    ],
  },
  {
    category: "系统信息",
    items: [
      { code: "uname -a", title: "系统信息", desc: "显示系统详细信息", example: "uname -a" },
      { code: "df -h", title: "磁盘空间", desc: "显示磁盘使用情况", example: "df -h" },
      { code: "du -sh <dir>", title: "目录大小", desc: "显示目录占用空间", example: "du -sh /var/log" },
      { code: "free -h", title: "内存信息", desc: "显示内存使用情况", example: "free -h" },
      { code: "uptime", title: "运行时间", desc: "显示系统运行时间", example: "uptime" },
      { code: "whoami", title: "当前用户", desc: "显示当前用户名", example: "whoami" },
      { code: "date", title: "日期时间", desc: "显示当前日期和时间", example: "date" },
    ],
  },
];

export default function LinuxCheatsheetPage() {
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
      title="Linux命令速查"
      description="常用Linux命令速查表，文件、网络、进程、权限等命令大全，支持搜索过滤"
      toolId="linux-cheatsheet"
      icon={Terminal}
      category="开发工具"
      slug="linux-cheatsheet"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索命令、代码或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all"
          />
        </div>
        <div className="space-y-6">
          {filteredData.map((group, gi) => (
            <div key={gi} className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-yellow-400" />
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
                            <code className="px-2 py-0.5 bg-zinc-800 text-yellow-400 text-sm font-mono rounded">
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
                        className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-yellow-400 hover:bg-zinc-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
