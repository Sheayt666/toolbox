"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Code2,
  Play,
  Copy,
  Check,
  Trash2,
  FileCode,
} from "lucide-react";

export default function XpathTesterPage() {
  const [input, setInput] = useState("");
  const [expression, setExpression] = useState("//book/title");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleTest = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setError("请输入XML/HTML数据");
      return;
    }
    if (!expression.trim()) {
      setError("请输入XPath表达式");
      return;
    }
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/xml");
      
      const parseError = doc.querySelector("parsererror");
      if (parseError) {
        setError("XML解析错误: " + parseError.textContent);
        return;
      }
      
      const result = doc.evaluate(
        expression,
        doc,
        null,
        XPathResult.ANY_TYPE,
        null
      );
      
      let outputText = "";
      let count = 0;
      
      if (result.resultType === XPathResult.STRING_TYPE) {
        outputText = result.stringValue;
        count = 1;
      } else if (result.resultType === XPathResult.NUMBER_TYPE) {
        outputText = String(result.numberValue);
        count = 1;
      } else if (result.resultType === XPathResult.BOOLEAN_TYPE) {
        outputText = String(result.booleanValue);
        count = 1;
      } else {
        let node = result.iterateNext();
        while (node) {
          count++;
          if (node.nodeType === Node.ELEMENT_NODE) {
            outputText += (node as Element).outerHTML + "\n";
          } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
            outputText += (node as Attr).name + '="' + (node as Attr).value + '"\n';
          } else {
            outputText += node.textContent + "\n";
          }
          node = result.iterateNext();
        }
      }
      
      if (count === 0) {
        setOutput("// 未找到匹配节点");
      } else {
        setOutput(`找到 ${count} 个匹配节点:\n\n${outputText.trim()}`);
      }
    } catch (e) {
      setError("查询失败: " + (e as Error).message);
    }
  }, [input, expression]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput("");
    setOutput("");
    setError("");
  }, []);

  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
</bookstore>`;

  const quickExpressions = [
    "//book/title",
    "//book/@category",
    "//author",
    "//*[@lang='en']",
    "//book[price>30]/title",
    "//book[1]/title",
  ];

  return (
    <ToolLayout
      title="XPath测试器"
      description="在线测试XPath表达式，快速查询XML/HTML文档节点，支持实时预览结果"
      toolId="xpath-tester"
      icon={Code2}
      category="开发工具"
      slug="xpath-tester"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b border-[#27272a]">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">XPath:</span>
                <input
                  type="text"
                  value={expression}
                  onChange={(e) => setExpression(e.target.value)}
                  placeholder="//path/to/element"
                  spellCheck={false}
                  className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg text-zinc-200 font-mono text-sm focus:outline-none focus:border-primary-500/50 placeholder-zinc-600"
                  onKeyDown={(e) => e.key === "Enter" && handleTest()}
                />
              </div>
            </div>
            <button
              onClick={handleTest}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
            >
              <Play className="w-4 h-4" />
              运行查询
            </button>
            <button
              onClick={handleCopy}
              disabled={!output}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 bg-[#27272a] hover:bg-[#3f3f46] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              清空
            </button>
          </div>

          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-zinc-500">快速表达式:</span>
              {quickExpressions.map((expr) => (
                <button
                  key={expr}
                  onClick={() => setExpression(expr)}
                  className="px-2 py-0.5 text-xs font-mono bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 rounded-md transition-colors"
                >
                  {expr}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <FileCode className="w-4 h-4 text-sky-400" />
                <span className="text-sm font-medium text-zinc-300">XML/HTML数据</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={sampleXml}
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
            <div className="border border-[#27272a] rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-zinc-300">查询结果</span>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="查询结果将显示在这里..."
                spellCheck={false}
                className="w-full h-80 p-4 bg-transparent text-zinc-200 text-sm font-mono resize-none outline-none focus:ring-0 placeholder-zinc-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">工具介绍</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            在线测试XPath表达式，快速查询XML/HTML文档节点，支持实时预览结果。XPath是XML路径语言，用于在XML文档中通过路径表达式导航节点。
            支持元素选择、属性选择、条件过滤等高级查询功能。
            所有处理在浏览器本地完成，数据安全可靠。
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
