"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Trash2, FileJson, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// Simple JSON Schema validator (supports common keywords)
function validateJsonSchema(jsonStr: string, schemaStr: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  try {
    const data = JSON.parse(jsonStr);
    const schema = JSON.parse(schemaStr);

    const validate = (value: any, schema: any, path: string): void => {
      if (!schema || typeof schema !== "object") return;

      // type validation
      if (schema.type) {
        const types = Array.isArray(schema.type) ? schema.type : [schema.type];
        let validType = false;
        for (const t of types) {
          if (t === "null" && value === null) validType = true;
          else if (t === "string" && typeof value === "string") validType = true;
          else if (t === "number" && typeof value === "number") validType = true;
          else if (t === "integer" && typeof value === "number" && Number.isInteger(value)) validType = true;
          else if (t === "boolean" && typeof value === "boolean") validType = true;
          else if (t === "array" && Array.isArray(value)) validType = true;
          else if (t === "object" && typeof value === "object" && value !== null && !Array.isArray(value)) validType = true;
        }
        if (!validType) {
          errors.push(`${path || "根节点"}: 类型错误，期望 ${types.join("/")}，实际是 ${Array.isArray(value) ? "array" : typeof value}`);
          return;
        }
      }

      // string validations
      if (typeof value === "string") {
        if (schema.minLength !== undefined && value.length < schema.minLength) {
          errors.push(`${path || "根节点"}: 长度 ${value.length} 小于最小长度 ${schema.minLength}`);
        }
        if (schema.maxLength !== undefined && value.length > schema.maxLength) {
          errors.push(`${path || "根节点"}: 长度 ${value.length} 大于最大长度 ${schema.maxLength}`);
        }
        if (schema.pattern) {
          try {
            const regex = new RegExp(schema.pattern);
            if (!regex.test(value)) {
              errors.push(`${path || "根节点"}: 不匹配模式 ${schema.pattern}`);
            }
          } catch {
            // invalid pattern, skip
          }
        }
        if (schema.format) {
          if (schema.format === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${path || "根节点"}: 不是有效的邮箱地址`);
            }
          } else if (schema.format === "uri" || schema.format === "url") {
            try {
              new URL(value);
            } catch {
              errors.push(`${path || "根节点"}: 不是有效的 URL`);
            }
          }
        }
      }

      // number validations
      if (typeof value === "number") {
        if (schema.minimum !== undefined && value < schema.minimum) {
          errors.push(`${path || "根节点"}: 值 ${value} 小于最小值 ${schema.minimum}`);
        }
        if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) {
          errors.push(`${path || "根节点"}: 值 ${value} 必须大于 ${schema.exclusiveMinimum}`);
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
          errors.push(`${path || "根节点"}: 值 ${value} 大于最大值 ${schema.maximum}`);
        }
        if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) {
          errors.push(`${path || "根节点"}: 值 ${value} 必须小于 ${schema.exclusiveMaximum}`);
        }
      }

      // array validations
      if (Array.isArray(value)) {
        if (schema.minItems !== undefined && value.length < schema.minItems) {
          errors.push(`${path || "根节点"}: 数组长度 ${value.length} 小于最小长度 ${schema.minItems}`);
        }
        if (schema.maxItems !== undefined && value.length > schema.maxItems) {
          errors.push(`${path || "根节点"}: 数组长度 ${value.length} 大于最大长度 ${schema.maxItems}`);
        }
        if (schema.uniqueItems) {
          const unique = new Set(value.map((v) => JSON.stringify(v)));
          if (unique.size !== value.length) {
            errors.push(`${path || "根节点"}: 数组中存在重复项`);
          }
        }
        if (schema.items) {
          for (let i = 0; i < value.length; i++) {
            validate(value[i], schema.items, `${path}[${i}]`);
          }
        }
      }

      // object validations
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        if (schema.required && Array.isArray(schema.required)) {
          for (const req of schema.required) {
            if (!(req in value)) {
              errors.push(`${path ? path + "." : ""}${req}: 必填字段缺失`);
            }
          }
        }
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (key in value) {
              validate(value[key], propSchema as any, path ? `${path}.${key}` : key);
            }
          }
        }
        if (schema.additionalProperties === false && schema.properties) {
          const allowedKeys = Object.keys(schema.properties);
          for (const key of Object.keys(value)) {
            if (!allowedKeys.includes(key)) {
              errors.push(`${path ? path + "." : ""}${key}: 不允许的额外属性`);
            }
          }
        }
      }

      // enum validation
      if (schema.enum && Array.isArray(schema.enum)) {
        const found = schema.enum.some((e: any) => JSON.stringify(e) === JSON.stringify(value));
        if (!found) {
          errors.push(`${path || "根节点"}: 值不在允许的枚举列表中`);
        }
      }
    };

    validate(data, schema, "");
    return { valid: errors.length === 0, errors };
  } catch (e) {
    return { valid: false, errors: ["解析错误：" + (e as Error).message] };
  }
}

export default function JsonSchemaValidatorPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [schemaInput, setSchemaInput] = useState("");
  const [result, setResult] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleValidate = useCallback(() => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setResult(null);
      return;
    }
    const validation = validateJsonSchema(jsonInput, schemaInput);
    setResult(validation);
  }, [jsonInput, schemaInput]);

  const handleClear = useCallback(() => {
    setJsonInput("");
    setSchemaInput("");
    setResult(null);
  }, []);

  const handleLoadExample = useCallback(() => {
    setJsonInput(JSON.stringify({
      name: "张三",
      age: 28,
      email: "zhangsan@example.com",
      tags: ["developer", "designer"]
    }, null, 2));
    setSchemaInput(JSON.stringify({
      type: "object",
      required: ["name", "age", "email"],
      properties: {
        name: { type: "string", minLength: 2, maxLength: 50 },
        age: { type: "integer", minimum: 0, maximum: 150 },
        email: { type: "string", format: "email" },
        tags: { type: "array", items: { type: "string" }, uniqueItems: true }
      },
      additionalProperties: false
    }, null, 2));
  }, []);

  return (
    <ToolLayout
      title="JSON Schema 验证"
      description="在线 JSON Schema 验证工具，校验 JSON 数据是否符合 Schema 规范"
      icon={CheckCircle}
      category="开发工具"
      slug="json-schema-validator"
    >
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">JSON Schema 验证</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadExample}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            >
              加载示例
            </button>
            <button
              onClick={handleValidate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-500/25"
            >
              <CheckCircle className="w-4 h-4" />
              验证
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
            <label className="text-sm font-medium text-slate-300">JSON 数据</label>
            <span className="text-xs text-slate-500">{jsonInput.length} 字符</span>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="在此输入要验证的 JSON 数据..."
            spellCheck={false}
            className="w-full h-72 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none resize-none transition-all"
          />
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">JSON Schema</label>
            <span className="text-xs text-slate-500">{schemaInput.length} 字符</span>
          </div>
          <textarea
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            placeholder="在此输入 JSON Schema..."
            spellCheck={false}
            className="w-full h-72 p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none resize-none transition-all"
          />
        </div>
      </div>

      {result && (
        <div className="p-4 border-t border-[#27272a]">
          {result.valid ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-300">验证通过</p>
                <p className="text-sm text-emerald-400/80 mt-1">JSON 数据符合 Schema 规范</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-300">验证失败</p>
                  <p className="text-sm text-red-400/80 mt-1">发现 {result.errors.length} 个错误</p>
                </div>
              </div>
              <ul className="space-y-2 ml-8">
                {result.errors.slice(0, 20).map((err, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {err}
                  </li>
                ))}
                {result.errors.length > 20 && (
                  <li className="text-sm text-red-400/70">
                    ...还有 {result.errors.length - 20} 个错误
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 支持 JSON Schema Draft 常用关键字：type、required、properties、enum 等</li>
          <li>• 支持字符串、数字、数组、对象等多种类型的验证</li>
          <li>• 所有验证都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
