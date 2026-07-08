"use client";

import { useState, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Copy, Check, Hash, Shield } from "lucide-react";

// MD5 implementation in pure JavaScript
function md5(string: string): string {
  function rotateLeft(value: number, shift: number): number {
    return (value << shift) | (value >>> (32 - shift));
  }

  function addUnsigned(x: number, y: number): number {
    const result = (x & 0x7fffffff) + (y & 0x7fffffff);
    if (x & 0x80000000) {
      if (y & 0x80000000) {
        return (result ^ 0x80000000 ^ 0x80000000) >>> 0;
      } else {
        return (result ^ 0x80000000) >>> 0;
      }
    } else {
      if (y & 0x80000000) {
        return (result ^ 0x80000000) >>> 0;
      } else {
        return result >>> 0;
      }
    }
  }

  function F(x: number, y: number, z: number): number {
    return (x & y) | (~x & z);
  }
  function G(x: number, y: number, z: number): number {
    return (x & z) | (y & ~z);
  }
  function H(x: number, y: number, z: number): number {
    return x ^ y ^ z;
  }
  function I(x: number, y: number, z: number): number {
    return y ^ (x | ~z);
  }

  function FF(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function GG(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function HH(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function II(
    a: number,
    b: number,
    c: number,
    d: number,
    x: number,
    s: number,
    ac: number
  ): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string): number[] {
    const wordCount = (((str.length + 8) - ((str.length + 8) % 64)) / 64 + 1) * 16;
    const wordArray: number[] = new Array(wordCount - 1).fill(0);
    let bytePosition = 0;
    let byteCount = 0;
    while (byteCount < str.length) {
      const wordArrayPosition = (byteCount - (byteCount % 4)) / 4;
      bytePosition = (byteCount % 4) * 8;
      wordArray[wordArrayPosition] =
        wordArray[wordArrayPosition] | (str.charCodeAt(byteCount) << bytePosition);
      byteCount++;
    }
    const wordArrayPosition = (byteCount - (byteCount % 4)) / 4;
    bytePosition = (byteCount % 4) * 8;
    wordArray[wordArrayPosition] =
      wordArray[wordArrayPosition] | (0x80 << bytePosition);
    wordArray[wordCount - 2] = str.length << 3;
    wordArray[wordCount - 1] = str.length >>> 29;
    return wordArray;
  }

  function wordToHex(value: number): string {
    let hex = "";
    for (let i = 0; i < 4; i++) {
      const byte = (value >>> (i * 8)) & 255;
      hex += ("0" + byte.toString(16)).slice(-2);
    }
    return hex;
  }

  // Handle UTF-8 encoding
  const utf8String = unescape(encodeURIComponent(string));
  const x = convertToWordArray(utf8String);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  const S11 = 7;
  const S12 = 12;
  const S13 = 17;
  const S14 = 22;
  const S21 = 5;
  const S22 = 9;
  const S23 = 14;
  const S24 = 20;
  const S31 = 4;
  const S32 = 11;
  const S33 = 16;
  const S34 = 23;
  const S41 = 6;
  const S42 = 10;
  const S43 = 15;
  const S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a;
    const BB = b;
    const CC = c;
    const DD = d;

    a = FF(a, b, c, d, x[k + 0], S11, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070db);
    b = FF(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4], S11, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6], S13, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10], S13, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5], S21, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13], S21, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5], S31, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1], S31, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3], S33, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881d05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xf4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = II(c, d, a, b, x[k + 14], S43, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10], S43, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6], S43, 0xa3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4], S41, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9], S44, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  const result = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  return result.toLowerCase();
}

// SHA hash using Web Crypto API
async function shaHash(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface HashAlgorithm {
  id: string;
  name: string;
  description: string;
  bits: number;
}

const ALGORITHMS: HashAlgorithm[] = [
  { id: "MD5", name: "MD5", description: "消息摘要算法", bits: 128 },
  { id: "SHA-1", name: "SHA-1", description: "安全哈希算法 1", bits: 160 },
  { id: "SHA-256", name: "SHA-256", description: "SHA-2 系列 256位", bits: 256 },
  { id: "SHA-384", name: "SHA-384", description: "SHA-2 系列 384位", bits: 384 },
  { id: "SHA-512", name: "SHA-512", description: "SHA-2 系列 512位", bits: 512 },
];

export default function HashGeneratorPage() {
  const [input, setInput] = useState("");
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([
    "MD5",
    "SHA-1",
    "SHA-256",
  ]);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [allCopied, setAllCopied] = useState(false);

  // Calculate hashes when input or selected algorithms change
  useEffect(() => {
    if (!input.trim()) {
      setHashes({});
      return;
    }

    const calculateHashes = async () => {
      const newHashes: Record<string, string> = {};

      for (const algo of selectedAlgorithms) {
        try {
          if (algo === "MD5") {
            newHashes[algo] = md5(input);
          } else {
            newHashes[algo] = await shaHash(input, algo);
          }
        } catch (e) {
          newHashes[algo] = "计算失败";
        }
      }

      setHashes(newHashes);
    };

    calculateHashes();
  }, [input, selectedAlgorithms]);

  const toggleAlgorithm = useCallback((algoId: string) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algoId)
        ? prev.filter((a) => a !== algoId)
        : [...prev, algoId]
    );
  }, []);

  const handleCopy = useCallback(async (algoId: string) => {
    const hash = hashes[algoId];
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedId(algoId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error("复制失败", e);
    }
  }, [hashes]);

  const handleCopyAll = useCallback(async () => {
    const selectedHashes = selectedAlgorithms
      .map((algo) => `${algo}: ${hashes[algo] || ""}`)
      .join("\n");
    if (!selectedHashes.trim()) return;
    try {
      await navigator.clipboard.writeText(selectedHashes);
      setAllCopied(true);
      setTimeout(() => setAllCopied(false), 2000);
    } catch (e) {
      console.error("复制失败", e);
    }
  }, [hashes, selectedAlgorithms]);

  const selectedActive = selectedAlgorithms.filter((a) => hashes[a]).length > 0;

  return (
    <ToolLayout
      title="哈希生成器"
      description="MD5、SHA-1、SHA-256等多种哈希算法，一键生成消息摘要"
      icon={Hash}
      category="开发工具"
      slug="hash-generator"
    >
      <div className="space-y-6">
        {/* Input section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                输入文本
              </label>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                {input.length} 字符
              </span>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此输入要计算哈希值的文本..."
              spellCheck={false}
              className="w-full h-36 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all code-editor"
            />
          </div>
        </div>

        {/* Algorithm selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  选择算法
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-500">
                已有{selectedAlgorithms.length} / {ALGORITHMS.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {ALGORITHMS.map((algo) => {
                const isSelected = selectedAlgorithms.includes(algo.id);
                return (
                  <button
                    key={algo.id}
                    onClick={() => toggleAlgorithm(algo.id)}
                    className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-zinc-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div
                      className={`absolute top-2 right-2 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-zinc-300 dark:border-zinc-600"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <Hash className="w-5 h-5 mb-1.5" />
                    <span className="text-sm font-semibold">{algo.name}</span>
                    <span className="text-xs opacity-70">{algo.bits}符</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Hash results */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                哈希结果
              </span>
              <button
                onClick={handleCopyAll}
                disabled={!selectedActive}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {allCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    已全部复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    复制全部
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {selectedAlgorithms.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-500">
                请选择至少一种哈希算法
              </div>
            ) : !input.trim() ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-500">
                请输入要计算哈希值的文本
              </div>
            ) : (
              selectedAlgorithms.map((algoId) => {
                const algo = ALGORITHMS.find((a) => a.id === algoId);
                const hash = hashes[algoId] || "";
                const isCopied = copiedId === algoId;

                return (
                  <div
                    key={algoId}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
                            {algo?.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {algo?.bits}位 · {hash.length} 字符
                          </span>
                        </div>
                        <code className="block text-sm font-mono text-slate-800 dark:text-slate-200 break-all bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                          {hash || (
                            <span className="text-slate-400 dark:text-slate-600">
                              计算中....
                            </span>
                          )}
                        </code>
                      </div>
                      <button
                        onClick={() => handleCopy(algoId)}
                        disabled={!hash}
                        className={`flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          isCopied
                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        title="复制哈希值"
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
        <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
          使用提示
        </h3>
        <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1.5">
          <li>
            • MD5 哈希值为 128 位，已不推荐用于安全场景，适合文件完整性校验
          </li>
          <li>
            • SHA-1 哈希值为 160 位，已被发现碰撞攻击，建议使用SHA-256 及以上
          </li>
          <li>
            • SHA-256 / SHA-384 / SHA-512 属于 SHA-2 系列，安全性更高，推荐用于密码存储等场景
          </li>
          <li>• 所有计算都在浏览器本地完成，您的数据不会上传到服务器</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
