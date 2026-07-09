"use client";

import { useState, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileJson, ChevronRight, ChevronDown, Trash2, Copy, Check } from "lucide-react";

interface JsonNodeProps {
  data: any;
  keyname?: string;
  isLast?: boolean;
  level?: number;
}

function JsonNode({ data, keyname, isLast = true, level = 0 }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const [copied, setCopied] = useState(false);

  const type = data === null ? "null" : Array.isArray(data) ? "array" : typeof data;

  const handleCopy = useCallback(() => {
    const text = typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data]);

  const renderKey = () => {
    if (keyname === undefined) return null;
    return (
      <span className="text-sky-400">"{keyname}"</span>
    );
  };

  const renderValue = () => {
    if (data === null) {
      return <span className="text-slate-500">null</span>;
    }
    if (typeof data === "string") {
      return <span className="text-emerald-400">"{data}"</span>;
    }
    if (typeof data === "number") {
      return <span className="text-amber-400">{data}</span>;
    }
    if (typeof data === "boolean") {
      return <span className="text-violet-400">{data ? "true" : "false"}</span>;
    }
    return null;
  };

  if (type === "object" || type === "array") {
    const entries = type === "array" 
      ? data.map((v: any, i: number) => [String(i), v]) 
      : Object.entries(data);
    const isArray = type === "array";
    const isEmpty = entries.length === 0;
    const openBracket = isArray ? "[" : "{";
    const closeBracket = isArray ? "]" : "}";

    return (
      <div className="font-mono text-sm">
        <div 
          className="flex items-center hover:bg-[#27272a] rounded px-1 -mx-1 cursor-pointer group"
          onClick={() => !isEmpty && setExpanded(!expanded)}
        >
          {!isEmpty ? (
            expanded ? (
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )
          ) : (
            <span className="w-4 flex-shrink-0" />
          )}
          {renderKey()}
          {keyname !== undefined && <span className="text-slate-500">: </span>}
          <span className="text-slate-400">{openBracket}</span>
          {!expanded && !isEmpty && (
            <>
              <span className="text-slate-600 mx-1">
                {entries.length} {isArray ? "项" : "个属性"}
              </span>
              <span className="text-slate-400">{closeBracket}</span>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="ml-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-opacity"
            title="复制值"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {expanded && !isEmpty && (
          <div className="ml-4 border-l border-[#27272a] pl-2">
            {entries.map(([key, value]: [string, unknown], i: number) => (
              <JsonNode
                key={key}
                data={value}
                keyname={isArray ? undefined : key}
                isLast={i === entries.length - 1}
                level={level + 1}
              />
            ))}
          </div>
        )}
        {expanded && !isEmpty && (
          <div className="text-slate-400 pl-5">{closeBracket}</div>
        )}
      </div>
    );
  }

  return (
    <div className="font-mono text-sm flex items-center hover:bg-[#27272a] rounded px-1 -mx-1 group">
      <span className="w-4 flex-shrink-0" />
      {renderKey()}
      {keyname !== undefined && <span className="text-slate-500">: </span>}
      {renderValue()}
      <button
        onClick={handleCopy}
        className="ml-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-white transition-opacity"
        title="复制值"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

export default function JsonViewerPage() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState("");

  const handleParse = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setParsed(null);
      return;
    }
    try {
      const data = JSON.parse(input);
      setParsed(data);
    } catch (e) {
      setError((e as Error).message);
      setParsed(null);
    }
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setParsed(null);
    setError("");
  }, []);

  const handleLoadExample = useCallback(() => {
    setInput(JSON.stringify({
      name: "工具箱",
      version: "1.0.0",
      features: ["格式化", "转换", "生成"],
      config: {
        theme: "dark",
        language: "zh-CN",
        autoSave: true,
        plugins: [
          { id: 1, name: "plugin1", enabled: true },
          { id: 2, name: "plugin2", enabled: false }
        ]
      },
      stats: {
        users: 10000,
        tools: 50,
        rating: 4.8
      }
    }, null, 2));
  }, []);

  const stats = useMemo(() => {
    if (!parsed) return null;
    const jsonStr = JSON.stringify(parsed);
    return {
      keys: countKeys(parsed),
      size: jsonStr.length,
    };
  }, [parsed]);

  function countKeys(obj: any): number {
    if (obj === null || typeof obj !== "object") return 0;
    let count = 0;
    if (Array.isArray(obj)) {
      for (const item of obj) {
        count += countKeys(item);
      }
    } else {
      count += Object.keys(obj).length;
      for (const val of Object.values(obj)) {
        count += countKeys(val);
      }
    }
    return count;
  }

  return (
    <ToolLayout
      title="JSON 树状查看器"
      description="在线 JSON 树状查看器，以可折叠的树形结构展示 JSON 数据，方便浏览复杂嵌套结构"
      icon={FileJson}
      category="开发工具"
      slug="json-viewer"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">JSON 树状查看器</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              加载示例
            </button>
            <button
              onClick={handleParse}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              解析
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入 JSON</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='在此输入 JSON 数据...'
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">树状视图</label>
            {stats && (
              <span className="text-xs text-slate-500">
                {stats.keys} 个键 · {stats.size} 字符
              </span>
            )}
          </div>
          <div className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl overflow-auto">
            {error ? (
              <div className="text-red-400 text-sm">解析错误：{error}</div>
            ) : parsed !== null ? (
              <JsonNode data={parsed} />
            ) : (
              <div className="text-slate-600 text-sm">
                输入 JSON 数据并点击解析按钮查看树状结构...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 点击左侧箭头可展开/折叠节点，方便浏览复杂的嵌套结构</li>
          <li>• 支持复制单个节点的值，悬停在节点上即可看到复制按钮</li>
          <li>• 所有解析都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
