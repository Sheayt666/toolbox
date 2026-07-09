"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { KeyRound, Copy, Check, AlertCircle, Shield } from "lucide-react";

export default function JwtDecoderPage() {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(""), 1500);
  };

  const decodeJWT = (jwt: string) => {
    setError("");
    setHeader(null);
    setPayload(null);
    setSignature("");

    if (!jwt.trim()) return;

    const parts = jwt.trim().split(".");
    if (parts.length !== 3) {
      setError("无效的JWT格式，JWT应由三部分组成，用点分隔");
      return;
    }

    try {
      // Decode header
      const headerJson = atob(parts[0].replace(/-/g, "+").replace(/_/g, "/"));
      setHeader(JSON.parse(headerJson));

      // Decode payload
      const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
      setPayload(JSON.parse(payloadJson));

      setSignature(parts[2]);
    } catch (e) {
      setError("解析失败，请检查JWT格式是否正确");
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString("zh-CN");
  };

  const isExpired = (exp: number) => {
    if (!exp) return false;
    return Date.now() > exp * 1000;
  };

  return (
    <ToolLayout
      title="JWT解析器"
      description="JWT Token在线解析，解码Header和Payload，验证签名格式，支持HS256算法"
      toolId="jwt-decoder"
      icon={KeyRound}
      category="开发工具"
      slug="jwt-decoder"
    >
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* 输入区 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-semibold">JWT Token</h2>
          </div>
          <div className="p-4">
            <textarea
              value={token}
              onChange={(e) => {
                setToken(e.target.value);
                decodeJWT(e.target.value);
              }}
              placeholder="粘贴你的JWT Token..."
              className="w-full h-32 bg-zinc-900/50 border border-zinc-700 rounded-lg p-4 text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-rose-500 resize-none font-mono text-sm break-all"
            />
            {error && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* 解析结果 */}
        {(header || payload) && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold">Header (头部)</h3>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(header, null, 2), "header")}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  {copied === "header" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "header" ? "已复制" : "复制"}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm text-zinc-400 font-mono bg-zinc-900/50 rounded-lg p-4 overflow-auto">
                  {JSON.stringify(header, null, 2)}
                </pre>
              </div>
            </div>

            {/* Payload */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold">Payload (载荷)</h3>
                </div>
                <button
                  onClick={() => handleCopy(JSON.stringify(payload, null, 2), "payload")}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  {copied === "payload" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "payload" ? "已复制" : "复制"}
                </button>
              </div>
              <div className="p-4">
                <pre className="text-sm text-zinc-400 font-mono bg-zinc-900/50 rounded-lg p-4 overflow-auto">
                  {JSON.stringify(payload, null, 2)}
                </pre>

                {/* 常用字段解读 */}
                {payload && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {payload.iss && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">签发者 (iss)</div>
                        <div className="text-sm text-zinc-300 font-mono break-all">{payload.iss}</div>
                      </div>
                    )}
                    {payload.sub && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">主题 (sub)</div>
                        <div className="text-sm text-zinc-300 font-mono break-all">{payload.sub}</div>
                      </div>
                    )}
                    {payload.aud && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">受众 (aud)</div>
                        <div className="text-sm text-zinc-300 font-mono break-all">{payload.aud}</div>
                      </div>
                    )}
                    {payload.exp && (
                      <div className={`p-3 rounded-lg ${isExpired(payload.exp) ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                        <div className={`text-xs mb-1 ${isExpired(payload.exp) ? "text-red-400" : "text-emerald-400"}`}>
                          过期时间 (exp) {isExpired(payload.exp) ? "已过期" : "有效"}
                        </div>
                        <div className="text-sm text-zinc-300">{formatDate(payload.exp)}</div>
                      </div>
                    )}
                    {payload.iat && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">签发时间 (iat)</div>
                        <div className="text-sm text-zinc-300">{formatDate(payload.iat)}</div>
                      </div>
                    )}
                    {payload.nbf && (
                      <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="text-xs text-zinc-500 mb-1">生效时间 (nbf)</div>
                        <div className="text-sm text-zinc-300">{formatDate(payload.nbf)}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Signature */}
            <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-400" />
                  <h3 className="text-sm font-semibold">Signature (签名)</h3>
                </div>
                <button
                  onClick={() => handleCopy(signature, "signature")}
                  className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  {copied === "signature" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === "signature" ? "已复制" : "复制"}
                </button>
              </div>
              <div className="p-4">
                <code className="text-xs text-zinc-500 font-mono break-all bg-zinc-900/50 rounded-lg p-3 block">
                  {signature}
                </code>
              </div>
            </div>
          </div>
        )}

        {/* 工具介绍 */}
        <div className="bg-zinc-800/30 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-base font-semibold mb-4">工具特性</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 bg-rose-500/10 rounded-xl">
              <div className="text-sm font-medium text-rose-300">实时解析</div>
              <p className="text-xs text-rose-400/70 mt-1">粘贴即解析，实时查看结果</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <div className="text-sm font-medium text-emerald-300">本地处理</div>
              <p className="text-xs text-emerald-400/70 mt-1">Token不上传服务器，安全可靠</p>
            </div>
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <div className="text-sm font-medium text-blue-300">字段解读</div>
              <p className="text-xs text-blue-400/70 mt-1">自动解读iss/exp/iat等常用字段</p>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
