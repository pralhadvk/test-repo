import pool from "@/lib/db";
import TrendingClient from "./TrendingClient";

export const revalidate = 300; // refresh every 5 min

type TrendRow = { query: string; count: number; category: string | null };

async function getTrending(period: string): Promise<TrendRow[]> {
  const interval = period === "today" ? "1 day" : period === "week" ? "7 days" : "365 days";
  const { rows } = await pool.query(
    `SELECT query, category, COUNT(*) AS count
     FROM searches
     WHERE created_at > NOW() - INTERVAL '${interval}'
     GROUP BY query, category
     ORDER BY count DESC
     LIMIT 25`
  );
  return rows.map(r => ({ ...r, count: parseInt(r.count) }));
}

export default async function TrendingPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = ["today", "week", "alltime"].includes(searchParams.period ?? "")
    ? searchParams.period!
    : "week";

  const trending = await getTrending(period);

  // Max count for bar scaling
  const maxCount = trending[0]?.count ?? 1;

  return <TrendingClient trending={trending} period={period} maxCount={maxCount} />;
}
