"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { BookMarked, Plus, Trash2, Check } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  status: "想读" | "在读" | "已读";
  progress: number;
  note: string;
}

export default function ReadingListPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [filter, setFilter] = useState("全部");

  useEffect(() => {
    const saved = localStorage.getItem("reading-list-data");
    if (saved) setBooks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("reading-list-data", JSON.stringify(books));
  }, [books]);

  const handleAdd = () => {
    if (!title.trim()) return;
    setBooks([{ id: Date.now().toString(), title: title.trim(), author: author.trim() || "未知", status: "想读", progress: 0, note: "" }, ...books]);
    setTitle(""); setAuthor("");
  };

  const handleDelete = (id: string) => setBooks(books.filter((b) => b.id !== id));
  const handleStatusChange = (id: string, status: Book["status"]) => setBooks(books.map((b) => b.id === id ? { ...b, status, progress: status === "已读" ? 100 : status === "想读" ? 0 : b.progress } : b));
  const handleProgress = (id: string, progress: number) => setBooks(books.map((b) => b.id === id ? { ...b, progress, status: progress >= 100 ? "已读" : progress > 0 ? "在读" : "想读" } : b));

  const filtered = filter === "全部" ? books : books.filter((b) => b.status === filter);
  const counts = { 想读: books.filter((b) => b.status === "想读").length, 在读: books.filter((b) => b.status === "在读").length, 已读: books.filter((b) => b.status === "已读").length };

  const STATUS_COLORS: Record<string, string> = { "想读": "text-blue-400 bg-blue-500/10", "在读": "text-orange-400 bg-orange-500/10", "已读": "text-emerald-400 bg-emerald-500/10" };

  return (
    <ToolLayout title="阅读清单" description="管理想读和在读的书籍" icon={BookMarked} category="生活工具" slug="reading-list">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-6">
            {Object.entries(counts).map(([status, count]) => (
              <div key={status} className="p-3 bg-[#09090b] border border-[#27272a] rounded-xl text-center">
                <div className="text-xs text-slate-500">{status}</div>
                <div className="text-xl font-bold text-white">{count}</div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-4">
            <div className="flex gap-3 flex-wrap">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="书名" className="flex-1 min-w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="作者" className="w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <button onClick={handleAdd} disabled={!title.trim()} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-1"><Plus className="w-4 h-4" />添加</button>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {["全部", "想读", "在读", "已读"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a]"}`}>{f}</button>
            ))}
          </div>

          <div className="space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl group">
                <div className="flex items-center gap-3 mb-2">
                  <BookMarked className="w-5 h-5 text-primary-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.author}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${STATUS_COLORS[b.status]}`}>{b.status}</span>
                  <button onClick={() => handleDelete(b.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                {b.status === "在读" && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <input type="range" min="0" max="100" value={b.progress} onChange={(e) => handleProgress(b.id, Number(e.target.value))} className="flex-1 accent-primary-500" />
                      <span className="text-xs text-slate-400 w-10 text-right">{b.progress}%</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-1 mt-2">
                  {(["想读", "在读", "已读"] as const).map((s) => (
                    <button key={s} onClick={() => handleStatusChange(b.id, s)} className={`px-2 py-1 rounded text-xs transition-all ${b.status === s ? STATUS_COLORS[s] : "bg-[#18181b] text-slate-500 hover:text-slate-400"}`}>{s}</button>
                  ))}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-slate-500">暂无书籍记录</div>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
