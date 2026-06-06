"use client";

import { useState, useRef, KeyboardEvent } from "react";

type Result = { rank: number; name: string; description: string };

function parseResults(text: string): Result[] {
  const lines = text.split("\n").filter((l) => /^\d\./.test(l.trim()));
  return lines.map((line, i) => {
    const match = line.match(/^\d\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
    if (match) return { rank: i + 1, name: match[1].trim(), description: match[2].trim() };
    return { rank: i + 1, name: `Result ${i + 1}`, description: line.replace(/^\d\.\s*/, "").trim() };
  });
}

function linkify(text: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer"
        className="text-blue-400 underline underline-offset-2 hover:text-blue-300 transition-colors">
        {part}
      </a>
    ) : part
  );
}

const EXAMPLES = ["best pizza in New York", "JavaScript frameworks 2024", "sci-fi movies to watch", "productivity apps"];

const RANK_STYLES = [
  { badge: "from-amber-400 to-yellow-500", border: "hover:border-amber-500/40", glow: "hover:shadow-amber-500/10" },
  { badge: "from-slate-300 to-slate-400", border: "hover:border-slate-400/40", glow: "hover:shadow-slate-400/10" },
  { badge: "from-orange-400 to-amber-600", border: "hover:border-orange-500/40", glow: "hover:shadow-orange-500/10" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q?: string) {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    setResults([]);
    setRawText("");
    setSearched(true);
    setLastQuery(searchQuery);
    if (q) setQuery(q);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      const parsed = parseResults(data.result);
      if (parsed.length > 0) setResults(parsed);
      else setRawText(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") search();
  }

  return (
    <main className="min-h-screen bg-[#080c14] flex flex-col items-center px-4 py-16 relative overflow-x-hidden">

      {/* Background glow blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="text-center mb-12 relative">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          Powered by AI
        </div>
        <h1 className="text-6xl font-extrabold tracking-tight mb-3">
          <span className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            3C Search
          </span>
        </h1>
        <p className="text-slate-500 text-base">Top 3 curated results for anything you ask</p>
      </div>

      {/* Search box */}
      <div className="w-full max-w-2xl relative">
        <div className="relative flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 focus-within:border-blue-500/40 focus-within:bg-white/[0.07] transition-all duration-300 backdrop-blur-sm">
          <svg className="w-5 h-5 text-slate-500 ml-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="e.g. best laptops under $1000, food in Hyderabad…"
            className="flex-1 bg-transparent text-white placeholder-slate-600 text-base py-3 pr-2 outline-none"
          />
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0 shadow-lg shadow-blue-900/30 text-sm"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Searching…
              </>
            ) : "Search"}
          </button>
        </div>

        {/* Example chips */}
        {!searched && (
          <div className="flex flex-wrap gap-2 mt-5 justify-center">
            <span className="text-slate-600 text-xs self-center mr-1">Try:</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => search(ex)}
                className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full transition-all duration-200">
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl mt-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl text-sm flex gap-3 items-start">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex gap-4 animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-white/10 rounded-full w-1/3" />
                <div className="h-3 bg-white/5 rounded-full w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          <p className="text-slate-600 text-xs text-center tracking-wide uppercase">
            Top 3 for &ldquo;{lastQuery}&rdquo;
          </p>
          {results.map((r, idx) => {
            const style = RANK_STYLES[idx] ?? RANK_STYLES[2];
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(r.name)}`;
            return (
              <div key={r.rank}
                className={`group bg-white/[0.04] hover:bg-white/[0.07] border border-white/10 ${style.border} rounded-2xl p-5 flex gap-4 transition-all duration-300 shadow-lg ${style.glow} hover:shadow-xl hover:-translate-y-0.5 backdrop-blur-sm`}>
                {/* Rank badge */}
                <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${style.badge} flex items-center justify-center text-black font-bold text-sm shadow-md`}>
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-white font-semibold text-base leading-snug group-hover:text-blue-200 transition-colors">
                      {r.name}
                    </h2>
                    <a href={googleUrl} target="_blank" rel="noopener noreferrer"
                      title={`Search "${r.name}" on Google`}
                      className="shrink-0 text-slate-600 hover:text-blue-400 transition-colors mt-0.5"
                      onClick={(e) => e.stopPropagation()}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">{linkify(r.description)}</p>
                </div>
              </div>
            );
          })}

          {/* Search again */}
          <div className="pt-2 text-center">
            <button onClick={() => { setSearched(false); setResults([]); setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← New search
            </button>
          </div>
        </div>
      )}

      {/* Raw fallback */}
      {!loading && rawText && (
        <div className="w-full max-w-2xl mt-8 bg-white/[0.04] border border-white/10 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap backdrop-blur-sm">
          {rawText}
        </div>
      )}

      <p className="mt-20 text-slate-700 text-xs tracking-widest uppercase">3C Search</p>
    </main>
  );
}
