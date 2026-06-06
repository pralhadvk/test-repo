"use client";

import { useRouter } from "next/navigation";

type Result   = { rank: number; name: string; description: string };
type Search   = { id: string; query: string; category: string | null; slug: string; created_at: string; results: Result[] };
type Stats    = { total: number; thisWeek: number; today: number; categories: number; cached: number };

const CAT_COLOR: Record<string, string> = {
  food:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  travel:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  tech:          "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};
const CAT_ICON: Record<string, string> = {
  food: "🍕", travel: "✈️", tech: "💻", finance: "💰", entertainment: "🎬",
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function DashboardClient({ searches, stats }: { searches: Search[]; stats: Stats }) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 pb-16 pt-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Live search activity · auto-refreshes every 30s
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 border border-slate-800 px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Auth coming soon
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Total",        value: stats.total,      color: "border-white/10" },
            { label: "This week",    value: stats.thisWeek,   color: "border-blue-500/20" },
            { label: "Today",        value: stats.today,      color: "border-violet-500/20" },
            { label: "Categories",   value: stats.categories, color: "border-emerald-500/20" },
            { label: "Cached",       value: stats.cached,     color: "border-amber-500/20" },
          ].map(c => (
            <div key={c.label} className={`bg-white/[0.03] border ${c.color} rounded-2xl p-4`}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-3xl font-bold">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Search feed */}
        <div>
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-4">
            Recent Searches
          </h2>

          {searches.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
              <p className="text-slate-500 text-sm">No searches yet.</p>
              <button onClick={() => router.push("/")}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Make the first search →
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {searches.map(s => (
                <div key={s.id}
                  className="group bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-200">

                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-medium">{s.query}</span>
                      {s.category && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CAT_COLOR[s.category] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}>
                          {CAT_ICON[s.category]} {s.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-slate-600 text-xs">{timeAgo(s.created_at)}</span>
                      <button
                        onClick={() => router.push(`/?q=${encodeURIComponent(s.query)}`)}
                        className="text-xs text-slate-500 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/30 px-3 py-1 rounded-lg transition-all">
                        Replay →
                      </button>
                    </div>
                  </div>

                  {s.results.length > 0 && (
                    <div className="space-y-1.5">
                      {s.results.map(r => (
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
