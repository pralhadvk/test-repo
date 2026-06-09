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
  food: `You are a world-class food and restaurant recommendation engine. Return the top results with name, cuisine type, price range hint, and one standout feature. Keep each description to one sentence. Be specific — name real dishes or standout qualities.`,
  travel: `You are an expert travel guide and trip planner. Return the top destinations, experiences, or stays with name, best time to visit hint, and one must-do activity. Keep each description to one sentence. Be specific and inspiring.`,
  tech: `You are a senior software engineer. Return the top tools, libraries, frameworks, or resources with name, key strength, and a one-line use case. Keep each description to one sentence. Prefer well-maintained, production-proven options.`,
  finance: `You are a knowledgeable financial guide. Return the top options with name, risk level hint, and one-line rationale. Keep each description to one sentence. Always end your entire response with: "Not financial advice."`,
  entertainment: `You are a culture critic and recommendation expert. Return the top titles, artists, or experiences with name, genre/format, and one hook sentence that makes it unmissable. Be enthusiastic and specific.`,
};

const DEFAULT_PROMPT = `You are a top recommendation engine. Return concise, accurate results with name and a one-sentence description. Prioritize quality over quantity.`;

function buildUserPrompt(query: string, limit: number) {
  const nums = Array.from({ length: limit }, (_, i) => i + 1);
  const format = nums.map(n => `${n}. **Name** — one concise sentence description`).join("\n");
  return `User query: "${query}"\n\nReturn ONLY the top ${limit} results using this exact format:\n${format}`;
}

export async function POST(req: NextRequest) {
  const { query, category, pro } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const limit = pro === true ? 5 : 3;

  // ── 1. Cache check ──────────────────────────────────────────────────────────
  const cacheKey = `${query.toLowerCase().trim()}__${limit}`;
  const queryHash = createHash("md5").update(cacheKey).digest("hex");

  try {
    const hit = await pool.query(
      "SELECT result_json FROM cache WHERE query_hash = $1 AND expires_at > NOW()",
      [queryHash]
    );
    if (hit.rows.length > 0) {
      const payload = hit.rows[0].result_json as { result: string; results: Result[] };
      const slug = await persistSearch(query, category, payload.results);
      return NextResponse.json({ ...payload, cached: true, slug });
    }
  } catch { /* non-fatal */ }

  // ── 2. Call OpenRouter ──────────────────────────────────────────────────────
  const systemPrompt = (category && CATEGORY_PROMPTS[category]) || DEFAULT_PROMPT;

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
        { role: "user", content: buildUserPrompt(query, limit) },
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

  // ── 4. Save history + return slug ───────────────────────────────────────────
  const slug = await persistSearch(query, category, results);

  return NextResponse.json({ ...payload, cached: false, slug });
}

async function persistSearch(query: string, category: string | undefined, results: Result[]): Promise<string | null> {
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
    return slug;
  } catch (err) {
    console.error("persistSearch failed:", err);
    return null;
  }
}
