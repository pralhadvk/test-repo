import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";
import ShareButtons from "./ShareButtons";

export const revalidate = 3600;

type Result = { rank: number; name: string; description: string };

type SearchData = {
  id: string;
  query: string;
  category: string | null;
  slug: string;
  created_at: string;
  results: Result[];
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const { rows } = await pool.query(
    `SELECT query FROM searches WHERE slug = $1 LIMIT 1`,
    [params.slug]
  );
  if (!rows[0]) return { title: "Not found — 3C Search" };
  return {
    title: `"${rows[0].query}" — 3C Search`,
    description: `Top 3 results for "${rows[0].query}" curated by 3C Search`,
    openGraph: {
      title: `Top 3 for "${rows[0].query}"`,
      description: `Curated by 3C Search — AI-powered top 3 recommendations`,
    },
  };
}

async function getSearch(slug: string): Promise<SearchData | null> {
  const { rows } = await pool.query(
    `SELECT s.id, s.query, s.category, s.slug, s.created_at,
      COALESCE(
        json_agg(
          json_build_object('rank', sr.rank, 'name', sr.name, 'description', sr.description)
          ORDER BY sr.rank
        ) FILTER (WHERE sr.id IS NOT NULL),
        '[]'
      ) AS results
     FROM searches s
     LEFT JOIN search_results sr ON sr.search_id = s.id
     WHERE s.slug = $1
     GROUP BY s.id
     LIMIT 1`,
    [slug]
  );
  return rows[0] ?? null;
}

const RANK_STYLES = [
  { badge: "from-amber-400 to-yellow-500", border: "border-amber-500/20 hover:border-amber-500/40", glow: "hover:shadow-amber-500/10" },
  { badge: "from-slate-300 to-slate-400",  border: "border-slate-400/20 hover:border-slate-400/40",  glow: "hover:shadow-slate-400/10" },
  { badge: "from-orange-400 to-amber-600", border: "border-orange-500/20 hover:border-orange-500/40", glow: "hover:shadow-orange-500/10" },
];

const CAT_COLOR: Record<string, string> = {
  food:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  travel:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  tech:          "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default async function SharePage({ params }: { params: { slug: string } }) {
  const search = await getSearch(params.slug);
  if (!search) notFound();

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 py-16 relative overflow-x-hidden">
      {/* Background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-600 text-xs mb-8">
          <Link href="/" className="hover:text-slate-400 transition-colors">3C Search</Link>
          <span>/</span>
          <span className="text-slate-500">Shared result</span>
        </div>

        {/* Query header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
              Shared search
            </div>
            {search.category && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CAT_COLOR[search.category] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}>
                {search.category}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            &ldquo;{search.query}&rdquo;
          </h1>
          <p className="text-slate-500 text-sm mt-2">Top 3 curated results</p>
        </div>

        {/* Results */}
        <div className="space-y-4 mb-8">
          {search.results.map((r, idx) => {
            const style = RANK_STYLES[idx] ?? RANK_STYLES[2];
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(r.name)}`;
            return (
              <div key={r.rank}
                className={`group bg-white/[0.04] hover:bg-white/[0.07] border ${style.border} rounded-2xl p-5 flex gap-4 transition-all duration-300 shadow-lg ${style.glow} hover:shadow-xl hover:-translate-y-0.5`}>
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
                      className="shrink-0 text-slate-600 hover:text-blue-400 transition-colors mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mt-1">{r.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action bar */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link href={`/?q=${encodeURIComponent(search.query)}`}
              className="w-full sm:w-auto flex-1 text-center bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-5 py-3 rounded-xl transition-all duration-200 text-sm">
              Search this yourself →
            </Link>
            <ShareButtons slug={search.slug} query={search.query} />
            <Link href="/"
              className="w-full sm:w-auto text-center text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-5 py-3 rounded-xl transition-all duration-200 text-sm">
              Try 3C Search
            </Link>
          </div>
          <p className="text-center text-slate-700 text-xs mt-4">
            Powered by 3C Search · AI-curated top 3 for anything
          </p>
        </div>
      </div>
    </main>
  );
}
