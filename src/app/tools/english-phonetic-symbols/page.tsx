"use client";

import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import { Volume2 } from "lucide-react";

interface Phonetic {
  symbol: string;
  type: string;
  example: string;
  word: string;
}

const PHONETICS: Phonetic[] = [
  { symbol: "/iː/", type: "长元音", example: "see", word: "/siː/" },
  { symbol: "/ɪ/", type: "短元音", example: "sit", word: "/sɪt/" },
  { symbol: "/e/", type: "短元音", example: "bed", word: "/bed/" },
  { symbol: "/æ/", type: "短元音", example: "cat", word: "/kæt/" },
  { symbol: "/ɑː/", type: "长元音", example: "car", word: "/kɑː/" },
  { symbol: "/ɒ/", type: "短元音", example: "hot", word: "/hɒt/" },
  { symbol: "/ɔː/", type: "长元音", example: "call", word: "/kɔːl/" },
  { symbol: "/ʊ/", type: "短元音", example: "book", word: "/bʊk/" },
  { symbol: "/uː/", type: "长元音", example: "food", word: "/fuːd/" },
  { symbol: "/ʌ/", type: "短元音", example: "cup", word: "/kʌp/" },
  { symbol: "/ɜː/", type: "长元音", example: "bird", word: "/bɜːd/" },
  { symbol: "/ə/", type: "短元音", example: "about", word: "/əˈbaʊt/" },
  { symbol: "/eɪ/", type: "双元音", example: "day", word: "/deɪ/" },
  { symbol: "/aɪ/", type: "双元音", example: "my", word: "/maɪ/" },
  { symbol: "/ɔɪ/", type: "双元音", example: "boy", word: "/bɔɪ/" },
  { symbol: "/aʊ/", type: "双元音", example: "now", word: "/naʊ/" },
  { symbol: "/əʊ/", type: "双元音", example: "go", word: "/ɡəʊ/" },
  { symbol: "/ɪə/", type: "双元音", example: "ear", word: "/ɪə/" },
  { symbol: "/eə/", type: "双元音", example: "air", word: "/eə/" },
  { symbol: "/ʊə/", type: "双元音", example: "tour", word: "/tʊə/" },
  { symbol: "/p/", type: "清辅音", example: "pen", word: "/pen/" },
  { symbol: "/b/", type: "浊辅音", example: "bad", word: "/bæd/" },
  { symbol: "/t/", type: "清辅音", example: "tea", word: "/tiː/" },
  { symbol: "/d/", type: "浊辅音", example: "did", word: "/dɪd/" },
  { symbol: "/k/", type: "清辅音", example: "cat", word: "/kæt/" },
  { symbol: "/g/", type: "浊辅音", example: "got", word: "/gɒt/" },
  { symbol: "/f/", type: "清辅音", example: "fall", word: "/fɔːl/" },
  { symbol: "/v/", type: "浊辅音", example: "van", word: "/væn/" },
  { symbol: "/θ/", type: "清辅音", example: "thin", word: "/θɪn/" },
  { symbol: "/ð/", type: "浊辅音", example: "this", word: "/ðɪs/" },
  { symbol: "/s/", type: "清辅音", example: "see", word: "/siː/" },
  { symbol: "/z/", type: "浊辅音", example: "zoo", word: "/zuː/" },
  { symbol: "/ʃ/", type: "清辅音", example: "she", word: "/ʃiː/" },
  { symbol: "/ʒ/", type: "浊辅音", example: "vision", word: "/ˈvɪʒn/" },
  { symbol: "/h/", type: "清辅音", example: "hat", word: "/hæt/" },
  { symbol: "/m/", type: "浊辅音", example: "man", word: "/mæn/" },
  { symbol: "/n/", type: "浊辅音", example: "no", word: "/nəʊ/" },
  { symbol: "/ŋ/", type: "浊辅音", example: "sing", word: "/sɪŋ/" },
  { symbol: "/l/", type: "浊辅音", example: "leg", word: "/leɡ/" },
  { symbol: "/r/", type: "浊辅音", example: "red", word: "/red/" },
  { symbol: "/w/", type: "半元音", example: "wet", word: "/wet/" },
  { symbol: "/j/", type: "半元音", example: "yes", word: "/jes/" },
  { symbol: "/tʃ/", type: "清辅音", example: "chain", word: "/tʃeɪn/" },
  { symbol: "/dʒ/", type: "浊辅音", example: "jam", word: "/dʒæm/" },
  { symbol: "/ts/", type: "清辅音", example: "cats", word: "/kæts/" },
  { symbol: "/dz/", type: "浊辅音", example: "beds", word: "/bedz/" },
];

const TYPE_COLORS: Record<string, string> = {
  "长元音": "text-red-400 bg-red-500/10", "短元音": "text-orange-400 bg-orange-500/10",
  "双元音": "text-yellow-400 bg-yellow-500/10", "清辅音": "text-blue-400 bg-blue-500/10",
  "浊辅音": "text-emerald-400 bg-emerald-500/10", "半元音": "text-purple-400 bg-purple-500/10",
};

export default function EnglishPhoneticSymbolsPage() {
  const [typeFilter, setTypeFilter] = useState("全部");

  const types = useMemo(() => ["全部", ...Array.from(new Set(PHONETICS.map((p) => p.type)))], []);
  const filtered = useMemo(() => typeFilter === "全部" ? PHONETICS : PHONETICS.filter((p) => p.type === typeFilter), [typeFilter]);

  const handleSpeak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 0.7;
      speechSynthesis.speak(utter);
    }
  };

  return (
    <ToolLayout title="英语音标学习" description="国际音标发音学习" icon={Volume2} category="教育学习" slug="english-phonetic-symbols">
      <div className="p-6">
        <div className="flex gap-2 mb-6 flex-wrap">
          {types.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "bg-[#09090b] text-slate-400 border border-[#27272a] hover:border-[#3f3f46]"}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((p, i) => (
            <div key={i} className="p-4 bg-[#09090b] border border-[#27272a] rounded-xl hover:border-primary-500/30 transition-colors text-center">
              <div className="text-3xl font-mono font-bold text-primary-400 mb-2">{p.symbol}</div>
              <span className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${TYPE_COLORS[p.type] || "text-slate-400 bg-slate-500/10"}`}>{p.type}</span>
              <button onClick={() => handleSpeak(p.example)} className="flex items-center justify-center gap-1 w-full text-sm text-slate-400 hover:text-primary-400 transition-colors">
                <Volume2 className="w-3 h-3" /> {p.example}
              </button>
              <div className="text-xs text-slate-600 font-mono mt-1">{p.word}</div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
