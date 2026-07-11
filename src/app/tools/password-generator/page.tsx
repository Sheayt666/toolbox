"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  Eye,
  EyeOff,
  RotateCw,
  Sun,
  Moon,
  History,
  Trash2,
  Layers,
  Sparkles,
  Type,
  Mic,
  Shuffle,
  Clock,
  Lock,
  Wifi,
  Landmark,
  Globe,
  BookOpen,
  Plus,
  Minus,
  Zap,
  type LucideIcon,
} from "lucide-react";

/* ============================================================
 * 常量
 * ========================================================== */
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const CONFUSING = "Il1O0o";
const CONSONANTS = "bcdfghjklmnpqrstvwxz";
const VOWELS = "aeiou";

/** 用于密码短语的常用英文单词列表（约 500 个，3-7 字母为主） */
const WORD_LIST: string[] = [
  "apple","arrow","badge","baker","ball","beach","beam","bear","beat","bell","belt","bend","bird","bite","blank",
  "blast","blend","blind","block","blood","bloom","blue","board","boat","body","bold","bolt","bone","book","boost",
  "boot","border","born","both","bottle","bottom","bowl","branch","brave","brick","bride","brief","bring","broad",
  "brook","broom","brown","brush","bubble","bucket","buddy","budget","buffalo","bug","bulb","bulk","bull","bunch",
  "bundle","burn","burst","bush","busy","butter","button","cabin","cable","cake","calm","camp","candy","canyon",
  "cap","captain","car","card","care","cargo","carpet","carry","cart","carve","case","cash","castle","catch",
  "cave","cedar","chain","chair","chalk","champ","chant","chaos","charm","chart","chase","cheap","check","cheer",
  "cheese","chef","chest","chick","chief","child","chili","chill","chip","chord","chunk","city","civic","claim",
  "clap","claw","clay","clean","clear","clerk","click","cliff","climb","clock","close","cloth","cloud","clown",
  "club","clutch","coach","coast","coat","code","coffee","coil","coin","cold","color","comb","comet","comic",
  "coral","corner","corn","couch","count","court","cover","crab","crack","craft","crank","crash","crawl","crazy",
  "cream","creek","creep","crest","crew","crib","crop","cross","crowd","crown","crust","crystal","cube","cult",
  "cup","curl","curve","cute","cycle","daily","dance","dare","dark","dash","data","date","dawn","deal","dear",
  "debate","debt","decay","deck","deep","deer","defeat","defend","degree","delay","deliver","demand","denim",
  "dense","dental","deny","depart","depth","derby","desert","design","desire","desk","detail","detect","device",
  "dial","diamond","diary","dice","diet","dig","digital","dim","dine","dinner","dip","direct","dirt","disco",
  "dish","disk","dive","diver","dizzy","dock","doctor","dollar","dolphin","domain","dome","donate","donkey",
  "donor","door","dose","dot","double","doubt","dough","dove","down","draft","drag","dragon","drama","draw",
  "dream","dress","drift","drill","drink","drive","drop","drum","duck","dull","dummy","dust","duty","eager",
  "eagle","early","earth","east","easy","echo","edge","edit","effort","egg","eight","elbow","elder","elite",
  "emerald","emoji","empty","enable","end","enemy","energy","engine","enjoy","enroll","enter","entry","equal",
  "equip","erase","error","erupt","event","every","exact","exam","exit","exotic","expand","expert","export",
  "extend","extra","fabric","face","factor","fade","fail","faint","fair","fairy","faith","fall","false","fame",
  "family","fan","fancy","fantasy","farm","fast","fat","fate","fault","favor","feast","federal","feed","feel",
  "fellow","felt","fern","ferry","fetch","fever","fiber","field","fierce","fifth","fight","figure","file","fill",
  "film","filter","final","find","fine","finger","finish","fire","firm","first","fish","fist","fit","five",
  "flag","flame","flash","flat","flavor","fleet","flesh","flight","flip","float","flock","flood","floor","flour",
  "flow","flower","fluid","flute","fly","foam","focus","fog","fold","folk","food","fool","foot","force","forge",
  "format","fort","fortune","four","frame","free","fresh","frog","front","frost","fruit","fry","fuel","full",
  "fun","fund","funny","fur","fusion","future","gadget","gain","galaxy","game","gang","gap","garage","garden",
  "garlic","gas","gate","gather","gauge","gear","gem","gene","genius","gentle","ghost","giant","gift","ginger",
  "girl","give","glad","glance","glass","glide","globe","glory","glove","glow","glue","goal","goat","gold",
  "golf","gone","good","grace","grade","grain","grand","grant","grape","graph","grass","grave","gravy","gray",
  "great","green","grid","grin","grip","grit","group","grow","guard","guess","guest","guide","guilt","guitar",
  "gust","habit","hair","half","hall","ham","hand","handle","hang","happy","harbor","hard","harm","harvest",
  "hat","hate","have","hawk","head","heal","health","hear","heart","heat","heavy","hedge","heel","height",
  "help","herb","hero","hidden","high","hill","hint","hippo","hire","history","hit","hold","hole","holiday",
  "holy","home","honey","hook","hope","horn","horse","host","hotel","hour","house","hover","human","humor",
  "hundred","hunt","hurry","ice","icon","idea","ideal","image","imply","index","ink","inner","input","insect",
  "inside","intent","invest","invite","iron","island","ivory","jacket","jade","jail","jam","jar","jaw","jazz",
  "jealous","jeep","jelly","jet","jewel","job","join","joint","joke","journey","joy","judge","juice","jumbo",
  "jump","jungle","junior","junk","just","keep","ketchup","key","kick","kid","kidney","kind","king","kiss",
  "kite","kitten","knee","knife","knight","knot","know","label","labor","lace","lack","ladder","lady","lake",
  "lamp","land","lane","large","laser","last","late","laugh","launch","laundry","lawn","lawyer","layer","lazy",
  "lead","leaf","league","lean","leap","learn","leather","leave","lecture","left","leg","legal","lemon","level",
  "lever","library","license","lid","life","lift","light","like","limb","lime","limit","line","link","lion",
  "lip","liquid","list","listen","little","live","load","loan","lobby","local","lock","logic","logo","lone",
  "long","look","loop","loose","lord","lose","loss","lost","lot","loud","love","low","lower","loyal","luck",
  "lucky","luggage","lumber","lunar","lunch","lung","luxury","machine","mad","magic","magnet","mail","main",
  "major","make","male","mall","manage","mango","map","marble","march","mark","market","mask","mass","match",
  "mate","math","matter","maze","meadow","meal","mean","meat","media","medical","meet","melody","melt","member",
  "memory","mend","menu","mercy","merge","merit","merry","mesh","mess","metal","meter","method","middle","might",
  "mild","mile","milk","mill","mind","mine","mint","minor","minus","minute","mirror","miss","mist","mix",
  "mobile","model","modern","modular","moment","money","monitor","monkey","month","moon","moral","more",
  "morning","most","motor","mountain","mouse","mouth","move","movie","much","muffin","mule","muscle","museum",
  "music","must","mutual","mystery","nail","name","narrow","nation","native","nature","near","neat","neck",
  "need","needle","negative","neighbor","nephew","nerve","nest","net","network","never","new","news","next",
  "nice","niche","night","nine","noble","noise","noodle","normal","north","nose","note","notion","novel","now",
  "nuclear","number","nurse","nut","oak","obey","object","observe","obtain","obvious","ocean","octave","odd",
  "offer","office","often","oil","okay","old","olive","omit","once","one","onion","online","only","open",
  "opera","option","orange","orbit","order","organ","origin","other","ought","ounce","outer","output","outside",
  "oven","over","own","owner","oxygen","oyster","pace","pack","page","paid","pain","paint","pair","palace",
  "palm","panel","panic","pants","paper","parrot","part","party","pass","past","path","patient","patrol",
  "pattern","pause","pave","peace","peach","peak","pear","pearl","peer","pencil","people","pepper","percent",
  "perfect","perhaps","period","permit","person","phase","phone","photo","phrase","piano","pick","picture",
  "piece","pier","pigeon","pile","pilot","pine","pink","pioneer","pipe","pirate","pistol","pitch","pity",
  "pizza","place","plain","plan","planet","plant","plate","play","please","pledge","plenty","plot","plug",
  "plum","plunge","plus","pocket","poem","poet","point","poison","polar","pole","police","policy","polish",
  "polite","pond","pony","pool","poor","pop","popular","porch","port","portion","pose","post","potato","pound",
  "pour","powder","power","practice","praise","pray","prefer","prepare","present","press","pretty","price",
  "pride","primary","prince","print","prior","prison","private","prize","problem","process","produce","profit",
  "prompt","proper","proud","prove","provide","public","puddle","pull","pulp","pulse","pump","pumpkin","punch",
  "pupil","puppet","puppy","purchase","pure","purple","purpose","purse","push","puzzle","quality","quantum",
  "quarter","queen","query","quest","queue","quick","quiet","quill","quilt","quit","quite","quiz","quote",
];

/* ============================================================
 * 类型
 * ========================================================== */
type PasswordMode = "random" | "passphrase" | "pronounceable";
type Separator = "hyphen" | "underscore" | "dot" | "space" | "none";
type Theme = "dark" | "light";
type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

interface PasswordConfig {
  mode: PasswordMode;
  // 随机模式
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeConfusing: boolean;
  // 密码短语
  wordCount: number;
  separator: Separator;
  capitalizeWords: boolean;
  includeNumber: boolean;
  includeSymbol: boolean;
  // 可发音
  syllableCount: number;
  capitalizeSyllables: boolean;
  pronUseSeparator: boolean;
  pronIncludeNumber: boolean;
  // 批量
  count: number;
}

interface HistoryEntry {
  id: string;
  password: string;
  mode: PasswordMode;
  entropy: number;
  strength: StrengthLevel;
  createdAt: number;
}

interface Preset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  config: Partial<PasswordConfig> & { mode: PasswordMode };
}

/* ============================================================
 * 工具函数
 * ========================================================== */
const clamp = (n: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, n));

const cn = (...classes: (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");

function removeConfusing(s: string): string {
  let r = s;
  for (const c of CONFUSING) r = r.split(c).join("");
  return r;
}

function separatorChar(sep: Separator): string {
  switch (sep) {
    case "hyphen": return "-";
    case "underscore": return "_";
    case "dot": return ".";
    case "space": return " ";
    case "none": return "";
  }
}

/* ---------- Web Crypto API 安全随机 ---------- */
function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  if (maxExclusive === 1) return 0;
  const maxUint32 = 0xffffffff;
  // 拒绝采样，消除取模偏差
  const limit = maxUint32 - (maxUint32 % maxExclusive);
  const buf = new Uint32Array(1);
  let val = 0;
  do {
    crypto.getRandomValues(buf);
    val = buf[0];
  } while (val > limit);
  return val % maxExclusive;
}

function securePick<T>(arr: readonly T[]): T {
  return arr[secureRandomInt(arr.length)];
}

function securePickChar(str: string): string {
  if (str.length === 0) return "";
  return str.charAt(secureRandomInt(str.length));
}

function secureShuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function secureDigits(n: number): string {
  let s = "";
  for (let i = 0; i < n; i++) s += securePickChar(NUMBERS);
  return s;
}

/* ---------- 密码生成器 ---------- */
function generateRandomPassword(c: PasswordConfig): string {
  let upper = c.uppercase ? UPPERCASE : "";
  let lower = c.lowercase ? LOWERCASE : "";
  let nums = c.numbers ? NUMBERS : "";
  let syms = c.symbols ? SYMBOLS : "";
  if (c.excludeConfusing) {
    upper = removeConfusing(upper);
    lower = removeConfusing(lower);
    nums = removeConfusing(nums);
  }
  const pools = [upper, lower, nums, syms].filter((p) => p.length > 0);
  if (pools.length === 0) return "";

  const charset = pools.join("");
  const length = clamp(c.length, 1, 128);

  // 保证每个已选字符池至少出现一次（在长度允许范围内）
  const result: string[] = [];
  for (let i = 0; i < pools.length && result.length < length; i++) {
    result.push(securePickChar(pools[i]));
  }
  while (result.length < length) {
    result.push(securePickChar(charset));
  }
  return secureShuffle(result).join("");
}

function generateSyllable(): string {
  return securePickChar(CONSONANTS) + securePickChar(VOWELS) + securePickChar(CONSONANTS);
}

function generatePassphrase(c: PasswordConfig): string {
  const count = clamp(c.wordCount, 2, 8);
  const words: string[] = [];
  for (let i = 0; i < count; i++) words.push(securePick(WORD_LIST));

  const processed = words.map((w) =>
    c.capitalizeWords ? w.charAt(0).toUpperCase() + w.slice(1) : w
  );
  const sep = separatorChar(c.separator);
  let result = processed.join(sep);

  if (c.includeNumber) {
    const digits = secureRandomInt(2) + 2; // 2-3 位
    result = result + (sep || "") + secureDigits(digits);
  }
  if (c.includeSymbol) {
    result = result + securePickChar(SYMBOLS);
  }
  return result;
}

function generatePronounceable(c: PasswordConfig): string {
  const count = clamp(c.syllableCount, 2, 8);
  const syls: string[] = [];
  for (let i = 0; i < count; i++) syls.push(generateSyllable());

  const processed = syls.map((s) =>
    c.capitalizeSyllables ? s.charAt(0).toUpperCase() + s.slice(1) : s
  );
  const sep = c.pronUseSeparator ? "-" : "";

  if (c.pronIncludeNumber) {
    // CVC-数字-CVC 格式：把数字插入到音节中间
    const digits = secureRandomInt(2) + 2;
    const num = secureDigits(digits);
    const mid = Math.floor(processed.length / 2);
    const left = processed.slice(0, mid).join(sep);
    const right = processed.slice(mid).join(sep);
    const joiner = sep || "";
    return (
      left + (left ? joiner : "") + num + (right ? joiner : "") + right
    );
  }
  return processed.join(sep);
}

function generatePassword(c: PasswordConfig): string {
  if (c.mode === "passphrase") return generatePassphrase(c);
  if (c.mode === "pronounceable") return generatePronounceable(c);
  return generateRandomPassword(c);
}

/* ---------- 熵值 / 强度 / 破解时间 ---------- */
function calculateEntropy(c: PasswordConfig): number {
  if (c.mode === "random") {
    let upper = UPPERCASE;
    let lower = LOWERCASE;
    let nums = NUMBERS;
    if (c.excludeConfusing) {
      upper = removeConfusing(upper);
      lower = removeConfusing(lower);
      nums = removeConfusing(nums);
    }
    let pool = 0;
    if (c.uppercase) pool += upper.length;
    if (c.lowercase) pool += lower.length;
    if (c.numbers) pool += nums.length;
    if (c.symbols) pool += SYMBOLS.length;
    if (pool === 0) return 0;
    return c.length * Math.log2(pool);
  }
  if (c.mode === "passphrase") {
    const wordBits = c.wordCount * Math.log2(WORD_LIST.length);
    const capBits = c.capitalizeWords ? c.wordCount : 0;
    const numBits = c.includeNumber ? 3 * Math.log2(10) : 0;
    const symBits = c.includeSymbol ? Math.log2(SYMBOLS.length) : 0;
    return wordBits + capBits + numBits + symBits;
  }
  // pronounceable
  const sylBits =
    c.syllableCount *
    Math.log2(CONSONANTS.length * VOWELS.length * CONSONANTS.length);
  const capBits = c.capitalizeSyllables ? c.syllableCount : 0;
  const numBits = c.pronIncludeNumber ? 3 * Math.log2(10) : 0;
  return sylBits + capBits + numBits;
}

function strengthFromEntropy(e: number): StrengthLevel {
  if (e < 40) return "weak";
  if (e < 60) return "medium";
  if (e < 80) return "strong";
  return "very-strong";
}

function getStrengthInfo(level: StrengthLevel): {
  label: string;
  color: string;
  bg: string;
  icon: LucideIcon;
} {
  switch (level) {
    case "weak":
      return { label: "弱", color: "text-red-500", bg: "bg-red-500", icon: ShieldAlert };
    case "medium":
      return { label: "中等", color: "text-amber-500", bg: "bg-amber-500", icon: Shield };
    case "strong":
      return { label: "强", color: "text-emerald-500", bg: "bg-emerald-500", icon: ShieldCheck };
    case "very-strong":
      return { label: "极强", color: "text-indigo-500", bg: "bg-indigo-500", icon: ShieldPlus };
  }
}

function formatCrackTime(entropy: number): string {
  if (!isFinite(entropy) || entropy <= 0) return "未知";
  // 假设离线 GPU 攻击 100 亿次/秒
  const guessesPerSecond = 1e10;
  let seconds: number;
  try {
    seconds = Math.pow(2, entropy) / 2 / guessesPerSecond;
  } catch {
    return "超过可计算范围";
  }
  if (!isFinite(seconds)) return "超过可计算范围";
  if (seconds < 1) return "瞬间";
  if (seconds < 60) return `${seconds.toFixed(0)} 秒`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} 分钟`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} 小时`;
  if (seconds < 2592000) return `${(seconds / 86400).toFixed(0)} 天`;
  if (seconds < 31557600) return `${(seconds / 2592000).toFixed(0)} 个月`;

  const years = seconds / 31557600;
  if (years < 1e3) return `${years.toFixed(years < 100 ? 1 : 0)} 年`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} 千年`;
  if (years < 1e9) return `${(years / 1e6).toFixed(1)} 百万年`;
  if (years < 1e12) return `${(years / 1e9).toFixed(1)} 十亿年`;
  if (years < 1e15) return `${(years / 1e12).toFixed(1)} 万亿年`;
  return "超过宇宙寿命";
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s} 秒前`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

function maskPassword(p: string): string {
  if (!p) return "***";
  if (p.length <= 3) return "***";
  return p.slice(0, 3) + "***";
}

/* ---------- localStorage 持久化 ---------- */
const CONFIG_KEY = "pg_pro_config_v1";
const THEME_KEY = "pg_pro_theme_v1";
const HISTORY_KEY = "pg_pro_history_v1";

const DEFAULT_CONFIG: PasswordConfig = {
  mode: "random",
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeConfusing: false,
  wordCount: 4,
  separator: "hyphen",
  capitalizeWords: false,
  includeNumber: true,
  includeSymbol: false,
  syllableCount: 3,
  capitalizeSyllables: true,
  pronUseSeparator: true,
  pronIncludeNumber: true,
  count: 1,
};

function loadConfig(): PasswordConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = window.localStorage.getItem(CONFIG_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<PasswordConfig>;
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return DEFAULT_CONFIG;
  }
}

function loadTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const t = window.localStorage.getItem(THEME_KEY);
    return t === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 20) : [];
  } catch {
    return [];
  }
}

function saveConfig(c: PasswordConfig): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_KEY, JSON.stringify(c));
  } catch {
    /* ignore */
  }
}

function saveTheme(t: Theme): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(THEME_KEY, t);
  } catch {
    /* ignore */
  }
}

function saveHistory(h: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch {
    /* ignore */
  }
}

/* ============================================================
 * 静态配置
 * ========================================================== */
const MODES: { id: PasswordMode; label: string; icon: LucideIcon }[] = [
  { id: "random", label: "随机密码", icon: Shuffle },
  { id: "passphrase", label: "密码短语", icon: Type },
  { id: "pronounceable", label: "可发音", icon: Mic },
];

const PRESETS: Preset[] = [
  {
    id: "bank",
    name: "银行级",
    description: "32 位全字符集，极强安全",
    icon: Landmark,
    config: {
      mode: "random",
      length: 32,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeConfusing: true,
    },
  },
  {
    id: "website",
    name: "网站账号",
    description: "16 位混合，易输入",
    icon: Globe,
    config: {
      mode: "random",
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeConfusing: true,
    },
  },
  {
    id: "wifi",
    name: "WiFi 密码",
    description: "12 位字母数字，设备友好",
    icon: Wifi,
    config: {
      mode: "random",
      length: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: false,
      excludeConfusing: true,
    },
  },
  {
    id: "passphrase",
    name: "记忆口令",
    description: "4 词短语，强且易记",
    icon: BookOpen,
    config: {
      mode: "passphrase",
      wordCount: 4,
      separator: "hyphen",
      capitalizeWords: false,
      includeNumber: true,
      includeSymbol: false,
    },
  },
];

const SEPARATORS: { id: Separator; label: string }[] = [
  { id: "hyphen", label: "连字符 -" },
  { id: "underscore", label: "下划线 _" },
  { id: "dot", label: "点 ." },
  { id: "space", label: "空格" },
  { id: "none", label: "无" },
];

const QUICK_LENGTHS = [8, 12, 16, 20, 24, 32];
const BATCH_COUNTS = [1, 10, 50, 100];

/* ============================================================
 * 复用小组件
 * ========================================================== */
function OptionToggle({
  label,
  hint,
  active,
  onClick,
  isDark,
}: {
  label: string;
  hint?: string;
  active: boolean;
  onClick: () => void;
  isDark: boolean;
}) {
  const base = isDark
    ? active
      ? "bg-indigo-500/15 border-indigo-500/40"
      : "bg-[#27272a]/60 border-[#3f3f46] hover:border-indigo-500/40"
    : active
      ? "bg-indigo-50 border-indigo-300"
      : "bg-slate-50 border-slate-200 hover:border-indigo-300";
  const labelCls = isDark
    ? active
      ? "text-indigo-300"
      : "text-slate-200"
    : active
      ? "text-indigo-700"
      : "text-slate-700";
  const box = active
    ? "bg-indigo-500 border-indigo-500"
    : isDark
      ? "border-slate-600"
      : "border-slate-300";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all",
        base
      )}
    >
      <div className="text-left min-w-0">
        <div className={cn("text-sm font-medium truncate", labelCls)}>{label}</div>
        {hint && (
          <div
            className={cn(
              "text-xs font-mono truncate",
              isDark ? "text-slate-500" : "text-slate-400"
            )}
          >
            {hint}
          </div>
        )}
      </div>
      <div
        className={cn(
          "w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all",
          box
        )}
      >
        {active && <Check className="w-3 h-3 text-white" />}
      </div>
    </button>
  );
}

/* ============================================================
 * 主组件
 * ========================================================== */
export default function PasswordGeneratorPage() {
  const [config, setConfig] = useState<PasswordConfig>(DEFAULT_CONFIG);
  const [theme, setTheme] = useState<Theme>("dark");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [passwords, setPasswords] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genKey, setGenKey] = useState(0);

  const [showPassword, setShowPassword] = useState(true);
  const [copiedPrimary, setCopiedPrimary] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  /* ---------- 初始化（避免 SSR 水合不匹配） ---------- */
  useEffect(() => {
    setConfig(loadConfig());
    setTheme(loadTheme());
    setHistory(loadHistory());
    setHydrated(true);
  }, []);

  /* ---------- 生成 ---------- */
  const runGenerate = useCallback(
    (animate: boolean, toHistory: boolean) => {
      const doGen = () => {
        const list: string[] = [];
        const n = clamp(config.count, 1, 100);
        for (let i = 0; i < n; i++) {
          list.push(generatePassword(config));
        }
        setPasswords(list.filter(Boolean));
        setGenKey((k) => k + 1);

        if (toHistory && list[0]) {
          const ent = calculateEntropy(config);
          const entry: HistoryEntry = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            password: list[0],
            mode: config.mode,
            entropy: ent,
            strength: strengthFromEntropy(ent),
            createdAt: Date.now(),
          };
          setHistory((prev) => {
            const next = [entry, ...prev].slice(0, 20);
            saveHistory(next);
            return next;
          });
        }
      };

      if (animate) {
        setIsGenerating(true);
        window.setTimeout(() => {
          doGen();
          setIsGenerating(false);
        }, 220);
      } else {
        doGen();
      }
    },
    [config]
  );

  // 实时预览：配置变化后自动重新生成（不计入历史）
  useEffect(() => {
    if (!hydrated) return;
    runGenerate(false, false);
  }, [hydrated, runGenerate]);

  // 配置 / 主题 持久化
  useEffect(() => {
    if (hydrated) saveConfig(config);
  }, [config, hydrated]);
  useEffect(() => {
    if (hydrated) saveTheme(theme);
  }, [theme, hydrated]);

  /* ---------- 操作 ---------- */
  const updateConfig = useCallback(
    <K extends keyof PasswordConfig>(key: K, value: PasswordConfig[K]) => {
      setConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const toggleChar = useCallback(
    (key: "uppercase" | "lowercase" | "numbers" | "symbols") => {
      setConfig((prev) => {
        if (prev[key]) {
          const keys = ["uppercase", "lowercase", "numbers", "symbols"] as const;
          const active = keys.filter((k) => prev[k]).length;
          if (active <= 1) return prev; // 至少保留一种
        }
        return { ...prev, [key]: !prev[key] };
      });
    },
    []
  );

  const applyPreset = useCallback((p: Preset) => {
    setConfig((prev) => ({ ...prev, ...p.config }));
  }, []);

  const copyText = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }, []);

  const copyPrimary = useCallback(async () => {
    const p = passwords[0];
    if (!p) return;
    if (await copyText(p)) {
      setCopiedPrimary(true);
      window.setTimeout(() => setCopiedPrimary(false), 1800);
    }
  }, [passwords, copyText]);

  const copyBatchItem = useCallback(
    async (id: string, text: string) => {
      if (await copyText(text)) {
        setCopiedId(id);
        window.setTimeout(() => setCopiedId(null), 1500);
      }
    },
    [copyText]
  );

  const copyAll = useCallback(async () => {
    if (passwords.length === 0) return;
    if (await copyText(passwords.join("\n"))) {
      setCopiedAll(true);
      window.setTimeout(() => setCopiedAll(false), 1800);
    }
  }, [passwords, copyText]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const removeHistoryItem = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const toggleReveal = useCallback((id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  /* ---------- 派生 ---------- */
  const isDark = theme === "dark";
  const primary = passwords[0] || "";
  const entropy = calculateEntropy(config);
  const strength = strengthFromEntropy(entropy);
  const strengthInfo = getStrengthInfo(strength);
  const StrengthIcon = strengthInfo.icon;
  const crackText = formatCrackTime(entropy);
  const strengthPct = Math.max(8, Math.min(100, (entropy / 128) * 100));
  const currentMode = MODES.find((m) => m.id === config.mode);

  /* ---------- 主题样式 ---------- */
  const s = isDark
    ? {
        root: "bg-[#18181b]",
        panel: "bg-[#1f1f23] border-[#3f3f46]",
        panelSoft: "bg-[#27272a]/60 border-[#3f3f46]",
        field: "bg-[#0f0f12] border-[#3f3f46] text-slate-100",
        text: "text-slate-100",
        sub: "text-slate-400",
        mute: "text-slate-500",
        hover: "hover:bg-[#3f3f46]",
        chip: "bg-[#27272a] text-slate-300 border-[#3f3f46]",
        chipActive: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
        chipHover: "hover:bg-[#3f3f46]",
        sliderTrack: "bg-slate-700",
        inactiveTab: "text-slate-400 hover:text-white hover:bg-white/5",
      }
    : {
        root: "bg-slate-100",
        panel: "bg-white border-slate-200",
        panelSoft: "bg-slate-50 border-slate-200",
        field: "bg-white border-slate-300 text-slate-900",
        text: "text-slate-900",
        sub: "text-slate-600",
        mute: "text-slate-500",
        hover: "hover:bg-slate-100",
        chip: "bg-slate-100 text-slate-600 border-slate-200",
        chipActive: "bg-indigo-50 text-indigo-700 border-indigo-300",
        chipHover: "hover:bg-slate-200",
        sliderTrack: "bg-slate-200",
        inactiveTab: "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
      };

  return (
    <ToolLayout
      title="密码生成器 Pro"
      description="基于 Web Crypto API 的安全密码生成器，支持随机/密码短语/可发音、批量生成、强度与破解时间估算、历史记录"
      icon={KeyRound}
      category="实用工具"
      slug="password-generator"
      toolId="password-generator"
    >
      <div className={cn("p-4 sm:p-6 space-y-5 transition-colors", s.root)}>
        {/* ============ 顶部工具栏：模式 + 主题 ============ */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div
            className={cn(
              "inline-flex p-1 rounded-xl border",
              s.panelSoft
            )}
          >
            {MODES.map((m) => {
              const Icon = m.icon;
              const activeTab = config.mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateConfig("mode", m.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow"
                      : s.inactiveTab
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all",
              s.chip,
              s.chipHover
            )}
            title="切换主题"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">{isDark ? "浅色" : "深色"}</span>
          </button>
        </div>

        {/* ============ 主密码显示 ============ */}
        <div className={cn("rounded-2xl border p-5 space-y-4", s.panel)}>
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <h2 className={cn("text-base font-semibold", s.text)}>当前密码</h2>
            <span className={cn("ml-auto text-xs", s.mute)}>
              {currentMode?.label} · {entropy.toFixed(0)} 位熵
            </span>
          </div>

          <div
            className={cn(
              "flex items-center gap-2 p-4 rounded-xl border",
              s.field
            )}
          >
            <code
              key={genKey}
              className={cn(
                "flex-1 font-mono text-base sm:text-lg break-all animate-in fade-in zoom-in-95 duration-300",
                showPassword ? s.text : "tracking-widest",
                !showPassword && (isDark ? "text-slate-600" : "text-slate-400")
              )}
            >
              {primary
                ? showPassword
                  ? primary
                  : "\u2022".repeat(Math.min(primary.length, 32))
                : "请选择至少一种字符类型"}
            </code>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-colors",
                isDark
                  ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              )}
              title={showPassword ? "隐藏密码" : "显示密码"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            <button
              type="button"
              onClick={copyPrimary}
              disabled={!primary}
              className={cn(
                "flex-shrink-0 p-2 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
                isDark
                  ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              )}
              title="复制密码"
            >
              {copiedPrimary ? (
                <Check className="w-5 h-5 text-emerald-500" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* 强度计 */}
          <div>
            <div className="flex items-center justify-between mb-2 text-sm">
              <span className={s.sub}>密码强度</span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium",
                  strengthInfo.color
                )}
              >
                <StrengthIcon className="w-4 h-4" />
                {strengthInfo.label}
              </span>
            </div>
            <div
              className={cn(
                "h-2 rounded-full overflow-hidden",
                s.sliderTrack
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  strengthInfo.bg
                )}
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            <div className={cn("mt-2 flex items-center gap-1.5 text-xs", s.mute)}>
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>破解耗时约</span>
              <span className={cn("font-medium", s.sub)}>{crackText}</span>
              <span className="hidden sm:inline">
                （按 100 亿次/秒 离线攻击估算）
              </span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => runGenerate(true, true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all active:scale-[0.98]"
            >
              <RefreshCw
                className={cn("w-5 h-5", isGenerating && "animate-spin")}
              />
              生成密码
            </button>
            <button
              type="button"
              onClick={() => runGenerate(true, true)}
              title="重新生成"
              className={cn(
                "inline-flex items-center justify-center w-12 h-12 rounded-xl border transition-all",
                s.chip,
                s.chipHover
              )}
            >
              <RotateCw
                className={cn("w-5 h-5", isGenerating && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* ============ 预设规则 ============ */}
        <div className={cn("rounded-2xl border p-5 space-y-3", s.panel)}>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className={cn("text-sm font-semibold", s.text)}>预设规则</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "text-left p-3 rounded-xl border transition-all",
                    s.chip,
                    s.chipHover
                  )}
                >
                  <Icon className="w-5 h-5 mb-2 text-indigo-400" />
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isDark ? "text-slate-200" : "text-slate-800"
                    )}
                  >
                    {p.name}
                  </div>
                  <div className={cn("text-xs mt-0.5", s.mute)}>
                    {p.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ============ 选项面板 ============ */}
        <div className={cn("rounded-2xl border p-5 space-y-6", s.panel)}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h3 className={cn("text-sm font-semibold", s.text)}>生成选项</h3>
          </div>

          {/* ----- 随机模式 ----- */}
          {config.mode === "random" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={cn("text-sm font-medium", s.text)}>
                    密码长度
                  </label>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
                      isDark
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {config.length} 位
                  </span>
                </div>
                <input
                  type="range"
                  min={4}
                  max={64}
                  value={config.length}
                  onChange={(e) =>
                    updateConfig("length", Number(e.target.value))
                  }
                  className={cn(
                    "w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500",
                    s.sliderTrack
                  )}
                />
                <div
                  className={cn(
                    "flex items-center justify-between mt-1 text-xs",
                    s.mute
                  )}
                >
                  <span>4</span>
                  <span>64</span>
                </div>
                <div className="grid grid-cols-6 gap-2 mt-3">
                  {QUICK_LENGTHS.map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => updateConfig("length", len)}
                      className={cn(
                        "px-2 py-2 rounded-lg text-sm font-medium transition-all",
                        config.length === len
                          ? "bg-indigo-500 text-white"
                          : cn(s.chip, s.chipHover)
                      )}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={cn("block text-sm font-medium mb-3", s.text)}>
                  字符类型
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <OptionToggle
                    label="大写字母"
                    hint="A-Z"
                    active={config.uppercase}
                    onClick={() => toggleChar("uppercase")}
                    isDark={isDark}
                  />
                  <OptionToggle
                    label="小写字母"
                    hint="a-z"
                    active={config.lowercase}
                    onClick={() => toggleChar("lowercase")}
                    isDark={isDark}
                  />
                  <OptionToggle
                    label="数字"
                    hint="0-9"
                    active={config.numbers}
                    onClick={() => toggleChar("numbers")}
                    isDark={isDark}
                  />
                  <OptionToggle
                    label="特殊符号"
                    hint="!@#$%..."
                    active={config.symbols}
                    onClick={() => toggleChar("symbols")}
                    isDark={isDark}
                  />
                </div>
              </div>

              <OptionToggle
                label="排除易混淆字符"
                hint="I, l, 1, O, 0, o"
                active={config.excludeConfusing}
                onClick={() =>
                  updateConfig("excludeConfusing", !config.excludeConfusing)
                }
                isDark={isDark}
              />
            </>
          )}

          {/* ----- 密码短语模式 ----- */}
          {config.mode === "passphrase" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={cn("text-sm font-medium", s.text)}>
                    单词数量
                  </label>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
                      isDark
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {config.wordCount} 词
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig(
                        "wordCount",
                        clamp(config.wordCount - 1, 2, 8)
                      )
                    }
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center",
                      s.chip,
                      s.chipHover
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={config.wordCount}
                    onChange={(e) =>
                      updateConfig("wordCount", Number(e.target.value))
                    }
                    className={cn(
                      "flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500",
                      s.sliderTrack
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig(
                        "wordCount",
                        clamp(config.wordCount + 1, 2, 8)
                      )
                    }
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center",
                      s.chip,
                      s.chipHover
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className={cn("block text-sm font-medium mb-3", s.text)}>
                  分隔符
                </label>
                <div className="flex flex-wrap gap-2">
                  {SEPARATORS.map((sep) => (
                    <button
                      key={sep.id}
                      type="button"
                      onClick={() => updateConfig("separator", sep.id)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                        config.separator === sep.id
                          ? s.chipActive
                          : cn(s.chip, s.chipHover)
                      )}
                    >
                      {sep.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <OptionToggle
                  label="首字母大写"
                  active={config.capitalizeWords}
                  onClick={() =>
                    updateConfig("capitalizeWords", !config.capitalizeWords)
                  }
                  isDark={isDark}
                />
                <OptionToggle
                  label="追加数字"
                  active={config.includeNumber}
                  onClick={() =>
                    updateConfig("includeNumber", !config.includeNumber)
                  }
                  isDark={isDark}
                />
                <OptionToggle
                  label="追加符号"
                  active={config.includeSymbol}
                  onClick={() =>
                    updateConfig("includeSymbol", !config.includeSymbol)
                  }
                  isDark={isDark}
                />
              </div>
            </>
          )}

          {/* ----- 可发音模式 ----- */}
          {config.mode === "pronounceable" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={cn("text-sm font-medium", s.text)}>
                    音节数量（CVC）
                  </label>
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold",
                      isDark
                        ? "bg-indigo-500/15 text-indigo-300"
                        : "bg-indigo-100 text-indigo-700"
                    )}
                  >
                    {config.syllableCount} 音节
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig(
                        "syllableCount",
                        clamp(config.syllableCount - 1, 2, 8)
                      )
                    }
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center",
                      s.chip,
                      s.chipHover
                    )}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="range"
                    min={2}
                    max={8}
                    value={config.syllableCount}
                    onChange={(e) =>
                      updateConfig("syllableCount", Number(e.target.value))
                    }
                    className={cn(
                      "flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500",
                      s.sliderTrack
                    )}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateConfig(
                        "syllableCount",
                        clamp(config.syllableCount + 1, 2, 8)
                      )
                    }
                    className={cn(
                      "w-10 h-10 rounded-lg border flex items-center justify-center",
                      s.chip,
                      s.chipHover
                    )}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className={cn("mt-2 text-xs", s.mute)}>
                  格式示例：CVC-数字-CVC（如 <span className="font-mono">Tig-482-Mop</span>）
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <OptionToggle
                  label="首字母大写"
                  active={config.capitalizeSyllables}
                  onClick={() =>
                    updateConfig(
                      "capitalizeSyllables",
                      !config.capitalizeSyllables
                    )
                  }
                  isDark={isDark}
                />
                <OptionToggle
                  label="音节间连字符"
                  active={config.pronUseSeparator}
                  onClick={() =>
                    updateConfig("pronUseSeparator", !config.pronUseSeparator)
                  }
                  isDark={isDark}
                />
                <OptionToggle
                  label="插入数字"
                  active={config.pronIncludeNumber}
                  onClick={() =>
                    updateConfig("pronIncludeNumber", !config.pronIncludeNumber)
                  }
                  isDark={isDark}
                />
              </div>
            </>
          )}
        </div>

        {/* ============ 批量生成 ============ */}
        <div className={cn("rounded-2xl border p-5 space-y-4", s.panel)}>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className={cn("text-sm font-semibold", s.text)}>批量生成</h3>
            <span className={cn("ml-auto text-xs", s.mute)}>
              一次性生成 {config.count} 个
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-2">
              {BATCH_COUNTS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateConfig("count", c)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                    config.count === c
                      ? s.chipActive
                      : cn(s.chip, s.chipHover)
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => runGenerate(true, true)}
              className="ml-auto inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white text-sm font-medium transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4" />
              批量生成
            </button>
          </div>

          {passwords.length > 1 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs", s.mute)}>
                  共 {passwords.length} 个密码
                </span>
                <button
                  type="button"
                  onClick={copyAll}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                    s.chip,
                    s.chipHover
                  )}
                >
                  {copiedAll ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      已复制全部
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      复制全部
                    </>
                  )}
                </button>
              </div>
              <div
                className={cn(
                  "grid gap-2 max-h-80 overflow-y-auto pr-1",
                  passwords.length > 10
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                )}
              >
                {passwords.map((p, i) => {
                  const itemId = `batch-${i}`;
                  return (
                    <div
                      key={itemId}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-lg border",
                        s.panelSoft
                      )}
                    >
                      <span className={cn("text-xs w-6 flex-shrink-0", s.mute)}>
                        {i + 1}
                      </span>
                      <code
                        className={cn(
                          "flex-1 font-mono text-sm break-all",
                          s.text
                        )}
                      >
                        {p}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyBatchItem(itemId, p)}
                        className={cn(
                          "flex-shrink-0 p-1.5 rounded-md transition-colors",
                          isDark
                            ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                        )}
                        title="复制"
                      >
                        {copiedId === itemId ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ============ 历史记录 ============ */}
        <div className={cn("rounded-2xl border p-5 space-y-3", s.panel)}>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className={cn("text-sm font-semibold", s.text)}>历史记录</h3>
            <span className={cn("text-xs", s.mute)}>
              最近 {history.length}/20 次
            </span>
            {history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className={cn(
                  "ml-auto inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all",
                  s.chip,
                  s.chipHover
                )}
              >
                <Trash2 className="w-3.5 h-3.5" />
                清空
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div
              className={cn(
                "text-center py-8 text-sm rounded-xl border border-dashed",
                s.panelSoft,
                s.mute
              )}
            >
              暂无历史记录，生成密码后将自动保存（仅本地）
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {history.map((h) => {
                const info = getStrengthInfo(h.strength);
                const InfoIcon = info.icon;
                const modeLabel =
                  MODES.find((m) => m.id === h.mode)?.label || "随机";
                const revealed = !!revealedIds[h.id];
                return (
                  <div
                    key={h.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border",
                      s.panelSoft
                    )}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                        isDark ? "bg-[#0f0f12]" : "bg-slate-100"
                      )}
                    >
                      <InfoIcon className={cn("w-4 h-4", info.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <code
                        className={cn(
                          "block font-mono text-sm break-all",
                          s.text
                        )}
                      >
                        {revealed ? h.password : maskPassword(h.password)}
                      </code>
                      <div className={cn("flex items-center gap-2 mt-1 text-xs", s.mute)}>
                        <span>{modeLabel}</span>
                        <span>·</span>
                        <span>{h.entropy.toFixed(0)} 位熵</span>
                        <span>·</span>
                        <span>{timeAgo(h.createdAt)}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleReveal(h.id)}
                      className={cn(
                        "flex-shrink-0 p-1.5 rounded-md transition-colors",
                        isDark
                          ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      )}
                      title={revealed ? "隐藏" : "显示"}
                    >
                      {revealed ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyBatchItem(h.id, h.password)}
                      className={cn(
                        "flex-shrink-0 p-1.5 rounded-md transition-colors",
                        isDark
                          ? "text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10"
                          : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                      )}
                      title="复制"
                    >
                      {copiedId === h.id ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeHistoryItem(h.id)}
                      className={cn(
                        "flex-shrink-0 p-1.5 rounded-md transition-colors",
                        isDark
                          ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                      )}
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <p className={cn("text-xs", s.mute)}>
            历史仅保存在本机 localStorage，默认掩码显示（前 3 位 + ***），可单击眼睛图标查看。
          </p>
        </div>

        {/* ============ 安全提示 ============ */}
        <div className={cn("rounded-2xl border p-5", s.panel)}>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h3 className={cn("text-sm font-semibold", s.text)}>安全说明</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl",
                s.panelSoft
              )}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className={cn("font-medium", s.sub)}>加密安全</span>
                <p className={cn("text-xs mt-1", s.mute)}>
                  使用 Web Crypto API 的 crypto.getRandomValues，拒绝采样消除取模偏差
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl",
                s.panelSoft
              )}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className={cn("font-medium", s.sub)}>长度优先</span>
                <p className={cn("text-xs mt-1", s.mute)}>
                  建议 16 位以上，银行级账号建议 32 位
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl",
                s.panelSoft
              )}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className={cn("font-medium", s.sub)}>唯一密码</span>
                <p className={cn("text-xs mt-1", s.mute)}>
                  每个账号使用不同密码，避免一处泄露殃及其余
                </p>
              </div>
            </div>
            <div
              className={cn(
                "flex items-start gap-2 p-3 rounded-xl",
                s.panelSoft
              )}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className={cn("font-medium", s.sub)}>本地存储</span>
                <p className={cn("text-xs mt-1", s.mute)}>
                  所有生成与历史记录仅在浏览器本地进行，不上传服务器
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
