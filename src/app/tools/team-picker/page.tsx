"use client";

import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Users, Shuffle, Copy, Check, Plus, X, RefreshCw } from "lucide-react";

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

interface Member {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  members: Member[];
}

const defaultMembers: Member[] = [
  { id: generateId(), name: "张三" },
  { id: generateId(), name: "李四" },
  { id: generateId(), name: "王五" },
  { id: generateId(), name: "赵六" },
  { id: generateId(), name: "钱七" },
  { id: generateId(), name: "孙八" },
  { id: generateId(), name: "周九" },
  { id: generateId(), name: "吴十" },
];

const teamColors = [
  "from-red-500 to-rose-500",
  "from-orange-500 to-amber-500",
  "from-yellow-500 to-amber-400",
  "from-green-500 to-emerald-500",
  "from-teal-500 to-cyan-500",
  "from-blue-500 to-indigo-500",
  "from-violet-500 to-purple-500",
  "from-pink-500 to-rose-500",
  "from-fuchsia-500 to-pink-500",
  "from-sky-500 to-blue-500",
];

export default function TeamPickerPage() {
  const [members, setMembers] = useState<Member[]>(defaultMembers);
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newMemberName, setNewMemberName] = useState("");
  const [mode, setMode] = useState<"count" | "size">("count");
  const [teamSize, setTeamSize] = useState(4);
  const [isShuffling, setIsShuffling] = useState(false);

  const addMember = () => {
    if (!newMemberName.trim()) return;
    setMembers([...members, { id: generateId(), name: newMemberName.trim() }]);
    setNewMemberName("");
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const updateMember = (id: string, name: string) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, name } : m)));
  };

  const batchAddMembers = () => {
    const input = prompt("请输入成员名单，每行一个名字：");
    if (!input) return;
    const names = input
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;
    const newMembers = names.map((name) => ({ id: generateId(), name }));
    setMembers([...members, ...newMembers]);
  };

  const clearMembers = () => {
    if (confirm("确定清空所有成员吗？")) {
      setMembers([]);
      setTeams([]);
    }
  };

  const shuffleTeams = useCallback(() => {
    if (members.length < 2) return;

    setIsShuffling(true);

    // Fisher-Yates shuffle
    const shuffled = [...members];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    let numTeams = teamCount;
    if (mode === "size") {
      numTeams = Math.ceil(members.length / teamSize);
    }
    numTeams = Math.min(numTeams, members.length);

    const newTeams: Team[] = [];
    for (let i = 0; i < numTeams; i++) {
      newTeams.push({
        id: generateId(),
        name: `第 ${i + 1} 队`,
        members: [],
      });
    }

    // Distribute members
    shuffled.forEach((member, idx) => {
      const teamIdx = idx % numTeams;
      newTeams[teamIdx].members.push(member);
    });

    setTimeout(() => {
      setTeams(newTeams);
      setIsShuffling(false);
    }, 400);
  }, [members, teamCount, mode, teamSize]);

  const copyResults = () => {
    const text = teams
      .map((team, idx) => {
        const memberNames = team.members.map((m) => m.name).join("、");
        return `${team.name}（${team.members.length}人）：${memberNames}`;
      })
      .join("\n");
    navigator.clipboard.writeText(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addMember();
    }
  };

  return (
    <ToolLayout
      title="随机分组工具"
      description="在线随机分组/分队工具，自定义成员和队伍数量，公平随机分配，支持批量添加"
      icon={Users}
      category="生成工具"
      slug="team-picker"
      toolId="team-picker"
    >
      {/* 工具栏 */}
      <div className="bg-[#18181b] border-b border-[#27272a] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">随机分组</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={shuffleTeams}
            disabled={members.length < 2}
            className={`inline-flex items-center gap-2 px-5 py-2 text-white text-sm font-medium rounded-xl transition-all shadow-lg ${
              isShuffling
                ? "bg-zinc-600 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 shadow-indigo-500/25"
            }`}
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? "animate-spin" : ""}`} />
            {isShuffling ? "分配中..." : "开始分组"}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 分组设置 */}
        <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center bg-[#18181b] rounded-lg p-0.5 border border-[#27272a]">
              <button
                onClick={() => setMode("count")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === "count"
                    ? "bg-[#27272a] text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                按队伍数
              </button>
              <button
                onClick={() => setMode("size")}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === "size"
                    ? "bg-[#27272a] text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                按每队人数
              </button>
            </div>

            {mode === "count" ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">分成</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, members.length)}
                  value={teamCount}
                  onChange={(e) => setTeamCount(Math.max(1, Math.min(members.length, Number(e.target.value) || 1)))}
                  className="w-20 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-center font-mono focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                />
                <span className="text-sm text-slate-400">队</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">每队</span>
                <input
                  type="number"
                  min={1}
                  max={members.length || 1}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 px-3 py-1.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-center font-mono focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none"
                />
                <span className="text-sm text-slate-400">人</span>
              </div>
            )}

            <div className="text-sm text-slate-500">
              共 {members.length} 人 · 预计每队约 {members.length > 0 ? Math.ceil(members.length / (mode === "count" ? teamCount : Math.ceil(members.length / teamSize))) : 0} 人
            </div>
          </div>
        </div>

        {/* 成员管理 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-300">
              成员名单（{members.length}）
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={batchAddMembers}
                className="text-xs text-slate-400 hover:text-indigo-400"
              >
                批量添加
              </button>
              <button
                onClick={clearMembers}
                className="text-xs text-slate-400 hover:text-red-400"
              >
                清空
              </button>
            </div>
          </div>

          {/* 添加成员 */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入成员姓名，按回车添加"
              className="flex-1 px-4 py-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none placeholder-slate-600"
            />
            <button
              onClick={addMember}
              disabled={!newMemberName.trim()}
              className="px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>

          {/* 成员列表 */}
          {members.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-lg group"
                >
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(member.id, e.target.value)}
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none"
                  />
                  <button
                    onClick={() => removeMember(member.id)}
                    className="p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {members.length === 0 && (
            <div className="text-center py-12 bg-[#09090b] border border-dashed border-[#27272a] rounded-xl">
              <Users className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">暂无成员，请添加成员后开始分组</p>
            </div>
          )}
        </div>

        {/* 分组结果 */}
        {teams.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Shuffle className="w-4 h-4 text-indigo-400" />
                分组结果（{teams.length} 队）
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={shuffleTeams}
                  className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  重新分组
                </button>
                <button
                  onClick={copyResults}
                  className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  复制结果
                </button>
              </div>
            </div>

            <div className={`grid gap-4 ${teams.length <= 2 ? "md:grid-cols-2" : teams.length <= 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"}`}>
              {teams.map((team, idx) => (
                <div
                  key={team.id}
                  className={`bg-gradient-to-br ${teamColors[idx % teamColors.length]} p-[1px] rounded-xl transition-all ${isShuffling ? "animate-pulse" : ""}`}
                >
                  <div className="bg-[#18181b] rounded-xl p-4 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-semibold">{team.name}</h4>
                      <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded-full">
                        {team.members.length} 人
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="px-3 py-1.5 bg-white/5 rounded-lg text-white text-sm"
                        >
                          {member.name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="p-5 border-t border-[#27272a]">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">使用提示</h3>
        <ul className="text-sm text-slate-500 space-y-1.5">
          <li>• 添加成员名单后，点击「开始分组」即可随机分配队伍</li>
          <li>• 支持两种模式：按队伍数量分配、按每队人数分配</li>
          <li>• 支持批量添加成员，每行一个名字快速录入</li>
          <li>• 使用 Fisher-Yates 洗牌算法，确保公平随机</li>
        </ul>
      </div>
    </ToolLayout>
  );
}
