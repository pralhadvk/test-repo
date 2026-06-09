"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type TrendRow = { query: string; count: number; category: string | null };

const ALL_CATS = ["food", "travel", "tech", "finance", "entertainment"];
const CAT_ICONS: Record<string, string> = { food: "🍕", travel: "✈️", tech: "💻", finance: "💰", entertainment: "🎬" };

const CAT_COLOR: Record<string, string> = {
  food:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  travel:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  tech:          "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const MEDAL = ["🥇", "🥈", "🥉"];

const PERIODS = [
  { key: "today", label: "Today" },
  { key: "week",  label: "This Week" },
  { key: "alltime", label: "All Time" },
];

export default function TrendingClient({
  trending,
  period,
  maxCount,
}: {
  trending: TrendRow[];
  period: string;
  maxCount: number;
}) {
  const router = useRouter();
  const [catFilter, setCatFilter] = useState<string | null>(null);

  const filtered = catFilter
    ? trending.filter(r => r.category === catFilter)
    : trending;
  const filteredMax = filtered[0]?.count ?? 1;

  function search(query: string) {
    router.push(`/?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 pb-20 pt-10 relative overflow-x-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              Live trends
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1">Trending Searches</h1>
          <p className="text-slate-500 text-sm">What people are searching right now</p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setCatFilter(null)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!catFilter ? "bg-white/10 border-white/20 text-white" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"}`}>
            All
          </button>
          {ALL_CATS.map(c => (
            <button key={c} onClick={() => setCatFilter(catFilter === c ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${catFilter === c ? "bg-blue-600/20 border-blue-500/40 text-blue-300" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"}`}>
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-8 bg-white/[0.03] border border-white/10 rounded-2xl p-1.5 w-fit">
          {PERIODS.map(p => (
            <Link key={p.key} href={`/trending?period=${p.key}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                period === p.key
                  ? "bg-white/10 text-white shadow"
                  : "text-slate-500 hover:text-white hover:bg-white/5"
              }`}>
              {p.label}
            </Link>
          ))}
        </div>

        {/* Trending list */}
        {filtered.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm mb-3">No searches yet for this period.</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
              Make the first search →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((row, idx) => {
              const barWidth = Math.max(4, Math.round((row.count / filteredMax) * 100));
              return (
                <div key={`${row.query}-${idx}`}
                  onClick={() => search(row.query)}
                  className="group relative bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-violet-500/30 rounded-2xl p-4 cursor-pointer transition-all duration-200 overflow-hidden">

                  {/* Progress bar background */}
                  <div
                    className="absolute inset-y-0 left-0 bg-violet-500/5 group-hover:bg-violet-500/8 transition-all duration-500 rounded-2xl"
                    style={{ width: `${barWidth}%` }}
                  />

                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank */}
                      <div className="shrink-0 w-8 text-center">
                        {idx < 3 ? (
                          <span className="text-lg">{MEDAL[idx]}</span>
                        ) : (
                          <span className="text-slate-600 font-mono text-sm font-bold">
                            #{idx + 1}
                          </span>
                        )}
                      </div>

                      {/* Query */}
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate group-hover:text-violet-200 transition-colors">
                          {row.query}
                        </p>
                        {row.category && (
                          <span className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${CAT_COLOR[row.category] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}>
                            {row.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{row.count}</p>
                        <p className="text-slate-600 text-[10px]">searches</p>
                      </div>
                      <svg className="w-4 h-4 text-slate-700 group-hover:text-violet-400 transition-colors"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        {filtered.length > 0 && (
          <p className="text-center text-slate-700 text-xs mt-8">
            Click any query to search it instantly
          </p>
        )}
      </div>
    </main>
  );
}
