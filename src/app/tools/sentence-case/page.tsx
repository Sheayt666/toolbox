"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { AlignLeft, Copy, Check, Trash2, Info } from "lucide-react";

function transformText(text: string): string {
  if (!text) return "";
  const sentences = text.match(/[^.!?。！？]+[.!?。！？]*/g) || [text];
  return sentences.map(sentence => {
    const trimmed = sentence.trimStart();
    const leadingSpaces = sentence.length - trimmed.length;
    if (trimmed.length === 0) return sentence;
    return " ".repeat(leadingSpaces) + trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }).join("");
}

export default function SentenceCasePage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = transformText(input);

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    setInput("");
  };

  return (
    <ToolLayout
      title="句子首字母大写"
      description="将文本转换为句子格式，每句首字母大写，其余字母小写，支持中英文标点识别"
      toolId="sentence-case"
      icon={AlignLeft}
      category="文本工具"
      slug="sentence-case"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    输入文本
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {input.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入或粘贴文本，例如：hello world. how are you?"
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleClear}
                disabled={!input}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-teal-500" />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    转换结果
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">
                  {output.length} 字符
                </span>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="w-full h-72 p-4 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 resize-none"
            />
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={handleCopy}
                disabled={!output}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-zinc-600 dark:text-zinc-400 hover:text-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {copied ? (
                  <><Check className="w-4 h-4 text-emerald-500" /> 已复制</>
                ) : (
                  <><Copy className="w-4 h-4" /> 复制结果</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              工具说明
            </h3>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            将文本转换为句子格式，每句首字母大写，其余字母小写，支持中英文标点识别，纯前端本地处理，数据不会上传到服务器。
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
