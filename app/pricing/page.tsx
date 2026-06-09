"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const FREE_FEATURES = [
  { label: "10 searches / day",      included: true },
  { label: "Top 3 results",          included: true },
  { label: "Shareable result links", included: true },
  { label: "Public collections",     included: true },
  { label: "Search history",         included: true },
  { label: "Trending searches",      included: true },
  { label: "Top 5 results",          included: false },
  { label: "Unlimited searches",     included: false },
  { label: "CSV export",             included: false },
  { label: "Private collections",    included: false },
  { label: "API access",             included: false },
];

const PRO_FEATURES = [
  { label: "Unlimited searches / day", included: true },
  { label: "Top 5 results",            included: true },
  { label: "Shareable result links",   included: true },
  { label: "Public + Private collections", included: true },
  { label: "Search history",           included: true },
  { label: "Priority trending",        included: true },
  { label: "CSV export",               included: true },
  { label: "API access",               included: true },
  { label: "Early access to features", included: true },
];

export default function PricingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [isPro, setIsPro]     = useState(false);
  const [success, setSuccess] = useState(false);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    setIsPro(localStorage.getItem("3cs_pro") === "true");
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      localStorage.setItem("3cs_pro", "true");
      setIsPro(true);
      setSuccess(true);
    }
    if (params.get("canceled") === "true") setCanceled(true);
  }, []);

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout");
      window.location.href = data.url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 py-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-4 py-1.5 rounded-full mb-6 uppercase tracking-wide">
            Simple pricing
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
              Start free. Upgrade when ready.
            </span>
          </h1>
          <p className="text-slate-500 text-base max-w-lg mx-auto">
            3C Search is free for casual use. Pro unlocks unlimited results, exports, and API access.
          </p>
        </div>

        {/* Success / canceled banners */}
        {success && (
          <div className="mb-8 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl px-6 py-4 text-center text-sm font-medium">
            🎉 Welcome to Pro! Your account is now upgraded. Unlimited searches await.
          </div>
        )}
        {canceled && !success && (
          <div className="mb-8 bg-slate-800/50 border border-white/10 text-slate-400 rounded-2xl px-6 py-4 text-center text-sm">
            Checkout canceled — you&apos;re still on the free plan.
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-white">$0</span>
                <span className="text-slate-500 text-sm mb-2">/ month</span>
              </div>
              <p className="text-slate-500 text-sm mt-2">No card required. Forever free.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-7">
              {FREE_FEATURES.map(f => (
                <li key={f.label} className={`flex items-center gap-3 text-sm ${f.included ? "text-slate-300" : "text-slate-600"}`}>
                  {f.included ? (
                    <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {f.label}
                </li>
              ))}
            </ul>

            <Link href="/"
              className="w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-3 rounded-xl text-sm transition-all">
              Start searching free →
            </Link>
          </div>

          {/* Pro */}
          <div className="relative bg-gradient-to-b from-blue-600/10 to-violet-600/5 border border-blue-500/30 rounded-2xl p-7 flex flex-col overflow-hidden">
            {/* "Most popular" badge */}
            <div className="absolute top-5 right-5">
              <span className="bg-blue-600/30 border border-blue-500/40 text-blue-300 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                YC ready
              </span>
            </div>

            <div className="mb-6">
              <p className="text-blue-400 text-sm font-medium uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-extrabold text-white">$9</span>
                <span className="text-slate-400 text-sm mb-2">/ month</span>
              </div>
              <p className="text-slate-400 text-sm mt-2">Cancel anytime. No setup fees.</p>
            </div>

            <ul className="space-y-3 flex-1 mb-7">
              {PRO_FEATURES.map(f => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-slate-300">
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f.label}
                </li>
              ))}
            </ul>

            {isPro ? (
              <div className="w-full text-center bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-medium py-3 rounded-xl text-sm">
                ✓ You&apos;re on Pro
              </div>
            ) : (
              <>
                {error && (
                  <p className="text-amber-400 text-xs text-center mb-3 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg">
                    {error}
                  </p>
                )}
                <button onClick={startCheckout} disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30">
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Redirecting to Stripe…
                    </span>
                  ) : "Upgrade to Pro — $9/month"}
                </button>
              </>
            )}
          </div>
        </div>

        {/* FAQ row */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { q: "Is the free plan really free?", a: "Yes, forever. No credit card needed. You get 10 searches per day at no cost." },
            { q: "What counts as a search?", a: "Each query you submit counts as one search. Cache hits also count — we track every intent." },
            { q: "Can I cancel Pro anytime?", a: "Yes. Cancel in one click, no questions asked. Your plan reverts to free at period end." },
          ].map(item => (
            <div key={item.q} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
              <p className="text-white font-medium text-sm mb-2">{item.q}</p>
              <p className="text-slate-500 text-xs leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-slate-700 text-xs mt-10">
          Payments powered by Stripe · Secure · No data sold
        </p>
      </div>
    </main>
  );
}
