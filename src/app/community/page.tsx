"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { games, getGameById } from "@/lib/games";
import {
  getPlayer,
  setPlayer,
  getRandomAvatar,
  getLeaderboard,
  getDissList,
  createDiss,
  getUnlockedAchievements,
  getSkillTree,
  danmakuPool,
  getUserDanmaku,
  addUserDanmaku,
  type PlayerInfo,
  type LeaderboardEntry,
  type ChallengeDiss,
  type Achievement,
  type SkillNode,
} from "@/lib/gamification";
import {
  Trophy,
  Clock,
  ChevronRight,
  CheckCircle,
  Home,
  Send,
  Settings,
  Swords,
  MessageSquare,
  Award,
  Zap,
  Copy,
  ChevronDown,
} from "lucide-react";

const AVATAR_LIST = [
  "🐱", "🦊", "🐼", "🐨", "🦁", "🐯", "🐸", "🐵",
  "🦄", "🐲", "🤖", "👻", "💀", "🥷", "🧙", "Wizard",
];

const tierConfig: Record<
  string,
  { label: string; className: string; badge: string }
> = {
  bronze: {
    label: "青铜",
    className: "text-amber-700 bg-amber-700/10 border-amber-700/20",
    badge: "🥉",
  },
  silver: {
    label: "白银",
    className: "text-slate-300 bg-slate-300/10 border-slate-300/20",
    badge: "🥈",
  },
  gold: {
    label: "黄金",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    badge: "🥇",
  },
  diamond: {
    label: "钻石",
    className: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    badge: "💎",
  },
};

const danmakuColors = [
  "#ffffff", "#a855f7", "#8b5cf6", "#ec4899",
  "#f59e0b", "#10b981", "#06b6d4", "#ef4444",
  "#f472b6", "#c084fc",
];

interface DanmakuItem {
  id: number;
  text: string;
  top: number;
  duration: number;
  color: string;
}

type TabId = "leaderboard" | "diss" | "danmaku";

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("leaderboard");

  // Player
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>({
    name: "",
    avatar: "",
  });
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Leaderboard
  const leaderboardGames = games.filter((g) => g.hasLeaderboard);
  const [selectedLbGame, setSelectedLbGame] = useState(
    leaderboardGames[0]?.id ?? "2048"
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Diss
  const [dissList, setDissList] = useState<ChallengeDiss[]>([]);
  const [dissGameId, setDissGameId] = useState(leaderboardGames[0]?.id ?? "2048");
  const [dissScore, setDissScore] = useState("");
  const [dissTarget, setDissTarget] = useState("");
  const [generatedDiss, setGeneratedDiss] = useState<{
    url: string;
    message: string;
  } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Danmaku
  const [userDanmaku, setUserDanmaku] = useState<string[]>([]);
  const [danmakuInput, setDanmakuInput] = useState("");
  const [activeDanmaku, setActiveDanmaku] = useState<DanmakuItem[]>([]);
  const danmakuIdRef = useRef(0);

  // Achievements
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Achievement[]
  >([]);

  // Skill tree
  const [skillTree, setSkillTree] = useState<SkillNode[]>([]);

  // ===== Load data on mount =====
  useEffect(() => {
    setMounted(true);
    const p = getPlayer();
    setPlayerInfo(p);
    setEditName(p.name);
    setEditAvatar(p.avatar);
    setLeaderboard(getLeaderboard(selectedLbGame));
    setDissList(getDissList());
    setUserDanmaku(getUserDanmaku());
    setUnlockedAchievements(getUnlockedAchievements());
    setSkillTree(getSkillTree());
  }, []);

  // Reload leaderboard when game changes
  useEffect(() => {
    if (mounted) {
      setLeaderboard(getLeaderboard(selectedLbGame));
    }
  }, [selectedLbGame, mounted]);

  // ===== Danmaku animation =====
  const spawnDanmaku = useCallback(() => {
    const allPool = [
      ...danmakuPool.game_start,
      ...danmakuPool.game_good,
      ...danmakuPool.game_fail,
      ...danmakuPool.game_clear,
      ...danmakuPool.diss,
      ...userDanmaku,
    ];
    if (allPool.length === 0) return;
    const text = allPool[Math.floor(Math.random() * allPool.length)];
    const item: DanmakuItem = {
      id: ++danmakuIdRef.current,
      text,
      top: Math.random() * 80 + 5,
      duration: 8 + Math.random() * 6,
      color: danmakuColors[Math.floor(Math.random() * danmakuColors.length)],
    };
    setActiveDanmaku((prev) => [...prev.slice(-20), item]);
  }, [userDanmaku]);

  useEffect(() => {
    if (!mounted || activeTab !== "danmaku") return;
    // Initial batch
    for (let i = 0; i < 4; i++) {
      setTimeout(() => spawnDanmaku(), i * 400);
    }
    const interval = setInterval(spawnDanmaku, 1800);
    return () => clearInterval(interval);
  }, [activeTab, mounted, spawnDanmaku]);

  const handleDanmakuEnd = useCallback((id: number) => {
    setActiveDanmaku((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // ===== Handlers =====
  const handleSavePlayer = () => {
    const name = editName.trim() || "匿名玩家";
    setPlayer(name, editAvatar);
    setPlayerInfo({ name, avatar: editAvatar });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRandomAvatar = () => {
    const av = getRandomAvatar();
    setEditAvatar(av);
  };

  const handleSendDanmaku = () => {
    const text = danmakuInput.trim();
    if (!text) return;
    addUserDanmaku(text);
    setUserDanmaku(getUserDanmaku());
    // Immediately spawn the new danmaku
    const item: DanmakuItem = {
      id: ++danmakuIdRef.current,
      text,
      top: Math.random() * 80 + 5,
      duration: 8 + Math.random() * 4,
      color: "#a855f7",
    };
    setActiveDanmaku((prev) => [...prev, item]);
    setDanmakuInput("");
  };

  const handleGenerateDiss = () => {
    const score = parseInt(dissScore, 10) || 0;
    const target = dissTarget.trim() || "全站玩家";
    const result = createDiss(dissGameId, score, target);
    setGeneratedDiss(result);
    setDissList(getDissList());
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // ignore
    }
  };

  // ===== Loading skeleton =====
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-[#18181b] rounded-xl w-64" />
            <div className="h-24 bg-[#18181b] rounded-xl" />
            <div className="h-10 bg-[#18181b] rounded-lg w-96" />
            <div className="h-64 bg-[#18181b] rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const tabs: { id: TabId; label: string; icon: typeof Trophy }[] = [
    { id: "leaderboard", label: "全站排行榜", icon: Trophy },
    { id: "diss", label: "Diss挑战墙", icon: Swords },
    { id: "danmaku", label: "弹幕墙", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Danmaku scroll animation */}
      <style>{`
        @keyframes danmaku-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100vw - 100%)); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs">
            <li>
              <Link
                href="/"
                className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                首页
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <li>
              <Link
                href="/games"
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                小游戏
              </Link>
            </li>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            <li>
              <span className="text-slate-300 font-medium">社区擂台</span>
            </li>
          </ol>
        </nav>

        {/* Title */}
        <div className="relative mb-8 overflow-hidden rounded-2xl">
          <div className="absolute inset-0 gradient-bg-hero" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="relative py-6 sm:py-8">
            <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2 tracking-tight">
              社区擂台 🏆
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              全站排行榜、Diss 挑战、弹幕互动 — 和全站玩家一较高下！
            </p>
          </div>
        </div>

        {/* Player Settings */}
        <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white">玩家信息设置</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Current avatar display */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20 flex items-center justify-center text-3xl flex-shrink-0">
                {playerInfo.avatar}
              </div>
              <div className="sm:hidden">
                <p className="text-sm font-bold text-white">{playerInfo.name}</p>
                <p className="text-xs text-slate-500">当前昵称</p>
              </div>
            </div>
            {/* Form */}
            <div className="flex-1 w-full space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  昵称
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={20}
                  className="w-full h-10 px-3 text-sm text-white bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 transition-all"
                  placeholder="输入你的昵称"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-slate-400">头像</label>
                  <button
                    onClick={handleRandomAvatar}
                    className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    🎲 随机
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {AVATAR_LIST.map((av) => (
                    <button
                      key={av}
                      onClick={() => setEditAvatar(av)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                        editAvatar === av
                          ? "bg-primary-500/20 border-2 border-primary-500"
                          : "bg-[#09090b] border border-[#27272a] hover:border-[#3f3f46]"
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Save button */}
            <div className="flex-shrink-0">
              <button
                onClick={handleSavePlayer}
                className={`inline-flex items-center gap-1.5 h-10 px-5 text-sm font-medium rounded-lg transition-all ${
                  saveSuccess
                    ? "bg-emerald-500 text-white"
                    : "bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:from-primary-500 hover:to-accent-500"
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    已保存
                  </>
                ) : (
                  "保存"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-[#18181b] border border-[#27272a] rounded-xl p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 h-10 px-3 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-primary-500 text-white shadow-lg shadow-primary-500/25"
                    : "text-slate-400 hover:text-white hover:bg-[#27272a]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
              {/* Game selector */}
              <div className="p-4 border-b border-[#27272a]">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-white">
                    全站排行榜
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {leaderboardGames.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setSelectedLbGame(g.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedLbGame === g.id
                          ? "bg-primary-500/20 text-primary-300 border border-primary-500/30"
                          : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white hover:border-[#3f3f46]"
                      }`}
                    >
                      <span>{g.icon}</span>
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Leaderboard table */}
              <div className="divide-y divide-[#27272a]">
                {leaderboard.slice(0, 15).map((entry, idx) => {
                  const isPlayer = entry.name.includes("(你)");
                  const rank = idx + 1;
                  return (
                    <div
                      key={`${entry.name}-${idx}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isPlayer
                          ? "bg-primary-500/5"
                          : "hover:bg-[#1c1c1f]"
                      }`}
                    >
                      {/* Rank */}
                      <div className="w-8 text-center flex-shrink-0">
                        {rank === 1 ? (
                          <span className="text-base">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-base">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-base">🥉</span>
                        ) : (
                          <span className="text-sm font-bold text-slate-500">
                            {rank}
                          </span>
                        )}
                      </div>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center text-base flex-shrink-0">
                        {entry.avatar}
                      </div>
                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <span
                          className={`text-sm font-medium truncate ${
                            isPlayer ? "text-primary-400" : "text-white"
                          }`}
                        >
                          {entry.name}
                        </span>
                        {entry.detail && (
                          <span className="ml-2 text-xs text-slate-500">
                            {entry.detail}
                          </span>
                        )}
                      </div>
                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-sm font-bold text-white">
                          {entry.score.toLocaleString()}
                        </span>
                        <span className="ml-1 text-xs text-slate-500">分</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Diss Wall Tab */}
          {activeTab === "diss" && (
            <div className="space-y-4">
              {/* Create new diss */}
              <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Swords className="w-4 h-4 text-primary-400" />
                  <h3 className="text-sm font-semibold text-white">
                    发起新的 Diss 挑战
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      选择游戏
                    </label>
                    <div className="relative">
                      <select
                        value={dissGameId}
                        onChange={(e) => setDissGameId(e.target.value)}
                        className="w-full h-10 pl-3 pr-8 text-sm text-white bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:border-primary-500/50 appearance-none cursor-pointer"
                      >
                        {leaderboardGames.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.icon} {g.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      你的分数
                    </label>
                    <input
                      type="number"
                      value={dissScore}
                      onChange={(e) => setDissScore(e.target.value)}
                      className="w-full h-10 px-3 text-sm text-white bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:border-primary-500/50"
                      placeholder="输入分数"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      挑战对象
                    </label>
                    <input
                      type="text"
                      value={dissTarget}
                      onChange={(e) => setDissTarget(e.target.value)}
                      maxLength={20}
                      className="w-full h-10 px-3 text-sm text-white bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:border-primary-500/50"
                      placeholder="玩家昵称（留空则挑战全站）"
                    />
                  </div>
                </div>
                <button
                  onClick={handleGenerateDiss}
                  className="inline-flex items-center gap-1.5 h-10 px-5 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg hover:from-primary-500 hover:to-accent-500 transition-all"
                >
                  <Swords className="w-4 h-4" />
                  生成挑战链接
                </button>

                {/* Generated diss result */}
                {generatedDiss && (
                  <div className="mt-4 p-4 bg-primary-500/5 border border-primary-500/20 rounded-lg animate-fade-in">
                    <p className="text-sm text-white mb-2">
                      <span className="text-slate-500">挑战宣言：</span>
                      {generatedDiss.message}
                    </p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedDiss.url}
                        className="flex-1 h-9 px-3 text-xs text-slate-400 bg-[#09090b] border border-[#27272a] rounded-lg truncate"
                      />
                      <button
                        onClick={() => handleCopyUrl(generatedDiss.url)}
                        className={`inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium rounded-lg transition-all flex-shrink-0 ${
                          copiedUrl
                            ? "bg-emerald-500 text-white"
                            : "bg-[#27272a] text-slate-300 hover:bg-[#3f3f46] hover:text-white"
                        }`}
                      >
                        {copiedUrl ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            已复制
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            复制
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Diss list */}
              <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
                <div className="p-4 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white">
                      已发送的 Diss 挑战
                    </h3>
                    <span className="text-xs text-slate-500">
                      ({dissList.length})
                    </span>
                  </div>
                </div>
                {dissList.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    还没有发送过 Diss 挑战，快来发起第一个吧！
                  </div>
                ) : (
                  <div className="divide-y divide-[#27272a]">
                    {dissList.map((diss) => {
                      const game = getGameById(diss.gameId);
                      return (
                        <div
                          key={diss.id}
                          className="p-4 hover:bg-[#1c1c1f] transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center text-xl flex-shrink-0">
                              {diss.fromAvatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-bold text-white">
                                  {diss.from}
                                </span>
                                <span className="text-xs text-slate-500">
                                  挑战
                                </span>
                                <span className="text-sm font-medium text-primary-400">
                                  {diss.to}
                                </span>
                                {game && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-[#27272a] rounded">
                                    {game.icon} {game.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-300 mb-1">
                                {diss.message}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="inline-flex items-center gap-1">
                                  <Trophy className="w-3 h-3" />
                                  {diss.score} 分
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(diss.createdAt).toLocaleDateString(
                                    "zh-CN"
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Danmaku Wall Tab */}
          {activeTab === "danmaku" && (
            <div className="space-y-4">
              {/* Danmaku display */}
              <div className="bg-[#18181b] rounded-xl border border-[#27272a] overflow-hidden">
                <div className="p-4 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-400" />
                    <h3 className="text-sm font-semibold text-white">弹幕墙</h3>
                    <span className="text-xs text-slate-500">
                      ({userDanmaku.length} 条已发送)
                    </span>
                  </div>
                </div>
                {/* Scrolling area */}
                <div className="relative h-64 bg-[#09090b] overflow-hidden">
                  {activeDanmaku.map((item) => (
                    <div
                      key={item.id}
                      className="absolute whitespace-nowrap text-sm font-medium pointer-events-none"
                      style={{
                        top: `${item.top}%`,
                        left: "100%",
                        color: item.color,
                        animation: `danmaku-scroll ${item.duration}s linear forwards`,
                        textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                      }}
                      onAnimationEnd={() => handleDanmakuEnd(item.id)}
                    >
                      {item.text}
                    </div>
                  ))}
                  {activeDanmaku.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-600">
                      弹幕正在加载中...
                    </div>
                  )}
                </div>
                {/* Send danmaku */}
                <div className="p-4 border-t border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={danmakuInput}
                      onChange={(e) => setDanmakuInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendDanmaku();
                      }}
                      maxLength={30}
                      className="flex-1 h-10 px-3 text-sm text-white bg-[#09090b] border border-[#27272a] rounded-lg focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/10 transition-all"
                      placeholder="发送一条弹幕..."
                    />
                    <button
                      onClick={handleSendDanmaku}
                      disabled={!danmakuInput.trim()}
                      className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg hover:from-primary-500 hover:to-accent-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                      发送
                    </button>
                  </div>
                  {/* Quick danmaku */}
                  <div className="mt-3">
                    <p className="text-xs text-slate-500 mb-2">快捷弹幕</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        ...danmakuPool.game_good.slice(0, 4),
                        ...danmakuPool.game_clear.slice(0, 2),
                      ].map((text, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            addUserDanmaku(text);
                            setUserDanmaku(getUserDanmaku());
                            const item: DanmakuItem = {
                              id: ++danmakuIdRef.current,
                              text,
                              top: Math.random() * 80 + 5,
                              duration: 8 + Math.random() * 4,
                              color: danmakuColors[
                                Math.floor(Math.random() * danmakuColors.length)
                              ],
                            };
                            setActiveDanmaku((prev) => [...prev, item]);
                          }}
                          className="px-2.5 py-1 text-xs text-slate-400 bg-[#09090b] border border-[#27272a] rounded-md hover:text-white hover:border-[#3f3f46] transition-all"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Achievement Display */}
        <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-primary-400" />
              <h2 className="text-sm font-semibold text-white">已解锁成就</h2>
              <span className="text-xs text-slate-500">
                ({unlockedAchievements.length} 个)
              </span>
            </div>
            <Link
              href="/games"
              className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
            >
              去解锁更多 →
            </Link>
          </div>
          {unlockedAchievements.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              还没有解锁任何成就，快去玩小游戏和使用工具吧！
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unlockedAchievements.map((ach) => {
                const tier = tierConfig[ach.tier] || tierConfig.bronze;
                return (
                  <div
                    key={ach.id}
                    className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500/15 to-accent-500/10 border border-primary-500/20 flex items-center justify-center text-xl flex-shrink-0">
                      {ach.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-bold text-white truncate">
                          {ach.name}
                        </span>
                        <span className="text-xs">{tier.badge}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {ach.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Tree */}
        <div className="bg-[#18181b] rounded-xl border border-[#27272a] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary-400" />
            <h2 className="text-sm font-semibold text-white">技能树</h2>
            <span className="text-xs text-slate-500">
              ({skillTree.filter((s) => s.level > 0).length}/{skillTree.length} 已激活)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {skillTree.map((skill) => (
              <div
                key={skill.category}
                className={`p-3 rounded-lg border transition-all ${
                  skill.level > 0
                    ? "bg-primary-500/5 border-primary-500/20"
                    : "bg-[#09090b] border-[#27272a]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{skill.icon}</span>
                  <span className="text-xs font-medium text-white truncate">
                    {skill.categoryName}
                  </span>
                </div>
                {/* Level bars */}
                <div className="flex items-center gap-1 mb-1.5">
                  {Array.from({ length: skill.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        i < skill.level
                          ? "bg-gradient-to-r from-primary-500 to-accent-500"
                          : "bg-[#27272a]"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">
                  Lv.{skill.level} / {skill.maxLevel}
                  {skill.toolsUsed > 0 && (
                    <span className="ml-1">· {skill.toolsUsed}个</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Back to games */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/games"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            返回游戏大厅
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
