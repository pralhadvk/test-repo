"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

type Metrics = {
  kpi: { total_searches: string; today: string; this_week: string; this_month: string };
  cacheHits: { active_cache: string; recent_searches: string };
  volumeChart: { day: string; count: number }[];
  topQueries: { query: string; category: string | null; count: number }[];
  categoryBreakdown: { category: string; count: number }[];
  affiliateClicks: { type: string; count: number }[];
  collectionsTotal: number;
  curatedRows: { vertical: string; city: string | null; count: number }[];
  apiKeys: { total: number; usage: number };
};

const CAT_COLORS: Record<string, string> = {
  food: "#f97316", travel: "#38bdf8", tech: "#818cf8",
  finance: "#34d399", entertainment: "#c084fc", uncategorized: "#475569",
};

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

const tooltipStyle = {
  contentStyle: { background: "#0e1420", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, fontSize: 12 },
  labelStyle: { color: "#94a3b8" },
  itemStyle: { color: "#e2e8f0" },
};

const CAT_ICON: Record<string, string> = {
  food: "🍕", travel: "✈️", tech: "💻", finance: "💰", entertainment: "🎬", uncategorized: "—",
};

export default function AdminClient({ metrics }: { metrics: Metrics }) {
  const totalInt   = parseInt(metrics.kpi.total_searches);
  const weekInt    = parseInt(metrics.kpi.this_week);
  const todayInt   = parseInt(metrics.kpi.today);
  const activeCache = parseInt(metrics.cacheHits.active_cache);
  const cacheHitRate = totalInt > 0 ? Math.round((activeCache / totalInt) * 100) : 0;

  const KPIS = [
    { label: "All-Time Searches", value: totalInt.toLocaleString(),  color: "border-white/10",       sub: "" },
    { label: "This Month",        value: parseInt(metrics.kpi.this_month).toLocaleString(), color: "border-blue-500/20",   sub: "" },
    { label: "This Week",         value: weekInt.toLocaleString(),   color: "border-violet-500/20",  sub: "" },
    { label: "Today",             value: todayInt.toLocaleString(),  color: "border-emerald-500/20", sub: "" },
    { label: "Cache Active",      value: activeCache.toLocaleString(), color: "border-amber-500/20", sub: `${cacheHitRate}% hit rate` },
    { label: "Collections",       value: metrics.collectionsTotal.toLocaleString(), color: "border-pink-500/20", sub: "" },
    { label: "API Keys",          value: metrics.apiKeys.total.toLocaleString(), color: "border-cyan-500/20", sub: `${metrics.apiKeys.usage} total calls` },
    { label: "Curated Results",   value: metrics.curatedRows.reduce((a, r) => a + r.count, 0).toLocaleString(), color: "border-lime-500/20", sub: "human-verified" },
  ];

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 pb-20 pt-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium uppercase tracking-widest">Live</span>
            </div>
            <h1 className="text-3xl font-bold">Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Your YC traction story — live from the database</p>
          </div>
          <p className="text-slate-700 text-xs">Admin Dashboard · 3C Search</p>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {KPIS.map(k => (
            <div key={k.label} className={`bg-white/[0.03] border ${k.color} rounded-2xl p-4`}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{k.label}</p>
              <p className="text-3xl font-bold">{k.value}</p>
              {k.sub && <p className="text-slate-600 text-[10px] mt-1">{k.sub}</p>}
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {/* Search volume — 7 day area chart */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-5">Search Volume — Last 7 Days</h2>
            {metrics.volumeChart.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-700 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={metrics.volumeChart} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="day" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#volGrad)" name="Searches" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category breakdown — pie */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-5">Category Mix</h2>
            {metrics.categoryBreakdown.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-700 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={metrics.categoryBreakdown} dataKey="count" nameKey="category"
                    cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                    {metrics.categoryBreakdown.map((entry, i) => (
                      <Cell key={entry.category}
                        fill={CAT_COLORS[entry.category] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle.contentStyle} />
                  <Legend
                    formatter={(value) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{CAT_ICON[value] ?? ""} {value}</span>}
                    iconSize={8}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Top queries */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Top Queries</h2>
            {metrics.topQueries.length === 0 ? (
              <p className="text-slate-700 text-sm py-4 text-center">No searches yet</p>
            ) : (
              <div className="space-y-2">
                {metrics.topQueries.map((q, i) => {
                  const maxCount = metrics.topQueries[0].count;
                  return (
                    <div key={q.query} className="flex items-center gap-3">
                      <span className="text-slate-600 text-xs font-mono w-5 text-right shrink-0">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-slate-300 text-xs truncate">{q.query}</span>
                          {q.category && (
                            <span className="text-[9px] text-slate-500 shrink-0">{CAT_ICON[q.category] ?? ""}</span>
                          )}
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500/60 rounded-full"
                            style={{ width: `${(q.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                      <span className="text-slate-500 text-xs shrink-0 font-mono">{q.count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Affiliate clicks */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Affiliate Clicks</h2>
            {metrics.affiliateClicks.length === 0 ? (
              <p className="text-slate-700 text-sm py-4 text-center">No clicks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.affiliateClicks} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="type" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="count" name="Clicks" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Curated verticals status */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <h2 className="text-slate-400 text-xs uppercase tracking-widest mb-4">Curated Verticals (Data Moat)</h2>
          {metrics.curatedRows.length === 0 ? (
            <p className="text-slate-700 text-sm">No curated data yet</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {metrics.curatedRows.map(r => (
                <div key={`${r.vertical}-${r.city}`}
                  className="bg-lime-500/10 border border-lime-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                  <span className="text-lime-300 text-sm font-medium capitalize">{r.vertical}</span>
                  {r.city && <span className="text-lime-600 text-xs">· {r.city}</span>}
                  <span className="text-lime-500 text-xs font-mono">{r.count} queries</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-slate-700 text-xs mt-3">
            Curated results override AI for known queries — human-verified quality that LLMs can&apos;t instantly copy.
          </p>
        </div>
      </div>
    </main>
  );
}
