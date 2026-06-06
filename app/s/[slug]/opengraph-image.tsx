import { ImageResponse } from "next/og";
import pool from "@/lib/db";

export const runtime = "nodejs";
export const alt = "3C Search Results";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const { rows } = await pool.query(
    `SELECT s.query, s.category,
      COALESCE(
        json_agg(json_build_object('rank', sr.rank, 'name', sr.name) ORDER BY sr.rank)
        FILTER (WHERE sr.id IS NOT NULL), '[]'
      ) AS results
     FROM searches s
     LEFT JOIN search_results sr ON sr.search_id = s.id
     WHERE s.slug = $1
     GROUP BY s.id LIMIT 1`,
    [params.slug]
  );

  const search = rows[0];
  const topResults: { rank: number; name: string }[] = search?.results ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#080c14",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}>
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: -100, left: -100,
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80,
          width: 400, height: 400,
          background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            borderRadius: "12px", width: "44px", height: "44px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", fontWeight: 800, color: "white",
          }}>3</div>
          <span style={{ color: "white", fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" }}>
            3C <span style={{ color: "#60a5fa" }}>Search</span>
          </span>
          <div style={{
            marginLeft: "12px",
            background: "rgba(139,92,246,0.15)",
            border: "1px solid rgba(139,92,246,0.3)",
            borderRadius: "20px", padding: "4px 14px",
            color: "#a78bfa", fontSize: "12px", fontWeight: 600,
          }}>
            Shared Result
          </div>
        </div>

        {/* Query */}
        {search ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, justifyContent: "center" }}>
            <div style={{ color: "#475569", fontSize: "16px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "2px" }}>
              Top 3 for
            </div>
            <div style={{
              color: "white", fontSize: "42px", fontWeight: 800,
              lineHeight: 1.2, maxWidth: "900px",
              textOverflow: "ellipsis", overflow: "hidden",
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            }}>
              &ldquo;{search.query}&rdquo;
            </div>
          </div>
        ) : (
          <div style={{ color: "#64748b", fontSize: "32px", flex: 1, display: "flex", alignItems: "center" }}>
            AI-curated top 3 for anything
          </div>
        )}

        {/* Results preview */}
        {topResults.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {topResults.slice(0, 3).map((r, i) => {
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <div key={r.rank} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ fontSize: "22px" }}>{medals[i]}</span>
                  <span style={{ color: "#e2e8f0", fontSize: "20px", fontWeight: 600 }}>{r.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "20px",
        }}>
          <span style={{ color: "#334155", fontSize: "14px" }}>Powered by AI · Top 3 for everything</span>
          <span style={{ color: "#475569", fontSize: "14px" }}>3csearch.app</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
