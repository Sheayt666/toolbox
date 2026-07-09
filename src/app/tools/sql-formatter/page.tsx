"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, Database, Minimize2, Maximize2 } from "lucide-react";

type IndentSize = 2 | 4;

// Simple SQL formatter
function formatSql(sql: string, indentSize: number): { result: string; error?: string } {
  try {
    if (!sql.trim()) {
      return { result: "" };
    }

    const keywords = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING",
      "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN",
      "CROSS JOIN", "ON", "AS", "IN", "LIKE", "BETWEEN", "IS NULL", "IS NOT NULL",
      "UNION", "UNION ALL", "INSERT INTO", "VALUES", "UPDATE", "SET", "DELETE FROM",
      "CREATE TABLE", "DROP TABLE", "ALTER TABLE", "ADD", "PRIMARY KEY", "FOREIGN KEY",
      "REFERENCES", "INDEX", "UNIQUE", "NOT NULL", "DEFAULT", "AUTO_INCREMENT",
      "LIMIT", "OFFSET", "DISTINCT", "CASE", "WHEN", "THEN", "ELSE", "END",
      "EXISTS", "NOT EXISTS", "INNER", "OUTER", "LEFT", "RIGHT", "FULL", "CROSS",
    ];

    // Tokenize
    const tokens: string[] = [];
    let current = "";
    let inString = false;
    let stringChar = "";
    let inComment = false;
    let commentType = ""; // "--" or "/*"

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      if (inComment) {
        current += char;
        if (commentType === "--" && char === "\n") {
          tokens.push(current);
          current = "";
          inComment = false;
          commentType = "";
        } else if (commentType === "/*" && char === "*" && nextChar === "/") {
          current += nextChar;
          i++;
          tokens.push(current);
          current = "";
          inComment = false;
          commentType = "";
        }
        continue;
      }

      if (inString) {
        current += char;
        if (char === stringChar && sql[i - 1] !== "\\") {
          inString = false;
          tokens.push(current);
          current = "";
        }
        continue;
      }

      // Check for comments
      if (char === "-" && nextChar === "-") {
        if (current.trim()) {
          tokens.push(current);
          current = "";
        }
        inComment = true;
        commentType = "--";
        current = "--";
        i++;
        continue;
      }
      if (char === "/" && nextChar === "*") {
        if (current.trim()) {
          tokens.push(current);
          current = "";
        }
        inComment = true;
        commentType = "/*";
        current = "/*";
        i++;
        continue;
      }

      // String
      if (char === "'" || char === '"') {
        if (current.trim()) {
          tokens.push(current);
          current = "";
        }
        inString = true;
        stringChar = char;
        current = char;
        continue;
      }

      // Whitespace
      if (/\s/.test(char)) {
        if (current.trim()) {
          tokens.push(current);
          current = "";
        }
        continue;
      }

      // Parentheses and operators
      if ("(),;=".includes(char)) {
        if (current.trim()) {
          tokens.push(current);
          current = "";
        }
        tokens.push(char);
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      tokens.push(current);
    }

    // Format tokens
    const indent = " ".repeat(indentSize);
    let result = "";
    let indentLevel = 0;
    let firstToken = true;

    const newlineKeywords = [
      "SELECT", "FROM", "WHERE", "AND", "OR", "ORDER BY", "GROUP BY", "HAVING",
      "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "OUTER JOIN", "FULL JOIN",
      "CROSS JOIN", "JOIN", "UNION", "UNION ALL", "INSERT INTO", "VALUES",
      "UPDATE", "SET", "DELETE FROM", "CREATE TABLE", "DROP TABLE", "ALTER TABLE",
      "LIMIT", "OFFSET", "CASE",
    ];

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];
      const upperToken = token.toUpperCase().trim();

      // Skip empty tokens
      if (!token.trim()) continue;

      // Check for multi-word keywords
      let combinedToken = upperToken;
      let skipNext = 0;
      for (const kw of keywords) {
        if (kw.includes(" ")) {
          const parts = kw.split(" ");
          if (upperToken === parts[0]) {
            let match = true;
            let combined = upperToken;
            for (let p = 1; p < parts.length; p++) {
              if (i + p < tokens.length && tokens[i + p].toUpperCase().trim() === parts[p]) {
                combined += " " + tokens[i + p].toUpperCase().trim();
              } else {
                match = false;
                break;
              }
            }
            if (match && combined === kw) {
              combinedToken = kw;
              skipNext = parts.length - 1;
              break;
            }
          }
        }
      }

      const isKeyword = keywords.includes(combinedToken) || keywords.includes(upperToken);
      const isNewlineKeyword = newlineKeywords.some(kw => 
        combinedToken === kw || upperToken === kw
      );

      if (token === "(") {
        if (!firstToken) result += " ";
        result += "(";
        indentLevel++;
        firstToken = false;
      } else if (token === ")") {
        indentLevel = Math.max(0, indentLevel - 1);
        result += "\n" + indent.repeat(indentLevel) + ")";
        firstToken = false;
      } else if (token === ",") {
        result += ",\n" + indent.repeat(indentLevel);
        firstToken = false;
      } else if (token === ";") {
        result += ";\n";
        indentLevel = 0;
        firstToken = true;
      } else if (isNewlineKeyword && !firstToken) {
        result += "\n" + indent.repeat(indentLevel) + combinedToken;
        firstToken = false;
      } else if (isKeyword) {
        if (!firstToken) result += " ";
        result += combinedToken;
        firstToken = false;
      } else {
        if (firstToken) {
          result += indent.repeat(indentLevel) + token;
          firstToken = false;
        } else {
          result += " " + token;
        }
      }

      i += skipNext;
    }

    return { result: result.trim() };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

function minifySql(sql: string): { result: string; error?: string } {
  try {
    if (!sql.trim()) {
      return { result: "" };
    }

    // Remove comments
    let result = sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
    // Normalize whitespace
    result = result.replace(/\s+/g, " ").trim();
    // Remove spaces around certain characters
    result = result.replace(/\s*([(),;=])\s*/g, "$1");

    return { result };
  } catch (e) {
    return { result: "", error: (e as Error).message };
  }
}

export default function SqlFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleFormat = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = formatSql(input, indentSize);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.result);
    }
  }, [input, indentSize]);

  const handleMinify = useCallback(() => {
    setError("");
    if (!input.trim()) {
      setOutput("");
      return;
    }
    const result = minifySql(input);
    if (result.error) {
      setError(result.error);
      setOutput("");
    } else {
      setOutput(result.result);
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
    setInput(`SELECT u.id, u.name, u.email, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND o.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 5
ORDER BY order_count DESC
LIMIT 10;`);
  }, []);

  return (
    <ToolLayout
      title="SQL 格式化"
      description="在线 SQL 格式化/压缩工具，美化 SQL 语句，支持多种数据库语法"
      icon={Database}
      category="开发工具"
      slug="sql-formatter"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">SQL 格式化/压缩</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">缩进:</span>
            <div className="flex items-center bg-[#09090b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setIndentSize(2)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 2
                    ? "bg-[#27272a] text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                2 空格
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  indentSize === 4
                    ? "bg-[#27272a] text-emerald-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                4 空格
              </button>
            </div>
          </div>

          <button
            onClick={handleFormat}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <Maximize2 className="w-4 h-4" />
            格式化
          </button>

          <button
            onClick={handleMinify}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
            压缩
          </button>

          <button
            onClick={handleLoadExample}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-xl transition-colors"
          >
            示例
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-[#27272a]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输入 SQL</label>
            <span className="text-xs text-slate-500">{input.length} 字符</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴或输入 SQL 语句..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">输出结果</label>
            <span className="text-xs text-slate-500">{output.length} 字符</span>
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="格式化或压缩后的结果将显示在这里..."
            spellCheck={false}
            className="w-full h-[500px] p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 resize-none"
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
            错误：{error}
          </div>
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 SELECT、INSERT、UPDATE、DELETE、CREATE 等常用 SQL 语句格式化</li>
          <li>• 自动识别 SQL 关键字并转换为大写，关键字换行对齐</li>
          <li>• 所有操作都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
