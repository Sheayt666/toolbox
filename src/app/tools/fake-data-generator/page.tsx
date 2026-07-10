"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Database, Copy, Check, RefreshCw, Download } from "lucide-react";

const inputClass =
  "w-full bg-[#0a0a0b] border border-[#27272a] rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary-500/50";

const FIRST_NAMES = ["张", "李", "王", "刘", "陈", "杨", "赵", "黄", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"];
const GIVEN_NAMES = ["伟", "芳", "娜", "敏", "静", "丽", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀英", "霞", "平"];
const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安", "重庆", "苏州", "天津"];
const STREETS = ["中山路", "人民路", "解放路", "建设路", "和平路", "文化路", "幸福街", "光明大道", "朝阳路", "迎宾路"];
const COMPANIES = ["科技", "网络", "信息", "智能", "数据", "云图", "星辰", "蓝海", "远景", "创新"];
const DOMAINS = ["gmail.com", "outlook.com", "163.com", "qq.com", "126.com", "foxmail.com"];
const CARDS = ["工商银行", "建设银行", "农业银行", "中国银行", "招商银行", "交通银行", "邮储银行"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genName() { return rand(FIRST_NAMES) + rand(GIVEN_NAMES); }
function genPhone() { return "1" + rand(["3", "5", "7", "8", "9"]) + String(randInt(0, 9)) + randInt(10000000, 99999999); }
function genIdCard() {
  const area = randInt(110000, 659000);
  const year = randInt(1960, 2005);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  const seq = randInt(100, 999);
  const check = String(randInt(0, 9));
  return `${area}${year}${m}${d}${seq}${check}`;
}
function genEmail(name: string) {
  const pinyin = ["zhang", "li", "wang", "liu", "chen", "yang", "zhao", "huang", "zhou", "wu"];
  return rand(pinyin) + randInt(100, 9999) + "@" + rand(DOMAINS);
}
function genBankCard() { return "62" + String(randInt(1000000000000, 9999999999999)); }
function genAddress() { return rand(CITIES) + "市" + rand(STREETS) + randInt(1, 200) + "号"; }
function genCompany() { return rand(CITIES) + rand(COMPANIES) + "有限公司"; }
function genDate(start: Date, end: Date) { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().slice(0, 10); }

const FIELDS: Record<string, () => string | number> = {
  name: genName,
  phone: genPhone,
  email: () => genEmail(""),
  idCard: genIdCard,
  bankCard: genBankCard,
  bank: () => rand(CARDS),
  address: genAddress,
  company: genCompany,
  city: () => rand(CITIES),
  age: () => randInt(18, 65),
  salary: () => randInt(5000, 50000),
  date: () => genDate(new Date(2020, 0, 1), new Date()),
  uuid: () => "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3) | 0x8; return v.toString(16); }),
};

const FIELD_OPTIONS = Object.keys(FIELDS);

export default function FakeDataGeneratorPage() {
  const [count, setCount] = useState(10);
  const [selected, setSelected] = useState<string[]>(["name", "phone", "email", "age"]);
  const [format, setFormat] = useState<"json" | "csv" | "sql">("json");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const rows: Record<string, string | number>[] = [];
    for (let i = 0; i < count; i++) {
      const row: Record<string, string | number> = {};
      selected.forEach((f) => { row[f] = FIELDS[f](); });
      rows.push(row);
    }
    let result = "";
    if (format === "json") {
      result = JSON.stringify(rows, null, 2);
    } else if (format === "csv") {
      const headers = selected.join(",");
      const lines = rows.map((r) => selected.map((f) => r[f]).join(","));
      result = [headers, ...lines].join("\n");
    } else {
      result = rows.map((r) => {
        const cols = Object.keys(r).join(", ");
        const vals = Object.values(r).map((v) => typeof v === "string" ? `'${v}'` : v).join(", ");
        return `INSERT INTO users (${cols}) VALUES (${vals});`;
      }).join("\n");
    }
    setOutput(result);
  };

  const toggleField = (f: string) => {
    setSelected(selected.includes(f) ? selected.filter((x) => x !== f) : [...selected, f]);
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const download = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `fakedata.${format}`;
    a.click();
  };

  const FIELD_LABELS: Record<string, string> = { name: "姓名", phone: "手机号", email: "邮箱", idCard: "身份证", bankCard: "银行卡号", bank: "银行", address: "地址", company: "公司", city: "城市", age: "年龄", salary: "薪资", date: "日期", uuid: "UUID" };

  return (
    <ToolLayout
      title="模拟数据生成"
      description="生成各种模拟测试数据"
      icon={Database}
      category="生成工具"
      slug="fake-data-generator"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-slate-300 mb-2 block">字段选择</label>
          <div className="flex flex-wrap gap-2">
            {FIELD_OPTIONS.map((f) => (
              <button
                key={f}
                onClick={() => toggleField(f)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  selected.includes(f) ? "border-primary-500/50 bg-primary-500/10 text-primary-400" : "border-[#27272a] bg-[#0a0a0b] text-slate-400 hover:border-[#3f3f46]"
                }`}
              >
                {FIELD_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">生成数量</label>
            <input type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Math.max(1, Math.min(1000, Number(e.target.value))))} className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">输出格式</label>
            <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className={inputClass}>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="sql">SQL</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={selected.length === 0} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg disabled:opacity-50">
              <RefreshCw className="w-4 h-4" /> 生成
            </button>
          </div>
        </div>

        {output && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-300">生成结果</label>
              <div className="flex gap-3">
                <button onClick={copy} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} 复制
                </button>
                <button onClick={download} className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
                  <Download className="w-3.5 h-3.5" /> 下载
                </button>
              </div>
            </div>
            <pre className="rounded-lg bg-[#0a0a0b] border border-[#27272a] p-4 text-sm text-slate-200 font-mono whitespace-pre-wrap break-all max-h-96 overflow-auto">
              {output}
            </pre>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
