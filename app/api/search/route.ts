import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query?.trim()) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
  }

  const prompt = `You are a top 3 recommendation engine.

User query: "${query}"

Rules:
- Return ONLY the top 3 results.
- Keep each result concise (1-2 sentences).
- Use this exact format for each result:
1. **Name** — description
2. **Name** — description
3. **Name** — description`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || "OpenAI error" }, { status: 502 });
  }

  const text = data.choices?.[0]?.message?.content || "No results found.";
  return NextResponse.json({ result: text });
}
