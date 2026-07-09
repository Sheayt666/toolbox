"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, ArrowRightLeft, FileJson, FileText } from "lucide-react";

// JSON to YAML converter (simple implementation)
function jsonToYaml(jsonStr: string): { yaml: string; error?: string } {
  try {
    const data = JSON.parse(jsonStr);
    const yamlLines: string[] = [];

    const convertValue = (value: any, indent: number, isArrayItem: boolean = false): void => {
      const pad = "  ".repeat(indent);
      const itemPad = isArrayItem ? pad.slice(0, -2) + "- " : pad;

      if (value === null) {
        yamlLines.push(itemPad + "null");
      } else if (typeof value === "boolean") {
        yamlLines.push(itemPad + (value ? "true" : "false"));
      } else if (typeof value === "number") {
        yamlLines.push(itemPad + value);
      } else if (typeof value === "string") {
        const needsQuotes =
          value === "" ||
          value.includes(":") ||
          value.includes("#") ||
          value.includes("'") ||
          value.includes('"') ||
          value.includes("\n") ||
          value.startsWith(" ") ||
          value.endsWith(" ") ||
          /^(true|false|null|yes|no|on|off)$/i.test(value) ||
          !isNaN(Number(value));
        if (needsQuotes) {
          yamlLines.push(itemPad + JSON.stringify(value));
        } else {
          yamlLines.push(itemPad + value);
        }
      } else if (Array.isArray(value)) {
        if (value.length === 0) {
          yamlLines.push(itemPad + "[]");
        } else {
          if (isArrayItem) {
            // Don't add extra line for nested arrays in array items
          }
          for (const item of value) {
            if (typeof item === "object" && item !== null && !Array.isArray(item)) {
              const keys = Object.keys(item);
              if (keys.length > 0) {
                const firstKey = keys[0];
                const firstValue = item[firstKey];
                if (typeof firstValue === "object" && firstValue !== null) {
                  yamlLines.push(pad.slice(0, -2) + "- " + firstKey + ":");
                  convertValue(firstValue, indent + 1, false);
                } else {
                  yamlLines.push(pad.slice(0, -2) + "- " + firstKey + ": " + formatScalar(firstValue));
                }
                for (let i = 1; i < keys.length; i++) {
                  const key = keys[i];
                  const val = item[key];
                  if (typeof val === "object" && val !== null) {
                    yamlLines.push(pad + "  " + key + ":");
                    convertValue(val, indent + 2, false);
                  } else {
                    yamlLines.push(pad + "  " + key + ": " + formatScalar(val));
                  }
                }
              }
            } else if (Array.isArray(item)) {
              yamlLines.push(pad.slice(0, -2) + "-");
              convertValue(item, indent, false);
            } else {
              yamlLines.push(pad.slice(0, -2) + "- " + formatScalar(item));
            }
          }
        }
      } else if (typeof value === "object") {
        const keys = Object.keys(value);
        if (keys.length === 0) {
          yamlLines.push(itemPad + "{}");
        } else {
          for (const key of keys) {
            const val = value[key];
            if (typeof val === "object" && val !== null) {
              yamlLines.push((isArrayItem ? pad + "  " : pad) + key + ":");
              convertValue(val, indent + 1, false);
            } else {
              yamlLines.push((isArrayItem ? pad + "  " : pad) + key + ": " + formatScalar(val));
            }
          }
        }
      }
    };

    const formatScalar = (value: any): string => {
      if (value === null) return "null";
      if (typeof value === "boolean") return value ? "true" : "false";
      if (typeof value === "number") return String(value);
      if (typeof value === "string") {
        const needsQuotes =
          value === "" ||
          value.includes(":") ||
          value.includes("#") ||
          value.includes("\n") ||
          /^(true|false|null|yes|no|on|off)$/i.test(value) ||
          !isNaN(Number(value));
        if (needsQuotes) return JSON.stringify(value);
        return value;
      }
      return "";
    };

    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      convertValue(data, 0, false);
    } else if (Array.isArray(data)) {
      convertValue(data, 1, true);
    } else {
      yamlLines.push(formatScalar(data));
    }

    return { yaml: yamlLines.join("\n") };
  } catch (e) {
    return { yaml: "", error: (e as Error).message };
  }
}

export default function JsonToYamlPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = jsonToYaml(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.yaml);
    }
  }, [input]);

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

  const handleLoadExample = useCallback(() => {
    setInput(JSON.stringify({
      name: "工具箱",
      version: "1.0.0",
      features: ["格式化", "转换", "生成"],
      config: {
        theme: "dark",
        language: "zh-CN",
        autoSave: true
      }
    }, null, 2));
  }, []);

  return (
    <ToolLayout
      title="JSON 转 YAML"
      description="在线 JSON 转 YAML 工具，快速将 JSON 数据转换为 YAML 格式，数据本地处理安全可靠"
      icon={FileJson}
      category="开发工具"
      slug="json-to-yaml"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">JSON → YAML 转换</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              加载示例
            </button>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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
            <label className="text-sm font-medium text-slate-300">
              JSON 输入
            </label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='在此输入 JSON 数据，例如：
{
  "name": "工具箱",
  "version": "1.0.0"
}'
            spellCheck={false}
            className="w-full h-96 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              转换为 YAML
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              YAML 输出
            </label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
            spellCheck={false}
            className="w-full h-96 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCopy}
              disabled={!output}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制结果
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 border-t border-[#27272a]">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400">
            转换错误：{error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• YAML 是一种人类可读的数据序列化格式，常用于配置文件</li>
          <li>• 支持嵌套对象、数组、字符串、数字、布尔值等数据类型</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
