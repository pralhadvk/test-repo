import { redirect } from "next/navigation";
import pool from "@/lib/db";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const [
    volumeRes, topQueriesRes, categoryRes,
    affiliateRes, collectionsRes, curationRes, apiKeysRes
  ] = await Promise.all([
    // Search volume: last 7 days by day
    pool.query(`
      SELECT TO_CHAR(DATE(created_at AT TIME ZONE 'UTC'), 'Mon DD') AS day,
             COUNT(*) AS count
      FROM searches
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at AT TIME ZONE 'UTC')
      ORDER BY DATE(created_at AT TIME ZONE 'UTC')
    `),
    // Top 10 queries all-time
    pool.query(`
      SELECT query, category, COUNT(*) AS count
      FROM searches
      GROUP BY query, category
      ORDER BY count DESC LIMIT 10
    `),
    // Category breakdown
    pool.query(`
      SELECT COALESCE(category, 'uncategorized') AS category, COUNT(*) AS count
      FROM searches
      GROUP BY category ORDER BY count DESC
    `),
    // Affiliate clicks by type
    pool.query(`
      SELECT affiliate_type, COUNT(*) AS count
      FROM affiliate_clicks
      GROUP BY affiliate_type ORDER BY count DESC LIMIT 10
    `),
    // Collections
    pool.query(`SELECT COUNT(*) AS total FROM collections`),
    // Curated results
    pool.query(`SELECT COUNT(*) AS total, vertical, city FROM curated_results GROUP BY vertical, city ORDER BY count DESC`),
    // API keys
    pool.query(`SELECT COUNT(*) AS total, SUM(usage_total) AS total_usage FROM api_keys`),
  ]);

  // KPI row
  const kpiRes = await pool.query(`
    SELECT
      COUNT(*) AS total_searches,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 day') AS today,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
      COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') AS this_month
    FROM searches
  `);

  const cacheRes = await pool.query(`
    SELECT
      COUNT(*) AS active_cache,
      (SELECT COUNT(*) FROM searches WHERE created_at > NOW() - INTERVAL '24 hours') AS recent_searches
    FROM cache WHERE expires_at > NOW()
  `);

  return {
    kpi: kpiRes.rows[0],
    cacheHits: cacheRes.rows[0],
    volumeChart: volumeRes.rows.map(r => ({ day: r.day, count: parseInt(r.count) })),
    topQueries: topQueriesRes.rows.map(r => ({ query: r.query, category: r.category, count: parseInt(r.count) })),
    categoryBreakdown: categoryRes.rows.map(r => ({ category: r.category, count: parseInt(r.count) })),
    affiliateClicks: affiliateRes.rows.map(r => ({ type: r.affiliate_type, count: parseInt(r.count) })),
    collectionsTotal: parseInt(collectionsRes.rows[0]?.total ?? "0"),
    curatedRows: curationRes.rows.map(r => ({ vertical: r.vertical, city: r.city, count: parseInt(r.count) })),
    apiKeys: { total: parseInt(apiKeysRes.rows[0]?.total ?? "0"), usage: parseInt(apiKeysRes.rows[0]?.total_usage ?? "0") },
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { secret?: string };
}) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && searchParams.secret !== adminSecret) {
    redirect("/");
  }

  const metrics = await getMetrics();
  return <AdminClient metrics={metrics} />;
}
