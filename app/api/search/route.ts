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
  food:          "You are a top restaurant and food recommendation engine.",
  travel:        "You are an expert travel guide.",
  tech:          "You are a senior software engineer recommending tools and libraries.",
  finance:       "You are a financial advisor. Always end with: 'Not financial advice.'",
  entertainment: "You are a culture critic recommending movies, shows, books, and music.",
};

export async function POST(req: NextRequest) {
  const { query, category } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  // ── 1. Cache check ──────────────────────────────────────────────────────────
  const queryHash = createHash("md5").update(query.toLowerCase().trim()).digest("hex");

  try {
    const hit = await pool.query(
      "SELECT result_json FROM cache WHERE query_hash = $1 AND expires_at > NOW()",
      [queryHash]
    );
    if (hit.rows.length > 0) {
      const payload = hit.rows[0].result_json as { result: string; results: Result[] };
      void persistSearch(query, category, payload.results);
      return NextResponse.json({ ...payload, cached: true });
    }
  } catch { /* non-fatal */ }

  // ── 2. Call OpenRouter ──────────────────────────────────────────────────────
  const systemPrompt = (category && CATEGORY_PROMPTS[category]) || "You are a top 3 recommendation engine.";
  const userPrompt = `User query: "${query}"

Return ONLY the top 3 results using this exact format:
1. **Name** — one concise sentence description
2. **Name** — one concise sentence description
3. **Name** — one concise sentence description`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || "OpenRouter error" }, { status: 502 });
  }

  const text: string = data.choices?.[0]?.message?.content ?? "No results found.";
  const results = parseResults(text);
  const payload = { result: text, results };

  // ── 3. Write cache ──────────────────────────────────────────────────────────
  try {
    await pool.query(
      `INSERT INTO cache (query_hash, result_json, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '24 hours')
       ON CONFLICT (query_hash)
       DO UPDATE SET result_json = $2, expires_at = NOW() + INTERVAL '24 hours'`,
      [queryHash, payload]
    );
  } catch { /* non-fatal */ }

  // ── 4. Save history ─────────────────────────────────────────────────────────
  void persistSearch(query, category, results);

  return NextResponse.json({ ...payload, cached: false });
}

async function persistSearch(query: string, category: string | undefined, results: Result[]) {
  try {
    const slug = nanoid(8);
    const { rows } = await pool.query(
      `INSERT INTO searches (user_id, query, category, slug) VALUES (NULL, $1, $2, $3) RETURNING id`,
      [query, category ?? null, slug]
    );
    const searchId: string = rows[0].id;
    for (const r of results) {
      await pool.query(
        `INSERT INTO search_results (search_id, rank, name, description) VALUES ($1, $2, $3, $4)`,
        [searchId, r.rank, r.name, r.description]
      );
    }
  } catch (err) {
    console.error("persistSearch failed:", err);
  }
}
