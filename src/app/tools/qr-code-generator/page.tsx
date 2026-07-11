"use client";

import { useState, useRef, useEffect, useCallback, ChangeEvent } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  QrCode,
  Type as TypeIcon,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  Link2,
  Download,
  Copy,
  Check,
  Trash2,
  History,
  Upload,
  X,
  Palette,
  Image as ImageIcon,
  ScanLine,
  RotateCcw,
  ChevronDown,
  Square,
  Circle,
  Droplets,
  Layers,
  FileImage,
  Sparkles,
  ClipboardList,
} from "lucide-react";

// ============================================================
// ===== Types =====
// ============================================================

type QRType = "text" | "url" | "wifi" | "vcard" | "email" | "sms" | "phone";
type ECLevel = "L" | "M" | "Q" | "H";
type DotStyle = "square" | "rounded" | "dots";
type DownloadFormat = "png" | "svg" | "jpg";
type EncodingMode = "numeric" | "alphanumeric" | "byte";

interface HistoryItem {
  id: string;
  type: QRType;
  content: string;
  preview: string;
  date: string;
}

interface BatchResult {
  id: number;
  text: string;
  matrix: boolean[][];
  size: number;
  version: number;
  error?: string;
}

interface QRResult {
  matrix: boolean[][];
  size: number;
  version: number;
}

// ============================================================
// ===== QR Code Generation Core (Pure JS, no dependencies) =====
// ============================================================

// --- Galois Field GF(256) arithmetic for Reed-Solomon ---

const EXP_TABLE = new Uint8Array(512);
const LOG_TABLE = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    EXP_TABLE[i] = EXP_TABLE[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

// --- Reed-Solomon error correction ---

function rsGeneratorPoly(degree: number): number[] {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const newPoly = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      newPoly[j] ^= poly[j];
      newPoly[j + 1] ^= gfMul(poly[j], EXP_TABLE[i]);
    }
    poly = newPoly;
  }
  return poly;
}

function rsEncode(data: number[], ecLength: number): number[] {
  const generator = rsGeneratorPoly(ecLength);
  const buf = [...data, ...new Array(ecLength).fill(0)];
  for (let i = 0; i < data.length; i++) {
    const coef = buf[i];
    if (coef !== 0) {
      for (let j = 0; j < generator.length; j++) {
        buf[i + j] ^= gfMul(generator[j], coef);
      }
    }
  }
  return buf.slice(data.length);
}

// --- EC Block configuration table ---
// Format: [ecCodewordsPerBlock, group1Count, group1DataCw, group2Count, group2DataCw]
// Index: [version-1][ecIndex] where ecIndex: L=0, M=1, Q=2, H=3

type ECBlockEntry = readonly [number, number, number, number, number];

const EC_BLOCKS: ECBlockEntry[][] = [
  [[7,1,19,0,0],[10,1,16,0,0],[13,1,13,0,0],[17,1,9,0,0]],           // v1
  [[10,1,34,0,0],[16,1,28,0,0],[22,1,22,0,0],[28,1,16,0,0]],         // v2
  [[15,1,55,0,0],[26,1,44,0,0],[18,2,17,0,0],[22,2,13,0,0]],         // v3
  [[20,1,80,0,0],[18,2,32,0,0],[26,2,24,0,0],[16,4,9,0,0]],          // v4
  [[26,1,108,0,0],[24,2,43,0,0],[18,2,15,2,16],[22,2,11,2,12]],      // v5
  [[18,2,68,0,0],[16,4,27,0,0],[24,4,19,0,0],[28,4,15,0,0]],         // v6
  [[20,2,78,0,0],[18,4,31,0,0],[18,2,14,4,15],[26,4,13,1,14]],       // v7
  [[24,2,97,0,0],[22,2,38,2,39],[22,4,18,2,19],[26,4,14,2,15]],      // v8
  [[30,2,116,0,0],[22,3,36,2,37],[20,4,16,4,17],[24,4,12,4,13]],     // v9
  [[18,2,68,2,69],[26,4,43,1,44],[24,6,19,2,20],[28,6,15,2,16]],     // v10
  [[20,4,81,0,0],[30,1,50,4,51],[28,4,22,4,23],[24,3,12,8,13]],      // v11
  [[24,2,92,2,93],[22,6,36,2,37],[26,4,20,6,21],[28,7,14,4,15]],     // v12
  [[26,4,107,0,0],[22,8,37,1,38],[24,8,20,4,21],[22,12,11,4,12]],    // v13
  [[30,3,115,1,116],[24,4,40,5,41],[20,11,16,5,17],[24,11,12,5,13]], // v14
  [[22,5,87,1,88],[24,5,41,5,42],[30,5,24,7,25],[24,11,12,7,13]],    // v15
  [[24,5,98,1,99],[28,7,45,3,46],[24,15,19,2,20],[30,3,15,13,16]],   // v16
  [[28,1,107,5,108],[28,10,46,1,47],[28,1,22,15,23],[28,2,14,17,15]],// v17
  [[30,5,120,1,121],[26,9,43,4,44],[28,17,22,1,23],[28,2,14,19,15]], // v18
  [[28,3,113,4,114],[26,3,44,11,45],[26,17,21,4,22],[26,9,13,16,14]],// v19
  [[28,3,107,5,108],[26,3,41,13,42],[30,15,24,5,25],[28,15,15,10,16]],// v20
  [[28,4,116,4,117],[26,17,42,0,0],[28,17,22,6,23],[30,19,16,6,17]],  // v21
  [[28,2,111,7,112],[28,17,46,0,0],[30,7,24,16,25],[24,34,13,0,0]],   // v22
  [[30,4,121,5,122],[28,4,47,14,48],[30,11,24,14,25],[30,16,15,14,16]],// v23
  [[30,6,117,4,118],[28,6,45,14,46],[30,11,24,16,25],[30,30,16,2,17]],// v24
  [[26,8,106,4,107],[28,8,47,13,48],[30,7,24,22,25],[30,22,15,13,16]],// v25
  [[28,10,114,2,115],[28,19,46,4,47],[28,28,22,6,23],[30,33,16,4,17]],// v26
  [[30,8,122,4,123],[28,22,45,3,46],[30,8,23,26,24],[30,12,15,28,16]],// v27
  [[30,3,117,10,118],[28,3,45,23,46],[30,4,24,31,25],[30,11,15,31,16]],// v28
  [[30,7,116,7,117],[28,21,45,7,46],[30,1,23,37,24],[30,19,15,26,16]],// v29
  [[30,5,115,10,116],[28,19,47,10,48],[30,15,24,25,25],[30,23,15,25,16]],// v30
  [[30,13,115,3,116],[28,2,46,29,47],[30,42,24,1,25],[30,23,15,28,16]],// v31
  [[30,17,115,0,0],[28,10,46,23,47],[30,10,24,35,25],[30,19,15,35,16]],// v32
  [[30,17,115,1,116],[28,14,46,21,47],[30,29,24,19,25],[30,11,15,46,16]],// v33
  [[30,13,115,6,116],[28,14,46,23,47],[30,44,24,7,25],[30,59,16,1,17]],// v34
  [[30,12,121,7,122],[28,12,47,26,48],[30,39,24,14,25],[30,22,15,41,16]],// v35
  [[30,6,121,14,122],[28,6,47,34,48],[30,46,24,10,25],[30,2,15,64,16]],// v36
  [[30,17,122,4,123],[28,29,46,14,47],[30,49,24,10,25],[30,24,15,46,16]],// v37
  [[30,4,122,18,123],[28,13,46,32,47],[30,48,24,14,25],[30,42,15,32,16]],// v38
  [[30,20,117,4,118],[28,40,47,7,48],[30,43,24,22,25],[30,10,15,67,16]],// v39
  [[30,19,118,6,119],[28,18,47,31,48],[30,34,24,34,25],[30,20,15,61,16]],// v40
];

// --- Alignment pattern center positions for each version ---

const ALIGNMENT_PATTERNS: number[][] = [
  [],                  // v0 (unused)
  [],                  // v1
  [6, 18],             // v2
  [6, 22],             // v3
  [6, 26],             // v4
  [6, 30],             // v5
  [6, 34],             // v6
  [6, 22, 38],         // v7
  [6, 24, 42],         // v8
  [6, 26, 46],         // v9
  [6, 28, 50],         // v10
  [6, 30, 54],         // v11
  [6, 32, 58],         // v12
  [6, 34, 62],         // v13
  [6, 26, 46, 66],     // v14
  [6, 26, 48, 70],     // v15
  [6, 26, 50, 74],     // v16
  [6, 30, 54, 78],     // v17
  [6, 30, 56, 82],     // v18
  [6, 30, 58, 86],     // v19
  [6, 34, 62, 90],     // v20
  [6, 28, 50, 72, 94], // v21
  [6, 26, 50, 74, 98], // v22
  [6, 30, 54, 78, 102],// v23
  [6, 28, 54, 80, 106],// v24
  [6, 32, 58, 84, 110],// v25
  [6, 30, 58, 86, 114],// v26
  [6, 34, 62, 90, 118],// v27
  [6, 26, 50, 74, 98, 122],   // v28
  [6, 30, 54, 78, 102, 126],  // v29
  [6, 26, 52, 78, 104, 130],  // v30
  [6, 30, 56, 82, 108, 134],  // v31
  [6, 34, 60, 86, 112, 138],  // v32
  [6, 30, 58, 86, 114, 142],  // v33
  [6, 34, 62, 90, 118, 146],  // v34
  [6, 30, 54, 78, 102, 126, 150], // v35
  [6, 24, 50, 76, 102, 128, 154], // v36
  [6, 28, 54, 80, 106, 132, 158], // v37
  [6, 32, 58, 84, 110, 136, 162], // v38
  [6, 26, 54, 82, 110, 138, 166], // v39
  [6, 30, 58, 86, 114, 142, 170], // v40
];

// --- Pre-computed format info table ---
// Index: [ecLevelIndex][maskPattern], ecLevelIndex: L=0, M=1, Q=2, H=3

const FORMAT_INFO: number[][] = [
  [0x77c4, 0x72f3, 0x7daa, 0x789d, 0x662f, 0x6318, 0x6c41, 0x6976], // L
  [0x5412, 0x5125, 0x5e7c, 0x5b4b, 0x45f9, 0x40ce, 0x4f97, 0x4aa0], // M
  [0x355f, 0x3068, 0x3f31, 0x3a06, 0x24b4, 0x2183, 0x2eda, 0x2bed], // Q
  [0x1689, 0x13be, 0x1ce7, 0x19d0, 0x0762, 0x0255, 0x0d0c, 0x083b], // H
];

// --- Compute version info (BCH 18,6) for versions 7-40 ---

const VERSION_INFO: number[] = (() => {
  const result: number[] = [0, 0, 0, 0, 0, 0, 0]; // v0-v6: no version info
  for (let v = 7; v <= 40; v++) {
    let d = v << 12;
    const gen = 0x1f25;
    for (let i = 17; i >= 12; i--) {
      if ((d >> i) & 1) d ^= gen << (i - 12);
    }
    result.push((v << 12) | (d & 0xfff));
  }
  return result;
})();

// --- Alphanumeric character set ---

const ALPHANUMERIC_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
const ALPHANUMERIC_MAP: Record<string, number> = {};
for (let i = 0; i < ALPHANUMERIC_CHARS.length; i++) {
  ALPHANUMERIC_MAP[ALPHANUMERIC_CHARS[i]] = i;
}

// --- UTF-8 encoding ---

function utf8Encode(text: string): number[] {
  if (typeof TextEncoder !== "undefined") {
    return Array.from(new TextEncoder().encode(text));
  }
  const bytes: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 0x80) bytes.push(code);
    else if (code < 0x800) {
      bytes.push(0xc0 | (code >> 6));
      bytes.push(0x80 | (code & 0x3f));
    } else {
      bytes.push(0xe0 | (code >> 12));
      bytes.push(0x80 | ((code >> 6) & 0x3f));
      bytes.push(0x80 | (code & 0x3f));
    }
  }
  return bytes;
}

// --- Mode detection ---

function isNumeric(text: string): boolean {
  return /^[0-9]+$/.test(text);
}

function isAlphanumeric(text: string): boolean {
  for (const ch of text) {
    if (!(ch in ALPHANUMERIC_MAP)) return false;
  }
  return true;
}

function detectMode(text: string): EncodingMode {
  if (isNumeric(text)) return "numeric";
  if (isAlphanumeric(text)) return "alphanumeric";
  return "byte";
}

// --- Character count indicator bits ---

function getCharCountBits(mode: EncodingMode, version: number): number {
  if (version <= 9) {
    return mode === "numeric" ? 10 : mode === "alphanumeric" ? 9 : 8;
  }
  if (version <= 26) {
    return mode === "numeric" ? 12 : mode === "alphanumeric" ? 11 : 16;
  }
  return mode === "numeric" ? 14 : mode === "alphanumeric" ? 13 : 16;
}

// --- Data encoding to bit stream ---

function encodeNumeric(text: string): boolean[] {
  const bits: boolean[] = [];
  let i = 0;
  while (i < text.length) {
    const chunk = text.substring(i, i + 3);
    const n = parseInt(chunk, 10);
    const bitCount = chunk.length === 3 ? 10 : chunk.length === 2 ? 7 : 4;
    for (let b = bitCount - 1; b >= 0; b--) {
      bits.push(((n >> b) & 1) === 1);
    }
    i += 3;
  }
  return bits;
}

function encodeAlphanumeric(text: string): boolean[] {
  const bits: boolean[] = [];
  let i = 0;
  while (i < text.length) {
    if (i + 1 < text.length) {
      const val = ALPHANUMERIC_MAP[text[i]] * 45 + ALPHANUMERIC_MAP[text[i + 1]];
      for (let b = 10; b >= 0; b--) {
        bits.push(((val >> b) & 1) === 1);
      }
      i += 2;
    } else {
      const val = ALPHANUMERIC_MAP[text[i]];
      for (let b = 5; b >= 0; b--) {
        bits.push(((val >> b) & 1) === 1);
      }
      i += 1;
    }
  }
  return bits;
}

function encodeByte(bytes: number[]): boolean[] {
  const bits: boolean[] = [];
  for (const byte of bytes) {
    for (let b = 7; b >= 0; b--) {
      bits.push(((byte >> b) & 1) === 1);
    }
  }
  return bits;
}

// --- Get data codeword count for version/EC level ---

function getDataCodewords(version: number, ecIndex: number): number {
  const [, g1c, g1d, g2c, g2d] = EC_BLOCKS[version - 1][ecIndex];
  return g1c * g1d + g2c * g2d;
}

// --- Full data encoding: text -> codewords ---

function encodeData(text: string, ecLevel: ECLevel): { codewords: number[]; version: number } {
  const ecIndex: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
  const mode = detectMode(text);

  let encodedBits: boolean[];
  let charCount: number;
  if (mode === "numeric") {
    encodedBits = encodeNumeric(text);
    charCount = text.length;
  } else if (mode === "alphanumeric") {
    encodedBits = encodeAlphanumeric(text);
    charCount = text.length;
  } else {
    const bytes = utf8Encode(text);
    encodedBits = encodeByte(bytes);
    charCount = bytes.length;
  }

  const modeIndicator: Record<EncodingMode, number> = {
    numeric: 0b0001,
    alphanumeric: 0b0010,
    byte: 0b0100,
  };

  // Find smallest version that fits
  let version = 1;
  for (; version <= 40; version++) {
    const dataCw = getDataCodewords(version, ecIndex[ecLevel]);
    const ccBits = getCharCountBits(mode, version);
    const totalBits = 4 + ccBits + encodedBits.length;
    if (totalBits <= dataCw * 8) break;
  }
  if (version > 40) throw new Error("数据过长，无法生成二维码（最大支持 Version 40）");

  const dataCw = getDataCodewords(version, ecIndex[ecLevel]);
  const ccBits = getCharCountBits(mode, version);
  const maxBits = dataCw * 8;

  // Build final bit stream
  const bits: boolean[] = [];

  // Mode indicator (4 bits)
  for (let b = 3; b >= 0; b--) bits.push(((modeIndicator[mode] >> b) & 1) === 1);

  // Character count
  for (let b = ccBits - 1; b >= 0; b--) bits.push(((charCount >> b) & 1) === 1);

  // Encoded data
  bits.push(...encodedBits);

  // Terminator (up to 4 zero bits)
  const termLen = Math.min(4, maxBits - bits.length);
  for (let i = 0; i < termLen; i++) bits.push(false);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(false);

  // Convert to bytes
  const codewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] ? 1 : 0);
    codewords.push(byte);
  }

  // Add padding bytes
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (codewords.length < dataCw) {
    codewords.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  return { codewords, version };
}

// --- Interleave data and EC codewords ---

function interleaveCodewords(codewords: number[], version: number, ecLevel: ECLevel): number[] {
  const ecIndex: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
  const [ecPerBlock, g1c, g1d, g2c, g2d] = EC_BLOCKS[version - 1][ecIndex[ecLevel]];

  // Split data into blocks
  const dataBlocks: number[][] = [];
  let offset = 0;
  for (let i = 0; i < g1c; i++) {
    dataBlocks.push(codewords.slice(offset, offset + g1d));
    offset += g1d;
  }
  for (let i = 0; i < g2c; i++) {
    dataBlocks.push(codewords.slice(offset, offset + g2d));
    offset += g2d;
  }

  // Generate EC for each block
  const ecBlocks = dataBlocks.map((block) => rsEncode(block, ecPerBlock));

  // Interleave data
  const result: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      result.push(block[i]);
    }
  }

  return result;
}

// --- Convert codewords to bit array ---

function codewordsToBits(codewords: number[]): boolean[] {
  const bits: boolean[] = [];
  for (const cw of codewords) {
    for (let b = 7; b >= 0; b--) {
      bits.push(((cw >> b) & 1) === 1);
    }
  }
  return bits;
}

// --- Matrix construction helpers ---

function createMatrix(size: number): { matrix: boolean[][]; reserved: boolean[][] } {
  const matrix: boolean[][] = [];
  const reserved: boolean[][] = [];
  for (let i = 0; i < size; i++) {
    matrix.push(new Array(size).fill(false));
    reserved.push(new Array(size).fill(false));
  }
  return { matrix, reserved };
}

function placeFinderPattern(matrix: boolean[][], reserved: boolean[][], startRow: number, startCol: number) {
  for (let dr = -1; dr <= 7; dr++) {
    for (let dc = -1; dc <= 7; dc++) {
      const r = startRow + dr;
      const c = startCol + dc;
      if (r < 0 || c < 0 || r >= matrix.length || c >= matrix.length) continue;
      reserved[r][c] = true;
      if (dr === -1 || dr === 7 || dc === -1 || dc === 7) {
        matrix[r][c] = false; // Separator
      } else {
        const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const isCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        matrix[r][c] = isBorder || isCenter;
      }
    }
  }
}

function placeAlignmentPattern(matrix: boolean[][], reserved: boolean[][], centerRow: number, centerCol: number) {
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      const r = centerRow + dr;
      const c = centerCol + dc;
      reserved[r][c] = true;
      const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
      const isCenter = dr === 0 && dc === 0;
      matrix[r][c] = isBorder || isCenter;
    }
  }
}

function placeAlignmentPatterns(matrix: boolean[][], reserved: boolean[][], version: number) {
  const positions = ALIGNMENT_PATTERNS[version];
  if (!positions || positions.length === 0) return;
  const lastIdx = positions.length - 1;
  for (let i = 0; i < positions.length; i++) {
    for (let j = 0; j < positions.length; j++) {
      // Skip positions that overlap with finder patterns
      if (i === 0 && j === 0) continue; // Top-left
      if (i === 0 && j === lastIdx) continue; // Top-right
      if (i === lastIdx && j === 0) continue; // Bottom-left
      placeAlignmentPattern(matrix, reserved, positions[i], positions[j]);
    }
  }
}

function placeTimingPatterns(matrix: boolean[][], reserved: boolean[][], size: number) {
  for (let i = 8; i < size - 8; i++) {
    const isDark = i % 2 === 0;
    matrix[6][i] = isDark;
    reserved[6][i] = true;
    matrix[i][6] = isDark;
    reserved[i][6] = true;
  }
}

function reserveFormatInfo(reserved: boolean[][], size: number) {
  for (let i = 0; i <= 8; i++) {
    if (i !== 6) {
      reserved[8][i] = true;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    reserved[8][size - 1 - i] = true;
    reserved[size - 1 - i][8] = true;
  }
  reserved[size - 8][8] = true; // Dark module
}

function reserveVersionInfo(reserved: boolean[][], version: number, size: number) {
  if (version < 7) return;
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 3; c++) {
      reserved[r][size - 11 + c] = true;
    }
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      reserved[size - 11 + r][c] = true;
    }
  }
}

function placeDataBits(matrix: boolean[][], reserved: boolean[][], bits: boolean[], size: number) {
  let bitIndex = 0;
  let direction = -1; // -1 = up, 1 = down
  let col = size - 1;

  while (col > 0) {
    if (col === 6) col--;
    for (let i = 0; i < size; i++) {
      const row = direction === -1 ? size - 1 - i : i;
      for (let c = 0; c < 2; c++) {
        const x = col - c;
        if (!reserved[row][x]) {
          matrix[row][x] = bitIndex < bits.length ? bits[bitIndex] : false;
          bitIndex++;
        }
      }
    }
    direction = -direction;
    col -= 2;
  }
}

// --- Mask patterns ---

function shouldMask(row: number, col: number, pattern: number): boolean {
  switch (pattern) {
    case 0: return (row + col) % 2 === 0;
    case 1: return row % 2 === 0;
    case 2: return col % 3 === 0;
    case 3: return (row + col) % 3 === 0;
    case 4: return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5: return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6: return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7: return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default: return false;
  }
}

function applyMask(matrix: boolean[][], reserved: boolean[][], pattern: number, size: number) {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!reserved[row][col] && shouldMask(row, col, pattern)) {
        matrix[row][col] = !matrix[row][col];
      }
    }
  }
}

function copyMatrix(matrix: boolean[][]): boolean[][] {
  return matrix.map((row) => [...row]);
}

// --- Penalty calculation for mask selection ---

function calculatePenalty(matrix: boolean[][], size: number): number {
  let penalty = 0;

  // Rule 1: runs of 5+ same-color modules in rows/columns
  for (let i = 0; i < size; i++) {
    let rowRun = 1, colRun = 1;
    for (let j = 1; j < size; j++) {
      if (matrix[i][j] === matrix[i][j - 1]) rowRun++;
      else { if (rowRun >= 5) penalty += 3 + (rowRun - 5); rowRun = 1; }
      if (matrix[j][i] === matrix[j - 1][i]) colRun++;
      else { if (colRun >= 5) penalty += 3 + (colRun - 5); colRun = 1; }
    }
    if (rowRun >= 5) penalty += 3 + (rowRun - 5);
    if (colRun >= 5) penalty += 3 + (colRun - 5);
  }

  // Rule 2: 2x2 blocks of same color
  for (let i = 0; i < size - 1; i++) {
    for (let j = 0; j < size - 1; j++) {
      if (matrix[i][j] === matrix[i][j + 1] &&
          matrix[i][j] === matrix[i + 1][j] &&
          matrix[i][j] === matrix[i + 1][j + 1]) {
        penalty += 3;
      }
    }
  }

  // Rule 3: finder-like patterns
  const pattern1 = [true, false, true, true, true, false, true, false, false, false, false];
  const pattern2 = [false, false, false, false, true, false, true, true, true, false, true];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j <= size - 11; j++) {
      let m1 = true, m2 = true, m3 = true, m4 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[i][j + k] !== pattern1[k]) m1 = false;
        if (matrix[i][j + k] !== pattern2[k]) m2 = false;
        if (matrix[j + k][i] !== pattern1[k]) m3 = false;
        if (matrix[j + k][i] !== pattern2[k]) m4 = false;
      }
      if (m1) penalty += 40;
      if (m2) penalty += 40;
      if (m3) penalty += 40;
      if (m4) penalty += 40;
    }
  }

  // Rule 4: proportion of dark modules
  let darkCount = 0;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j]) darkCount++;
    }
  }
  const percent = (darkCount * 100) / (size * size);
  penalty += 10 * Math.floor(Math.abs(percent - 50) / 5);

  return penalty;
}

// --- Place format info ---

function placeFormatInfo(matrix: boolean[][], ecLevel: ECLevel, maskPattern: number, size: number) {
  const ecIndex: Record<ECLevel, number> = { L: 0, M: 1, Q: 2, H: 3 };
  const formatInfo = FORMAT_INFO[ecIndex[ecLevel]][maskPattern];

  // Location 1: around top-left finder
  const pos1: [number, number][] = [
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [7, 8], [8, 8],
    [8, 7], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
  ];
  for (let i = 0; i < 15; i++) {
    const bit = (formatInfo >> (14 - i)) & 1;
    matrix[pos1[i][0]][pos1[i][1]] = bit === 1;
  }

  // Location 2: split top-right and bottom-left
  const pos2: [number, number][] = [
    [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
    [size - 5, 8], [size - 6, 8], [size - 7, 8],
    [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
    [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1],
  ];
  for (let i = 0; i < 15; i++) {
    const bit = (formatInfo >> (14 - i)) & 1;
    matrix[pos2[i][0]][pos2[i][1]] = bit === 1;
  }

  // Dark module
  matrix[size - 8][8] = true;
}

// --- Place version info (v7+) ---

function placeVersionInfo(matrix: boolean[][], version: number, size: number) {
  if (version < 7) return;
  const vi = VERSION_INFO[version];
  for (let i = 0; i < 18; i++) {
    const bit = (vi >> i) & 1;
    // Block 1: top-right
    matrix[i % 6][size - 11 + Math.floor(i / 6)] = bit === 1;
    // Block 2: bottom-left
    matrix[size - 11 + Math.floor(i / 6)][i % 6] = bit === 1;
  }
}

// --- Main QR generation function ---

function generateQRMatrix(text: string, ecLevel: ECLevel): QRResult {
  if (!text) throw new Error("内容不能为空");

  const { codewords, version } = encodeData(text, ecLevel);
  const finalCodewords = interleaveCodewords(codewords, version, ecLevel);
  const bits = codewordsToBits(finalCodewords);

  const size = 17 + 4 * version;
  const { matrix, reserved } = createMatrix(size);

  // Place function patterns
  placeFinderPattern(matrix, reserved, 0, 0);
  placeFinderPattern(matrix, reserved, 0, size - 7);
  placeFinderPattern(matrix, reserved, size - 7, 0);
  placeAlignmentPatterns(matrix, reserved, version);
  placeTimingPatterns(matrix, reserved, size);
  reserveFormatInfo(reserved, size);
  reserveVersionInfo(reserved, version, size);

  // Place data
  placeDataBits(matrix, reserved, bits, size);

  // Find best mask
  let bestMask = 0;
  let bestPenalty = Infinity;
  for (let m = 0; m < 8; m++) {
    const masked = copyMatrix(matrix);
    applyMask(masked, reserved, m, size);
    const penalty = calculatePenalty(masked, size);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMask = m;
    }
  }

  // Apply best mask
  applyMask(matrix, reserved, bestMask, size);

  // Place format and version info
  placeFormatInfo(matrix, ecLevel, bestMask, size);
  placeVersionInfo(matrix, version, size);

  return { matrix, size, version };
}

// ============================================================
// ===== Drawing Functions =====
// ============================================================

interface DrawOptions {
  pixelSize: number;
  margin: number;
  fgColor: string;
  bgColor: string;
  useGradient: boolean;
  gradientFrom: string;
  gradientTo: string;
  dotStyle: DotStyle;
  logo: HTMLImageElement | null;
  logoSizeRatio: number;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

function drawQRCanvas(
  canvas: HTMLCanvasElement,
  matrix: boolean[][],
  qrSize: number,
  options: DrawOptions
) {
  const { pixelSize, margin, fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle, logo, logoSizeRatio } = options;
  const totalSize = (qrSize + margin * 2) * pixelSize;

  canvas.width = totalSize;
  canvas.height = totalSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, totalSize, totalSize);

  // Foreground fill style
  let fillStyle: string | CanvasGradient = fgColor;
  if (useGradient) {
    const grad = ctx.createLinearGradient(0, 0, totalSize, totalSize);
    grad.addColorStop(0, gradientFrom);
    grad.addColorStop(1, gradientTo);
    fillStyle = grad;
  }
  ctx.fillStyle = fillStyle;

  // Draw modules
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * pixelSize;
        const y = (row + margin) * pixelSize;
        if (dotStyle === "square") {
          ctx.fillRect(x, y, pixelSize, pixelSize);
        } else if (dotStyle === "rounded") {
          drawRoundedRect(ctx, x, y, pixelSize, pixelSize, pixelSize * 0.3);
        } else if (dotStyle === "dots") {
          ctx.beginPath();
          ctx.arc(x + pixelSize / 2, y + pixelSize / 2, pixelSize * 0.42, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Draw logo
  if (logo) {
    const logoSize = totalSize * logoSizeRatio;
    const logoX = (totalSize - logoSize) / 2;
    const logoY = (totalSize - logoSize) / 2;
    const padding = logoSize * 0.08;

    // White background for logo
    ctx.fillStyle = bgColor;
    ctx.fillRect(logoX - padding, logoY - padding, logoSize + padding * 2, logoSize + padding * 2);

    ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  }
}

function generateQRSVG(
  matrix: boolean[][],
  qrSize: number,
  options: DrawOptions
): string {
  const { pixelSize, margin, fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle, logo, logoSizeRatio } = options;
  const totalSize = (qrSize + margin * 2) * pixelSize;
  const fill = useGradient ? "url(#qrGradient)" : fgColor;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}">`;

  if (useGradient) {
    svg += `<defs><linearGradient id="qrGradient" x1="0%" y1="0%" x2="100%" y2="100%">`;
    svg += `<stop offset="0%" stop-color="${gradientFrom}"/>`;
    svg += `<stop offset="100%" stop-color="${gradientTo}"/>`;
    svg += `</linearGradient></defs>`;
  }

  // Background
  svg += `<rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>`;

  // Draw modules
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (matrix[row][col]) {
        const x = (col + margin) * pixelSize;
        const y = (row + margin) * pixelSize;
        if (dotStyle === "square") {
          svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="${fill}"/>`;
        } else if (dotStyle === "rounded") {
          svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" rx="${pixelSize * 0.3}" fill="${fill}"/>`;
        } else if (dotStyle === "dots") {
          svg += `<circle cx="${x + pixelSize / 2}" cy="${y + pixelSize / 2}" r="${pixelSize * 0.42}" fill="${fill}"/>`;
        }
      }
    }
  }

  // Logo
  if (logo && logo.src) {
    const logoSize = totalSize * logoSizeRatio;
    const logoX = (totalSize - logoSize) / 2;
    const logoY = (totalSize - logoSize) / 2;
    const padding = logoSize * 0.08;
    svg += `<rect x="${logoX - padding}" y="${logoY - padding}" width="${logoSize + padding * 2}" height="${logoSize + padding * 2}" fill="${bgColor}"/>`;
    svg += `<image x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" href="${logo.src}" preserveAspectRatio="xMidYMid meet"/>`;
  }

  svg += `</svg>`;
  return svg;
}

// ============================================================
// ===== Content Formatting =====
// ============================================================

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, "\\$1");
}

function formatWifiContent(ssid: string, password: string, encryption: string, hidden: boolean): string {
  const t = encryption === "nopass" ? "nopass" : encryption;
  let result = `WIFI:T:${t};S:${escapeWifiValue(ssid)};`;
  if (encryption !== "nopass" && password) {
    result += `P:${escapeWifiValue(password)};`;
  }
  if (hidden) result += `H:true;`;
  result += `;`;
  return result;
}

function formatVCardContent(data: {
  name: string; phone: string; email: string; org: string; title: string; url: string; address: string;
}): string {
  let vcard = "BEGIN:VCARD\nVERSION:3.0\n";
  if (data.name) vcard += `FN:${data.name}\nN:${data.name};;;;\n`;
  if (data.phone) vcard += `TEL;TYPE=CELL:${data.phone}\n`;
  if (data.email) vcard += `EMAIL:${data.email}\n`;
  if (data.org) vcard += `ORG:${data.org}\n`;
  if (data.title) vcard += `TITLE:${data.title}\n`;
  if (data.url) vcard += `URL:${data.url}\n`;
  if (data.address) vcard += `ADR:;;${data.address};;;;\n`;
  vcard += "END:VCARD";
  return vcard;
}

function formatEmailContent(to: string, subject: string, body: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${to}${query}`;
}

function formatSmsContent(phone: string, message: string): string {
  if (message) return `SMSTO:${phone}:${message}`;
  return `sms:${phone}`;
}

function formatPhoneContent(phone: string): string {
  return `tel:${phone}`;
}

function formatUrlContent(url: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

// ============================================================
// ===== Constants =====
// ============================================================

const QR_TYPES: { type: QRType; label: string; icon: typeof QrCode }[] = [
  { type: "text", label: "文本", icon: TypeIcon },
  { type: "url", label: "网址", icon: Link2 },
  { type: "wifi", label: "WiFi", icon: Wifi },
  { type: "vcard", label: "名片", icon: Contact },
  { type: "email", label: "邮件", icon: Mail },
  { type: "sms", label: "短信", icon: MessageSquare },
  { type: "phone", label: "电话", icon: Phone },
];

const EC_LEVELS: { level: ECLevel; label: string; desc: string }[] = [
  { level: "L", label: "L", desc: "7% 容错" },
  { level: "M", label: "M", desc: "15% 容错" },
  { level: "Q", label: "Q", desc: "25% 容错" },
  { level: "H", label: "H", desc: "30% 容错" },
];

const SIZE_PRESETS = [128, 256, 384, 512, 768, 1024];

const DOT_STYLES: { style: DotStyle; label: string; icon: typeof Square }[] = [
  { style: "square", label: "直角", icon: Square },
  { style: "rounded", label: "圆角", icon: Circle },
  { style: "dots", label: "圆点", icon: Circle },
];

const HISTORY_KEY = "qr-generator-history";
const SETTINGS_KEY = "qr-generator-settings";
const MAX_HISTORY = 20;

// ============================================================
// ===== React Component =====
// ============================================================

export default function QRCodeGeneratorPage() {
  // --- QR type ---
  const [qrType, setQrType] = useState<QRType>("text");

  // --- Input data ---
  const [text, setText] = useState("https://99gongju.online");
  const [url, setUrl] = useState("");
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA", hidden: false });
  const [vcardData, setVcardData] = useState({ name: "", phone: "", email: "", org: "", title: "", url: "", address: "" });
  const [emailData, setEmailData] = useState({ to: "", subject: "", body: "" });
  const [smsData, setSmsData] = useState({ phone: "", message: "" });
  const [phone, setPhone] = useState("");

  // --- Style settings ---
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [useGradient, setUseGradient] = useState(false);
  const [gradientFrom, setGradientFrom] = useState("#667eea");
  const [gradientTo, setGradientTo] = useState("#764ba2");
  const [dotStyle, setDotStyle] = useState<DotStyle>("square");

  // --- Logo ---
  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string>("");

  // --- Size & EC ---
  const [outputSize, setOutputSize] = useState(256);
  const [customSize, setCustomSize] = useState(256);
  const [useCustomSize, setUseCustomSize] = useState(false);
  const [ecLevel, setEcLevel] = useState<ECLevel>("M");

  // --- History ---
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- Batch mode ---
  const [batchMode, setBatchMode] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [batchResults, setBatchResults] = useState<BatchResult[]>([]);

  // --- UI state ---
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);

  // --- QR result ---
  const [qrResult, setQrResult] = useState<QRResult | null>(null);

  // --- Refs ---
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const batchCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // --- Final output size ---
  const finalSize = useCustomSize ? customSize : outputSize;

  // --- Load settings from localStorage on mount ---
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const s = JSON.parse(savedSettings);
        if (s.fgColor) setFgColor(s.fgColor);
        if (s.bgColor) setBgColor(s.bgColor);
        if (s.useGradient !== undefined) setUseGradient(s.useGradient);
        if (s.gradientFrom) setGradientFrom(s.gradientFrom);
        if (s.gradientTo) setGradientTo(s.gradientTo);
        if (s.dotStyle) setDotStyle(s.dotStyle);
        if (s.outputSize) setOutputSize(s.outputSize);
        if (s.ecLevel) setEcLevel(s.ecLevel);
        if (s.useCustomSize !== undefined) setUseCustomSize(s.useCustomSize);
        if (s.customSize) setCustomSize(s.customSize);
      }
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch {
      // ignore
    }
  }, []);

  // --- Save settings to localStorage ---
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle,
        outputSize, ecLevel, useCustomSize, customSize,
      }));
    } catch {
      // ignore
    }
  }, [fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle, outputSize, ecLevel, useCustomSize, customSize]);

  // --- Get QR content based on type ---
  const getContent = useCallback((): string => {
    switch (qrType) {
      case "text": return text;
      case "url": return formatUrlContent(url);
      case "wifi": return wifiData.ssid ? formatWifiContent(wifiData.ssid, wifiData.password, wifiData.encryption, wifiData.hidden) : "";
      case "vcard": return vcardData.name || vcardData.phone ? formatVCardContent(vcardData) : "";
      case "email": return emailData.to ? formatEmailContent(emailData.to, emailData.subject, emailData.body) : "";
      case "sms": return smsData.phone ? formatSmsContent(smsData.phone, smsData.message) : "";
      case "phone": return phone ? formatPhoneContent(phone) : "";
      default: return "";
    }
  }, [qrType, text, url, wifiData, vcardData, emailData, smsData, phone]);

  // --- Generate QR matrix ---
  useEffect(() => {
    const content = getContent();
    if (!content) {
      setQrResult(null);
      setQrError(null);
      return;
    }
    try {
      const result = generateQRMatrix(content, ecLevel);
      setQrResult(result);
      setQrError(null);
    } catch (e) {
      setQrResult(null);
      setQrError(e instanceof Error ? e.message : "生成失败");
    }
  }, [getContent, ecLevel]);

  // --- Draw QR on canvas ---
  useEffect(() => {
    if (!qrResult || !canvasRef.current) return;

    const pixelSize = Math.max(1, Math.floor(finalSize / (qrResult.size + 8)));
    drawQRCanvas(canvasRef.current, qrResult.matrix, qrResult.size, {
      pixelSize,
      margin: 4,
      fgColor,
      bgColor,
      useGradient,
      gradientFrom,
      gradientTo,
      dotStyle,
      logo,
      logoSizeRatio: 0.2,
    });
  }, [qrResult, finalSize, fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle, logo]);

  // --- Save to history (debounced) ---
  useEffect(() => {
    if (!qrResult || !getContent()) return;
    const timer = setTimeout(() => {
      const content = getContent();
      const item: HistoryItem = {
        id: Date.now().toString(),
        type: qrType,
        content,
        preview: content.length > 60 ? content.substring(0, 60) + "..." : content,
        date: new Date().toLocaleString("zh-CN"),
      };
      const filtered = history.filter((h) => h.content !== content);
      const newHistory = [item, ...filtered].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      } catch {
        // ignore
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [qrResult, getContent, qrType, history]);

  // --- Get draw options ---
  const getDrawOptions = useCallback((size: number): DrawOptions => {
    const ps = qrResult ? Math.max(1, Math.floor(size / (qrResult.size + 8))) : 4;
    return {
      pixelSize: ps, margin: 4, fgColor, bgColor,
      useGradient, gradientFrom, gradientTo, dotStyle,
      logo, logoSizeRatio: 0.2,
    };
  }, [qrResult, fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle, logo]);

  // --- Download handler ---
  const handleDownload = useCallback((format: DownloadFormat) => {
    if (!qrResult) return;
    const opts = getDrawOptions(finalSize);
    if (format === "svg") {
      const svg = generateQRSVG(qrResult.matrix, qrResult.size, opts);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      drawQRCanvas(canvas, qrResult.matrix, qrResult.size, opts);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qrcode-${Date.now()}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }, mime, 0.92);
    }
  }, [qrResult, finalSize, getDrawOptions]);

  // --- Copy to clipboard ---
  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvasRef.current!.toBlob((b) => resolve(b), "image/png");
      });
      if (!blob) return;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: copy text content
      try {
        await navigator.clipboard.writeText(getContent());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // ignore
      }
    }
  }, [getContent]);

  // --- Logo upload ---
  const handleLogoUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => setLogo(img);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    setLogoName(file.name);
  }, []);

  const handleRemoveLogo = useCallback(() => {
    setLogo(null);
    setLogoName("");
    if (logoInputRef.current) logoInputRef.current.value = "";
  }, []);

  // --- History handlers ---
  const handleHistoryLoad = useCallback((item: HistoryItem) => {
    setQrType(item.type);
    switch (item.type) {
      case "text": setText(item.content); break;
      case "url": setUrl(item.content.replace(/^https?:\/\//i, "")); break;
      case "phone": setPhone(item.content.replace(/^tel:/, "")); break;
      case "email": {
        const m = item.content.match(/^mailto:([^?]+)/);
        if (m) setEmailData((p) => ({ ...p, to: m![1] }));
        break;
      }
      default:
        setText(item.content);
        break;
    }
  }, []);

  const handleHistoryClear = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch { /* ignore */ }
  }, []);

  const handleHistoryDelete = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // --- Scan test ---
  const handleScanTest = useCallback(async () => {
    if (!canvasRef.current) return;
    setScanResult(null);
    try {
      // @ts-ignore
      if (typeof BarcodeDetector !== "undefined") {
        // @ts-ignore
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        const results = await detector.detect(canvasRef.current);
        if (results.length > 0) {
          setScanResult(`扫描成功: ${results[0].rawValue}`);
        } else {
          setScanResult("未检测到二维码内容，请用手机扫描验证");
        }
      } else {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        const win = window.open();
        if (win) {
          win.document.write(`<html><head><title>QR扫描测试</title></head><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#1a1a2e;"><img src="${dataUrl}" style="max-width:400px;border:10px solid #fff;border-radius:8px;"/><p style="color:#fff;margin-top:16px;font-family:sans-serif;">请使用手机扫描上方二维码验证</p></body></html>`);
          win.document.close();
        }
        setScanResult("浏览器不支持自动扫描，已在新窗口打开二维码供手机扫描");
      }
    } catch {
      setScanResult("扫描测试失败，请用手机直接扫描二维码");
    }
  }, []);

  // --- Batch generation ---
  const handleBatchGenerate = useCallback(() => {
    const lines = batchText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return;
    const results: BatchResult[] = lines.map((line, idx) => {
      try {
        const r = generateQRMatrix(line, ecLevel);
        return { id: idx, text: line, matrix: r.matrix, size: r.size, version: r.version };
      } catch {
        return { id: idx, text: line, matrix: [], size: 0, version: 0, error: "生成失败" };
      }
    });
    setBatchResults(results);
  }, [batchText, ecLevel]);

  // --- Download batch QR ---
  const handleBatchDownload = useCallback((result: BatchResult, format: DownloadFormat) => {
    if (!result.matrix.length) return;
    const size = 256;
    const ps = Math.max(1, Math.floor(size / (result.size + 8)));
    const opts: DrawOptions = {
      pixelSize: ps, margin: 4, fgColor, bgColor,
      useGradient, gradientFrom, gradientTo, dotStyle,
      logo: null, logoSizeRatio: 0.2,
    };
    if (format === "svg") {
      const svg = generateQRSVG(result.matrix, result.size, opts);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-batch-${result.id + 1}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      drawQRCanvas(canvas, result.matrix, result.size, opts);
      const mime = format === "png" ? "image/png" : "image/jpeg";
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `qr-batch-${result.id + 1}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }, mime, 0.92);
    }
  }, [fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle]);

  // --- Draw batch QR canvases ---
  useEffect(() => {
    if (batchResults.length === 0) return;
    batchResults.forEach((result) => {
      if (result.error || !result.matrix.length) return;
      const canvas = batchCanvasRefs.current.get(result.id);
      if (!canvas) return;
      const size = 200;
      const ps = Math.max(1, Math.floor(size / (result.size + 8)));
      drawQRCanvas(canvas, result.matrix, result.size, {
        pixelSize: ps, margin: 4, fgColor, bgColor,
        useGradient, gradientFrom, gradientTo, dotStyle,
        logo: null, logoSizeRatio: 0.2,
      });
    });
  }, [batchResults, fgColor, bgColor, useGradient, gradientFrom, gradientTo, dotStyle]);

  const contentPreview = getContent();
  const typeLabel = QR_TYPES.find((t) => t.type === qrType)?.label || "";

  // --- Input component for a text field ---
  const inputClass = "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <ToolLayout
      title="二维码生成器 Pro"
      description="支持多种类型的二维码生成，自定义样式、Logo嵌入、批量生成、历史记录等高级功能"
      toolId="qr-code-generator"
      icon={QrCode}
      category="生成工具"
      slug="qr-code-generator"
    >
      <div className="max-w-6xl mx-auto">
        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setBatchMode(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${!batchMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Sparkles className="w-4 h-4 inline mr-1.5" />
            单个生成
          </button>
          <button
            onClick={() => setBatchMode(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${batchMode ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
          >
            <Layers className="w-4 h-4 inline mr-1.5" />
            批量生成
          </button>
        </div>

        {!batchMode ? (
          /* ===== Single QR Mode ===== */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ===== Left Column: Input & Settings ===== */}
            <div className="space-y-4">
              {/* Type Selector */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <label className={labelClass}>二维码类型</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {QR_TYPES.map(({ type, label, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setQrType(type)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                        qrType === type
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                          : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type-specific Input */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <label className={labelClass}>
                  {typeLabel}内容
                </label>

                {qrType === "text" && (
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="输入要生成二维码的文本内容..."
                    rows={4}
                    className={inputClass + " resize-none"}
                  />
                )}

                {qrType === "url" && (
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="example.com 或 https://example.com"
                    className={inputClass}
                  />
                )}

                {qrType === "wifi" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">WiFi名称 (SSID)</label>
                      <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} placeholder="MyWiFi" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">密码</label>
                      <input type="text" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} placeholder="password123" className={inputClass} />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">加密方式</label>
                        <select value={wifiData.encryption} onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })} className={inputClass}>
                          <option value="WPA">WPA/WPA2</option>
                          <option value="WEP">WEP</option>
                          <option value="nopass">无密码</option>
                        </select>
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                          <input type="checkbox" checked={wifiData.hidden} onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                          隐藏网络
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {qrType === "vcard" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">姓名</label>
                        <input type="text" value={vcardData.name} onChange={(e) => setVcardData({ ...vcardData, name: e.target.value })} placeholder="张三" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">电话</label>
                        <input type="tel" value={vcardData.phone} onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })} placeholder="13800138000" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">邮箱</label>
                        <input type="email" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} placeholder="email@example.com" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">公司</label>
                        <input type="text" value={vcardData.org} onChange={(e) => setVcardData({ ...vcardData, org: e.target.value })} placeholder="公司名称" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">职位</label>
                        <input type="text" value={vcardData.title} onChange={(e) => setVcardData({ ...vcardData, title: e.target.value })} placeholder="产品经理" className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">网址</label>
                        <input type="text" value={vcardData.url} onChange={(e) => setVcardData({ ...vcardData, url: e.target.value })} placeholder="example.com" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">地址</label>
                      <input type="text" value={vcardData.address} onChange={(e) => setVcardData({ ...vcardData, address: e.target.value })} placeholder="详细地址" className={inputClass} />
                    </div>
                  </div>
                )}

                {qrType === "email" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">收件人</label>
                      <input type="email" value={emailData.to} onChange={(e) => setEmailData({ ...emailData, to: e.target.value })} placeholder="recipient@example.com" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">主题</label>
                      <input type="text" value={emailData.subject} onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })} placeholder="邮件主题" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">正文</label>
                      <textarea value={emailData.body} onChange={(e) => setEmailData({ ...emailData, body: e.target.value })} placeholder="邮件内容..." rows={3} className={inputClass + " resize-none"} />
                    </div>
                  </div>
                )}

                {qrType === "sms" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">手机号</label>
                      <input type="tel" value={smsData.phone} onChange={(e) => setSmsData({ ...smsData, phone: e.target.value })} placeholder="13800138000" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">短信内容</label>
                      <textarea value={smsData.message} onChange={(e) => setSmsData({ ...smsData, message: e.target.value })} placeholder="短信内容..." rows={3} className={inputClass + " resize-none"} />
                    </div>
                  </div>
                )}

                {qrType === "phone" && (
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="13800138000" className={inputClass} />
                )}

                {/* Content preview */}
                {contentPreview && (
                  <div className="mt-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">编码内容预览:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 break-all font-mono">{contentPreview.length > 120 ? contentPreview.substring(0, 120) + "..." : contentPreview}</p>
                  </div>
                )}
              </div>

              {/* Style Settings */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Palette className="w-4 h-4 inline mr-1.5" />
                    样式设置
                  </label>
                  <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
                    {showAdvanced ? "收起" : "展开"}高级选项
                    <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">前景色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                      <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className={inputClass + " flex-1 font-mono text-xs"} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">背景色</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                      <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className={inputClass + " flex-1 font-mono text-xs"} />
                    </div>
                  </div>
                </div>

                {/* Gradient */}
                <div className="mb-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer mb-2">
                    <input type="checkbox" checked={useGradient} onChange={(e) => setUseGradient(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <Droplets className="w-4 h-4" />
                    启用渐变色
                  </label>
                  {useGradient && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">起始色</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                          <input type="text" value={gradientFrom} onChange={(e) => setGradientFrom(e.target.value)} className={inputClass + " flex-1 font-mono text-xs"} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">结束色</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={gradientTo} onChange={(e) => setGradientTo(e.target.value)} className="w-10 h-9 rounded cursor-pointer border border-gray-200 dark:border-gray-700" />
                          <input type="text" value={gradientTo} onChange={(e) => setGradientTo(e.target.value)} className={inputClass + " flex-1 font-mono text-xs"} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dot Style */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">点阵样式</label>
                  <div className="grid grid-cols-3 gap-2">
                    {DOT_STYLES.map(({ style, label, icon: Icon }) => (
                      <button
                        key={style}
                        onClick={() => setDotStyle(style)}
                        className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          dotStyle === style
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Logo嵌入</label>
                  <div className="flex items-center gap-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      {logoName ? logoName : "上传Logo"}
                    </button>
                    {logo && (
                      <button onClick={handleRemoveLogo} className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    {/* Size */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">输出尺寸</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {SIZE_PRESETS.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setOutputSize(s); setUseCustomSize(false); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              !useCustomSize && outputSize === s
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            {s}px
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={useCustomSize}
                          onChange={(e) => setUseCustomSize(e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <input
                          type="number"
                          value={customSize}
                          onChange={(e) => { setCustomSize(Math.max(64, Math.min(2048, parseInt(e.target.value) || 256))); setUseCustomSize(true); }}
                          min={64}
                          max={2048}
                          className={inputClass + " w-32"}
                        />
                        <span className="text-xs text-gray-500">px (64-2048)</span>
                      </div>
                    </div>

                    {/* Error Correction */}
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">容错等级</label>
                      <div className="grid grid-cols-4 gap-2">
                        {EC_LEVELS.map(({ level, label, desc }) => (
                          <button
                            key={level}
                            onClick={() => setEcLevel(level)}
                            title={desc}
                            className={`flex flex-col items-center py-2 rounded-lg text-xs font-medium transition-all ${
                              ecLevel === level
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <span className="font-bold">{label}</span>
                            <span className="text-[10px] opacity-75">{desc.split(" ")[0]}</span>
                          </button>
                        ))}
                      </div>
                      {logo && ecLevel !== "H" && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          嵌入Logo建议使用 H 级容错以保证可扫描性
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ===== Right Column: Preview & Actions ===== */}
            <div className="space-y-4">
              {/* QR Preview */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">实时预览</h3>
                  {qrResult && (
                    <span className="text-xs px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                      Version {qrResult.version} / {qrResult.size}x{qrResult.size}
                    </span>
                  )}
                </div>

                {/* Canvas */}
                <div className="flex justify-center items-center min-h-[280px]">
                  {qrError ? (
                    <div className="text-center">
                      <p className="text-sm text-red-500 dark:text-red-400">{qrError}</p>
                    </div>
                  ) : qrResult ? (
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        className="rounded-lg shadow-sm"
                        style={{ maxWidth: "100%", height: "auto", imageRendering: "pixelated" }}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 dark:text-gray-600">
                      <QrCode className="w-16 h-16 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">输入内容后自动生成</p>
                    </div>
                  )}
                </div>

                {/* Download buttons */}
                {qrResult && (
                  <div className="mt-4 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDownload("png")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/30"
                      >
                        <Download className="w-4 h-4" />
                        PNG
                      </button>
                      <button
                        onClick={() => handleDownload("svg")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        <FileImage className="w-4 h-4" />
                        SVG
                      </button>
                      <button
                        onClick={() => handleDownload("jpg")}
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                      >
                        <ImageIcon className="w-4 h-4" />
                        JPG
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copied ? "已复制" : "复制图片"}
                      </button>
                      <button
                        onClick={handleScanTest}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <ScanLine className="w-4 h-4" />
                        扫描测试
                      </button>
                    </div>

                    {scanResult && (
                      <div className={`px-3 py-2 rounded-lg text-xs ${scanResult.startsWith("扫描成功") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"}`}>
                        {scanResult}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* History */}
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <History className="w-4 h-4" />
                    历史记录
                    {history.length > 0 && <span className="text-xs text-gray-400">({history.length})</span>}
                  </h3>
                  {history.length > 0 && (
                    <button onClick={handleHistoryClear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      清空
                    </button>
                  )}
                </div>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">暂无历史记录</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {history.map((item) => {
                      const histType = QR_TYPES.find((t) => t.type === item.type);
                      const HistIcon = histType?.icon;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                        >
                          {HistIcon && <HistIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleHistoryLoad(item)}>
                            <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{item.preview}</p>
                            <p className="text-[10px] text-gray-400">{histType?.label} / {item.date}</p>
                          </div>
                          <button
                            onClick={() => handleHistoryDelete(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ===== Batch Mode ===== */
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
              <label className={labelClass}>
                <Layers className="w-4 h-4 inline mr-1.5" />
                批量生成（每行一个二维码）
              </label>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={"每行输入一个内容，例如：\nhttps://example.com\nhttps://example.org\nHello World\n电话：13800138000"}
                rows={8}
                className={inputClass + " resize-none font-mono text-sm"}
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {batchText.split("\n").filter((l) => l.trim()).length} 行有效内容
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setBatchText(""); setBatchResults([]); }}
                    className="px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <RotateCcw className="w-4 h-4 inline mr-1" />
                    清空
                  </button>
                  <button
                    onClick={handleBatchGenerate}
                    disabled={!batchText.trim()}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-indigo-600/30"
                  >
                    <Sparkles className="w-4 h-4 inline mr-1" />
                    批量生成
                  </button>
                </div>
              </div>
            </div>

            {batchResults.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4" />
                  生成结果 ({batchResults.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {batchResults.map((result) => (
                    <div key={result.id} className="flex flex-col items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      {result.error ? (
                        <div className="w-[200px] h-[200px] flex items-center justify-center text-xs text-red-500">
                          {result.error}
                        </div>
                      ) : (
                        <>
                          <canvas
                            ref={(el) => {
                              if (el) batchCanvasRefs.current.set(result.id, el);
                            }}
                            className="rounded-lg"
                            style={{ maxWidth: "100%", height: "auto" }}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center" title={result.text}>
                            {result.text.length > 20 ? result.text.substring(0, 20) + "..." : result.text}
                          </p>
                          <div className="flex gap-1">
                            <button onClick={() => handleBatchDownload(result, "png")} className="p-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-all" title="下载PNG">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleBatchDownload(result, "svg")} className="p-1.5 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all" title="下载SVG">
                              <FileImage className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}