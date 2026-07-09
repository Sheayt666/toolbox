"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { GitBranch, Search, Copy, Check, BookOpen } from "lucide-react";

const cheatsheetData = [
  {
    category: "基础操作",
    items: [
      { code: "git init", title: "初始化仓库", desc: "在当前目录创建一个新的Git仓库", example: "git init" },
      { code: "git clone <url>", title: "克隆仓库", desc: "克隆远程仓库到本地", example: "git clone https://github.com/user/repo.git" },
      { code: "git status", title: "查看状态", desc: "显示工作目录和暂存区的状态", example: "git status" },
      { code: "git add <file>", title: "添加文件", desc: "将文件添加到暂存区", example: "git add index.js" },
      { code: "git add .", title: "添加所有", desc: "将所有变更添加到暂存区", example: "git add ." },
      { code: "git commit -m \"msg\"", title: "提交变更", desc: "提交暂存区的变更到本地仓库", example: 'git commit -m "fix: 修复登录bug"' },
      { code: "git commit -am \"msg\"", title: "快速提交", desc: "添加并提交所有已跟踪文件的变更", example: 'git commit -am "update"' },
    ],
  },
  {
    category: "分支操作",
    items: [
      { code: "git branch", title: "列出分支", desc: "列出所有本地分支", example: "git branch" },
      { code: "git branch -a", title: "列出所有分支", desc: "列出所有本地和远程分支", example: "git branch -a" },
      { code: "git branch <name>", title: "创建分支", desc: "创建新分支", example: "git branch feature/login" },
      { code: "git checkout <branch>", title: "切换分支", desc: "切换到指定分支", example: "git checkout develop" },
      { code: "git switch <branch>", title: "切换分支", desc: "切换到指定分支（Git 2.23+）", example: "git switch main" },
      { code: "git checkout -b <name>", title: "创建并切换", desc: "创建新分支并切换到该分支", example: "git checkout -b feature/new" },
      { code: "git branch -d <name>", title: "删除分支", desc: "删除指定分支", example: "git branch -d feature/old" },
      { code: "git merge <branch>", title: "合并分支", desc: "将指定分支合并到当前分支", example: "git merge feature/login" },
    ],
  },
  {
    category: "远程操作",
    items: [
      { code: "git remote -v", title: "查看远程", desc: "查看远程仓库地址", example: "git remote -v" },
      { code: "git remote add <name> <url>", title: "添加远程", desc: "添加远程仓库", example: "git remote add origin https://..." },
      { code: "git push <remote> <branch>", title: "推送", desc: "将本地提交推送到远程仓库", example: "git push origin main" },
      { code: "git pull", title: "拉取", desc: "从远程拉取并合并到当前分支", example: "git pull origin main" },
      { code: "git fetch <remote>", title: "获取", desc: "从远程获取最新代码但不合并", example: "git fetch origin" },
    ],
  },
  {
    category: "撤销与回退",
    items: [
      { code: "git reset HEAD <file>", title: "取消暂存", desc: "将文件从暂存区移回工作区", example: "git reset HEAD app.js" },
      { code: "git checkout -- <file>", title: "撤销修改", desc: "撤销工作区文件的修改", example: "git checkout -- app.js" },
      { code: "git reset --soft HEAD~1", title: "软重置", desc: "撤销最近一次提交，保留变更", example: "git reset --soft HEAD~1" },
      { code: "git reset --hard HEAD~1", title: "硬重置", desc: "撤销最近一次提交，丢弃变更", example: "git reset --hard HEAD~1" },
      { code: "git revert <commit>", title: "反提交", desc: "创建新提交来撤销指定提交", example: "git revert a1b2c3d" },
      { code: "git stash", title: "暂存工作", desc: "临时保存未完成的工作", example: "git stash" },
      { code: "git stash pop", title: "恢复暂存", desc: "恢复最近一次暂存的工作", example: "git stash pop" },
    ],
  },
  {
    category: "查看历史",
    items: [
      { code: "git log", title: "查看日志", desc: "查看提交历史", example: "git log" },
      { code: "git log --oneline", title: "简洁日志", desc: "一行显示一个提交", example: "git log --oneline" },
      { code: "git log --graph", title: "图形日志", desc: "以图形方式显示分支历史", example: "git log --graph --oneline --all" },
      { code: "git diff", title: "查看差异", desc: "查看工作区与暂存区的差异", example: "git diff" },
      { code: "git diff --cached", title: "暂存区差异", desc: "查看暂存区与上次提交的差异", example: "git diff --cached" },
      { code: "git show <commit>", title: "查看提交", desc: "查看指定提交的详细信息", example: "git show a1b2c3d" },
    ],
  },
];

export default function GitCheatsheetPage() {
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
      title="Git命令速查"
      description="常用Git命令速查表，涵盖提交、分支、远程、撤销等操作，支持搜索快速查找"
      toolId="git-cheatsheet"
      icon={GitBranch}
      category="开发工具"
      slug="git-cheatsheet"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索命令、代码或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 transition-all"
          />
        </div>
        <div className="space-y-6">
          {filteredData.map((group, gi) => (
            <div key={gi} className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-orange-400" />
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
                            <code className="px-2 py-0.5 bg-zinc-800 text-orange-400 text-sm font-mono rounded">
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
                        className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-orange-400 hover:bg-zinc-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
