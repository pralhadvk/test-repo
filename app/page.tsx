"use client";

import { useState, useRef, KeyboardEvent, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
  { badge: "from-slate-300 to-slate-400",  border: "hover:border-slate-400/40",  glow: "hover:shadow-slate-400/10" },
  { badge: "from-orange-400 to-amber-600", border: "hover:border-orange-500/40", glow: "hover:shadow-orange-500/10" },
];

function SaveModal({
  query,
  results,
  onClose,
}: {
  query: string;
  results: Result[];
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), query, results }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setCollectionId(data.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0e1420] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {collectionId ? (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-white font-semibold text-lg mb-1">Collection created!</h3>
              <p className="text-slate-500 text-sm">Bookmark this link to access your collection</p>
            </div>
            <Link href={`/collections/${collectionId}`}
              className="block w-full text-center bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl text-sm transition-colors mb-3">
              View collection →
            </Link>
            <button onClick={onClose}
              className="w-full text-slate-500 hover:text-white text-sm py-2 transition-colors">
              Close
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold">Save to Collection</h3>
              <button onClick={onClose} className="text-slate-600 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-slate-500 text-xs mb-4">
              Saving &ldquo;{query}&rdquo; and its results
            </p>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save()}
              placeholder="Collection name…"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-emerald-500/40 mb-3"
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button onClick={save} disabled={!name.trim() || saving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 rounded-xl text-sm transition-colors">
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [rawText, setRawText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) search(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function search(q?: string) {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    setResults([]);
    setRawText("");
    setSearched(true);
    setLastQuery(searchQuery);
    setSlug(null);
    setCopied(false);
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
      if (data.slug) setSlug(data.slug);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") search();
  }

  async function copyShareLink() {
    if (!slug) return;
    const url = `${window.location.origin}/s/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <>
      {showSaveModal && (
        <SaveModal
          query={lastQuery}
          results={results}
          onClose={() => setShowSaveModal(false)}
        />
      )}

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
              <Link href="/trending"
                className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 px-3 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                See trending →
              </Link>
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

            {/* Share + Save bar */}
            {slug && (
              <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314" />
                  </svg>
                  <span className="text-slate-500 text-xs">Share this result</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/s/${slug}`}
                    className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                    View page
                  </Link>
                  <button onClick={copyShareLink}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      copied
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-slate-400 hover:text-white"
                    }`}>
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy link
                      </>
                    )}
                  </button>
                  <button onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 bg-white/5 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 px-3 py-1.5 rounded-lg transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Search again */}
            <div className="pt-2 text-center">
              <button onClick={() => { setSearched(false); setResults([]); setQuery(""); setSlug(null); setTimeout(() => inputRef.current?.focus(), 50); }}
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
    </>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeInner />
    </Suspense>
  );
}
