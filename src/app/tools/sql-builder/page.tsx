"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Database, Copy, Check, Plus, Trash2 } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

interface Col { name: string; type: string; }

const TYPES = ["INT", "BIGINT", "VARCHAR(255)", "TEXT", "DECIMAL(10,2)", "BOOLEAN", "DATE", "DATETIME", "TIMESTAMP", "JSON"];

export default function SqlBuilderPage() {
  const [table, setTable] = useState("users");
  const [action, setAction] = useState<"select" | "insert" | "update" | "delete" | "create">("select");
  const [cols, setCols] = useState<Col[]>([
    { name: "id", type: "INT" },
    { name: "username", type: "VARCHAR(255)" },
    { name: "email", type: "VARCHAR(255)" },
    { name: "created_at", type: "DATETIME" },
  ]);
  const [whereClause, setWhereClause] = useState("id = 1");
  const [selectCols, setSelectCols] = useState("*");
  const [orderBy, setOrderBy] = useState("created_at DESC");
  const [limit, setLimit] = useState("10");
  const [copied, setCopied] = useState(false);

  const addCol = () => setCols([...cols, { name: "field", type: "VARCHAR(255)" }]);
  const updateCol = (i: number, field: keyof Col, val: string) => setCols(cols.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  const removeCol = (i: number) => setCols(cols.filter((_, idx) => idx !== i));

  const sql = useMemo(() => {
    const t = table || "table_name";
    switch (action) {
      case "select": {
        let s = `SELECT ${selectCols || "*"}\nFROM ${t}`;
        if (whereClause.trim()) s += `\nWHERE ${whereClause}`;
        if (orderBy.trim()) s += `\nORDER BY ${orderBy}`;
        if (limit.trim()) s += `\nLIMIT ${limit}`;
        return s + ";";
      }
      case "insert": {
        const names = cols.map((c) => c.name).join(", ");
        const vals = cols.map((c) => {
          if (c.type.includes("INT") || c.type.includes("DECIMAL") || c.type === "BOOLEAN") return "0";
          return `'value'`;
        }).join(", ");
        return `INSERT INTO ${t} (${names})\nVALUES (${vals});`;
      }
      case "update": {
        const sets = cols.map((c) => {
          if (c.type.includes("INT") || c.type.includes("DECIMAL") || c.type === "BOOLEAN") return `${c.name} = 0`;
          return `${c.name} = 'value'`;
        }).join(", ");
        let s = `UPDATE ${t}\nSET ${sets}`;
        if (whereClause.trim()) s += `\nWHERE ${whereClause}`;
        return s + ";";
      }
      case "delete": {
        let s = `DELETE FROM ${t}`;
        if (whereClause.trim()) s += `\nWHERE ${whereClause}`;
        return s + ";";
      }
      case "create": {
        const defs = cols.map((c) => {
          let def = `  ${c.name} ${c.type}`;
          if (c.name === "id") def += " PRIMARY KEY AUTO_INCREMENT";
          return def;
        }).join(",\n");
        return `CREATE TABLE ${t} (\n${defs}\n);`;
      }
    }
  }, [action, table, cols, whereClause, selectCols, orderBy, limit]);

  const copy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const actions = [
    { v: "select", l: "SELECT" },
    { v: "insert", l: "INSERT" },
    { v: "update", l: "UPDATE" },
    { v: "delete", l: "DELETE" },
    { v: "create", l: "CREATE" },
  ] as const;

  return (
    <ToolLayout
      title="SQL语句生成器"
      description="可视化生成SQL查询语句"
      icon={Database}
      category="开发工具"
      slug="sql-builder"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex gap-2">
          {actions.map((a) => (
            <button
              key={a.v}
              onClick={() => setAction(a.v)}
              className={`flex-1 px-3 py-2 text-xs font-mono rounded-lg border transition-colors ${
                action === a.v ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400"
              }`}
            >
              {a.l}
            </button>
          ))}
        </div>

        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">表名</label>
          <input value={table} onChange={(e) => setTable(e.target.value)} className={inputClass + " font-mono"} />
        </div>

        {action === "select" && (
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">查询列</label>
              <input value={selectCols} onChange={(e) => setSelectCols(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">ORDER BY</label>
              <input value={orderBy} onChange={(e) => setOrderBy(e.target.value)} className={inputClass} />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">字段定义</label>
            <button onClick={addCol} className="text-xs text-primary-400 hover:text-primary-300 inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> 添加字段
            </button>
          </div>
          <div className="space-y-2">
            {cols.map((c, i) => (
              <div key={i} className="flex gap-2">
                <input value={c.name} onChange={(e) => updateCol(i, "name", e.target.value)} className={inputClass + " flex-1 font-mono"} placeholder="字段名" />
                <select value={c.type} onChange={(e) => updateCol(i, "type", e.target.value)} className="bg-[#0a0a0b] border border-[#27272a] rounded-lg px-2 text-sm text-white">
                  {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <button onClick={() => removeCol(i)} className="px-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>

        {(action === "select" || action === "update" || action === "delete") && (
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">WHERE 条件</label>
            <input value={whereClause} onChange={(e) => setWhereClause(e.target.value)} className={inputClass + " font-mono"} />
          </div>
        )}

        {action === "select" && (
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">LIMIT</label>
            <input value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClass + " w-32"} />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-300">生成的 SQL</label>
            <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
            </button>
          </div>
          <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-emerald-300 font-mono whitespace-pre-wrap break-all min-h-[80px]">
            {sql}
          </pre>
        </div>
      </div>
    </ToolLayout>
  );
}
