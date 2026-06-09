"use client";

import { useState, useEffect } from "react";

type ApiKey = { id: string; key: string; label: string; rate_limit: number; created_at: string };

const CODE_EXAMPLE = `curl -X POST https://top3-search.vercel.app/api/v1/search \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "best coffee in Berlin", "category": "food"}'`;

const CODE_RESPONSE = `{
  "query": "best coffee in Berlin",
  "results": [
    { "rank": 1, "name": "The Barn", "description": "Specialty coffee pioneer..." },
    { "rank": 2, "name": "Five Elephant", "description": "Roastery and café..." },
    { "rank": 3, "name": "Bonanza Coffee", "description": "Third wave espresso..." }
  ],
  "cached": false,
  "usage": { "queries_total": 1, "rate_limit": 100 }
}`;

const JS_EXAMPLE = `const res = await fetch("https://top3-search.vercel.app/api/v1/search", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ query: "best coffee in Berlin", category: "food" })
});
const data = await res.json();
console.log(data.results);`;

export default function DeveloperPage() {
  const [label, setLabel]   = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [keys, setKeys]     = useState<ApiKey[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [tab, setTab]       = useState<"curl" | "js">("curl");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("3cs_api_keys") || "[]");
      setKeys(stored);
    } catch { /* ok */ }
  }, []);

  async function generateKey() {
    if (!label.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/keys", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNewKey(data);
      const updated = [data, ...keys];
      setKeys(updated);
      localStorage.setItem("3cs_api_keys", JSON.stringify(updated));
      setLabel("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function copy(text: string, id: string) {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 py-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/7 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Developer API
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">Build with 3C Search</span>
          </h1>
          <p className="text-slate-500 text-base max-w-xl">
            Embed AI-curated top 3 results in your app. One endpoint, one API key, zero setup.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — docs */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick start */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-4">Quick Start</h2>

              {/* Language tabs */}
              <div className="flex gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 w-fit mb-3">
                {(["curl", "js"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${tab === t ? "bg-white/10 text-white" : "text-slate-500 hover:text-white"}`}>
                    {t === "curl" ? "cURL" : "JavaScript"}
                  </button>
                ))}
              </div>

              <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
                  <span className="text-slate-600 text-xs font-mono">Request</span>
                  <button onClick={() => copy(tab === "curl" ? CODE_EXAMPLE : JS_EXAMPLE, "request")}
                    className="text-slate-600 hover:text-white text-xs transition-colors">
                    {copied === "request" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre className="p-4 text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed text-[12.5px]">
                  <code>{tab === "curl" ? CODE_EXAMPLE : JS_EXAMPLE}</code>
                </pre>
              </div>

              <div className="bg-[#0a0f1a] border border-white/10 rounded-2xl overflow-hidden mt-3">
                <div className="px-4 py-2.5 border-b border-white/5">
                  <span className="text-slate-600 text-xs font-mono">Response</span>
                </div>
                <pre className="p-4 text-sm text-emerald-300/80 font-mono overflow-x-auto leading-relaxed text-[12.5px]">
                  <code>{CODE_RESPONSE}</code>
                </pre>
              </div>
            </section>

            {/* Endpoint reference */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-4">Endpoint Reference</h2>
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-lg">POST</span>
                    <code className="text-slate-300 text-sm font-mono">/api/v1/search</code>
                  </div>
                  <p className="text-slate-500 text-sm">Returns AI-curated top 3 results for any query.</p>
                </div>

                <div className="p-5 space-y-5">
                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Headers</p>
                    <div className="space-y-2">
                      {[
                        { key: "Authorization", val: "Bearer sk_3c_...", req: true },
                        { key: "Content-Type", val: "application/json", req: true },
                      ].map(h => (
                        <div key={h.key} className="flex items-center gap-3 text-sm">
                          <code className="text-blue-400 font-mono text-xs w-36 shrink-0">{h.key}</code>
                          <code className="text-slate-400 font-mono text-xs flex-1">{h.val}</code>
                          {h.req && <span className="text-red-400 text-[10px] font-medium">required</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Body</p>
                    <div className="space-y-2">
                      {[
                        { key: "query", type: "string", req: true, desc: "The search query" },
                        { key: "category", type: "string", req: false, desc: "food | travel | tech | finance | entertainment" },
                      ].map(p => (
                        <div key={p.key} className="flex items-start gap-3 text-sm">
                          <code className="text-emerald-400 font-mono text-xs w-20 shrink-0 mt-0.5">{p.key}</code>
                          <code className="text-slate-500 font-mono text-xs w-14 shrink-0 mt-0.5">{p.type}</code>
                          <span className="text-slate-400 text-xs flex-1">{p.desc}</span>
                          {p.req && <span className="text-red-400 text-[10px] font-medium shrink-0">required</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Rate limits */}
            <section>
              <h2 className="text-white font-semibold text-lg mb-4">Rate Limits</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tier: "Free key", limit: "100 req/day", color: "border-white/10" },
                  { tier: "Pro key", limit: "1,000 req/day", color: "border-blue-500/20" },
                  { tier: "Enterprise", limit: "Custom", color: "border-violet-500/20" },
                ].map(t => (
                  <div key={t.tier} className={`bg-white/[0.03] border ${t.color} rounded-xl p-4 text-center`}>
                    <p className="text-slate-500 text-xs mb-1">{t.tier}</p>
                    <p className="text-white font-bold text-sm">{t.limit}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right — key generation */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 sticky top-20">
              <h3 className="text-white font-semibold mb-1">Get API Key</h3>
              <p className="text-slate-500 text-xs mb-5">Free for 100 queries/day. Copy your key — it won&apos;t be shown again.</p>

              <input type="text" value={label} onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === "Enter" && generateKey()}
                placeholder="Key label (e.g. My App)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm outline-none focus:border-blue-500/40 mb-3"
              />
              <button onClick={generateKey} disabled={!label.trim() || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl text-sm transition-all mb-5">
                {loading ? "Generating…" : "Generate API Key"}
              </button>

              {/* New key display */}
              {newKey && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-5">
                  <p className="text-emerald-400 text-xs font-semibold mb-2">✓ Key generated — copy it now</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-emerald-300 text-xs font-mono bg-black/20 rounded-lg px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {newKey.key}
                    </code>
                    <button onClick={() => copy(newKey.key, newKey.id)}
                      className="shrink-0 text-xs text-emerald-400 hover:text-white bg-emerald-500/10 border border-emerald-500/20 hover:border-white/20 px-3 py-2 rounded-lg transition-all">
                      {copied === newKey.id ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              )}

              {/* Stored keys */}
              {keys.length > 0 && (
                <div>
                  <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest mb-3">Your Keys</p>
                  <div className="space-y-2">
                    {keys.map(k => (
                      <div key={k.id} className="flex items-center justify-between gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-slate-300 text-xs font-medium truncate">{k.label}</p>
                          <p className="text-slate-600 text-[10px] font-mono">{k.key.slice(0, 20)}…</p>
                        </div>
                        <button onClick={() => copy(k.key, k.id)}
                          className="shrink-0 text-[10px] text-slate-500 hover:text-white transition-colors">
                          {copied === k.id ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
