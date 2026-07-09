"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { ListTodo, Plus, Trash2, CheckCircle2, Circle, Filter, CalendarDays } from "lucide-react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  priority: "low" | "medium" | "high";
}

type FilterType = "all" | "active" | "completed";

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  // 从 localStorage 加载
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todo-list-data");
      if (saved) {
        setTodos(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem("todo-list-data", JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodoText.trim()) return;
    const newTodo: Todo = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      priority,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setNewTodoText("");
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.completed));
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "high": return "text-rose-400 bg-rose-500/20";
      case "medium": return "text-amber-400 bg-amber-500/20";
      case "low": return "text-emerald-400 bg-emerald-500/20";
      default: return "text-slate-400 bg-slate-500/20";
    }
  };

  const getPriorityLabel = (p: string) => {
    switch (p) {
      case "high": return "高";
      case "medium": return "中";
      case "low": return "低";
      default: return "";
    }
  };

  return (
    <ToolLayout
      title="待办事项"
      description="简洁高效的待办事项管理工具，支持优先级设置，轻松管理日常任务"
      icon={ListTodo}
      category="生活工具"
      slug="todo-list"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 头部统计 */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/25">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/70 mb-1">今日待办</div>
              <div className="text-4xl font-bold">
                {activeCount}
                <span className="text-xl text-white/60 ml-1">项待完成</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/70 mb-1">已完成</div>
              <div className="text-2xl font-bold">{completedCount}</div>
              {todos.length > 0 && (
                <div className="text-xs text-white/60 mt-1">
                  {Math.round((completedCount / todos.length) * 100)}% 完成率
                </div>
              )}
            </div>
          </div>
          {todos.length > 0 && (
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/80 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / todos.length) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* 添加任务 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="添加新的待办事项..."
              className="flex-1 px-4 py-3 bg-[#09090b] border border-[#27272a] rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <button
              onClick={addTodo}
              disabled={!newTodoText.trim()}
              className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* 优先级选择 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">优先级:</span>
            <div className="flex gap-1">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all ${
                    priority === p
                      ? getPriorityColor(p) + " font-medium"
                      : "bg-[#09090b] text-slate-500 hover:text-slate-300 border border-[#27272a]"
                  }`}
                >
                  {getPriorityLabel(p)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 筛选和列表 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] overflow-hidden">
          {/* 筛选栏 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272a] bg-[#09090b]">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <div className="flex gap-1">
                {(["all", "active", "completed"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 text-xs rounded-lg transition-all ${
                      filter === f
                        ? "bg-blue-500/20 text-blue-400 font-medium"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {f === "all" ? "全部" : f === "active" ? "进行中" : "已完成"}
                  </button>
                ))}
              </div>
            </div>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors"
              >
                清除已完成
              </button>
            )}
          </div>

          {/* 任务列表 */}
          <div className="max-h-96 overflow-y-auto">
            {filteredTodos.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {filter === "all"
                    ? "暂无待办事项"
                    : filter === "active"
                    ? "暂无进行中的任务"
                    : "暂无已完成的任务"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#27272a]">
                {filteredTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#09090b] transition-colors group"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0"
                    >
                      {todo.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                      )}
                    </button>
                    <span
                      className={`flex-1 text-sm ${
                        todo.completed
                          ? "text-slate-600 line-through"
                          : "text-slate-200"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-md ${getPriorityColor(todo.priority)}`}>
                      {getPriorityLabel(todo.priority)}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 说明 */}
        <div className="bg-[#18181b] rounded-2xl border border-[#27272a] p-6">
          <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            关于待办事项
          </h3>
          <div className="text-sm text-slate-400 space-y-2 leading-relaxed">
            <p>本工具支持任务优先级设置，帮助你更好地管理时间和任务。</p>
            <p>数据保存在浏览器本地存储中，刷新页面不会丢失。</p>
            <p>建议每天早上规划当天任务，晚上回顾完成情况。</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
