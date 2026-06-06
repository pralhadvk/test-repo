import { notFound } from "next/navigation";
import Link from "next/link";
import pool from "@/lib/db";

export const revalidate = 60;

type Result = { rank: number; name: string; description: string };
type SearchItem = {
  search_id: string;
  query: string;
  category: string | null;
  slug: string;
  added_at: string;
  results: Result[];
};

type Collection = {
  id: string;
  name: string;
  is_public: boolean;
  created_at: string;
  items: SearchItem[];
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { rows } = await pool.query(
    `SELECT name FROM collections WHERE id = $1 LIMIT 1`,
    [params.id]
  );
  if (!rows[0]) return { title: "Collection not found — 3C Search" };
  return {
    title: `${rows[0].name} — 3C Search Collection`,
    description: `A curated collection of 3C Search results: ${rows[0].name}`,
  };
}

async function getCollection(id: string): Promise<Collection | null> {
  const { rows: [col] } = await pool.query(
    `SELECT id, name, is_public, created_at FROM collections WHERE id = $1 LIMIT 1`,
    [id]
  );
  if (!col) return null;

  const { rows: items } = await pool.query(
    `SELECT
       s.id AS search_id, s.query, s.category, s.slug, ci.added_at,
       COALESCE(
         json_agg(
           json_build_object('rank', sr.rank, 'name', sr.name, 'description', sr.description)
           ORDER BY sr.rank
         ) FILTER (WHERE sr.id IS NOT NULL),
         '[]'
       ) AS results
     FROM collection_items ci
     JOIN searches s ON s.id = ci.search_id
     LEFT JOIN search_results sr ON sr.search_id = s.id
     WHERE ci.collection_id = $1
     GROUP BY s.id, ci.added_at
     ORDER BY ci.added_at DESC`,
    [id]
  );

  return { ...col, items };
}

const RANK_STYLES = [
  { badge: "from-amber-400 to-yellow-500" },
  { badge: "from-slate-300 to-slate-400" },
  { badge: "from-orange-400 to-amber-600" },
];

const CAT_COLOR: Record<string, string> = {
  food:          "bg-orange-500/20 text-orange-400 border-orange-500/30",
  travel:        "bg-sky-500/20 text-sky-400 border-sky-500/30",
  tech:          "bg-blue-500/20 text-blue-400 border-blue-500/30",
  finance:       "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  entertainment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const collection = await getCollection(params.id);
  if (!collection) notFound();

  const collectionUrl = `/collections/${collection.id}`;

  return (
    <main className="min-h-screen bg-[#080c14] text-white px-4 py-16 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 right-40 w-[500px] h-[500px] bg-emerald-600/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto relative">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-slate-600 text-xs mb-8">
          <Link href="/" className="hover:text-slate-400 transition-colors">3C Search</Link>
          <span>/</span>
          <span className="text-slate-500">Collections</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Collection · {collection.items.length} {collection.items.length === 1 ? "search" : "searches"}
            </div>
          </div>
          <h1 className="text-3xl font-bold">{collection.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Created {timeAgo(collection.created_at)}</p>
        </div>

        {/* Items */}
        {collection.items.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-10 text-center">
            <p className="text-slate-500 text-sm mb-3">This collection is empty.</p>
            <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">
              Add a search →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {collection.items.map(item => (
              <div key={item.search_id} className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                {/* Search header */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-white font-medium">&ldquo;{item.query}&rdquo;</h2>
                    {item.category && (
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${CAT_COLOR[item.category] ?? "bg-slate-700/50 text-slate-400 border-slate-600/30"}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-slate-600 text-xs">{timeAgo(item.added_at)}</span>
                    <Link href={`/s/${item.slug}`}
                      className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                      View →
                    </Link>
                  </div>
                </div>
                {/* Results */}
                <div className="p-5 space-y-3">
                  {item.results.map((r, idx) => {
                    const style = RANK_STYLES[idx] ?? RANK_STYLES[2];
                    return (
                      <div key={r.rank} className="flex gap-3">
                        <div className={`shrink-0 w-7 h-7 rounded-lg bg-gradient-to-br ${style.badge} flex items-center justify-center text-black font-bold text-xs`}>
                          {r.rank}
                        </div>
                        <div className="min-w-0">
                          <p className="text-slate-300 font-medium text-sm">{r.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Share collection */}
        <div className="mt-8 bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
          <p className="text-slate-500 text-sm mb-3">Share this collection</p>
          <div className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-mono">
            <span className="flex-1 text-left truncate">
              {typeof window !== "undefined" ? window.location.origin : "https://3csearch.app"}{collectionUrl}
            </span>
          </div>
          <p className="text-slate-700 text-xs mt-3">Bookmark this link — collections are permanent and public</p>
        </div>
      </div>
    </main>
  );
}
