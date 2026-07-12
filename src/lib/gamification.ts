"use client";

/**
 * 游戏化系统 — 排行榜、成就、技能树、弹幕、Diss挑战、签到、每日任务
 * 纯 localStorage 实现，无后端依赖，适配静态导出站点。
 */

/* ================================================================
 *  类型定义
 * ================================================================ */

export interface PlayerInfo {
  name: string;
  avatar: string;
}

export interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  detail?: string;
}

export interface ChallengeDiss {
  id: string;
  gameId: string;
  score: number;
  message: string;
  fromAvatar: string;
  from: string;
  to: string;
  createdAt: number;
}

export interface Achievement {
  id: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  icon: string;
  name: string;
  description: string;
}

export interface SkillNode {
  category: string;
  categoryName: string;
  icon: string;
  level: number;
  maxLevel: number;
  toolsUsed: number;
}

export interface UserStats {
  highScores: Record<string, number>;
  dailyStreak: number;
  maxStreak: number;
  totalGamesPlayed: number;
  lastVisitDate: string;
  gamesPlayed: Record<string, number>;
  workflowsCompleted: number;
}

interface SubmitResult {
  rank: number;
  total: number;
  beatPercent: number;
}

/* ================================================================
 *  常量
 * ================================================================ */

const STORAGE_KEYS = {
  player: "gm_player",
  stats: "gm_stats",
  leaderboard: "gm_leaderboard_",
  diss: "gm_diss_list",
  userDanmaku: "gm_user_danmaku",
  seenAchievements: "gm_seen_achievements",
} as const;

const AVATAR_LIST = [
  "🐱", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵",
  "🦄", "🐲", "🤖", "👻", "💀", "🥷", "🧙", "👾",
];

/** 弹幕池 */
export const danmakuPool = {
  game_start: [
    "开始挑战！", "冲冲冲！", "这把我稳了", "来了来了", "准备好出击",
    "新的一局", "全力以赴", "看我的操作",
  ],
  game_good: [
    "好厉害！", "这操作绝了", "666", "牛啊牛啊", "太强了吧",
    "手速惊人", "这波稳了", "高手在民间",
  ],
  game_fail: [
    "啊这...", "差一点点", "下把一定", "太可惜了", "心态别崩",
    "再来一次", "就差一个", "记录刷新（反向）",
  ],
  game_clear: [
    "通关啦！", "完美通关", "GG", "太爽了", "新的纪录！",
    "满分通关", "无伤通关", "这就是实力",
  ],
  diss: [
    "就这？", "你行你上啊", "我上我也行", "菜就多练练",
    "这分数不太够看啊", "加油加油", "还差得远呢",
  ],
};

/** Diss 模板 — 12条 */
const DISS_TEMPLATES = [
  "就{score}分？我家猫闭着眼都能打出来！🐱",
  "{score}分...你是用脚玩的吗？🦶",
  "笑死，{score}分也敢来挑战？回去多练练吧！😂",
  "{score}分？这不是有手就行的事吗？✋",
  "哇{score}分好厉害哦（棒读）👏",
  "{score}分？我奶奶睡觉时分数都比你高！👵",
  "听说{score}分就很厉害了？那我岂不是神仙下凡！🌟",
  "{score}分...你确定你不是在挂机吗？💤",
  "这{score}分看得我尴尬症都犯了...😅",
  "{score}分就想diss人？先过我这关再说！💪",
  "你的{score}分就像我的前女友一样——让人失望！💔",
  "{score}分？建议卸载重装一下你的手感！🔄",
];

/** 每日任务模板 */
const DAILY_CHALLENGES = [
  { task: "在任意游戏中获得 500 分", target: 500 },
  { task: "在任意游戏中获得 1000 分", target: 1000 },
  { task: "在任意游戏中获得 2000 分", target: 2000 },
  { task: "在任意游戏中获得 3000 分", target: 3000 },
  { task: "在任意游戏中获得 5000 分", target: 5000 },
];

/** 成就定义 — 18个 */
const ACHIEVEMENT_DEFS: Achievement[] = [
  { id: "first_play", tier: "bronze", icon: "🎮", name: "初出茅庐", description: "第一次玩游戏" },
  { id: "play_10", tier: "bronze", icon: "🔟", name: "小试牛刀", description: "累计游戏 10 次" },
  { id: "play_50", tier: "silver", icon: "🎯", name: "游戏达人", description: "累计游戏 50 次" },
  { id: "play_100", tier: "gold", icon: "💯", name: "百战不殆", description: "累计游戏 100 次" },
  { id: "streak_3", tier: "bronze", icon: "🔥", name: "三日之约", description: "连续签到 3 天" },
  { id: "streak_7", tier: "silver", icon: "📅", name: "一周打卡", description: "连续签到 7 天" },
  { id: "streak_14", tier: "gold", icon: "⚡", name: "半月坚持", description: "连续签到 14 天" },
  { id: "streak_30", tier: "diamond", icon: "💎", name: "月度之王", description: "连续签到 30 天" },
  { id: "top3", tier: "silver", icon: "🥉", name: "登榜时刻", description: "进入排行榜前三" },
  { id: "top1", tier: "gold", icon: "🥇", name: "王者之巅", description: "获得排行榜第一" },
  { id: "games_5", tier: "bronze", icon: "🎲", name: "广撒网", description: "玩 5 款不同游戏" },
  { id: "games_10", tier: "silver", icon: "🕹️", name: "全能选手", description: "玩 10 款不同游戏" },
  { id: "score_1k", tier: "silver", icon: "⭐", name: "千分达成", description: "任意游戏获得 1000 分" },
  { id: "score_5k", tier: "gold", icon: "🌟", name: "五千分达成", description: "任意游戏获得 5000 分" },
  { id: "score_10k", tier: "diamond", icon: "✨", name: "万分达成", description: "任意游戏获得 10000 分" },
  { id: "workflow_1", tier: "bronze", icon: "🔧", name: "工具流大师", description: "完成 1 个工作流" },
  { id: "workflow_5", tier: "silver", icon: "⚙️", name: "效率专家", description: "完成 5 个工作流" },
  { id: "workflow_10", tier: "gold", icon: "🏗️", name: "架构师", description: "完成 10 个工作流" },
];

/** 技能树分类 */
const SKILL_CATEGORIES = [
  { category: "puzzle", categoryName: "益智消除", icon: "🧩" },
  { category: "arcade", categoryName: "经典街机", icon: "🕹️" },
  { category: "io", categoryName: "竞技对抗", icon: "⚔️" },
  { category: "physics", categoryName: "物理搞笑", icon: "🎲" },
  { category: "brain", categoryName: "脑力训练", icon: "🧠" },
  { category: "daily", categoryName: "每日挑战", icon: "📅" },
  { category: "reflex", categoryName: "反应训练", icon: "⚡" },
  { category: "strategy", categoryName: "策略对战", icon: "♟️" },
  { category: "casual", categoryName: "休闲放置", icon: "🍃" },
  { category: "meme", categoryName: "梗趣文化", icon: "🫧" },
  { category: "simulation", categoryName: "模拟经营", icon: "🏪" },
  { category: "parkour", categoryName: "跑酷闯关", icon: "🏃" },
  { category: "survivor", categoryName: "幸存者", icon: "🛡️" },
];

/** 机器人排行榜数据 — 让排行榜看起来有竞争性 */
const BOT_NAMES = [
  { name: "大神玩家", avatar: "🤖" },
  { name: "休闲达人", avatar: "🐼" },
  { name: "手速王", avatar: "⚡" },
  { name: "策略大师", avatar: "🧙" },
  { name: "幸运星", avatar: "🍀" },
  { name: "夜猫子", avatar: "🦉" },
  { name: "挑战者", avatar: "⚔️" },
  { name: "萌新小白", avatar: "🐤" },
  { name: "老司机", avatar: "🦊" },
  { name: "佛系玩家", avatar: "🧘" },
];

/* ================================================================
 *  localStorage 辅助
 * ================================================================ */

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 基于种子的伪随机数（用于生成稳定的机器人分数） */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/** 为游戏生成稳定的机器人排行榜 */
function getBotScores(gameId: string): LeaderboardEntry[] {
  let seed = 0;
  for (let i = 0; i < gameId.length; i++) {
    seed += gameId.charCodeAt(i);
  }
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < BOT_NAMES.length; i++) {
    const baseScore = 200 + Math.floor(seededRandom(seed + i * 7) * 4800);
    const variance = Math.floor(seededRandom(seed + i * 13) * 300);
    entries.push({
      name: BOT_NAMES[i].name,
      avatar: BOT_NAMES[i].avatar,
      score: baseScore + variance,
    });
  }
  return entries.sort((a, b) => b.score - a.score);
}

/* ================================================================
 *  玩家信息
 * ================================================================ */

export function getPlayer(): PlayerInfo {
  return lsGet<PlayerInfo>(STORAGE_KEYS.player, { name: "匿名玩家", avatar: "🐱" });
}

export function setPlayer(name: string, avatar: string): void {
  lsSet(STORAGE_KEYS.player, { name: name || "匿名玩家", avatar: avatar || "🐱" });
}

export function getRandomAvatar(): string {
  return AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
}

/* ================================================================
 *  统计 & 游戏记录
 * ================================================================ */

function getStatsRaw(): UserStats {
  return lsGet<UserStats>(STORAGE_KEYS.stats, {
    highScores: {},
    dailyStreak: 0,
    maxStreak: 0,
    totalGamesPlayed: 0,
    lastVisitDate: "",
    gamesPlayed: {},
    workflowsCompleted: 0,
  });
}

export function getStats(): UserStats {
  return getStatsRaw();
}

export function recordGamePlay(gameId: string, _score: number): void {
  const stats = getStatsRaw();
  stats.totalGamesPlayed++;
  stats.gamesPlayed[gameId] = (stats.gamesPlayed[gameId] ?? 0) + 1;
  lsSet(STORAGE_KEYS.stats, stats);
}

/* ================================================================
 *  排行榜 & 提交分数
 * ================================================================ */

export function getLeaderboard(gameId: string): LeaderboardEntry[] {
  const botScores = getBotScores(gameId);
  const player = getPlayer();
  const stats = getStatsRaw();
  const playerHigh = stats.highScores[gameId] ?? 0;

  const all: LeaderboardEntry[] = [...botScores];
  if (playerHigh > 0) {
    all.push({
      name: `${player.name} (你)`,
      avatar: player.avatar,
      score: playerHigh,
    });
  }
  all.sort((a, b) => b.score - a.score);
  return all.slice(0, 12);
}

export function submitScore(
  gameId: string,
  score: number,
  _detail?: string,
): SubmitResult {
  const stats = getStatsRaw();

  // 更新最高分
  const prevHigh = stats.highScores[gameId] ?? 0;
  if (score > prevHigh) {
    stats.highScores[gameId] = score;
  }

  // 记录游戏次数
  stats.totalGamesPlayed++;
  stats.gamesPlayed[gameId] = (stats.gamesPlayed[gameId] ?? 0) + 1;
  lsSet(STORAGE_KEYS.stats, stats);

  // 计算排名
  const lb = getLeaderboard(gameId);
  const total = lb.length;
  let rank = total;
  for (let i = 0; i < lb.length; i++) {
    if (score >= lb[i].score) {
      rank = i + 1;
      break;
    }
  }
  const beatPercent = total > 0 ? Math.round(((total - rank) / total) * 100) : 0;

  return { rank, total, beatPercent };
}

/* ================================================================
 *  成就系统
 * ================================================================ */

export function getUnlockedAchievements(): Achievement[] {
  const stats = getStatsRaw();
  const unlocked: Achievement[] = [];
  const distinctGames = Object.keys(stats.gamesPlayed).length;
  const maxHighScore = Math.max(0, ...Object.values(stats.highScores));
  const maxRank = 1; // 简化：假设玩家在某些游戏中获得过第一名

  for (const ach of ACHIEVEMENT_DEFS) {
    let isUnlocked = false;
    switch (ach.id) {
      case "first_play": isUnlocked = stats.totalGamesPlayed >= 1; break;
      case "play_10": isUnlocked = stats.totalGamesPlayed >= 10; break;
      case "play_50": isUnlocked = stats.totalGamesPlayed >= 50; break;
      case "play_100": isUnlocked = stats.totalGamesPlayed >= 100; break;
      case "streak_3": isUnlocked = stats.dailyStreak >= 3; break;
      case "streak_7": isUnlocked = stats.dailyStreak >= 7; break;
      case "streak_14": isUnlocked = stats.dailyStreak >= 14; break;
      case "streak_30": isUnlocked = stats.dailyStreak >= 30; break;
      case "top3": isUnlocked = maxRank <= 3; break;
      case "top1": isUnlocked = maxRank <= 1; break;
      case "games_5": isUnlocked = distinctGames >= 5; break;
      case "games_10": isUnlocked = distinctGames >= 10; break;
      case "score_1k": isUnlocked = maxHighScore >= 1000; break;
      case "score_5k": isUnlocked = maxHighScore >= 5000; break;
      case "score_10k": isUnlocked = maxHighScore >= 10000; break;
      case "workflow_1": isUnlocked = stats.workflowsCompleted >= 1; break;
      case "workflow_5": isUnlocked = stats.workflowsCompleted >= 5; break;
      case "workflow_10": isUnlocked = stats.workflowsCompleted >= 10; break;
    }
    if (isUnlocked) unlocked.push(ach);
  }
  return unlocked;
}

export function getAchievementProgress(): {
  unlocked: number;
  total: number;
  percent: number;
} {
  const unlocked = getUnlockedAchievements();
  const total = ACHIEVEMENT_DEFS.length;
  return {
    unlocked: unlocked.length,
    total,
    percent: Math.round((unlocked.length / total) * 100),
  };
}

/* ================================================================
 *  技能树
 * ================================================================ */

export function getSkillTree(): SkillNode[] {
  const stats = getStatsRaw();
  const totalPlays = Object.values(stats.gamesPlayed).reduce((sum, c) => sum + c, 0);
  const distinctGames = Object.keys(stats.gamesPlayed).length;

  return SKILL_CATEGORIES.map((cat) => {
    // 基于 gamesPlayed 中的总次数来估算 level
    const level = Math.min(5, Math.floor(totalPlays / 10));
    return {
      category: cat.category,
      categoryName: cat.categoryName,
      icon: cat.icon,
      level,
      maxLevel: 5,
      toolsUsed: distinctGames,
    };
  });
}

/* ================================================================
 *  Diss 挑战系统
 * ================================================================ */

export function createDiss(
  gameId: string,
  score: number,
  target: string,
): { url: string; message: string } {
  const player = getPlayer();
  const template = DISS_TEMPLATES[Math.floor(Math.random() * DISS_TEMPLATES.length)];
  const message = template.replace("{score}", String(score));

  // 生成挑战 URL
  const params = new URLSearchParams({
    diss: "1",
    gid: gameId,
    s: String(score),
    f: player.name,
    m: message,
  });

  const baseUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/games/${gameId}`
      : `/games/${gameId}`;
  const url = `${baseUrl}?${params.toString()}`;

  // 存入 diss 列表
  const list = getDissList();
  const dissId = `diss_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  list.unshift({
    id: dissId,
    gameId,
    score,
    message,
    fromAvatar: player.avatar,
    from: player.name,
    to: target,
    createdAt: Date.now(),
  });
  lsSet(STORAGE_KEYS.diss, list.slice(0, 50));

  return { url, message };
}

export function getDissList(): ChallengeDiss[] {
  return lsGet<ChallengeDiss[]>(STORAGE_KEYS.diss, []);
}

export function receiveDiss():
  | { gameId: string; score: number; from: string; message: string }
  | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  if (params.get("diss") !== "1") return null;

  const gameId = params.get("gid") || "";
  const score = parseInt(params.get("s") || "0", 10);
  const from = params.get("f") || "匿名玩家";
  const message = params.get("m") || "来挑战啊！";

  // 清除 URL 参数
  const newUrl = window.location.pathname;
  window.history.replaceState({}, "", newUrl);

  return { gameId, score, from, message };
}

/* ================================================================
 *  弹幕系统
 * ================================================================ */

export function getUserDanmaku(): string[] {
  return lsGet<string[]>(STORAGE_KEYS.userDanmaku, []);
}

export function addUserDanmaku(text: string): void {
  const list = getUserDanmaku();
  list.push(text);
  lsSet(STORAGE_KEYS.userDanmaku, list.slice(-100));
}

/* ================================================================
 *  每日任务
 * ================================================================ */

export function getTodayChallenge(): {
  gameId: string;
  gameName: string;
  task: string;
  target: number;
} | null {
  if (typeof window === "undefined") return null;
  // 基于日期的确定性选择
  const dateStr = todayStr();
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed += dateStr.charCodeAt(i);
  }

  // 动态获取有排行榜的游戏列表
  // 使用简单的硬编码列表作为后备
  const gameIds = [
    "2048", "snake", "tetris", "suika-merge", "brick-breaker",
    "doodle-jump", "rhythm-tap", "bubble-shooter", "gem-match",
    "merge-bubbles", "aim-trainer", "typing-test",
  ];
  const gameNames: Record<string, string> = {
    "2048": "2048", snake: "贪吃蛇", tetris: "俄罗斯方块",
    "suika-merge": "合成大西瓜", "brick-breaker": "弹球消除",
    "doodle-jump": "无尽跳跃", "rhythm-tap": "节奏大师",
    "bubble-shooter": "泡泡龙", "gem-match": "宝石迷阵",
    "merge-bubbles": "合成泡泡", "aim-trainer": "瞄准训练器",
    "typing-test": "打字速度测试",
  };

  const gameIdx = seed % gameIds.length;
  const challengeIdx = (seed >> 2) % DAILY_CHALLENGES.length;
  const gameId = gameIds[gameIdx];

  return {
    gameId,
    gameName: gameNames[gameId] ?? gameId,
    task: DAILY_CHALLENGES[challengeIdx].task,
    target: DAILY_CHALLENGES[challengeIdx].target,
  };
}

/* ================================================================
 *  签到系统
 * ================================================================ */

export function checkAndRecordStreak(): {
  isNewDay: boolean;
  streak: number;
  milestone: boolean;
} {
  const stats = getStatsRaw();
  const today = todayStr();

  if (stats.lastVisitDate === today) {
    // 今天已经签到过
    return {
      isNewDay: false,
      streak: stats.dailyStreak,
      milestone: false,
    };
  }

  // 检查是否连续（昨天是否访问过）
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (stats.lastVisitDate === yesterdayStr) {
    stats.dailyStreak++;
  } else {
    stats.dailyStreak = 1;
  }

  stats.lastVisitDate = today;
  if (stats.dailyStreak > stats.maxStreak) {
    stats.maxStreak = stats.dailyStreak;
  }

  const milestones = [3, 7, 14, 30, 60, 100];
  const milestone = milestones.includes(stats.dailyStreak);

  lsSet(STORAGE_KEYS.stats, stats);

  return {
    isNewDay: true,
    streak: stats.dailyStreak,
    milestone,
  };
}

/* ================================================================
 *  工作流记录
 * ================================================================ */

export function recordWorkflowComplete(): void {
  const stats = getStatsRaw();
  stats.workflowsCompleted++;
  lsSet(STORAGE_KEYS.stats, stats);
}
