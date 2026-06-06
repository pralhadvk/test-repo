import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerk = await currentUser();

  // Upsert user in DB
  await pool.query(
    `INSERT INTO users (clerk_id, email, name)
     VALUES ($1, $2, $3)
     ON CONFLICT (clerk_id) DO UPDATE SET email = $2, name = COALESCE($3, users.name)`,
    [
      userId,
      clerk?.emailAddresses[0]?.emailAddress ?? "",
      clerk?.fullName ?? null,
    ]
  );

  const userResult = await pool.query(
    "SELECT * FROM users WHERE clerk_id = $1",
    [userId]
  );
  const user = userResult.rows[0];

  // Searches with results
  const searchesResult = await pool.query(
    `SELECT
       s.id, s.query, s.category, s.slug,
       s.created_at,
       COALESCE(
         json_agg(
           json_build_object('rank', sr.rank, 'name', sr.name, 'description', sr.description)
           ORDER BY sr.rank
         ) FILTER (WHERE sr.id IS NOT NULL),
         '[]'
       ) AS results
     FROM searches s
     LEFT JOIN search_results sr ON sr.search_id = s.id
     WHERE s.user_id = $1
     GROUP BY s.id
     ORDER BY s.created_at DESC
     LIMIT 100`,
    [user.id]
  );

  // Stats
  const statsResult = await pool.query(
    `SELECT
       COUNT(*)                                                      AS total,
       COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week,
       COUNT(DISTINCT category) FILTER (WHERE category IS NOT NULL) AS categories
     FROM searches WHERE user_id = $1`,
    [user.id]
  );

  const stats = {
    total:      parseInt(statsResult.rows[0].total),
    thisWeek:   parseInt(statsResult.rows[0].this_week),
    categories: parseInt(statsResult.rows[0].categories),
  };

  return (
    <DashboardClient
      searches={searchesResult.rows}
      stats={stats}
      userName={clerk?.firstName ?? clerk?.fullName ?? "there"}
    />
  );
}
