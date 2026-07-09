"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, FileText, FileJson } from "lucide-react";

// Simple YAML to JSON parser
function yamlToJson(yamlStr: string): { json: string; error?: string } {
  try {
    const lines = yamlStr.replace(/\r\n/g, "\n").split("\n");
    
    const parseValue = (str: string): any => {
      str = str.trim();
      if (str === "" || str === "null" || str === "~" || str === "Null" || str === "NULL") {
        return null;
      }
      if (str === "true" || str === "True" || str === "TRUE" || str === "yes" || str === "Yes" || str === "on") {
        return true;
      }
      if (str === "false" || str === "False" || str === "FALSE" || str === "no" || str === "No" || str === "off") {
        return false;
      }
      // Quoted string
      if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
        return str.slice(1, -1);
      }
      // Number
      if (!isNaN(Number(str)) && str.trim() !== "") {
        return Number(str);
      }
      return str;
    };

    const getIndent = (line: string): number => {
      const match = line.match(/^(\s*)/);
      return match ? match[1].length : 0;
    };

    // Remove comments and empty lines, track line numbers
    const cleanLines: { text: string; indent: number; origIndex: number }[] = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // Remove comments (but not inside quotes)
      let inSingleQuote = false;
      let inDoubleQuote = false;
      let commentPos = -1;
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "'" && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        if (line[j] === '"' && !inSingleQuote) inDoubleQuote = !inDoubleQuote;
        if (line[j] === "#" && !inSingleQuote && !inDoubleQuote) {
          commentPos = j;
          break;
        }
      }
      if (commentPos >= 0) {
        line = line.substring(0, commentPos);
      }
      if (line.trim() === "") continue;
      cleanLines.push({ text: line, indent: getIndent(line), origIndex: i });
    }

    if (cleanLines.length === 0) {
      return { json: "", error: "YAML 内容为空" };
    }

    let currentIndex = 0;

    const parseBlock = (currentIndent: number): any => {
      // Check if it's a list
      if (currentIndex < cleanLines.length) {
        const line = cleanLines[currentIndex];
        if (line.indent === currentIndent && line.text.trim().startsWith("- ")) {
          return parseArray(currentIndent);
        }
        if (line.indent === currentIndent && line.text.trim() === "-") {
          return parseArray(currentIndent);
        }
      }
      return parseObject(currentIndent);
    };

    const parseObject = (currentIndent: number): Record<string, any> => {
      const obj: Record<string, any> = {};
      
      while (currentIndex < cleanLines.length) {
        const line = cleanLines[currentIndex];
        if (line.indent < currentIndent) break;
        if (line.indent > currentIndent) {
          currentIndex++;
          continue;
        }
        
        const trimmed = line.text.trim();
        if (trimmed.startsWith("- ")) break;
        if (trimmed === "-") break;
        
        // Find key: value pattern
        const colonMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (!colonMatch) {
          currentIndex++;
          continue;
        }
        
        let key = colonMatch[1].trim();
        let value = colonMatch[2].trim();
        
        // Remove quotes from key
        if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
          key = key.slice(1, -1);
        }
        
        currentIndex++;
        
        if (value === "" || value === "|" || value === ">") {
          // Nested structure or multi-line string
          if (currentIndex < cleanLines.length && cleanLines[currentIndex].indent > currentIndent) {
            obj[key] = parseBlock(cleanLines[currentIndex].indent);
          } else {
            obj[key] = null;
          }
        } else {
          obj[key] = parseValue(value);
        }
      }
      
      return obj;
    };

    const parseArray = (currentIndent: number): any[] => {
      const arr: any[] = [];
      
      while (currentIndex < cleanLines.length) {
        const line = cleanLines[currentIndex];
        if (line.indent < currentIndent) break;
        if (line.indent > currentIndent) {
          currentIndex++;
          continue;
        }
        
        const trimmed = line.text.trim();
        if (!trimmed.startsWith("-")) break;
        
        if (trimmed === "-") {
          // Nested structure after dash
          currentIndex++;
          if (currentIndex < cleanLines.length && cleanLines[currentIndex].indent > currentIndent) {
            arr.push(parseBlock(cleanLines[currentIndex].indent));
          } else {
            arr.push(null);
          }
        } else {
          const valueAfterDash = trimmed.substring(2).trim();
          const colonMatch = valueAfterDash.match(/^([^:]+):\s*(.*)$/);
          
          if (colonMatch) {
            // Array of objects - parse inline first key then continue
            let key = colonMatch[1].trim();
            let firstValue = colonMatch[2].trim();
            
            if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
              key = key.slice(1, -1);
            }
            
            const obj: Record<string, any> = {};
            
            if (firstValue === "" || firstValue === "|" || firstValue === ">") {
              currentIndex++;
              if (currentIndex < cleanLines.length && cleanLines[currentIndex].indent > currentIndent + 2) {
                obj[key] = parseBlock(cleanLines[currentIndex].indent);
              } else {
                obj[key] = null;
              }
            } else {
              obj[key] = parseValue(firstValue);
              currentIndex++;
            }
            
            // Parse remaining keys of this object
            while (currentIndex < cleanLines.length) {
              const nextLine = cleanLines[currentIndex];
              if (nextLine.indent <= currentIndent) break;
              if (nextLine.indent === currentIndent + 2 && !nextLine.text.trim().startsWith("-")) {
                const nextTrimmed = nextLine.text.trim();
                const nextColon = nextTrimmed.match(/^([^:]+):\s*(.*)$/);
                if (nextColon) {
                  let nextKey = nextColon[1].trim();
                  let nextVal = nextColon[2].trim();
                  if ((nextKey.startsWith('"') && nextKey.endsWith('"')) || (nextKey.startsWith("'") && nextKey.endsWith("'"))) {
                    nextKey = nextKey.slice(1, -1);
                  }
                  currentIndex++;
                  if (nextVal === "" || nextVal === "|" || nextVal === ">") {
                    if (currentIndex < cleanLines.length && cleanLines[currentIndex].indent > currentIndent + 2) {
                      obj[nextKey] = parseBlock(cleanLines[currentIndex].indent);
                    } else {
                      obj[nextKey] = null;
                    }
                  } else {
                    obj[nextKey] = parseValue(nextVal);
                  }
                } else {
                  currentIndex++;
                }
              } else {
                break;
              }
            }
            
            arr.push(obj);
          } else {
            // Simple array value
            arr.push(parseValue(valueAfterDash));
            currentIndex++;
          }
        }
      }
      
      return arr;
    };

    const result = parseBlock(cleanLines[0].indent);
    return { json: JSON.stringify(result, null, 2) };
  } catch (e) {
    return { json: "", error: (e as Error).message };
  }
}

export default function YamlToJsonPage() {
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
    const result = yamlToJson(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.json);
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
    setInput(`name: 工具箱
version: 1.0.0
features:
  - 格式化
  - 转换
  - 生成
config:
  theme: dark
  language: zh-CN
  autoSave: true`);
  }, []);

  return (
    <ToolLayout
      title="YAML 转 JSON"
      description="在线 YAML 转 JSON 工具，快速将 YAML 配置转换为 JSON 格式，数据本地处理安全可靠"
      icon={FileText}
      category="开发工具"
      slug="yaml-to-json"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-white">YAML → JSON 转换</span>
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
            <label className="text-sm font-medium text-slate-300">YAML 输入</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`在此输入 YAML 数据，例如：
name: 工具箱
version: 1.0.0
features:
  - 格式化
  - 转换`}
            spellCheck={false}
            className="w-full h-96 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none resize-none transition-all"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleConvert}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all shadow-lg shadow-purple-500/25"
            >
              转换为 JSON
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">JSON 输出</label>
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
          <li>• YAML 使用缩进表示层级关系，建议使用 2 空格缩进</li>
          <li>• 支持对象、数组、字符串、数字、布尔值、null 等数据类型</li>
          <li>• 所有转换都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
