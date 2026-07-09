"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { BookOpen, Copy, Check, Search } from "lucide-react";

const cheatsheetData = [
  {
    category: "字符类",
    items: [
      { pattern: ".", desc: "匹配任意单个字符（除换行符）" },
      { pattern: "\\d", desc: "匹配数字 [0-9]" },
      { pattern: "\\D", desc: "匹配非数字" },
      { pattern: "\\w", desc: "匹配字母数字下划线 [a-zA-Z0-9_]" },
      { pattern: "\\W", desc: "匹配非字母数字下划线" },
      { pattern: "\\s", desc: "匹配空白字符" },
      { pattern: "\\S", desc: "匹配非空白字符" },
      { pattern: "[abc]", desc: "匹配a、b或c中的任意一个" },
      { pattern: "[^abc]", desc: "匹配除a、b、c以外的字符" },
      { pattern: "[a-z]", desc: "匹配a到z的任意小写字母" },
      { pattern: "[A-Z]", desc: "匹配A到Z的任意大写字母" },
      { pattern: "[0-9]", desc: "匹配0到9的任意数字" },
    ],
  },
  {
    category: "锚点",
    items: [
      { pattern: "^", desc: "匹配字符串开头" },
      { pattern: "$", desc: "匹配字符串结尾" },
      { pattern: "\\b", desc: "匹配单词边界" },
      { pattern: "\\B", desc: "匹配非单词边界" },
    ],
  },
  {
    category: "量词",
    items: [
      { pattern: "*", desc: "匹配前面的表达式0次或多次" },
      { pattern: "+", desc: "匹配前面的表达式1次或多次" },
      { pattern: "?", desc: "匹配前面的表达式0次或1次" },
      { pattern: "{n}", desc: "精确匹配n次" },
      { pattern: "{n,}", desc: "至少匹配n次" },
      { pattern: "{n,m}", desc: "匹配n到m次" },
      { pattern: "*?", desc: "非贪婪匹配0次或多次" },
      { pattern: "+?", desc: "非贪婪匹配1次或多次" },
    ],
  },
  {
    category: "分组与引用",
    items: [
      { pattern: "(abc)", desc: "捕获组，匹配abc并捕获" },
      { pattern: "(?:abc)", desc: "非捕获组，匹配但不捕获" },
      { pattern: "(?=abc)", desc: "正向先行断言" },
      { pattern: "(?!abc)", desc: "负向先行断言" },
      { pattern: "(?<=abc)", desc: "正向后行断言" },
      { pattern: "(?<!abc)", desc: "负向后行断言" },
      { pattern: "a|b", desc: "匹配a或b" },
      { pattern: "\\1", desc: "反向引用第1个捕获组" },
    ],
  },
  {
    category: "标志",
    items: [
      { pattern: "g", desc: "全局匹配，查找所有匹配项" },
      { pattern: "i", desc: "忽略大小写" },
      { pattern: "m", desc: "多行模式，^和$匹配每行" },
      { pattern: "s", desc: "点号匹配换行符" },
      { pattern: "u", desc: "Unicode模式" },
    ],
  },
  {
    category: "常用示例",
    items: [
      { pattern: "^\\d+$", desc: "纯数字" },
      { pattern: "^[a-zA-Z]+$", desc: "纯字母" },
      { pattern: "^[\\u4e00-\\u9fa5]+$", desc: "纯中文" },
      { pattern: "^\\w+@\\w+\\.\\w+$", desc: "邮箱地址（简单版）" },
      { pattern: "^1[3-9]\\d{9}$", desc: "中国大陆手机号" },
      { pattern: "^https?://", desc: "URL（http/https）" },
      { pattern: "^\\d{4}-\\d{2}-\\d{2}$", desc: "日期 YYYY-MM-DD" },
      { pattern: "^\\d{3}-\\d{4}-\\d{4}$", desc: "电话号码" },
    ],
  },
];

export default function RegexCheatsheetPage() {
  const [search, setSearch] = useState("");
  const [copiedPattern, setCopiedPattern] = useState("");

  const handleCopy = (pattern: string) => {
    navigator.clipboard.writeText(pattern);
    setCopiedPattern(pattern);
    setTimeout(() => setCopiedPattern(""), 1500);
  };

  const filteredData = cheatsheetData.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) =>
        item.pattern.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <ToolLayout
      title="正则表达式速查表"
      description="正则表达式速查表，常用正则语法大全，快速查阅正则表达式参考"
      toolId="regex-cheatsheet"
      icon={BookOpen}
      category="开发工具"
      slug="regex-cheatsheet"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索正则表达式语法..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-primary-500/50 placeholder-zinc-600"
              />
            </div>
          </div>

          <div className="p-4 space-y-6 max-h-[600px] overflow-y-auto">
            {filteredData.map((group) => (
              <div key={group.category}>
                <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                  {group.category}
                </h3>
                <div className="grid gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.pattern}
                      className="flex items-center gap-3 p-3 bg-[#09090b] rounded-xl hover:bg-[#0f0f12] transition-colors group"
                    >
                      <code className="flex-shrink-0 px-3 py-1 bg-[#18181b] border border-[#27272a] rounded-lg text-sm font-mono text-primary-400 min-w-[120px] text-center">
                        {item.pattern}
                      </code>
                      <span className="flex-1 text-sm text-zinc-400">{item.desc}</span>
                      <button
                        onClick={() => handleCopy(item.pattern)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-zinc-300 transition-all"
                        title="复制"
                      >
                        {copiedPattern === item.pattern ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            正则表达式速查表，常用正则语法大全，快速查阅正则表达式参考。涵盖字符类、锚点、量词、分组、断言等核心语法，
            附常用正则示例，支持搜索筛选，点击即可复制。是开发者日常工作的必备参考工具。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
