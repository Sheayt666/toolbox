"use client";

import { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Film, Plus, Trash2, Star, Check } from "lucide-react";

interface Movie {
  id: string;
  title: string;
  rating: number;
  status: "想看" | "已看";
  note: string;
}

export default function MovieWishlistPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"想看" | "已看">("想看");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("全部");

  useEffect(() => {
    const saved = localStorage.getItem("movie-wishlist-data");
    if (saved) setMovies(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("movie-wishlist-data", JSON.stringify(movies));
  }, [movies]);

  const handleAdd = () => {
    if (!title.trim()) return;
    setMovies([{ id: Date.now().toString(), title: title.trim(), rating, status, note: note.trim() }, ...movies]);
    setTitle(""); setRating(0); setNote(""); setStatus("想看");
  };

  const handleDelete = (id: string) => setMovies(movies.filter((m) => m.id !== id));
  const handleToggle = (id: string) => setMovies(movies.map((m) => m.id === id ? { ...m, status: m.status === "想看" ? "已看" : "想看" } : m));

  const filtered = filter === "全部" ? movies : movies.filter((m) => m.status === filter);
  const watchedCount = movies.filter((m) => m.status === "已看").length;
  const avgRating = watchedCount > 0 ? (movies.filter((m) => m.status === "已看" && m.rating > 0).reduce((s, m) => s + m.rating, 0) / watchedCount).toFixed(1) : "0.0";

  return (
    <ToolLayout title="观影清单" description="记录想看和已看的电影" icon={Film} category="生活工具" slug="movie-wishlist">
      <div className="p-6">
        <div className="max-w-xl mx-auto">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center"><div className="text-xs text-slate-500">已看</div><div className="text-2xl font-bold text-emerald-400">{watchedCount}</div></div>
            <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl text-center"><div className="text-xs text-slate-500">平均评分</div><div className="text-2xl font-bold text-yellow-400">{avgRating}</div></div>
          </div>

          <div className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl mb-4">
            <div className="flex gap-3 flex-wrap mb-3">
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} placeholder="电影名称" className="flex-1 min-w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
              <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white text-sm">
                <option value="想看">想看</option><option value="已看">已看</option>
              </select>
              <button onClick={handleAdd} disabled={!title.trim()} className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors inline-flex items-center gap-1"><Plus className="w-4 h-4" />添加</button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">评分:</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} onClick={() => setRating(s)}><Star className={`w-5 h-5 ${s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} /></button>
                ))}
              </div>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="备注（可选）" className="flex-1 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none text-sm" />
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            {["全部", "想看", "已看"].map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a]"}`}>{f}</button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 bg-[#09090b] border border-[#27272a] rounded-xl group">
                <button onClick={() => handleToggle(m.id)} className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.status === "已看" ? "bg-emerald-500/20 text-emerald-400" : "bg-[#27272a] text-slate-500"}`}>
                  <Check className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${m.status === "已看" ? "text-slate-500 line-through" : "text-white"}`}>{m.title}</div>
                  {m.note && <div className="text-xs text-slate-500 truncate">{m.note}</div>}
                </div>
                {m.rating > 0 && (
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1,2,3,4,5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= m.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-700"}`} />)}
                  </div>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${m.status === "已看" ? "bg-emerald-500/10 text-emerald-400" : "bg-primary-500/10 text-primary-400"}`}>{m.status}</span>
                <button onClick={() => handleDelete(m.id)} className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-12 text-slate-500">暂无电影记录</div>}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
