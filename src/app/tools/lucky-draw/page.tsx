"use client";

import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Ticket, Plus, Trash2, Shuffle, Trophy, RotateCcw } from "lucide-react";

export default function LuckyDrawPage() {
  const [participants, setParticipants] = useState<string[]>([
    "张三", "李四", "王五", "赵六", "钱七", "孙八"
  ]);
  const [newParticipant, setNewParticipant] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [winners, setWinners] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [displayNames, setDisplayNames] = useState<string[]>([]);

  const addParticipant = () => {
    if (!newParticipant.trim()) return;
    if (participants.includes(newParticipant.trim())) return;
    setParticipants((prev) => [...prev, newParticipant.trim()]);
    setNewParticipant("");
  };

  const removeParticipant = (index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  const drawWinners = () => {
    if (participants.length < 2 || isDrawing) return;
    setIsDrawing(true);
    setWinners([]);

    let count = 0;
    const totalFrames = 25;
    const countNum = Math.min(winnerCount, participants.length);

    const interval = setInterval(() => {
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      setDisplayNames(shuffled.slice(0, countNum));
      count++;
      if (count >= totalFrames) {
        clearInterval(interval);
        const finalWinners = [...participants].sort(() => Math.random() - 0.5).slice(0, countNum);
        setDisplayNames(finalWinners);
        setWinners(finalWinners);
        setIsDrawing(false);
      }
    }, 100);
  };

  const resetDraw = () => {
    setWinners([]);
    setDisplayNames([]);
  };

  const batchAdd = () => {
    const input = prompt("批量输入参与者，每行一个：");
    if (input) {
      const names = input.split("\n").map(n => n.trim()).filter(n => n);
      const uniqueNames = [...new Set([...participants, ...names])];
      setParticipants(uniqueNames);
    }
  };

  return (
    <ToolLayout
      title="抽奖抽签工具"
      description="在线抽奖抽签，从参与者中随机抽取获奖者，支持批量导入和多奖项设置"
      icon={Ticket}
      category="生活工具"
      slug="lucky-draw"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 抽奖区域 */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg shadow-emerald-500/25">
          <div className="text-center">
            <div className="text-sm text-white/70 mb-4">
              {isDrawing ? "抽奖进行中..." : winners.length > 0 ? "🎉 中奖名单" : "点击开始抽奖"}
            </div>

            <div className="min-h-[120px] flex flex-col items-center justify-center mb-6 gap-2">
              {displayNames.length > 0 ? (
                displayNames.map((name, i) => (
                  <div
                    key={i}
                    className={`text-3xl font-bold transition-all ${
                      winners.length > 0 && !isDrawing ? "text-yellow-300" : ""
                    }`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {winners.length > 0 && !isDrawing && <Trophy className="w-6 h-6 inline mr-2" />}
                    {name}
                  </div>
                ))
              ) : (
                <div className="text-white/50 text-lg">
                  {participants.length < 2 ? "请先添加参与者" : "准备就绪"}
                </div>
              )}
            </div>

            {/* 中奖人数选择 */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-sm text-white/70">中奖人数:</span>
              <div className="flex items-center gap-1 bg-white/10 rounded-lg p-1">
                {[1, 3, 5, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setWinnerCount(n)}
                    className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                      winnerCount === n
                        ? "bg-white text-emerald-600 font-medium"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    {n}人
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={drawWinners}
                disabled={participants.length < 2 || isDrawing}
                className="px-8 py-3 bg-white text-emerald-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Shuffle className={`w-5 h-5 ${isDrawing ? "animate-spin" : ""}`} />
                {isDrawing ? "抽奖中..." : "开始抽奖"}
              </button>
              {winners.length > 0 && (
                <button
                  onClick={resetDraw}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  重置
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 参与者管理 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-emerald-400" />
              参与者列表 ({participants.length}人)
            </h3>
            <button
              onClick={batchAdd}
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              批量添加
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              placeholder="输入参与者姓名..."
              className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={addParticipant}
              disabled={!newParticipant.trim()}
              className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {participants.map((p, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                  winners.includes(p)
                    ? "bg-emerald-500/20 border-emerald-500/50"
                    : "bg-[#09090b] border-[#27272a]"
                }`}
              >
                <span className={`text-sm truncate ${winners.includes(p) ? "text-emerald-400 font-medium" : "text-slate-300"}`}>
                  {p}
                </span>
                <button
                  onClick={() => removeParticipant(index)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              暂无参与者，请添加
            </div>
          )}
        </div>

        {/* 快捷模板 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">快捷示例</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setParticipants(["张三", "李四", "王五", "赵六", "钱七", "孙八", "周九", "吴十"])}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              8人示例
            </button>
            <button
              onClick={() => setParticipants(["一等奖", "二等奖", "三等奖", "参与奖", "谢谢参与"])}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              奖项模板
            </button>
            <button
              onClick={() => setParticipants(["1号", "2号", "3号", "4号", "5号", "6号", "7号", "8号", "9号", "10号"])}
              className="px-3 py-2 bg-[#09090b] hover:bg-[#27272a] text-slate-400 hover:text-white text-sm rounded-lg border border-[#27272a] transition-colors"
            >
              1-10号
            </button>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
