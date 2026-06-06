"use client";

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useUser();
  const path = usePathname();

  const links = [
    { href: "/", label: "Search" },
    { href: "/progress", label: "Progress" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left — logo + links */}
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
            {isSignedIn && (
              <Link href="/dashboard"
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  path === "/dashboard"
                    ? "text-white bg-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}>
                Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Right — auth */}
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors font-medium">
                  Get started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
