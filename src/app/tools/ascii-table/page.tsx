"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Hash, Search, Copy, Check, BookOpen } from "lucide-react";

const cheatsheetData = [
  {
    category: "控制字符 (0-31, 127)",
    items: [
      { code: "0", title: "NUL", desc: "空字符 (Null)" },
      { code: "1", title: "SOH", desc: "标题开始 (Start of Heading)" },
      { code: "2", title: "STX", desc: "正文开始 (Start of Text)" },
      { code: "3", title: "ETX", desc: "正文结束 (End of Text)" },
      { code: "4", title: "EOT", desc: "传输结束 (End of Transmission)" },
      { code: "7", title: "BEL", desc: "响铃 (Bell)" },
      { code: "8", title: "BS", desc: "退格 (Backspace) \\b" },
      { code: "9", title: "HT", desc: "水平制表符 (Tab) \\t" },
      { code: "10", title: "LF", desc: "换行 (Line Feed) \\n" },
      { code: "11", title: "VT", desc: "垂直制表符 (Vertical Tab) \\v" },
      { code: "12", title: "FF", desc: "换页 (Form Feed) \\f" },
      { code: "13", title: "CR", desc: "回车 (Carriage Return) \\r" },
      { code: "27", title: "ESC", desc: "转义 (Escape)" },
      { code: "32", title: "Space", desc: "空格 (Space)" },
      { code: "127", title: "DEL", desc: "删除 (Delete)" },
    ],
  },
  {
    category: "可打印字符 - 数字与符号 (32-64)",
    items: [
      { code: "32", title: "空格", desc: "空格字符 Space" },
      { code: "33", title: "!", desc: "感叹号 Exclamation Mark" },
      { code: "34", title: '"', desc: "双引号 Double Quote" },
      { code: "35", title: "#", desc: "井号 Number Sign" },
      { code: "36", title: "$", desc: "美元符号 Dollar Sign" },
      { code: "37", title: "%", desc: "百分号 Percent" },
      { code: "38", title: "&", desc: "和号 Ampersand" },
      { code: "39", title: "'", desc: "单引号 Apostrophe" },
      { code: "40", title: "(", desc: "左括号 Left Parenthesis" },
      { code: "41", title: ")", desc: "右括号 Right Parenthesis" },
      { code: "42", title: "*", desc: "星号 Asterisk" },
      { code: "43", title: "+", desc: "加号 Plus Sign" },
      { code: "44", title: ",", desc: "逗号 Comma" },
      { code: "45", title: "-", desc: "连字符 Hyphen" },
      { code: "46", title: ".", desc: "句号 Period" },
      { code: "47", title: "/", desc: "斜杠 Slash" },
      { code: "48-57", title: "0-9", desc: "数字0到9 Digits 0-9" },
      { code: "58", title: ":", desc: "冒号 Colon" },
      { code: "59", title: ";", desc: "分号 Semicolon" },
      { code: "60", title: "<", desc: "小于号 Less Than" },
      { code: "61", title: "=", desc: "等号 Equals" },
      { code: "62", title: ">", desc: "大于号 Greater Than" },
      { code: "63", title: "?", desc: "问号 Question Mark" },
      { code: "64", title: "@", desc: "艾特符号 At Sign" },
    ],
  },
  {
    category: "可打印字符 - 大写字母 (65-90)",
    items: [
      { code: "65", title: "A", desc: "大写字母A" },
      { code: "66", title: "B", desc: "大写字母B" },
      { code: "67", title: "C", desc: "大写字母C" },
      { code: "68", title: "D", desc: "大写字母D" },
      { code: "69", title: "E", desc: "大写字母E" },
      { code: "70", title: "F", desc: "大写字母F" },
      { code: "71", title: "G", desc: "大写字母G" },
      { code: "72", title: "H", desc: "大写字母H" },
      { code: "73", title: "I", desc: "大写字母I" },
      { code: "74", title: "J", desc: "大写字母J" },
      { code: "75", title: "K", desc: "大写字母K" },
      { code: "76", title: "L", desc: "大写字母L" },
      { code: "77", title: "M", desc: "大写字母M" },
      { code: "78", title: "N", desc: "大写字母N" },
      { code: "79", title: "O", desc: "大写字母O" },
      { code: "80", title: "P", desc: "大写字母P" },
      { code: "81", title: "Q", desc: "大写字母Q" },
      { code: "82", title: "R", desc: "大写字母R" },
      { code: "83", title: "S", desc: "大写字母S" },
      { code: "84", title: "T", desc: "大写字母T" },
      { code: "85", title: "U", desc: "大写字母U" },
      { code: "86", title: "V", desc: "大写字母V" },
      { code: "87", title: "W", desc: "大写字母W" },
      { code: "88", title: "X", desc: "大写字母X" },
      { code: "89", title: "Y", desc: "大写字母Y" },
      { code: "90", title: "Z", desc: "大写字母Z" },
    ],
  },
  {
    category: "可打印字符 - 小写字母 (97-122)",
    items: [
      { code: "97", title: "a", desc: "小写字母a" },
      { code: "98", title: "b", desc: "小写字母b" },
      { code: "99", title: "c", desc: "小写字母c" },
      { code: "100", title: "d", desc: "小写字母d" },
      { code: "101", title: "e", desc: "小写字母e" },
      { code: "102", title: "f", desc: "小写字母f" },
      { code: "103", title: "g", desc: "小写字母g" },
      { code: "104", title: "h", desc: "小写字母h" },
      { code: "105", title: "i", desc: "小写字母i" },
      { code: "106", title: "j", desc: "小写字母j" },
      { code: "107", title: "k", desc: "小写字母k" },
      { code: "108", title: "l", desc: "小写字母l" },
      { code: "109", title: "m", desc: "小写字母m" },
      { code: "110", title: "n", desc: "小写字母n" },
      { code: "111", title: "o", desc: "小写字母o" },
      { code: "112", title: "p", desc: "小写字母p" },
      { code: "113", title: "q", desc: "小写字母q" },
      { code: "114", title: "r", desc: "小写字母r" },
      { code: "115", title: "s", desc: "小写字母s" },
      { code: "116", title: "t", desc: "小写字母t" },
      { code: "117", title: "u", desc: "小写字母u" },
      { code: "118", title: "v", desc: "小写字母v" },
      { code: "119", title: "w", desc: "小写字母w" },
      { code: "120", title: "x", desc: "小写字母x" },
      { code: "121", title: "y", desc: "小写字母y" },
      { code: "122", title: "z", desc: "小写字母z" },
    ],
  },
  {
    category: "可打印字符 - 特殊符号 (91-96, 123-126)",
    items: [
      { code: "91", title: "[", desc: "左方括号 Left Square Bracket" },
      { code: "92", title: "\\\\", desc: "反斜杠 Backslash" },
      { code: "93", title: "]", desc: "右方括号 Right Square Bracket" },
      { code: "94", title: "^", desc: "脱字符 Caret" },
      { code: "95", title: "_", desc: "下划线 Underscore" },
      { code: "96", title: "`", desc: "重音符 Grave Accent" },
      { code: "123", title: "{", desc: "左花括号 Left Curly Bracket" },
      { code: "124", title: "|", desc: "竖线 Vertical Bar" },
      { code: "125", title: "}", desc: "右花括号 Right Curly Bracket" },
      { code: "126", title: "~", desc: "波浪号 Tilde" },
    ],
  },
];

export default function AsciiTablePage() {
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
      title="ASCII码对照表"
      description="完整ASCII码表查询，支持十进制、十六进制、二进制、字符对照查询，可搜索过滤"
      toolId="ascii-table"
      icon={Hash}
      category="开发工具"
      slug="ascii-table"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="搜索命令、代码或描述..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500/50 transition-all"
          />
        </div>
        <div className="space-y-6">
          {filteredData.map((group, gi) => (
            <div key={gi} className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" />
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
                            <code className="px-2 py-0.5 bg-zinc-800 text-slate-400 text-sm font-mono rounded">
                              {item.code}
                            </code>
                          )}
                          <span className="font-medium text-zinc-200 text-sm">
                            {item.title}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{item.desc}</p>
                        {(item as any).example && (
                          <pre className="mt-2 p-2 bg-zinc-900 rounded-lg text-xs text-zinc-500 overflow-x-auto">
                            {(item as any).example}
                          </pre>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(item.code || item.title)}
                        className="flex-shrink-0 p-1.5 text-zinc-500 hover:text-slate-400 hover:bg-zinc-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
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
