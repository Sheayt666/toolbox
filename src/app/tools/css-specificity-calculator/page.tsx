"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  Scale,
  Calculator,
  Trash2,
  FileCode,
} from "lucide-react";

function calculateSpecificity(selector: string): { ids: number; classes: number; elements: number; total: string } {
  // 移除伪元素
  let s = selector.replace(/::[\w-]+/g, "");
  
  // 计算ID选择器数量
  const ids = (s.match(/#[\w-]+/g) || []).length;
  
  // 计算类选择器、属性选择器、伪类数量
  const classMatches = s.match(/\.[\w-]+/g) || [];
  const attrMatches = s.match(/\[[^\]]+\]/g) || [];
  const pseudoMatches = s.match(/:[\w-]+(?:\([^)]*\))?/g) || [];
  const classes = classMatches.length + attrMatches.length + pseudoMatches.length;
  
  // 计算元素选择器数量（排除已计算的）
  // 简单方法：按空格、>、+、~分割，计算每个部分的元素名
  const parts = s.split(/[\s>+~]+/);
  let elements = 0;
  for (const part of parts) {
    if (!part.trim()) continue;
    // 提取纯元素选择器（不以#或.开头，不是*）
    const elemMatch = part.match(/^([a-zA-Z][\w-]*)/);
    if (elemMatch) {
      elements++;
    }
    // 如果全部是 * 通配符
    if (part.trim() === "*") {
      // * 不增加特异性
    }
  }
  
  // 从elements中减去可能的伪元素（已在开头移除，但保险起见）
  const total = `(0,${ids},${classes},${elements})`;
  
  return { ids, classes, elements, total };
}

export default function CssSpecificityCalculatorPage() {
  const [selector, setSelector] = useState("");
  const [result, setResult] = useState<{ ids: number; classes: number; elements: number; total: string } | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = useCallback(() => {
    setError("");
    if (!selector.trim()) {
      setError("请输入CSS选择器");
      return;
    }
    try {
      const r = calculateSpecificity(selector);
      setResult(r);
    } catch (e) {
      setError("计算失败: " + (e as Error).message);
    }
  }, [selector]);

  const handleClear = useCallback(() => {
    setSelector("");
    setResult(null);
    setError("");
  }, []);

  const examples = [
    "#header .nav a:hover",
    "div.container > p:first-child",
    ".btn.btn-primary:active",
    "ul li:nth-child(2n) a",
  ];

  return (
    <ToolLayout
      title="CSS选择器权重计算"
      description="计算CSS选择器的特异性权重，了解选择器优先级，帮助优化CSS代码"
      toolId="css-specificity-calculator"
      icon={Scale}
      category="开发工具"
      slug="css-specificity-calculator"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          <div className="p-4 border-b border-[#27272a]">
            <label className="block text-sm font-medium text-zinc-300 mb-2">CSS选择器</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="例如: #header .nav a:hover"
                spellCheck={false}
                className="flex-1 px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-zinc-200 font-mono text-sm focus:outline-none focus:border-primary-500/50 placeholder-zinc-600"
                onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
              />
              <button
                onClick={handleCalculate}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium rounded-xl transition-all hover:opacity-90 hover:shadow-lg"
              >
                <Calculator className="w-4 h-4" />
                计算
              </button>
              <button
                onClick={handleClear}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-400 bg-[#27272a] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                清空
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-sm text-zinc-400 mb-2">特异性权重</div>
                <div className="inline-flex bg-[#09090b] rounded-xl overflow-hidden border border-[#27272a]">
                  <div className="px-6 py-4 border-r border-[#27272a]">
                    <div className="text-3xl font-bold text-purple-400">{result.ids}</div>
                    <div className="text-xs text-zinc-500 mt-1">ID</div>
                  </div>
                  <div className="px-6 py-4 border-r border-[#27272a]">
                    <div className="text-3xl font-bold text-sky-400">{result.classes}</div>
                    <div className="text-xs text-zinc-500 mt-1">类/属性/伪类</div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="text-3xl font-bold text-emerald-400">{result.elements}</div>
                    <div className="text-xs text-zinc-500 mt-1">元素</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#09090b] rounded-xl p-4 text-center">
                <span className="text-zinc-400 text-sm">权重值: </span>
                <span className="font-mono text-lg text-zinc-200">{result.total}</span>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
            <div className="text-sm text-zinc-400 mb-2">快速示例：</div>
            <div className="flex flex-wrap gap-2">
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setSelector(ex)}
                  className="px-3 py-1.5 text-xs font-mono bg-[#27272a] hover:bg-[#3f3f46] text-zinc-300 rounded-lg transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-zinc-100 mb-3">权重计算规则</h3>
          <ul className="text-sm text-zinc-400 space-y-2 leading-relaxed">
            <li><span className="text-purple-400 font-medium">ID选择器</span>（#id）- 权重最高，每个计100</li>
            <li><span className="text-sky-400 font-medium">类选择器</span>（.class）、属性选择器（[attr]）、伪类（:hover）- 每个计10</li>
            <li><span className="text-emerald-400 font-medium">元素选择器</span>（div、p、a）- 每个计1</li>
            <li><span className="text-zinc-500 font-medium">通配符</span>（*）- 不计权重</li>
            <li>内联样式 &gt; ID选择器 &gt; 类选择器 &gt; 元素选择器</li>
          </ul>
        </div>
      </div>
    </ToolLayout>
  );
}
