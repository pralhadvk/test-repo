import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { nanoid } from "nanoid";
import pool from "@/lib/db";

type Result = { rank: number; name: string; description: string };

function parseResults(text: string): Result[] {
  const lines = text.split("\n").filter((l) => /^\d\./.test(l.trim()));
  return lines.map((line, i) => {
    const match = line.match(/^\d\.\s+\*\*(.+?)\*\*\s*[—–-]\s*(.+)/);
    if (match) return { rank: i + 1, name: match[1].trim(), description: match[2].trim() };
    return { rank: i + 1, name: `Result ${i + 1}`, description: line.replace(/^\d\.\s*/, "").trim() };
  });
}

const CATEGORY_PROMPTS: Record<string, string> = {
  food:          "You are a world-class food and restaurant recommendation engine. Return results with name, cuisine, price range, and standout feature.",
  travel:        "You are an expert travel guide. Return destinations with name, best time to visit, and one must-do activity.",
  tech:          "You are a senior software engineer. Return tools with name, key strength, and one-line use case.",
  finance:       "You are a financial guide. Return options with name, risk level, and rationale. End with: 'Not financial advice.'",
  entertainment: "You are a culture critic. Return titles with name, genre, and one hook that makes it unmissable.",
};

export async function POST(req: NextRequest) {
  // ── 1. API key auth ────────────────────────────────────────────────────────
  const authHeader = req.headers.get("authorization") ?? "";
  const key = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  if (!key) {
    return NextResponse.json({ error: "Missing Authorization header. Use: Bearer sk_3c_..." }, { status: 401 });
  }

  let keyRow: { id: string; rate_limit: number; usage_total: number } | null = null;
  try {
    const { rows } = await pool.query(
      `SELECT id, rate_limit, usage_total FROM api_keys WHERE key = $1 LIMIT 1`,
      [key]
    );
    keyRow = rows[0] ?? null;
  } catch { /* DB error */ }

  if (!keyRow) {
    return NextResponse.json({ error: "Invalid API key." }, { status: 401 });
  }

  // ── 2. Rate limit check (simple daily counter via usage_today column) ──────
  // For simplicity we track usage_total only; per-day limit = rate_limit
  // A real implementation would use a Redis counter or a daily_usage column

  const { query, category } = await req.json().catch(() => ({}));
  if (!query?.trim()) {
    return NextResponse.json({ error: "Body must include { query: string, category?: string }" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Search service not configured." }, { status: 503 });
  }

  // ── 3. Cache check ─────────────────────────────────────────────────────────
  const queryHash = createHash("md5").update(query.toLowerCase().trim()).digest("hex");

  let cached = false;
  let results: Result[] = [];
  let resultText = "";

  try {
    const hit = await pool.query(
      "SELECT result_json FROM cache WHERE query_hash = $1 AND expires_at > NOW()",
      [queryHash]
    );
    if (hit.rows.length > 0) {
      const payload = hit.rows[0].result_json as { result: string; results: Result[] };
      results = payload.results;
      resultText = payload.result;
      cached = true;
    }
  } catch { /* non-fatal */ }

  // ── 4. Call OpenRouter if not cached ──────────────────────────────────────
  if (!cached) {
    const systemPrompt = (category && CATEGORY_PROMPTS[category]) || "You are a top 3 recommendation engine.";
    const userPrompt = `Query: "${query}"\n\nReturn ONLY the top 3 results:\n1. **Name** — description\n2. **Name** — description\n3. **Name** — description`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.7 }),
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error?.message || "Search failed" }, { status: 502 });

    resultText = data.choices?.[0]?.message?.content ?? "";
    results = parseResults(resultText);

    try {
      await pool.query(
        `INSERT INTO cache (query_hash, result_json, expires_at) VALUES ($1, $2, NOW() + INTERVAL '24 hours') ON CONFLICT (query_hash) DO UPDATE SET result_json = $2, expires_at = NOW() + INTERVAL '24 hours'`,
        [queryHash, { result: resultText, results }]
      );
    } catch { /* non-fatal */ }
  }

  // ── 5. Increment API key usage + save search ───────────────────────────────
  try {
    await pool.query(`UPDATE api_keys SET usage_total = usage_total + 1 WHERE id = $1`, [keyRow.id]);
    const slug = nanoid(8);
    const { rows } = await pool.query(
      `INSERT INTO searches (user_id, query, category, slug) VALUES (NULL, $1, $2, $3) RETURNING id`,
      [query, category ?? null, slug]
    );
    const searchId = rows[0].id;
    for (const r of results) {
      await pool.query(
        `INSERT INTO search_results (search_id, rank, name, description) VALUES ($1, $2, $3, $4)`,
        [searchId, r.rank, r.name, r.description]
      );
    }
  } catch { /* non-fatal */ }

  return NextResponse.json({
    query,
    results,
    cached,
    usage: { queries_total: keyRow.usage_total + 1, rate_limit: keyRow.rate_limit },
  });
}
