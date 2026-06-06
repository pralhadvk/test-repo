"use client";

import { useRouter } from "next/navigation";

type Result = { rank: number; name: string; description: string };
type Search = {
  id: string;
  query: string;
  category: string | null;
  slug: string;
  created_at: string;
  results: Result[];
};
type Stats = { total: number; thisWeek: number; categories: number };

const CATEGORY_COLORS: Record<string, string> = {
  food:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  travel:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  tech:          "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const CATEGORY_ICONS: Record<string, string> = {
  food: "🍕", travel: "✈️", tech: "💻", finance: "💰", entertainment: "🎬",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function DashboardClient({
  searches,
  stats,
  userName,
}: {
  searches: Search[];
  stats: Stats;
  userName: string;
}) {
  const router = useRouter();

  function replay(query: string) {
    router.push(`/?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 pb-16 pt-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Hey, <span className="text-blue-400">{userName}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm">Your 3C Search history</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total searches",  value: stats.total,      color: "border-white/10" },
            { label: "This week",       value: stats.thisWeek,   color: "border-blue-500/20" },
            { label: "Categories used", value: stats.categories, color: "border-violet-500/20" },
          ].map(c => (
            <div key={c.label} className={`bg-white/[0.03] border ${c.color} rounded-2xl p-5`}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-4xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div>
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Search History</h2>

          {searches.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-slate-500 text-sm">No searches yet.</p>
              <button onClick={() => router.push("/")}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Make your first search →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map((s) => (
                <div key={s.id}
                  className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-200">

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium text-base">{s.query}</span>
                      {s.category && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[s.category] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}>
                          {CATEGORY_ICONS[s.category]} {s.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-600 text-xs">{timeAgo(s.created_at)}</span>
                      <button
                        onClick={() => replay(s.query)}
                        className="text-xs text-slate-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 px-3 py-1 rounded-lg transition-all">
                        Replay →
                      </button>
                    </div>
                  </div>

                  {/* Results preview */}
                  {s.results.length > 0 && (
                    <div className="space-y-1.5">
                      {s.results.slice(0, 3).map((r) => (
                        <div key={r.rank} className="flex items-start gap-2.5 text-sm">
                          <span className="shrink-0 w-5 h-5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {r.rank}
                          </span>
                          <div className="min-w-0">
                            <span className="text-slate-300 font-medium">{r.name}</span>
                            <span className="text-slate-600"> — </span>
                            <span className="text-slate-500 text-xs">{r.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
