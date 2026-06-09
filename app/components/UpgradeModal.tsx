"use client";

import Link from "next/link";

export default function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0e1420] border border-white/10 rounded-2xl p-7 w-full max-w-sm shadow-2xl text-center">
        {/* Icon */}
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600/30 to-violet-600/30 border border-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>

        <h3 className="text-white font-bold text-xl mb-2">Daily limit reached</h3>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          You&apos;ve used your <span className="text-white font-medium">10 free searches</span> for today.
          Upgrade to Pro for unlimited searches, top 5 results, and CSV export.
        </p>

        {/* Feature diff */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
          {[
            { label: "Searches / day", free: "10", pro: "Unlimited" },
            { label: "Results per search", free: "Top 3", pro: "Top 5" },
            { label: "CSV export", free: "—", pro: "✓" },
            { label: "Private collections", free: "—", pro: "✓" },
          ].map(f => (
            <div key={f.label} className="flex items-center justify-between text-xs">
              <span className="text-slate-500">{f.label}</span>
              <div className="flex gap-6">
                <span className="text-slate-600 w-16 text-right">{f.free}</span>
                <span className="text-emerald-400 font-medium w-20 text-right">{f.pro}</span>
              </div>
            </div>
          ))}
        </div>

        <Link href="/pricing"
          className="block w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold py-3 rounded-xl text-sm transition-all mb-3">
          Upgrade to Pro — $9/month
        </Link>
        <button onClick={onClose}
          className="w-full text-slate-600 hover:text-slate-400 text-sm py-2 transition-colors">
          Continue with free (resets tomorrow)
        </button>
      </div>
    </div>
  );
}
