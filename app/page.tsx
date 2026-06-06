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

const EXAMPLES = ["best pizza in New York", "JavaScript frameworks 2024", "sci-fi movies to watch", "productivity apps"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function search(q?: string) {
    const searchQuery = q ?? query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setRawText("");
    setSearched(true);
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
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-start px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-5">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          Powered by GPT-4o mini
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3">
          3C Search
        </h1>
        <p className="text-slate-400 text-lg">Get the top 3 curated results for anything</p>
      </div>

      {/* Search box */}
      <div className="w-full max-w-2xl">
        <div className="flex gap-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-2 shadow-xl shadow-black/30 focus-within:border-blue-500/50 transition-colors">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="e.g. food in Hyderabad, best laptops, JS frameworks…"
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-base px-3 py-3 outline-none"
          />
          <button
            onClick={() => search()}
            disabled={loading || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>

        {/* Example chips */}
        {!searched && (
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => search(ex)}
                className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="w-full max-w-2xl mt-6 bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="w-full max-w-2xl mt-8 space-y-4">
          <p className="text-slate-500 text-sm text-center">Top 3 results for &ldquo;{query}&rdquo;</p>
          {results.map((r) => (
            <div
              key={r.rank}
              className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 flex gap-4 transition-all duration-200"
            >
              <div className="shrink-0 w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold text-sm flex items-center justify-center">
                {r.rank}
              </div>
              <div>
                <h2 className="text-white font-semibold text-base mb-1 group-hover:text-blue-300 transition-colors">
                  {r.name}
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed">{r.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw fallback */}
      {rawText && (
        <div className="w-full max-w-2xl mt-8 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {rawText}
        </div>
      )}

      {/* Footer */}
      <p className="mt-16 text-slate-600 text-xs">3C Search — Top 3 for everything</p>
    </main>
  );
}
