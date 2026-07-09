"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FileText, Copy, Check, Plus, X, Code2 } from "lucide-react";

interface RobotsRule {
  id: string;
  userAgent: string;
  allows: string[];
  disallows: string[];
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

const presets = [
  {
    name: "完全允许",
    rules: [
      { userAgent: "*", allows: ["/"], disallows: [] },
    ],
  },
  {
    name: "禁止敏感目录",
    rules: [
      {
        userAgent: "*",
        allows: [],
        disallows: ["/admin/", "/private/", "/.git", "/wp-admin/"],
      },
    ],
  },
  {
    name: "SEO 友好",
    rules: [
      { userAgent: "*", allows: [], disallows: ["/api/", "/admin/"] },
      { userAgent: "Googlebot", allows: ["/"], disallows: [] },
      { userAgent: "Baiduspider", allows: ["/"], disallows: [] },
    ],
  },
  {
    name: "完全禁止",
    rules: [
      { userAgent: "*", allows: [], disallows: ["/"] },
    ],
  },
];

export default function RobotsTxtGeneratorPage() {
  const [rules, setRules] = useState<RobotsRule[]>([
    { id: generateId(), userAgent: "*", allows: [], disallows: ["/admin/", "/private/"] },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState("https://example.com/sitemap.xml");
  const [includeSitemap, setIncludeSitemap] = useState(true);
  const [copied, setCopied] = useState(false);

  const generateRobotsTxt = useCallback((): string => {
    const lines: string[] = [];

    rules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.allows.forEach((path) => {
        lines.push(`Allow: ${path}`);
      });
      rule.disallows.forEach((path) => {
        lines.push(`Disallow: ${path}`);
      });
      lines.push("");
    });

    if (includeSitemap && sitemapUrl) {
      lines.push(`Sitemap: ${sitemapUrl}`);
    }

    return lines.join("\n").trim() + "\n";
  }, [rules, sitemapUrl, includeSitemap]);

  const robotsTxt = generateRobotsTxt();

  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(robotsTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [robotsTxt]);

  const addRule = () => {
    setRules([...rules, { id: generateId(), userAgent: "*", allows: [], disallows: [] }]);
  };

  const removeRule = (id: string) => {
    if (rules.length <= 1) return;
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateRule = (id: string, key: keyof RobotsRule, value: string | string[]) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const addPath = (ruleId: string, type: "allows" | "disallows") => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newPaths = [...rule[type], type === "allows" ? "/" : "/"];
    updateRule(ruleId, type, newPaths);
  };

  const updatePath = (ruleId: string, type: "allows" | "disallows", index: number, value: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newPaths = [...rule[type]];
    newPaths[index] = value;
    updateRule(ruleId, type, newPaths);
  };

  const removePath = (ruleId: string, type: "allows" | "disallows", index: number) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (!rule) return;
    const newPaths = rule[type].filter((_, i) => i !== index);
    updateRule(ruleId, type, newPaths);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    const newRules = preset.rules.map((r) => ({
      ...r,
      id: generateId(),
    }));
    setRules(newRules);
  };

  const downloadFile = () => {
    const blob = new Blob([robotsTxt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "robots.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="robots.txt 生成器"
      description="在线生成 robots.txt 文件，自定义爬虫规则，支持 Allow/Disallow 和 Sitemap，一键下载"
      icon={FileText}
      category="生成工具"
      slug="robots-txt-generator"
      toolId="robots-txt-generator"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">robots.txt</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={downloadFile}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-slate-300 hover:text-white text-sm font-medium rounded-xl transition-all"
          >
            下载文件
          </button>
          <button
            onClick={copyCode}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制内容
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 预设 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            快速预设
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(preset)}
                className="p-4 bg-[#09090b] border border-[#27272a] hover:border-emerald-500/30 rounded-xl text-left transition-colors group"
              >
                <div className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">
                  {preset.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {preset.rules.length} 条规则
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 规则列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-300">
              爬虫规则
            </label>
            <button
              onClick={addRule}
              className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
            >
              <Plus className="w-3.5 h-3.5" />
              添加规则组
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule, ruleIdx) => (
              <div
                key={rule.id}
                className="bg-[#09090b] border border-[#27272a] rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">规则组 {ruleIdx + 1}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">User-agent:</span>
                      <input
                        type="text"
                        value={rule.userAgent}
                        onChange={(e) => updateRule(rule.id, "userAgent", e.target.value)}
                        className="w-32 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none"
                      />
                    </div>
                  </div>
                  {rules.length > 1 && (
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Allow */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-emerald-400">Allow</span>
                      <button
                        onClick={() => addPath(rule.id, "allows")}
                        className="text-xs text-slate-500 hover:text-emerald-400"
                      >
                        + 添加
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.allows.length === 0 && (
                        <div className="text-xs text-slate-600 italic py-2">无 Allow 规则</div>
                      )}
                      {rule.allows.map((path, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={path}
                            onChange={(e) => updatePath(rule.id, "allows", idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none"
                          />
                          <button
                            onClick={() => removePath(rule.id, "allows", idx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Disallow */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-red-400">Disallow</span>
                      <button
                        onClick={() => addPath(rule.id, "disallows")}
                        className="text-xs text-slate-500 hover:text-red-400"
                      >
                        + 添加
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.disallows.length === 0 && (
                        <div className="text-xs text-slate-600 italic py-2">无 Disallow 规则</div>
                      )}
                      {rule.disallows.map((path, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={path}
                            onChange={(e) => updatePath(rule.id, "disallows", idx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm font-mono focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 outline-none"
                          />
                          <button
                            onClick={() => removePath(rule.id, "disallows", idx)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sitemap */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSitemap}
                onChange={(e) => setIncludeSitemap(e.target.checked)}
                className="w-4 h-4 rounded border-[#27272a] bg-[#18181b] text-emerald-500 focus:ring-emerald-500/50"
              />
              <span className="text-sm text-slate-300">包含 Sitemap</span>
            </label>
          </div>
          {includeSitemap && (
            <input
              type="text"
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://example.com/sitemap.xml"
              className="w-full px-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-white text-sm font-mono focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none placeholder-slate-600"
            />
          )}
        </div>

        {/* 生成结果 */}
        <div>
          <label className="text-sm font-medium text-slate-300 mb-3 block">
            生成的 robots.txt
          </label>
          <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
            <pre className="font-mono text-sm text-emerald-300 whitespace-pre">
              {robotsTxt}
            </pre>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• robots.txt 放在网站根目录，用于告诉搜索引擎爬虫哪些页面可以访问</li>
          <li>• Allow 指定允许爬取的路径，Disallow 指定禁止爬取的路径</li>
          <li>• 通配符 * 表示匹配所有爬虫，路径支持 * 和 $ 通配符</li>
          <li>• Sitemap 指向网站的 XML 地图文件，帮助搜索引擎更高效地爬取</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
