import pool from "@/lib/db";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Recent searches (anonymous until Clerk auth is wired up)
  const searchesResult = await pool.query(
    `SELECT
       s.id, s.query, s.category, s.slug, s.created_at,
       COALESCE(
         json_agg(
           json_build_object('rank', sr.rank, 'name', sr.name, 'description', sr.description)
           ORDER BY sr.rank
         ) FILTER (WHERE sr.id IS NOT NULL),
         '[]'
       ) AS results
     FROM searches s
     LEFT JOIN search_results sr ON sr.search_id = s.id
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT 50`
  );

  // Stats
  const statsResult = await pool.query(
    `SELECT
       COUNT(*)                                                        AS total,
       COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
       COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day')  AS today,
       COUNT(DISTINCT category) FILTER (WHERE category IS NOT NULL)   AS categories
     FROM searches`
  );

  // Cache hit rate
  const cacheResult = await pool.query(
    `SELECT COUNT(*) AS cached_queries FROM cache WHERE expires_at > NOW()`
  );

  const stats = {
    total:      parseInt(statsResult.rows[0].total),
    thisWeek:   parseInt(statsResult.rows[0].this_week),
    today:      parseInt(statsResult.rows[0].today),
    categories: parseInt(statsResult.rows[0].categories),
    cached:     parseInt(cacheResult.rows[0].cached_queries),
  };

  return <DashboardClient searches={searchesResult.rows} stats={stats} />;
}
