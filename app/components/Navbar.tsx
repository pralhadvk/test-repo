"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Search" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/progress",  label: "Progress" },
];

export default function Navbar() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        <div className="flex items-center gap-6">
          <Link href="/" className="text-white font-bold tracking-tight text-base">
            3C <span className="text-blue-400">Search</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  path === l.href
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Auth placeholder — Clerk will replace this */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 border border-slate-800 px-3 py-1.5 rounded-lg">
            Auth coming soon
          </span>
        </div>
      </div>
    </nav>
  );
}
