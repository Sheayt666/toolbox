"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Braces,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sun,
  Moon,
  Clock,
  GitCompare,
  FileCode,
  FileJson,
  ListTree,
  Code2,
  Download,
  Sparkles,
  Columns2,
  Hash,
  WrapText,
  Minimize2,
  Save,
  RotateCcw,
  ChevronsDown,
  ChevronsUp,
  type LucideIcon,
} from "lucide-react";

/* =========================================================================
 * 类型定义
 * ========================================================================= */

type IndentSize = 2 | 4;
type ViewMode = "code" | "tree";
type OutputFormat = "json" | "yaml" | "xml" | "csv";
type OutputMode = "beautify" | "minify";
type Theme = "dark" | "light";
type AppMode = "format" | "diff";

interface ValidationResult {
  valid: boolean;
  error?: string;
  errorLine?: number;
  errorColumn?: number;
  errorType?: string;
}

interface HistoryItem {
  id: string;
  text: string;
  preview: string;
  size: number;
  time: number;
}

interface ColorScheme {
  key: string;
  string: string;
  number: string;
  boolean: string;
  null: string;
  punct: string;
  bg: string;
  text: string;
  gutter: string;
  gutterText: string;
  border: string;
}

type DiffKind = "equal" | "added" | "removed" | "modified";

interface DiffTree {
  key: string;
  kind: DiffKind;
  leftType: string;
  rightType: string;
  leftPreview: string;
  rightPreview: string;
  children: DiffTree[];
}

/* =========================================================================
 * 常量
 * ========================================================================= */

const HISTORY_KEY = "json-formatter-history-v1";
const PREFS_KEY = "json-formatter-prefs-v1";
const MAX_HISTORY = 10;
const MAX_RENDER_CHILDREN = 200; // 单节点最多直接渲染子项，超出分块加载
const LARGE_OUTPUT_THRESHOLD = 300_000; // 超过该长度不做高亮，直接纯文本

const DARK_COLORS: ColorScheme = {
  key: "#7dd3fc",
  string: "#86efac",
  number: "#93c5fd",
  boolean: "#fdba74",
  null: "#94a3b8",
  punct: "#64748b",
  bg: "#0b0b0f",
  text: "#e2e8f0",
  gutter: "#0b0b0f",
  gutterText: "#475569",
  border: "#27272a",
};

const LIGHT_COLORS: ColorScheme = {
  key: "#0369a1",
  string: "#15803d",
  number: "#1d4ed8",
  boolean: "#c2410c",
  null: "#64748b",
  punct: "#94a3b8",
  bg: "#ffffff",
  text: "#1e293b",
  gutter: "#f8fafc",
  gutterText: "#94a3b8",
  border: "#e2e8f0",
};

const SAMPLE_JSON = `{
  "name": "99工具箱",
  "version": "2.0.0",
  "active": true,
  "license": null,
  "downloads": 125800,
  "rating": 4.9,
  "author": {
    "name": "张三",
    "email": "zhangsan@99gongju.online",
    "address": {
      "city": "北京",
      "zip": "100000"
    }
  },
  "tags": ["JSON", "格式化", "YAML", "CSV"],
  "features": [
    { "id": 1, "name": "语法高亮", "enabled": true },
    { "id": 2, "name": "树形视图", "enabled": true },
    { "id": 3, "name": "Diff 对比", "enabled": false }
  ],
  "stats": {
    "users": 8421,
    "requests": 99210
  }
}`;

/* =========================================================================
 * 纯 JS 工具函数
 * ========================================================================= */

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** 校验 JSON，返回错误位置（行/列）与错误类型 */
function validateJson(text: string): ValidationResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return { valid: false, error: "请输入 JSON 数据", errorType: "empty" };
  }
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    const err = e as SyntaxError;
    const message = err.message || "JSON 解析失败";
    let errorType = "语法错误";
    if (/unexpected end/i.test(message)) errorType = "未闭合结构";
    else if (/unexpected token/i.test(message)) errorType = "意外字符";
    else if (/unexpected number/i.test(message)) errorType = "数字格式错误";
    else if (/unexpected string/i.test(message)) errorType = "字符串格式错误";
    else if (/comma/i.test(message)) errorType = "逗号错误";

    let errorLine: number | undefined;
    let errorColumn: number | undefined;
    const posMatch =
      message.match(/position (\d+)/) || message.match(/at position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = text.substring(0, pos);
      const lines = before.split("\n");
      errorLine = lines.length;
      errorColumn = lines[lines.length - 1].length + 1;
    }
    return { valid: false, error: message, errorLine, errorColumn, errorType };
  }
}

function safeParse(text: string): unknown | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** 语法高亮：将 JSON 字符串转为带颜色 span 的 HTML */
function highlightJsonToHtml(jsonStr: string, c: ColorScheme): string {
  const regex =
    /("(?:\\.|[^"\\])*")(\s*:)?|(\btrue\b|\bfalse\b)|(\bnull\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|Infinity|-NaN)|([{}\[\],])/g;
  let result = "";
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(jsonStr)) !== null) {
    if (m.index > lastIndex) {
      result += escapeHtml(jsonStr.slice(lastIndex, m.index));
    }
    if (m[1] !== undefined) {
      if (m[2] !== undefined) {
        result +=
          `<span style="color:${c.key}">${escapeHtml(m[1])}</span>` +
          `<span style="color:${c.punct}">${escapeHtml(m[2])}</span>`;
      } else {
        result += `<span style="color:${c.string}">${escapeHtml(m[1])}</span>`;
      }
    } else if (m[3] !== undefined) {
      result += `<span style="color:${c.boolean}">${m[3]}</span>`;
    } else if (m[4] !== undefined) {
      result += `<span style="color:${c.null}">${m[4]}</span>`;
    } else if (m[5] !== undefined) {
      result += `<span style="color:${c.number}">${escapeHtml(m[5])}</span>`;
    } else if (m[6] !== undefined) {
      result += `<span style="color:${c.punct}">${escapeHtml(m[6])}</span>`;
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < jsonStr.length) {
    result += escapeHtml(jsonStr.slice(lastIndex));
  }
  return result;
}

/* ----------------------- JSON -> YAML ----------------------- */

function yamlString(s: string): string {
  if (s === "") return '""';
  if (/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(s)) return JSON.stringify(s);
  if (["true", "false", "null", "yes", "no", "~", "True", "False", "Null"].includes(s))
    return JSON.stringify(s);
  if (/[:#\[\]\{\},&*!|>'"%@`?]/.test(s)) return JSON.stringify(s);
  if (/^\s|\s$/.test(s)) return JSON.stringify(s);
  if (/:\s|\s#/.test(s)) return JSON.stringify(s);
  return s;
}

function yamlKey(k: string): string {
  if (/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(k)) return k;
  return JSON.stringify(k);
}

function toYaml(value: unknown, indent: number): string {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return pad + "null";
  if (typeof value === "boolean") return pad + (value ? "true" : "false");
  if (typeof value === "number")
    return pad + (Number.isFinite(value) ? String(value) : "null");
  if (typeof value === "string") return pad + yamlString(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return pad + "[]";
    const itemPad = "  ".repeat(indent);
    return value
      .map((item) => {
        if (item !== null && typeof item === "object") {
          const block = toYaml(item, indent + 1);
          const lines = block.split("\n");
          const firstIndent = "  ".repeat(indent + 1);
          if (lines[0].startsWith(firstIndent)) {
            lines[0] = itemPad + "- " + lines[0].slice(firstIndent.length);
          } else {
            lines[0] = itemPad + "- " + lines[0];
          }
          return lines.join("\n");
        }
        return itemPad + "- " + toYaml(item, indent + 1).trimStart();
      })
      .join("\n");
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return pad + "{}";
    return entries
      .map(([k, v]) => {
        const key = yamlKey(k);
        if (v !== null && typeof v === "object") {
          return `${pad}${key}:\n${toYaml(v, indent + 1)}`;
        }
        return `${pad}${key}: ${toYaml(v, indent + 1).trimStart()}`;
      })
      .join("\n");
  }
  return pad + String(value);
}

function jsonToYaml(value: unknown): string {
  return toYaml(value, 0);
}

/* ----------------------- JSON -> XML ----------------------- */

function isValidTag(name: string): boolean {
  return /^[A-Za-z_][A-Za-z0-9._-]*$/.test(name);
}

function toXml(value: unknown, name: string, indent: number): string {
  const pad = "  ".repeat(indent);
  const tag = isValidTag(name) ? name : "_";
  if (value === null || value === undefined) {
    return `${pad}<${tag} null="true"/>`;
  }
  if (typeof value === "boolean") return `${pad}<${tag}>${value}</${tag}>`;
  if (typeof value === "number") return `${pad}<${tag}>${value}</${tag}>`;
  if (typeof value === "string")
    return `${pad}<${tag}>${escapeXml(value)}</${tag}>`;
  if (Array.isArray(value)) {
    if (value.length === 0) return `${pad}<${tag}/>`;
    return value.map((item) => toXml(item, tag, indent)).join("\n");
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return `${pad}<${tag}/>`;
    const inner = entries
      .map(([k, v]) => toXml(v, k, indent + 1))
      .join("\n");
    return `${pad}<${tag}>\n${inner}\n${pad}</${tag}>`;
  }
  return `${pad}<${tag}/>`;
}

function jsonToXml(value: unknown): string {
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + toXml(value, "root", 0);
}

/* ----------------------- JSON -> CSV ----------------------- */

function csvCell(v: unknown): string {
  let s: string;
  if (v === null || v === undefined) s = "";
  else if (typeof v === "object") s = JSON.stringify(v);
  else s = String(v);
  if (/[",\n\r]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function jsonToCsv(value: unknown): string {
  let arr: Record<string, unknown>[];
  if (Array.isArray(value)) {
    arr = value as Record<string, unknown>[];
  } else if (value !== null && typeof value === "object") {
    arr = [value as Record<string, unknown>];
  } else {
    return csvCell(value);
  }
  if (arr.length === 0) return "";
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of arr) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      for (const key of Object.keys(row)) {
        if (!seen.has(key)) {
          seen.add(key);
          headers.push(key);
        }
      }
    }
  }
  const lines = [headers.map(csvCell).join(",")];
  for (const row of arr) {
    const cells = headers.map((h) =>
      csvCell(
        row && typeof row === "object"
          ? (row as Record<string, unknown>)[h]
          : ""
      )
    );
    lines.push(cells.join(","));
  }
  return lines.join("\n");
}

/* ----------------------- 路径与节点信息 ----------------------- */

function joinPath(parent: string, key: string | number): string {
  if (typeof key === "number") return `${parent}[${key}]`;
  return parent === "$" ? `$.${key}` : `${parent}.${key}`;
}

function typeLabel(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

function valuePreview(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "object") {
    const s = JSON.stringify(v);
    return s.length > 60 ? s.slice(0, 60) + " …" : s;
  }
  return String(v);
}

function childCount(v: unknown): number {
  if (Array.isArray(v)) return v.length;
  if (v && typeof v === "object") return Object.keys(v).length;
  return 0;
}

/** 收集到指定深度的所有路径，用于初始展开 */
function collectPaths(
  value: unknown,
  path: string,
  depth: number,
  maxDepth: number,
  acc: Set<string>,
  limit: number
): void {
  acc.add(path);
  if (depth >= maxDepth) return;
  if (Array.isArray(value)) {
    const len = Math.min(value.length, limit);
    for (let i = 0; i < len; i++) {
      collectPaths(value[i], joinPath(path, i), depth + 1, maxDepth, acc, limit);
    }
  } else if (value && typeof value === "object") {
    const keys = Object.keys(value);
    const len = Math.min(keys.length, limit);
    for (let i = 0; i < len; i++) {
      const k = keys[i];
      collectPaths(
        (value as Record<string, unknown>)[k],
        joinPath(path, k),
        depth + 1,
        maxDepth,
        acc,
        limit
      );
    }
  }
}

/** 根据 JSONPath 从 parsed 中取值 */
function getValueByPath(parsed: unknown, path: string): unknown {
  if (path === "$") return parsed;
  const tokens: (string | number)[] = [];
  const rest = path.slice(1); // remove leading $
  const re = /\.([^.\[]+)|\[(\d+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rest)) !== null) {
    if (m[1] !== undefined) tokens.push(m[1]);
    else if (m[2] !== undefined) tokens.push(parseInt(m[2], 10));
  }
  let cur: unknown = parsed;
  for (const t of tokens) {
    if (cur === null || typeof cur !== "object") return null;
    cur = (cur as Record<string | number, unknown>)[t as string | number];
  }
  return cur;
}

/* ----------------------- JSON Diff ----------------------- */

function diffTree(left: unknown, right: unknown, key: string): DiffTree {
  const lt = typeLabel(left);
  const rt = typeLabel(right);

  if (lt === rt && lt === "object") {
    const lObj = left as Record<string, unknown>;
    const rObj = right as Record<string, unknown>;
    const lKeys = Object.keys(lObj);
    const rKeys = Object.keys(rObj);
    const keys = Array.from(new Set([...lKeys, ...rKeys]));
    const children: DiffTree[] = keys.map((k) => {
      const inL = k in lObj;
      const inR = k in rObj;
      if (inL && inR) return diffTree(lObj[k], rObj[k], k);
      if (inR)
        return {
          key: k,
          kind: "added",
          leftType: "undefined",
          rightType: typeLabel(rObj[k]),
          leftPreview: "",
          rightPreview: valuePreview(rObj[k]),
          children: [],
        };
      return {
        key: k,
        kind: "removed",
        leftType: typeLabel(lObj[k]),
        rightType: "undefined",
        leftPreview: valuePreview(lObj[k]),
        rightPreview: "",
        children: [],
      };
    });
    return {
      key,
      kind: "equal",
      leftType: lt,
      rightType: rt,
      leftPreview: "",
      rightPreview: "",
      children,
    };
  }

  if (lt === rt && lt === "array") {
    const lArr = left as unknown[];
    const rArr = right as unknown[];
    const max = Math.max(lArr.length, rArr.length);
    const children: DiffTree[] = [];
    for (let i = 0; i < max; i++) {
      const inL = i < lArr.length;
      const inR = i < rArr.length;
      if (inL && inR) children.push(diffTree(lArr[i], rArr[i], String(i)));
      else if (inR)
        children.push({
          key: String(i),
          kind: "added",
          leftType: "undefined",
          rightType: typeLabel(rArr[i]),
          leftPreview: "",
          rightPreview: valuePreview(rArr[i]),
          children: [],
        });
      else
        children.push({
          key: String(i),
          kind: "removed",
          leftType: typeLabel(lArr[i]),
          rightType: "undefined",
          leftPreview: valuePreview(lArr[i]),
          rightPreview: "",
          children: [],
        });
    }
    return {
      key,
      kind: "equal",
      leftType: lt,
      rightType: rt,
      leftPreview: "",
      rightPreview: "",
      children,
    };
  }

  const equal = lt === rt && JSON.stringify(left) === JSON.stringify(right);
  return {
    key,
    kind: equal ? "equal" : "modified",
    leftType: lt,
    rightType: rt,
    leftPreview: valuePreview(left),
    rightPreview: valuePreview(right),
    children: [],
  };
}

function countDiff(node: DiffTree): {
  added: number;
  removed: number;
  modified: number;
} {
  let added = 0;
  let removed = 0;
  let modified = 0;
  if (node.kind === "added") added++;
  if (node.kind === "removed") removed++;
  if (node.kind === "modified") modified++;
  for (const c of node.children) {
    const r = countDiff(c);
    added += r.added;
    removed += r.removed;
    modified += r.modified;
  }
  return { added, removed, modified };
}

/* =========================================================================
 * 子组件：树形节点
 * ========================================================================= */

interface TreeNodeProps {
  label: string;
  value: unknown;
  path: string;
  depth: number;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  onSelect: (path: string, value: unknown) => void;
  selectedPath: string;
  colors: ColorScheme;
  isRoot?: boolean;
}

function TreeNode({
  label,
  value,
  path,
  depth,
  expanded,
  onToggle,
  onSelect,
  selectedPath,
  colors,
  isRoot,
}: TreeNodeProps) {
  const isContainer =
    (Array.isArray(value) && value.length > 0) ||
    (value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0);

  const isOpen = expanded.has(path);
  const count = childCount(value);
  const typeStr = Array.isArray(value)
    ? `array[${count}]`
    : `object{${count}}`;

  let entries: { key: string | number; val: unknown }[] = [];
  if (Array.isArray(value)) {
    entries = value.map((v, i) => ({ key: i, val: v }));
  } else if (value && typeof value === "object") {
    entries = Object.entries(value).map(([k, v]) => ({ key: k, val: v }));
  }
  const [extraLoad, setExtraLoad] = useState(0);
  const totalShown = MAX_RENDER_CHILDREN + extraLoad * MAX_RENDER_CHILDREN;
  const displayedEntries = entries.slice(0, totalShown);
  const remainingHidden = entries.length - displayedEntries.length;

  const isSelected = selectedPath === path;

  const valueColor =
    value === null
      ? colors.null
      : typeof value === "string"
      ? colors.string
      : typeof value === "number"
      ? colors.number
      : typeof value === "boolean"
      ? colors.boolean
      : colors.punct;

  return (
    <div>
      <div
        className={`flex items-start gap-1 py-0.5 px-1 rounded cursor-pointer transition-colors group ${
          isSelected ? "bg-indigo-500/15" : "hover:bg-white/5"
        }`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => onSelect(path, value)}
      >
        {/* 展开/折叠箭头 */}
        <span
          className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            if (isContainer) onToggle(path);
          }}
        >
          {isContainer ? (
            isOpen ? (
              <ChevronDown
                className="w-3.5 h-3.5"
                style={{ color: colors.punct }}
              />
            ) : (
              <ChevronRight
                className="w-3.5 h-3.5"
                style={{ color: colors.punct }}
              />
            )
          ) : null}
        </span>

        {/* 键名 */}
        {!isRoot && (
          <span
            className="font-mono text-[13px] flex-shrink-0"
            style={{ color: colors.key }}
          >
            {typeof label === "number" ? label : `"${label}"`}
            <span style={{ color: colors.punct }}>:</span>
          </span>
        )}

        {/* 值 / 类型 */}
        {isContainer ? (
          <span className="font-mono text-[13px] select-none" style={{ color: colors.punct }}>
            {Array.isArray(value) ? "[" : "{"}
            {!isOpen && (
              <span
                className="ml-1 text-[11px]"
                style={{ color: colors.gutterText }}
              >
                {typeStr}
              </span>
            )}
            {!isOpen ? (Array.isArray(value) ? " ]" : " }") : ""}
          </span>
        ) : (
          <span
            className="font-mono text-[13px] break-all"
            style={{ color: valueColor }}
          >
            {value === null
              ? "null"
              : typeof value === "string"
              ? JSON.stringify(value)
              : String(value)}
          </span>
        )}

        {isContainer && isOpen && (
          <span
            className="ml-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: colors.gutterText }}
          >
            {typeStr}
          </span>
        )}
      </div>

      {/* 子节点 */}
      {isContainer && isOpen && (
        <div>
          {displayedEntries.map((entry) => (
            <TreeNode
              key={String(entry.key)}
              label={String(entry.key)}
              value={entry.val}
              path={joinPath(path, entry.key)}
              depth={depth + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedPath={selectedPath}
              colors={colors}
            />
          ))}
          {remainingHidden > 0 && (
            <button
              className="text-[11px] py-1 px-2 rounded hover:bg-white/5 transition-colors"
              style={{
                color: colors.key,
                marginLeft: `${(depth + 1) * 16 + 20}px`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setExtraLoad((n) => n + 1);
              }}
            >
              显示更多 {remainingHidden} 项 …
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 * 子组件：Diff 树行
 * ========================================================================= */

interface DiffRowProps {
  node: DiffTree;
  depth: number;
  pathKeyPrefix: string;
  expanded: Set<string>;
  onToggle: (key: string) => void;
}

function DiffRow({
  node,
  depth,
  pathKeyPrefix,
  expanded,
  onToggle,
}: DiffRowProps) {
  const pathKey = `${pathKeyPrefix}/${node.key}`;
  const hasChildren = node.children.length > 0;
  const isOpen = depth === 0 || expanded.has(pathKey);

  const bg: Record<DiffKind, string> = {
    equal: "",
    added: "bg-emerald-500/10",
    removed: "bg-rose-500/10",
    modified: "bg-amber-500/10",
  };

  const label: Record<DiffKind, string> = {
    equal: "",
    added: "+ 新增",
    removed: "- 删除",
    modified: "~ 修改",
  };

  const tagColor: Record<DiffKind, string> = {
    equal: "text-slate-500",
    added: "text-emerald-400",
    removed: "text-rose-400",
    modified: "text-amber-400",
  };

  return (
    <div>
      <div
        className={`flex items-start gap-1 py-0.5 px-1 rounded ${bg[node.kind]}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() => hasChildren && onToggle(pathKey)}
      >
        <span className="w-4 h-4 flex-shrink-0 mt-0.5 flex items-center justify-center">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            )
          ) : null}
        </span>
        <span className="font-mono text-[13px] text-sky-300 flex-shrink-0">
          {/^\d+$/.test(node.key) ? node.key : `"${node.key}"`}
          <span className="text-slate-600">:</span>
        </span>

        {node.kind === "modified" ? (
          <span className="font-mono text-[13px] flex flex-wrap items-center gap-x-2">
            <span className="text-rose-400 line-through decoration-rose-500/50">
              {node.leftPreview}
            </span>
            <ArrowRight className="w-3 h-3 text-slate-600" />
            <span className="text-emerald-400">{node.rightPreview}</span>
          </span>
        ) : node.kind === "added" ? (
          <span className="font-mono text-[13px] text-emerald-400">
            {node.rightPreview}
          </span>
        ) : node.kind === "removed" ? (
          <span className="font-mono text-[13px] text-rose-400 line-through decoration-rose-500/40">
            {node.leftPreview}
          </span>
        ) : hasChildren ? (
          <span className="font-mono text-[13px] text-slate-500">
            {node.leftType === "array"
              ? `[${node.children.length}]`
              : `{${node.children.length}}`}
          </span>
        ) : (
          <span className="font-mono text-[13px] text-slate-400">
            {node.leftPreview}
          </span>
        )}

        {node.kind !== "equal" && (
          <span
            className={`ml-auto text-[10px] font-medium flex-shrink-0 ${tagColor[node.kind]}`}
          >
            {label[node.kind]}
          </span>
        )}
      </div>

      {hasChildren && isOpen && (
        <div>
          {node.children.map((c, i) => (
            <DiffRow
              key={`${c.key}-${i}`}
              node={c}
              depth={depth + 1}
              pathKeyPrefix={pathKey}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
 * 主组件
 * ========================================================================= */

export default function JsonFormatterPage() {
  const [mode, setMode] = useState<AppMode>("format");
  const [input, setInput] = useState<string>("");
  const [diffLeft, setDiffLeft] = useState<string>("");
  const [diffRight, setDiffRight] = useState<string>("");
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("json");
  const [outputMode, setOutputMode] = useState<OutputMode>("beautify");
  const [theme, setTheme] = useState<Theme>("dark");
  const [copiedTarget, setCopiedTarget] = useState<string>("");
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["$"])
  );
  const [diffExpanded, setDiffExpanded] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const [prevValid, setPrevValid] = useState<boolean>(false);

  // 初始化：从 localStorage 读取历史与偏好（仅客户端，需在 effect 中读取）
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const rawHist = localStorage.getItem(HISTORY_KEY);
      if (rawHist) setHistory(JSON.parse(rawHist));
      const rawPrefs = localStorage.getItem(PREFS_KEY);
      if (rawPrefs) {
        const prefs = JSON.parse(rawPrefs);
        if (prefs.indentSize) setIndentSize(prefs.indentSize);
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.viewMode) setViewMode(prefs.viewMode);
        if (prefs.outputFormat) setOutputFormat(prefs.outputFormat);
      }
    } catch {
      // ignore
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // 持久化偏好
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ indentSize, theme, viewMode, outputFormat })
      );
    } catch {
      // ignore
    }
  }, [indentSize, theme, viewMode, outputFormat]);

  const colors = theme === "dark" ? DARK_COLORS : LIGHT_COLORS;

  /* ----------------------- 实时校验与解析 ----------------------- */
  const validation = useMemo<ValidationResult>(() => {
    if (mode === "format") return validateJson(input);
    return validateJson(diffLeft || diffRight || "");
  }, [input, diffLeft, diffRight, mode]);

  const parsed = useMemo<unknown | null>(() => {
    if (mode !== "format") return null;
    return safeParse(input);
  }, [input, mode]);

  /* ----------------------- 实时格式化输出 ----------------------- */
  const formattedOutput = useMemo<string>(() => {
    if (mode !== "format") return "";
    if (parsed === null || !validation.valid) return "";
    switch (outputFormat) {
      case "json":
        return outputMode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indentSize);
      case "yaml":
        return jsonToYaml(parsed);
      case "xml":
        return jsonToXml(parsed);
      case "csv":
        return jsonToCsv(parsed);
      default:
        return "";
    }
  }, [parsed, validation.valid, outputFormat, outputMode, indentSize, mode]);

  // 当 JSON 从无效变为有效时，重置树形展开为默认（前两层）
  // 采用 React 推荐的「渲染期调整状态」模式，避免在 effect 中 setState
  const parsedValid = mode === "format" && parsed !== null;
  if (parsedValid !== prevValid) {
    setPrevValid(parsedValid);
    if (parsedValid && parsed !== null) {
      const acc = new Set<string>();
      collectPaths(parsed, "$", 0, 1, acc, 100);
      setExpandedPaths(acc);
      setSelectedPath("");
    }
  }

  /* ----------------------- Diff 计算 ----------------------- */
  const diffResult = useMemo<{
    tree: DiffTree | null;
    stats: { added: number; removed: number; modified: number };
  }>(() => {
    if (mode !== "diff")
      return { tree: null, stats: { added: 0, removed: 0, modified: 0 } };
    const l = safeParse(diffLeft);
    const r = safeParse(diffRight);
    if (l === null || r === null)
      return { tree: null, stats: { added: 0, removed: 0, modified: 0 } };
    const tree = diffTree(l, r, "root");
    return { tree, stats: countDiff(tree) };
  }, [diffLeft, diffRight, mode]);

  /* ----------------------- 操作函数 ----------------------- */

  const copyText = useCallback(async (text: string, target: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
    setCopiedTarget(target);
    setTimeout(() => setCopiedTarget(""), 1800);
  }, []);

  const saveToHistory = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      JSON.parse(trimmed);
    } catch {
      return;
    }
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.text !== trimmed);
      const item: HistoryItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        text: trimmed,
        preview: trimmed.slice(0, 80).replace(/\n/g, " "),
        size: trimmed.length,
        time: Date.now(),
      };
      const next = [item, ...filtered].slice(0, MAX_HISTORY);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const handleFormatClick = useCallback(() => {
    if (validation.valid) saveToHistory(input);
  }, [validation.valid, input, saveToHistory]);

  const handleClear = useCallback(() => {
    if (mode === "format") {
      setInput("");
      setSelectedPath("");
    } else {
      setDiffLeft("");
      setDiffRight("");
    }
  }, [mode]);

  const loadSample = useCallback(() => {
    if (mode === "format") {
      setInput(SAMPLE_JSON);
    } else {
      setDiffLeft(
        `{"name":"张三","age":30,"city":"北京","tags":["a","b"]}`
      );
      setDiffRight(
        `{"name":"张三","age":31,"city":"上海","tags":["a","b","c"],"email":"a@b.com"}`
      );
    }
  }, [mode]);

  const togglePath = useCallback((path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const selectNode = useCallback((path: string) => {
    setSelectedPath(path);
  }, []);

  const toggleDiffNode = useCallback((key: string) => {
    setDiffExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (parsed === null) return;
    const acc = new Set<string>();
    collectPaths(parsed, "$", 0, 50, acc, 100000);
    setExpandedPaths(acc);
  }, [parsed]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set(["$"]));
  }, []);

  const downloadOutput = useCallback(() => {
    if (!formattedOutput) return;
    const ext =
      outputFormat === "json"
        ? "json"
        : outputFormat === "yaml"
        ? "yaml"
        : outputFormat === "xml"
        ? "xml"
        : "csv";
    const blob = new Blob([formattedOutput], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [formattedOutput, outputFormat]);

  // Ctrl+Enter 保存到历史
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleFormatClick();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleFormatClick]);

  /* ----------------------- 统计信息 ----------------------- */
  const inputLineCount = mode === "format"
    ? input
      ? input.split("\n").length
      : 1
    : diffLeft
    ? diffLeft.split("\n").length
    : 1;
  const outputLineCount = formattedOutput ? formattedOutput.split("\n").length : 1;
  const isLargeOutput = formattedOutput.length > LARGE_OUTPUT_THRESHOLD;
  const highlightedHtml = useMemo(() => {
    if (mode !== "format" || !formattedOutput || outputFormat !== "json" || isLargeOutput)
      return "";
    return highlightJsonToHtml(formattedOutput, colors);
  }, [formattedOutput, outputFormat, colors, isLargeOutput, mode]);

  const selectedValue = useMemo(() => {
    if (!selectedPath || parsed === null) return null;
    return getValueByPath(parsed, selectedPath);
  }, [selectedPath, parsed]);

  const selectedValueText = useMemo(() => {
    if (selectedValue === null) return "null";
    if (typeof selectedValue === "string") return selectedValue;
    return JSON.stringify(selectedValue);
  }, [selectedValue]);

  /* =========================================================================
   * 渲染
   * ========================================================================= */
  return (
    <ToolLayout
      title="JSON 格式化工具 Pro"
      description="在线 JSON 格式化、压缩、校验、树形视图、JSONPath 提取、Diff 对比，支持 JSON 转 YAML / XML / CSV，实时语法高亮"
      icon={Braces}
      category="开发工具"
      slug="json-formatter"
    >
      <div className="p-4 sm:p-5 space-y-4">
        {/* ============ 顶部模式与工具栏 ============ */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* 模式切换 */}
          <div className="flex items-center gap-1 bg-[#0b0b0f] border border-[#27272a] rounded-lg p-0.5">
            <button
              onClick={() => setMode("format")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === "format"
                  ? "bg-indigo-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Braces className="w-3.5 h-3.5" />
              格式化
            </button>
            <button
              onClick={() => setMode("diff")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                mode === "diff"
                  ? "bg-indigo-500 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              Diff 对比
            </button>
          </div>

          <div className="h-6 w-px bg-[#27272a] hidden sm:block" />

          {/* 主题切换 */}
          <button
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#0b0b0f] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-colors"
            title="切换深色/浅色主题"
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
            {theme === "dark" ? "浅色" : "深色"}
          </button>

          {/* 历史 */}
          <button
            onClick={() => setShowHistory((s) => !s)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showHistory
                ? "text-indigo-300 bg-indigo-500/10 border-indigo-500/30"
                : "text-slate-300 bg-[#0b0b0f] border-[#27272a] hover:text-white hover:border-[#3f3f46]"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            历史 ({history.length})
          </button>

          {/* 示例 */}
          <button
            onClick={loadSample}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#0b0b0f] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            示例
          </button>

          {/* 清空 */}
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-[#0b0b0f] border border-[#27272a] rounded-lg hover:text-rose-400 hover:border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            清空
          </button>

          <div className="ml-auto flex items-center gap-2.5">
            {/* 缩进 */}
            {mode === "format" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500">缩进</span>
                <div className="flex items-center bg-[#0b0b0f] border border-[#27272a] rounded-md p-0.5">
                  {([2, 4] as IndentSize[]).map((n) => (
                    <button
                      key={n}
                      onClick={() => setIndentSize(n)}
                      className={`px-2 py-1 text-[11px] font-medium rounded transition-all ${
                        indentSize === n
                          ? "bg-[#27272a] text-white"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ 格式转换栏（仅 format 模式） ============ */}
        {mode === "format" && (
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1 bg-[#0b0b0f] border border-[#27272a] rounded-lg p-0.5">
              {(
                [
                  { v: "json", label: "JSON", icon: FileJson },
                  { v: "yaml", label: "YAML", icon: FileCode },
                  { v: "xml", label: "XML", icon: Code2 },
                  { v: "csv", label: "CSV", icon: Columns2 },
                ] as { v: OutputFormat; label: string; icon: LucideIcon }[]
              ).map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.v}
                    onClick={() => setOutputFormat(f.v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                      outputFormat === f.v
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {f.label}
                  </button>
                );
              })}
            </div>

            {/* 压缩/美化（仅 JSON） */}
            {outputFormat === "json" && (
              <div className="flex items-center gap-1 bg-[#0b0b0f] border border-[#27272a] rounded-lg p-0.5">
                <button
                  onClick={() => setOutputMode("beautify")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    outputMode === "beautify"
                      ? "bg-sky-500/15 text-sky-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <WrapText className="w-3.5 h-3.5" />
                  美化
                </button>
                <button
                  onClick={() => setOutputMode("minify")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    outputMode === "minify"
                      ? "bg-sky-500/15 text-sky-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  压缩
                </button>
              </div>
            )}

            {/* 视图切换（仅 JSON） */}
            {outputFormat === "json" && (
              <div className="flex items-center gap-1 bg-[#0b0b0f] border border-[#27272a] rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("code")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    viewMode === "code"
                      ? "bg-purple-500/15 text-purple-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  代码
                </button>
                <button
                  onClick={() => setViewMode("tree")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all ${
                    viewMode === "tree"
                      ? "bg-purple-500/15 text-purple-300"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ListTree className="w-3.5 h-3.5" />
                  树形
                </button>
              </div>
            )}

            {/* 树形视图：全部展开/折叠 */}
            {viewMode === "tree" && outputFormat === "json" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={expandAll}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                  title="全部展开"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                  展开
                </button>
                <button
                  onClick={collapseAll}
                  className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors"
                  title="全部折叠"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                  折叠
                </button>
              </div>
            )}

            {/* 下载 */}
            <button
              onClick={downloadOutput}
              disabled={!formattedOutput}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 bg-[#0b0b0f] border border-[#27272a] rounded-lg hover:text-white hover:border-[#3f3f46] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-3.5 h-3.5" />
              下载
            </button>
          </div>
        )}

        {/* ============ 校验状态 ============ */}
        {mode === "format" && input.trim() && (
          <ValidationBanner validation={validation} />
        )}

        {/* ============ 历史记录面板 ============ */}
        {showHistory && (
          <div className="bg-[#0b0b0f] border border-[#27272a] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                历史记录（最近 {MAX_HISTORY} 条）
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                收起
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-[11px] text-slate-500 py-3 text-center">
                暂无历史记录，格式化 JSON 后点击「保存」或按 Ctrl+Enter 自动保存
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-[#18181b] transition-colors"
                  >
                    <button
                      onClick={() => {
                        setInput(h.text);
                        setShowHistory(false);
                      }}
                      className="flex-1 min-w-0 text-left"
                    >
                      <p className="text-[11px] text-slate-300 font-mono truncate">
                        {h.preview}
                      </p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {h.size} 字符 ·{" "}
                        {new Date(h.time).toLocaleString("zh-CN")}
                      </p>
                    </button>
                    <button
                      onClick={() => copyText(h.text, `hist-${h.id}`)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity"
                      title="复制"
                    >
                      {copiedTarget === `hist-${h.id}` ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => removeFromHistory(h.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ 主编辑区 ============ */}
        {mode === "format" ? (
          <FormatArea
            input={input}
            setInput={setInput}
            inputLineCount={inputLineCount}
            formattedOutput={formattedOutput}
            outputLineCount={outputLineCount}
            viewMode={viewMode}
            outputFormat={outputFormat}
            colors={colors}
            highlightedHtml={highlightedHtml}
            isLargeOutput={isLargeOutput}
            parsed={parsed}
            expandedPaths={expandedPaths}
            togglePath={togglePath}
            selectNode={selectNode}
            selectedPath={selectedPath}
            selectedValueText={selectedValueText}
            copyText={copyText}
            copiedTarget={copiedTarget}
            onFormatClick={handleFormatClick}
            validation={validation}
          />
        ) : (
          <DiffArea
            diffLeft={diffLeft}
            setDiffLeft={setDiffLeft}
            diffRight={diffRight}
            setDiffRight={setDiffRight}
            diffResult={diffResult}
            diffExpanded={diffExpanded}
            toggleDiffNode={toggleDiffNode}
            copyText={copyText}
            copiedTarget={copiedTarget}
            colors={colors}
          />
        )}

        {/* ============ 底部统计 ============ */}
        <StatsBar
          mode={mode}
          inputLen={
            mode === "format" ? input.length : diffLeft.length + diffRight.length
          }
          outputLen={formattedOutput.length}
          inputLineCount={inputLineCount}
          outputLineCount={outputLineCount}
          diffStats={diffResult.stats}
        />
      </div>
    </ToolLayout>
  );
}

/* =========================================================================
 * 校验状态横幅
 * ========================================================================= */

function ValidationBanner({ validation }: { validation: ValidationResult }) {
  if (validation.valid) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
        <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="text-xs font-medium text-emerald-300">
          JSON 格式正确
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 px-3 py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-lg">
      <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-rose-300">
            JSON 格式错误
          </span>
          {validation.errorType && (
            <span className="text-[10px] px-1.5 py-0.5 bg-rose-500/15 text-rose-400 rounded">
              {validation.errorType}
            </span>
          )}
          {validation.errorLine && (
            <span className="text-[10px] text-rose-400/80">
              第 {validation.errorLine} 行
              {validation.errorColumn ? `，第 ${validation.errorColumn} 列` : ""}
            </span>
          )}
        </div>
        <p className="text-[11px] text-rose-400/70 mt-1 break-all">
          {validation.error}
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
 * 格式化区域
 * ========================================================================= */

interface FormatAreaProps {
  input: string;
  setInput: (v: string) => void;
  inputLineCount: number;
  formattedOutput: string;
  outputLineCount: number;
  viewMode: ViewMode;
  outputFormat: OutputFormat;
  colors: ColorScheme;
  highlightedHtml: string;
  isLargeOutput: boolean;
  parsed: unknown | null;
  expandedPaths: Set<string>;
  togglePath: (path: string) => void;
  selectNode: (path: string, value: unknown) => void;
  selectedPath: string;
  selectedValueText: string;
  copyText: (text: string, target: string) => void;
  copiedTarget: string;
  onFormatClick: () => void;
  validation: ValidationResult;
}

function FormatArea(props: FormatAreaProps) {
  const {
    input,
    setInput,
    inputLineCount,
    formattedOutput,
    outputLineCount,
    viewMode,
    outputFormat,
    colors,
    highlightedHtml,
    isLargeOutput,
    parsed,
    expandedPaths,
    togglePath,
    selectNode,
    selectedPath,
    selectedValueText,
    copyText,
    copiedTarget,
    onFormatClick,
    validation,
  } = props;

  const inputGutterRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputScroll = useCallback(() => {
    if (inputGutterRef.current && inputRef.current) {
      inputGutterRef.current.scrollTop = inputRef.current.scrollTop;
    }
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* -------- 输入区 -------- */}
      <div
        className="rounded-xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.gutter,
          }}
        >
          <div className="flex items-center gap-1.5">
            <Braces className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium" style={{ color: colors.text }}>
              输入 JSON
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: colors.gutterText }}>
              {inputLineCount} 行 · {input.length} 字符
            </span>
            <button
              onClick={onFormatClick}
              disabled={!validation.valid}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title="保存到历史 (Ctrl+Enter)"
            >
              <Save className="w-3 h-3" />
              保存
            </button>
          </div>
        </div>
        <div className="relative flex" style={{ height: 520 }}>
          <div
            ref={inputGutterRef}
            className="flex-shrink-0 w-12 overflow-hidden text-right py-3 pr-2 font-mono text-[12px] leading-6 select-none"
            style={{
              backgroundColor: colors.gutter,
              color: colors.gutterText,
            }}
          >
            {Array.from(
              { length: Math.max(inputLineCount, 20) },
              (_, i) => <div key={i}>{i + 1}</div>
            )}
          </div>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onScroll={handleInputScroll}
            placeholder='在此粘贴或输入 JSON 数据，例如：&#10;{&#10;  "name": "99工具箱",&#10;  "version": "2.0.0"&#10;}'
            spellCheck={false}
            style={{ color: colors.text }}
            className="flex-1 py-3 px-3 bg-transparent font-mono text-[13px] leading-6 resize-none outline-none placeholder-slate-600"
          />
        </div>
      </div>

      {/* -------- 输出区 -------- */}
      <div
        className="rounded-xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.gutter,
          }}
        >
          <div className="flex items-center gap-1.5">
            {viewMode === "tree" ? (
              <ListTree className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Braces className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span className="text-xs font-medium" style={{ color: colors.text }}>
              {viewMode === "tree" && outputFormat === "json"
                ? "树形视图"
                : `输出结果 (${outputFormat.toUpperCase()})`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: colors.gutterText }}>
              {outputLineCount} 行 · {formattedOutput.length} 字符
            </span>
            <button
              onClick={() => copyText(formattedOutput, "output")}
              disabled={!formattedOutput}
              className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                color: copiedTarget === "output" ? "#10b981" : colors.text,
                backgroundColor: colors.gutter,
              }}
            >
              {copiedTarget === "output" ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  复制
                </>
              )}
            </button>
          </div>
        </div>

        {/* 路径提取条 */}
        {selectedPath && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 border-b text-[11px]"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.gutter,
            }}
          >
            <Hash className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            <span
              className="font-mono truncate flex-1 min-w-0"
              style={{ color: colors.key }}
              title={selectedPath}
            >
              {selectedPath}
            </span>
            <span
              className="font-mono truncate max-w-[40%] hidden sm:block"
              style={{ color: colors.gutterText }}
              title={selectedValueText}
            >
              {selectedValueText.length > 60
                ? selectedValueText.slice(0, 60) + "…"
                : selectedValueText}
            </span>
            <button
              onClick={() => copyText(selectedPath, "path")}
              className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
              style={{
                color: copiedTarget === "path" ? "#10b981" : colors.gutterText,
              }}
            >
              {copiedTarget === "path" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              路径
            </button>
            <button
              onClick={() => copyText(selectedValueText, "value")}
              className="flex-shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-white/5 transition-colors"
              style={{
                color:
                  copiedTarget === "value" ? "#10b981" : colors.gutterText,
              }}
            >
              {copiedTarget === "value" ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              值
            </button>
          </div>
        )}

        {/* 输出内容 */}
        <div
          className="overflow-auto"
          style={{ height: selectedPath ? 496 : 520 }}
        >
          {viewMode === "tree" && outputFormat === "json" ? (
            parsed === null ? (
              <EmptyState colors={colors} text="输入合法 JSON 后显示树形结构" />
            ) : (
              <div className="py-2 px-1">
                <TreeNode
                  label="$"
                  value={parsed}
                  path="$"
                  depth={0}
                  expanded={expandedPaths}
                  onToggle={togglePath}
                  onSelect={selectNode}
                  selectedPath={selectedPath}
                  colors={colors}
                  isRoot
                />
              </div>
            )
          ) : formattedOutput ? (
            isLargeOutput && outputFormat === "json" ? (
              <pre
                className="p-3 font-mono text-[13px] leading-6 whitespace-pre"
                style={{ color: colors.text }}
              >
                {formattedOutput}
              </pre>
            ) : outputFormat === "json" ? (
              <pre className="p-3 font-mono text-[13px] leading-6 whitespace-pre">
                <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
              </pre>
            ) : (
              <pre
                className="p-3 font-mono text-[13px] leading-6 whitespace-pre"
                style={{ color: colors.text }}
              >
                {formattedOutput}
              </pre>
            )
          ) : (
            <EmptyState colors={colors} text="格式化后的结果将显示在这里" />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ colors, text }: { colors: ColorScheme; text: string }) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-2 text-center px-4"
      style={{ color: colors.gutterText }}
    >
      <Braces className="w-8 h-8 opacity-30" />
      <p className="text-xs">{text}</p>
    </div>
  );
}

/* =========================================================================
 * Diff 区域
 * ========================================================================= */

interface DiffAreaProps {
  diffLeft: string;
  setDiffLeft: (v: string) => void;
  diffRight: string;
  setDiffRight: (v: string) => void;
  diffResult: {
    tree: DiffTree | null;
    stats: { added: number; removed: number; modified: number };
  };
  diffExpanded: Set<string>;
  toggleDiffNode: (key: string) => void;
  copyText: (text: string, target: string) => void;
  copiedTarget: string;
  colors: ColorScheme;
}

function DiffArea(props: DiffAreaProps) {
  const {
    diffLeft,
    setDiffLeft,
    diffRight,
    setDiffRight,
    diffResult,
    diffExpanded,
    toggleDiffNode,
    copyText,
    copiedTarget,
    colors,
  } = props;

  const leftValid = diffLeft.trim() ? validateJson(diffLeft).valid : true;
  const rightValid = diffRight.trim() ? validateJson(diffRight).valid : true;

  return (
    <div className="space-y-4">
      {/* Diff 统计 */}
      {diffResult.tree && (
        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <span className="text-slate-400">差异统计：</span>
          <span className="inline-flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            新增 {diffResult.stats.added}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            删除 {diffResult.stats.removed}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            修改 {diffResult.stats.modified}
          </span>
          {diffResult.stats.added +
            diffResult.stats.removed +
            diffResult.stats.modified ===
            0 && (
            <span className="inline-flex items-center gap-1 text-sky-400">
              <CheckCircle className="w-3 h-3" />
              两个 JSON 完全相同
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 左侧 */}
        <div
          className="rounded-xl border overflow-hidden flex flex-col"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.gutter,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span
                className="text-xs font-medium"
                style={{ color: colors.text }}
              >
                原始 JSON (A)
              </span>
            </div>
            <span className="text-[10px]" style={{ color: colors.gutterText }}>
              {diffLeft.split("\n").length} 行 · {diffLeft.length} 字符
            </span>
          </div>
          <textarea
            value={diffLeft}
            onChange={(e) => setDiffLeft(e.target.value)}
            placeholder="粘贴 JSON A..."
            spellCheck={false}
            style={{ color: colors.text, height: 320 }}
            className="w-full p-3 bg-transparent font-mono text-[13px] leading-6 resize-none outline-none placeholder-slate-600"
          />
          {!leftValid && (
            <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/20 text-[10px] text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              JSON A 格式错误
            </div>
          )}
        </div>

        {/* 右侧 */}
        <div
          className="rounded-xl border overflow-hidden flex flex-col"
          style={{ backgroundColor: colors.bg, borderColor: colors.border }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 border-b"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.gutter,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span
                className="text-xs font-medium"
                style={{ color: colors.text }}
              >
                对比 JSON (B)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]" style={{ color: colors.gutterText }}>
                {diffRight.split("\n").length} 行 · {diffRight.length} 字符
              </span>
              <button
                onClick={() => {
                  setDiffLeft(diffRight);
                  setDiffRight(diffLeft);
                }}
                className="text-[10px] text-slate-400 hover:text-white inline-flex items-center gap-1"
                title="交换 A / B"
              >
                <RotateCcw className="w-3 h-3" />
                交换
              </button>
            </div>
          </div>
          <textarea
            value={diffRight}
            onChange={(e) => setDiffRight(e.target.value)}
            placeholder="粘贴 JSON B..."
            spellCheck={false}
            style={{ color: colors.text, height: 320 }}
            className="w-full p-3 bg-transparent font-mono text-[13px] leading-6 resize-none outline-none placeholder-slate-600"
          />
          {!rightValid && (
            <div className="px-3 py-1.5 bg-rose-500/10 border-t border-rose-500/20 text-[10px] text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              JSON B 格式错误
            </div>
          )}
        </div>
      </div>

      {/* Diff 结果树 */}
      <div
        className="rounded-xl border overflow-hidden"
        style={{ backgroundColor: colors.bg, borderColor: colors.border }}
      >
        <div
          className="flex items-center justify-between px-3 py-2 border-b"
          style={{
            borderColor: colors.border,
            backgroundColor: colors.gutter,
          }}
        >
          <div className="flex items-center gap-1.5">
            <GitCompare className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium" style={{ color: colors.text }}>
              差异结果
            </span>
          </div>
          <button
            onClick={() =>
              copyText(
                diffResult.tree
                  ? JSON.stringify(
                      {
                        added: diffResult.stats.added,
                        removed: diffResult.stats.removed,
                        modified: diffResult.stats.modified,
                      },
                      null,
                      2
                    )
                  : "",
                "diff"
              )
            }
            disabled={!diffResult.tree}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded transition-colors disabled:opacity-40"
            style={{
              color: copiedTarget === "diff" ? "#10b981" : colors.text,
              backgroundColor: colors.gutter,
            }}
          >
            {copiedTarget === "diff" ? (
              <CheckCircle className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            复制统计
          </button>
        </div>
        <div className="overflow-auto" style={{ maxHeight: 360 }}>
          {diffResult.tree ? (
            <div className="py-2 px-1">
              <DiffRow
                node={diffResult.tree}
                depth={0}
                pathKeyPrefix="root"
                expanded={diffExpanded}
                onToggle={toggleDiffNode}
              />
            </div>
          ) : (
            <EmptyState
              colors={colors}
              text="在左右两栏分别输入合法 JSON，自动对比差异"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
 * 底部统计
 * ========================================================================= */

function StatsBar({
  mode,
  inputLen,
  outputLen,
  inputLineCount,
  outputLineCount,
  diffStats,
}: {
  mode: AppMode;
  inputLen: number;
  outputLen: number;
  inputLineCount: number;
  outputLineCount: number;
  diffStats: { added: number; removed: number; modified: number };
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-500">
      {mode === "format" ? (
        <>
          <Stat
            icon="bg-indigo-400"
            label="输入"
            value={`${inputLen} 字符 / ${inputLineCount} 行`}
          />
          <Stat
            icon="bg-emerald-400"
            label="输出"
            value={`${outputLen} 字符 / ${outputLineCount} 行`}
          />
          {inputLen > 0 && outputLen > 0 && (
            <Stat
              icon="bg-amber-400"
              label="压缩比"
              value={`${((outputLen / inputLen) * 100).toFixed(1)}%`}
            />
          )}
        </>
      ) : (
        <>
          <Stat icon="bg-rose-400" label="删除" value={`${diffStats.removed} 项`} />
          <Stat icon="bg-emerald-400" label="新增" value={`${diffStats.added} 项`} />
          <Stat icon="bg-amber-400" label="修改" value={`${diffStats.modified} 项`} />
        </>
      )}
      <span className="ml-auto text-slate-600">
        快捷键：
        <kbd className="px-1 py-0.5 bg-[#27272a] rounded text-slate-400">
          Ctrl
        </kbd>{" "}
        +{" "}
        <kbd className="px-1 py-0.5 bg-[#27272a] rounded text-slate-400">
          Enter
        </kbd>{" "}
        保存到历史
      </span>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${icon}`} />
      {label}：<span className="text-slate-300">{value}</span>
    </span>
  );
}
