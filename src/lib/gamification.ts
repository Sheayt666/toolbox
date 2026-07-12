/**
 * 游戏化系统 — 成就 / 每日挑战 / 签到 / 排行榜 / Diss挑战
 * 纯 localStorage 实现，无后端依赖
 */

/* ============ 类型定义 ============ */

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalGamesPlayed: number;
  uniqueGamesPlayed: number;
  uniqueToolsUsed: number;
  totalToolsUsed: number;
  favoritesCount: number;
  workflowsCompleted: number;
  shareCardsGenerated: number;
  dailyStreak: number;
  maxStreak: number;
  challengeDaysCompleted: number;
  totalScore: number;
  highScores: Record<string, number>;
  lastVisitDate: string;
  firstVisitDate: string;
  achievementsUnlocked: string[];
}

export interface LeaderboardEntry {
  name: string;
  avatar: string;
  score: number;
  gameId: string;
  date: string;
  detail?: string;
}

export interface ChallengeDiss {
  id: string;
  from: string;
  fromAvatar: string;
  to: string;
  gameId: string;
  score: number;
  message: string;
  createdAt: number;
}

export interface DailyChallenge {
  date: string;
  gameId: string;
  gameName: string;
  task: string;
  target: number;
  completed: boolean;
  score?: number;
}

/* ============ 存储键 ============ */

const KEYS = {
  STATS: "gm_stats",
  LEADERBOARD: "gm_leaderboard",
  DISS: "gm_diss",
  DAILY: "gm_daily_challenge",
  STREAK: "gm_streak",
  PLAYER: "gm_player",
};

/* ============ 工具函数 ============ */

function isClient(): boolean {
  return typeof window !== "undefined";
}

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function safeParse<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("toolbox-storage-change"));
  } catch {
    // quota exceeded — ignore
  }
}

/* ============ 玩家信息 ============ */

export interface PlayerInfo {
  name: string;
  avatar: string;
}

const AVATARS = ["🐱", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵", "🦄", "🐲", "🤖", "👻", "💀", "🥷", "Wizard", "🧙"];

export function getPlayer(): PlayerInfo {
  return safeParse<PlayerInfo>(KEYS.PLAYER, {
    name: "匿名玩家" + Math.floor(Math.random() * 1000),
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
  });
}

export function setPlayer(name: string, avatar: string): void {
  safeSave(KEYS.PLAYER, { name, avatar });
}

export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

/* ============ 用户统计 ============ */

export function getStats(): UserStats {
  const today = getTodayStr();
  const defaultStats: UserStats = {
    totalGamesPlayed: 0,
    uniqueGamesPlayed: 0,
    uniqueToolsUsed: 0,
    totalToolsUsed: 0,
    favoritesCount: 0,
    workflowsCompleted: 0,
    shareCardsGenerated: 0,
    dailyStreak: 0,
    maxStreak: 0,
    challengeDaysCompleted: 0,
    totalScore: 0,
    highScores: {},
    lastVisitDate: today,
    firstVisitDate: today,
    achievementsUnlocked: [],
  };
  return safeParse<UserStats>(KEYS.STATS, defaultStats);
}

export function recordGamePlay(gameId: string, score: number): void {
  const stats = getStats();
  const today = getTodayStr();
  stats.totalGamesPlayed++;
  stats.totalScore += score;
  if (!stats.highScores[gameId] || score > stats.highScores[gameId]) {
    stats.highScores[gameId] = score;
  }
  // Track unique games
  const uniqueGames = new Set(Object.keys(stats.highScores));
  stats.uniqueGamesPlayed = uniqueGames.size;
  safeSave(KEYS.STATS, stats);
  checkAchievements(stats);
}

export function recordToolUse(toolId: string): void {
  const stats = getStats();
  stats.totalToolsUsed++;
  // Use highScores map to track unique tool IDs too
  if (!stats.highScores[`tool_${toolId}`]) {
    stats.highScores[`tool_${toolId}`] = 1;
  }
  const uniqueTools = Object.keys(stats.highScores).filter((k) => k.startsWith("tool_"));
  stats.uniqueToolsUsed = uniqueTools.length;
  safeSave(KEYS.STATS, stats);
  checkAchievements(stats);
}

export function recordWorkflowComplete(): void {
  const stats = getStats();
  stats.workflowsCompleted++;
  safeSave(KEYS.STATS, stats);
  checkAchievements(stats);
}

export function recordShareCard(): void {
  const stats = getStats();
  stats.shareCardsGenerated++;
  safeSave(KEYS.STATS, stats);
  checkAchievements(stats);
}

/* ============ 签到系统 ============ */

export function checkAndRecordStreak(): { isNewDay: boolean; streak: number; milestone: boolean } {
  const stats = getStats();
  const today = getTodayStr();
  const yesterday = getDateStr(1);

  if (stats.lastVisitDate === today) {
    return { isNewDay: false, streak: stats.dailyStreak, milestone: false };
  }

  if (stats.lastVisitDate === yesterday) {
    stats.dailyStreak++;
  } else {
    stats.dailyStreak = 1;
  }

  stats.lastVisitDate = today;
  if (stats.dailyStreak > stats.maxStreak) {
    stats.maxStreak = stats.dailyStreak;
  }
  safeSave(KEYS.STATS, stats);

  const milestones = [3, 7, 14, 30, 60, 100];
  const milestone = milestones.includes(stats.dailyStreak);

  checkAchievements(stats);
  return { isNewDay: true, streak: stats.dailyStreak, milestone };
}

/* ============ 成就系统 ============ */

export const achievements: Achievement[] = [
  { id: "first_game", name: "初次登场", description: "第一次游玩小游戏", icon: "🎮", tier: "bronze",
    condition: (s) => s.totalGamesPlayed >= 1 },
  { id: "first_tool", name: "工具新手", description: "使用第一个工具", icon: "🔧", tier: "bronze",
    condition: (s) => s.totalToolsUsed >= 1 },
  { id: "explorer", name: "探索者", description: "使用10个不同工具", icon: "🧭", tier: "silver",
    condition: (s) => s.uniqueToolsUsed >= 10 },
  { id: "tool_master", name: "工具达人", description: "使用30个不同工具", icon: "⚡", tier: "gold",
    condition: (s) => s.uniqueToolsUsed >= 30 },
  { id: "tool_grandmaster", name: "工具大师", description: "使用50个不同工具", icon: "👑", tier: "diamond",
    condition: (s) => s.uniqueToolsUsed >= 50 },
  { id: "gamer", name: "游戏玩家", description: "游玩10次小游戏", icon: "🕹️", tier: "silver",
    condition: (s) => s.totalGamesPlayed >= 10 },
  { id: "pro_gamer", name: "游戏高手", description: "游玩50次小游戏", icon: "🏆", tier: "gold",
    condition: (s) => s.totalGamesPlayed >= 50 },
  { id: "game_addict", name: "游戏达人", description: "游玩100次小游戏", icon: "🎯", tier: "diamond",
    condition: (s) => s.totalGamesPlayed >= 100 },
  { id: "collector", name: "收藏家", description: "收藏10个工具", icon: "📦", tier: "silver",
    condition: (s) => s.favoritesCount >= 10 },
  { id: "streak_3", name: "三日打卡", description: "连续3天访问", icon: "🔥", tier: "bronze",
    condition: (s) => s.maxStreak >= 3 },
  { id: "streak_7", name: "全勤战士", description: "连续7天访问", icon: "📅", tier: "silver",
    condition: (s) => s.maxStreak >= 7 },
  { id: "streak_30", name: "坚持达人", description: "连续30天访问", icon: "💎", tier: "gold",
    condition: (s) => s.maxStreak >= 30 },
  { id: "streak_100", name: "百日传说", description: "连续100天访问", icon: "🌟", tier: "diamond",
    condition: (s) => s.maxStreak >= 100 },
  { id: "workflow_starter", name: "流程新手", description: "完成1条工作流", icon: "🔄", tier: "bronze",
    condition: (s) => s.workflowsCompleted >= 1 },
  { id: "workflow_expert", name: "流程专家", description: "完成3条工作流", icon: "⚙️", tier: "gold",
    condition: (s) => s.workflowsCompleted >= 3 },
  { id: "sharer", name: "分享达人", description: "生成5张分享卡片", icon: "📤", tier: "silver",
    condition: (s) => s.shareCardsGenerated >= 5 },
  { id: "daily_7", name: "每日挑战者", description: "完成7天每日挑战", icon: "🎖️", tier: "gold",
    condition: (s) => s.challengeDaysCompleted >= 7 },
  { id: "all_rounder", name: "全能选手", description: "使用全部5个游戏分类", icon: "🌟", tier: "diamond",
    condition: (s) => s.uniqueGamesPlayed >= 5 },
];

export function checkAchievements(stats?: UserStats): Achievement[] {
  const s = stats || getStats();
  const unlocked = new Set(s.achievementsUnlocked);
  const newlyUnlocked: Achievement[] = [];

  for (const ach of achievements) {
    if (!unlocked.has(ach.id) && ach.condition(s)) {
      unlocked.add(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  if (newlyUnlocked.length > 0) {
    s.achievementsUnlocked = Array.from(unlocked);
    safeSave(KEYS.STATS, s);
  }

  return newlyUnlocked;
}

export function getUnlockedAchievements(): Achievement[] {
  const stats = getStats();
  return achievements.filter((a) => stats.achievementsUnlocked.includes(a.id));
}

export function getAchievementProgress(): { unlocked: number; total: number; percent: number } {
  const stats = getStats();
  const unlocked = stats.achievementsUnlocked.length;
  const total = achievements.length;
  return { unlocked, total, percent: Math.round((unlocked / total) * 100) };
}

/* ============ 排行榜系统 ============ */

// 预置的"其他玩家"假数据，制造竞争氛围
const FAKE_PLAYERS: { name: string; avatar: string }[] = [
  { name: "闪电手", avatar: "⚡" },
  { name: "键盘侠", avatar: "⌨️" },
  { name: "摸鱼王", avatar: "🐟" },
  { name: "数字魔", avatar: "🔢" },
  { name: "反应神", avatar: "🎯" },
  { name: "脑力帝", avatar: "🧠" },
  { name: "不服输", avatar: "😤" },
  { name: "肝帝", avatar: "🔥" },
  { name: "菜但爱玩", avatar: "🎮" },
  { name: "隐形大佬", avatar: "👤" },
  { name: "划水选手", avatar: "🏊" },
  { name: "卷王", avatar: "📈" },
];

function generateFakeScores(gameId: string): LeaderboardEntry[] {
  const seed = gameId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const count = 8 + (seed % 5);
  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < count; i++) {
    const player = FAKE_PLAYERS[(seed + i) % FAKE_PLAYERS.length];
    const baseScore = 1000 - i * 80 + ((seed * (i + 1)) % 200);
    entries.push({
      name: player.name,
      avatar: player.avatar,
      score: Math.max(50, baseScore),
      gameId,
      date: getDateStr(i),
    });
  }
  return entries.sort((a, b) => b.score - a.score);
}

export function getLeaderboard(gameId: string): LeaderboardEntry[] {
  const localScores = safeParse<LeaderboardEntry[]>(`${KEYS_LEADERBOARD}${gameId}`, []);
  const fakeScores = generateFakeScores(gameId);

  // Merge and sort
  const all = [...fakeScores, ...localScores].sort((a, b) => b.score - a.score);

  // Insert player's high score if exists
  const stats = getStats();
  const playerHigh = stats.highScores[gameId];
  if (playerHigh !== undefined) {
    const player = getPlayer();
    const playerEntry: LeaderboardEntry = {
      name: player.name + " (你)",
      avatar: player.avatar,
      score: playerHigh,
      gameId,
      date: getTodayStr(),
    };
    // Check if already in localScores
    const hasPlayer = localScores.some((e) => e.name.includes("(你)"));
    if (!hasPlayer) {
      all.push(playerEntry);
      all.sort((a, b) => b.score - a.score);
    }
  }

  return all;
}

const KEYS_LEADERBOARD = "gm_lb_";

export function submitScore(gameId: string, score: number, detail?: string): { rank: number; total: number; beatPercent: number } {
  const player = getPlayer();
  const entry: LeaderboardEntry = {
    name: player.name,
    avatar: player.avatar,
    score,
    gameId,
    date: getTodayStr(),
    detail,
  };

  const localScores = safeParse<LeaderboardEntry[]>(`${KEYS_LEADERBOARD}${gameId}`, []);
  localScores.push(entry);
  // Keep top 50 local scores
  localScores.sort((a, b) => b.score - a.score);
  if (localScores.length > 50) localScores.length = 50;
  safeSave(`${KEYS_LEADERBOARD}${gameId}`, localScores);

  // Record in stats
  recordGamePlay(gameId, score);

  // Calculate rank
  const board = getLeaderboard(gameId);
  const rank = board.findIndex((e) => e.name.includes("(你)") || (e.name === player.name && e.score === score)) + 1;
  const total = board.length;
  const beatPercent = total > 1 ? Math.round(((total - rank) / (total - 1)) * 100) : 100;

  return { rank: rank || total, total, beatPercent };
}

/* ============ Diss / 挑战系统 ============ */

export const dissTemplates = [
  "你的最高分才{score}？来比比啊！",
  "就这成绩也好意思上榜？不服来战！",
  "听说你是排行榜第一？我笑了，来PK！",
  "挑战书已下达，敢接吗？菜鸡！",
  "{score}分就飘了？看我怎么碾压你！",
  "你这水平我闭眼都能打，来battle！",
  "菜鸡互啄？不，是我单方面碾压你！",
  "别躲了，我知道你在线，来一战！",
  "你的成绩像在跟我开玩笑，认真的吗？",
  "我今天心情好，给你个挑战我的机会！",
  "听说你很厉害？我不信，证明给我看！",
  "{score}分？我左手都能打出来！",
];

export function createDiss(gameId: string, score: number, targetName: string): { url: string; message: string } {
  const player = getPlayer();
  const template = dissTemplates[Math.floor(Math.random() * dissTemplates.length)];
  const message = template.replace("{score}", String(score));

  const diss: ChallengeDiss = {
    id: Date.now().toString(36),
    from: player.name,
    fromAvatar: player.avatar,
    to: targetName,
    gameId,
    score,
    message,
    createdAt: Date.now(),
  };

  // Save to local
  const dissList = safeParse<ChallengeDiss[]>(KEYS.DISS, []);
  dissList.unshift(diss);
  if (dissList.length > 100) dissList.length = 100;
  safeSave(KEYS.DISS, dissList);

  // Generate challenge URL
  const params = new URLSearchParams({
    challenge: btoa(JSON.stringify({ gameId, score, from: player.name, message })),
  });

  return { url: `${typeof window !== "undefined" ? window.location.origin : "https://99gongju.online"}/games/${gameId}?${params}`, message };
}

export function receiveDiss(): { gameId: string; score: number; from: string; message: string } | null {
  if (!isClient()) return null;
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("challenge");
  if (!encoded) return null;
  try {
    return JSON.parse(atob(encoded));
  } catch {
    return null;
  }
}

export function getDissList(): ChallengeDiss[] {
  return safeParse<ChallengeDiss[]>(KEYS.DISS, []);
}

/* ============ 每日挑战 ============ */

// Deterministic daily game selection based on date
export function getTodayChallenge(): { gameId: string; gameName: string; task: string; target: number } {
  const today = getTodayStr();
  const dateNum = parseInt(today.replace(/-/g, ""), 10);

  const challenges = [
    { gameId: "typing-test", gameName: "打字速度测试", task: "达到 40 WPM", target: 40 },
    { gameId: "reaction-test", gameName: "反应力测试", task: "反应时间低于 300ms", target: 300 },
    { gameId: "stroop-test", gameName: "色字干扰测试", task: "30秒内答对 20 题", target: 20 },
    { gameId: "aim-trainer", gameName: "瞄准训练器", task: "30秒内击中 25 个目标", target: 25 },
    { gameId: "2048", gameName: "2048", task: "达到 512 方块", target: 512 },
    { gameId: "color-guess", gameName: "颜色辨别测试", task: "通过第 10 关", target: 10 },
  ];

  const selected = challenges[dateNum % challenges.length];
  return { ...selected, gameId: selected.gameId };
}

export function isDailyChallengeCompleted(): boolean {
  const today = getTodayStr();
  const completed = safeParse<Record<string, boolean>>(KEYS.DAILY, {});
  return completed[today] === true;
}

export function completeDailyChallenge(score?: number): void {
  const today = getTodayStr();
  const completed = safeParse<Record<string, boolean>>(KEYS.DAILY, {});
  if (!completed[today]) {
    completed[today] = true;
    safeSave(KEYS.DAILY, completed);

    const stats = getStats();
    stats.challengeDaysCompleted++;
    safeSave(KEYS.STATS, stats);
    checkAchievements(stats);
  }
}

/* ============ 技能树 ============ */

export interface SkillNode {
  category: string;
  categoryName: string;
  icon: string;
  level: number;
  maxLevel: number;
  progress: number;
  toolsUsed: number;
}

export function getSkillTree(): SkillNode[] {
  const stats = getStats();
  const categories = [
    { name: "计算工具", displayName: "计算", icon: "🧮" },
    { name: "文本工具", displayName: "文本", icon: "📝" },
    { name: "生成工具", displayName: "生成", icon: "✨" },
    { name: "转换工具", displayName: "转换", icon: "🔄" },
    { name: "设计工具", displayName: "设计", icon: "🎨" },
    { name: "图片工具", displayName: "图片", icon: "🖼️" },
    { name: "生活工具", displayName: "生活", icon: "🏠" },
    { name: "开发工具", displayName: "开发", icon: "💻" },
    { name: "PDF工具", displayName: "PDF", icon: "📄" },
    { name: "查询工具", displayName: "查询", icon: "🔍" },
    { name: "教育学习", displayName: "教育", icon: "📚" },
    { name: "金融理财", displayName: "金融", icon: "💰" },
    { name: "健康医疗", displayName: "健康", icon: "❤️" },
    { name: "视频音频", displayName: "音视频", icon: "🎬" },
  ];

  return categories.map((cat) => {
    // Count tools used in this category
    const toolKey = `tool_`;
    let toolsInCategory = 0;
    for (const key of Object.keys(stats.highScores)) {
      if (key.startsWith(toolKey)) {
        // We don't have category info in highScores, approximate
        toolsInCategory++;
      }
    }
    // Distribute roughly
    const perCat = Math.floor(toolsInCategory / categories.length);
    const level = perCat >= 10 ? 3 : perCat >= 5 ? 2 : perCat >= 1 ? 1 : 0;
    return {
      category: cat.name,
      categoryName: cat.displayName,
      icon: cat.icon,
      level,
      maxLevel: 3,
      progress: perCat,
      toolsUsed: perCat,
    };
  });
}

/* ============ 弹幕系统 ============ */

export const danmakuPool: Record<string, string[]> = {
  game_start: ["冲冲冲！", "又来挑战了", "这把我必赢", "稳住能赢", "让我试试", "来了来了"],
  game_good: ["太强了！", "卧槽牛逼", "学到了", "高手！", "这操作我服", "666666", "膜拜大佬"],
  game_fail: ["哈哈哈菜鸡", "就这？", "下次一定", "我上我也行", "笑死", "太菜了吧"],
  game_clear: ["通关大师！", "太秀了", "这就是大佬吗", "跪了跪了", "不可超越", "YYDS"],
  diss: ["就这水平？", "不服来战！", "我奶奶都比你强", "太菜了太菜了", "就这？就这？", "你行的你行的（反话）"],
};

export function getRandomDanmaku(scene: string): string {
  const pool = danmakuPool[scene] || danmakuPool.game_good;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getUserDanmaku(): string[] {
  return safeParse<string[]>("gm_user_danmaku", []);
}

export function addUserDanmaku(text: string): void {
  const list = getUserDanmaku();
  if (list.length < 50) {
    list.push(text);
    safeSave("gm_user_danmaku", list);
  }
}
