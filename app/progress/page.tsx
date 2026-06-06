"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RadialBarChart, RadialBar, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "todo" | "in_progress" | "completed" | "blocked";

interface Task {
  id: number;
  parent_id: number | null;
  phase: number | null;
  order_index: number;
  title: string;
  description: string | null;
  status: Status;
  created_at: string;
  updated_at: string | null;
  completed_at: string | null;
  children?: Task[];
}

interface Stats {
  total: number; completed: number; in_progress: number; todo: number; blocked: number; pct: number;
}

interface SectionStat { id: number; title: string; total: number; completed: number; pct: number }

interface PhaseStat {
  phase: number; name: string; color: string; bg: string;
  total: number; completed: number; in_progress: number; todo: number; blocked: number; pct: number;
  sections: SectionStat[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const PHASE_META: Record<number, { name: string; color: string; bg: string }> = {
  1: { name: "Foundation",    color: "#3b82f6", bg: "border-blue-500/20" },
  2: { name: "Virality",      color: "#8b5cf6", bg: "border-violet-500/20" },
  3: { name: "Monetization",  color: "#10b981", bg: "border-emerald-500/20" },
  4: { name: "Defensibility", color: "#f59e0b", bg: "border-amber-500/20" },
};

const STATUS_COLORS: Record<Status, string> = {
  completed: "#10b981", in_progress: "#3b82f6", todo: "#334155", blocked: "#ef4444",
};
const STATUS_LABELS: Record<Status, string> = {
  completed: "Done", in_progress: "Active", todo: "Todo", blocked: "Blocked",
};
const STATUS_BADGE: Record<Status, string> = {
  completed:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  in_progress: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  todo:        "bg-slate-700/50 text-slate-500 border-slate-600/20",
  blocked:     "bg-red-500/20 text-red-400 border-red-500/30",
};
const STATUS_DOT: Record<Status, string> = {
  completed: "●", in_progress: "◉", todo: "○", blocked: "⊗",
};
const STATUS_CYCLE: Status[] = ["todo", "in_progress", "completed", "blocked"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildTree(flat: Task[]): Task[] {
  const map = new Map<number, Task>();
  flat.forEach(t => map.set(t.id, { ...t, children: [] }));
  const roots: Task[] = [];
  map.forEach(t => {
    if (t.parent_id === null) roots.push(t);
    else map.get(t.parent_id)?.children?.push(t);
  });
  const sort = (arr: Task[]) => arr.sort((a, b) => a.order_index - b.order_index).map(t => { sort(t.children!); return t; });
  return sort(roots).sort((a, b) => (a.phase ?? 99) - (b.phase ?? 99));
}

function computeAll(flat: Task[]) {
  const leafs = flat.filter(t => !flat.some(x => x.parent_id === t.id));
  const total = leafs.length;
  const completed = leafs.filter(t => t.status === "completed").length;
  const in_progress = leafs.filter(t => t.status === "in_progress").length;
  const blocked = leafs.filter(t => t.status === "blocked").length;
  const todo = leafs.filter(t => t.status === "todo").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phases: PhaseStat[] = [1, 2, 3, 4].flatMap(ph => {
    const meta = PHASE_META[ph];
    const root = flat.find(t => t.parent_id === null && t.phase === ph);
    if (!root) return [];
    const sections = flat.filter(t => t.parent_id === root.id);
    const sectionStats: SectionStat[] = sections.map(sec => {
      const kids = flat.filter(t => t.parent_id === sec.id);
      const l = kids.length > 0 ? kids : [sec];
      const done = l.filter(t => t.status === "completed").length;
      return { id: sec.id, title: sec.title, total: l.length, completed: done, pct: l.length > 0 ? Math.round((done / l.length) * 100) : 0 };
    });
    const phLeafs = leafs.filter(t => {
      const p = flat.find(x => x.id === t.parent_id);
      if (!p) return false;
      const gp = flat.find(x => x.id === p.parent_id);
      return gp?.id === root.id || p.id === root.id;
    });
    const phTotal = phLeafs.length;
    const phDone = phLeafs.filter(t => t.status === "completed").length;
    const phActive = phLeafs.filter(t => t.status === "in_progress").length;
    const phBlocked = phLeafs.filter(t => t.status === "blocked").length;
    const phTodo = phLeafs.filter(t => t.status === "todo").length;
    return [{
      phase: ph, name: meta.name, color: meta.color, bg: meta.bg,
      total: phTotal, completed: phDone, in_progress: phActive, todo: phTodo, blocked: phBlocked,
      pct: phTotal > 0 ? Math.round((phDone / phTotal) * 100) : 0,
      sections: sectionStats,
    }];
  });

  return { stats: { total, completed, in_progress, todo, blocked, pct }, phases };
}

// ─── Tooltip style ────────────────────────────────────────────────────────────
const ttStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, color: "#fff", fontSize: 12 };

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProgressPage() {
  const [flat, setFlat] = useState<Task[]>([]);
  const [tree, setTree] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, in_progress: 0, todo: 0, blocked: 0, pct: 0 });
  const [phases, setPhases] = useState<PhaseStat[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      const tasks: Task[] = data.tasks ?? [];
      setFlat(tasks);
      setTree(buildTree(tasks));
      const { stats: s, phases: p } = computeAll(tasks);
      setStats(s);
      setPhases(p);
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function cycleStatus(id: number, current: Status) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length];
    const updated = flat.map(t => t.id === id ? { ...t, status: next, updated_at: new Date().toISOString() } : t);
    setFlat(updated);
    setTree(buildTree(updated));
    const { stats: s, phases: p } = computeAll(updated);
    setStats(s); setPhases(p);
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  function toggle(id: number) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // Chart data
  const gaugeData = [{ value: stats.pct, fill: "#3b82f6" }];

  const phaseBarData = phases.map(p => ({
    name: `Ph ${p.phase}`,
    fullName: `Phase ${p.phase} — ${p.name}`,
    Completed: p.completed,
    "In Progress": p.in_progress,
    Todo: p.todo,
    Blocked: p.blocked,
  }));

  const donutData = [
    { name: "Completed",   value: stats.completed,   color: "#10b981" },
    { name: "In Progress", value: stats.in_progress,  color: "#3b82f6" },
    { name: "Todo",        value: stats.todo,         color: "#1e293b" },
    { name: "Blocked",     value: stats.blocked,      color: "#ef4444" },
  ].filter(d => d.value > 0);

  const activity = [...flat]
    .filter(t => t.status !== "todo" || t.updated_at !== null)
    .sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime())
    .slice(0, 10);

  // Recursive task tree renderer
  function renderTask(task: Task, depth = 0): React.ReactNode {
    const hasKids = (task.children?.length ?? 0) > 0;
    const isOpen = expanded.has(task.id);
    const isLeaf = !hasKids;

    return (
      <div key={task.id}>
        <div
          className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${isLeaf ? "hover:bg-white/5" : ""}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          {hasKids
            ? <button onClick={() => toggle(task.id)} className="w-4 text-slate-600 hover:text-slate-300 text-[10px]">{isOpen ? "▼" : "▶"}</button>
            : <span className="w-4 text-slate-800 text-xs shrink-0">—</span>
          }

          <span className={`flex-1 text-sm truncate ${isLeaf ? "text-slate-300" : "text-slate-400 font-medium"}`}>
            {task.title}
          </span>

          {isLeaf ? (
            <button
              onClick={() => cycleStatus(task.id, task.status)}
              title="Click to cycle status"
              className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border transition-all hover:scale-105 cursor-pointer ${STATUS_BADGE[task.status]}`}
            >
              {STATUS_DOT[task.status]} {STATUS_LABELS[task.status]}
            </button>
          ) : (
            <span className="text-[11px] text-slate-600 shrink-0">
              {task.children?.filter(c => c.status === "completed").length ?? 0}/{task.children?.length ?? 0}
            </span>
          )}
        </div>

        {hasKids && isOpen && task.children?.map(c => renderTask(c, depth + 1))}
      </div>
    );
  }

  if (loading && flat.length === 0) {
    return (
      <main className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <span className="w-5 h-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
          Loading progress data…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 pb-16 pt-10">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <a href="/" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">← Search</a>
              <span className="text-slate-700">/</span>
              <h1 className="text-2xl font-bold">Build Progress</h1>
              <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-mono">version_1</span>
            </div>
            <p className="text-slate-600 text-xs">
              YC Roadmap · 3C Search{lastSync ? ` · synced ${lastSync.toLocaleTimeString()}` : ""}
            </p>
          </div>
          <button onClick={refresh} disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all disabled:opacity-50">
            {loading ? <span className="w-3.5 h-3.5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" /> : "↻"}
            Refresh
          </button>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Tasks",  value: stats.total,       sub: "4 phases · 12 sections", color: "border-white/10" },
            { label: "Completed",    value: `${stats.pct}%`,   sub: `${stats.completed} tasks done`, color: "border-emerald-500/20" },
            { label: "In Progress",  value: stats.in_progress, sub: "active tasks",            color: "border-blue-500/20" },
            { label: "Remaining",    value: stats.todo,        sub: `${stats.blocked} blocked`, color: "border-slate-700/50" },
          ].map(c => (
            <div key={c.label} className={`bg-white/[0.03] border ${c.color} rounded-2xl p-5`}>
              <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">{c.label}</p>
              <p className="text-3xl font-bold">{c.value}</p>
              <p className="text-slate-600 text-xs mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Gauge + Donut ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Overall Completion</p>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart cx="50%" cy="85%" innerRadius="65%" outerRadius="95%"
                  startAngle={180} endAngle={0} data={gaugeData} barSize={22}>
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar background={{ fill: "#1e293b" }} dataKey="value" angleAxisId={0}
                    fill="#3b82f6" cornerRadius={12} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
                <p className="text-5xl font-black text-white leading-none">{stats.pct}<span className="text-2xl text-slate-500">%</span></p>
                <p className="text-slate-500 text-xs mt-1">{stats.completed} of {stats.total} leaf tasks</p>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Status Distribution</p>
            <div className="flex items-center gap-2">
              <ResponsiveContainer width="55%" height={180}>
                <PieChart>
                  <Pie data={donutData.length > 0 ? donutData : [{ name: "Todo", value: 1, color: "#1e293b" }]}
                    cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3} stroke="none">
                    {(donutData.length > 0 ? donutData : [{ name: "Todo", value: 1, color: "#1e293b" }]).map((e, i) =>
                      <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={ttStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {[
                  { label: "Completed",   val: stats.completed,   color: "#10b981" },
                  { label: "In Progress", val: stats.in_progress,  color: "#3b82f6" },
                  { label: "Todo",        val: stats.todo,         color: "#334155" },
                  { label: "Blocked",     val: stats.blocked,      color: "#ef4444" },
                ].map(d => (
                  <div key={d.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-slate-400 text-xs">{d.label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{d.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stacked Bar Chart ──────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-6">Phase Breakdown — Tasks by Status</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={phaseBarData} barCategoryGap="35%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={ttStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }}
                formatter={(val, name) => [val, name]} labelFormatter={(l, p) => p?.[0]?.payload?.fullName ?? l} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12, paddingTop: 16 }} />
              <Bar dataKey="Completed"   stackId="a" fill="#10b981" />
              <Bar dataKey="In Progress" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Blocked"     stackId="a" fill="#ef4444" />
              <Bar dataKey="Todo"        stackId="a" fill="#1e293b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Phase Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {phases.map(ph => (
            <div key={ph.phase} className={`bg-white/[0.03] border ${ph.bg} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ph.color }} />
                  <span className="text-white font-semibold text-sm">Phase {ph.phase} — {ph.name}</span>
                </div>
                <span className="text-xl font-bold" style={{ color: ph.color }}>{ph.pct}%</span>
              </div>

              {/* Phase progress bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${ph.pct}%`, background: ph.color }} />
              </div>

              {/* Mini stat row */}
              <div className="flex gap-4 text-xs text-slate-500 mb-4">
                <span><span className="text-emerald-400 font-medium">{ph.completed}</span> done</span>
                <span><span className="text-blue-400 font-medium">{ph.in_progress}</span> active</span>
                <span><span className="text-slate-400 font-medium">{ph.todo}</span> todo</span>
                {ph.blocked > 0 && <span><span className="text-red-400 font-medium">{ph.blocked}</span> blocked</span>}
              </div>

              {/* Section bars */}
              <div className="space-y-2.5">
                {ph.sections.map(sec => (
                  <div key={sec.id}>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span className="truncate pr-2">{sec.title}</span>
                      <span className="shrink-0 tabular-nums">{sec.completed}/{sec.total}</span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${sec.pct}%`, background: ph.color + "bb" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Activity Log + Task Tree ───────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Activity log */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-4">Activity Log</p>
            {activity.length === 0 ? (
              <p className="text-slate-600 text-sm">No activity yet — click task badges to update status.</p>
            ) : (
              <div className="space-y-3 max-h-72 overflow-auto">
                {activity.map(t => (
                  <div key={t.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: STATUS_COLORS[t.status] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-300 text-sm truncate">{t.title}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        {new Date(t.updated_at ?? t.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status]}`}>
                      {STATUS_DOT[t.status]} {STATUS_LABELS[t.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task tree */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-slate-400 text-xs uppercase tracking-widest">Task Tree</p>
              <div className="flex gap-3">
                <button onClick={() => setExpanded(new Set(flat.map(t => t.id)))}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">Expand all</button>
                <button onClick={() => setExpanded(new Set())}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">Collapse</button>
              </div>
            </div>
            <div className="overflow-auto max-h-72 -mx-1 px-1 space-y-0.5">
              {tree.map(t => renderTask(t))}
            </div>
            <p className="text-slate-700 text-[11px] mt-3 pt-3 border-t border-white/5">
              Click any status badge to cycle: todo → active → done → blocked
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
