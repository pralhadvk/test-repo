import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, query, results } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    // Create the collection
    const { rows: [collection] } = await pool.query(
      `INSERT INTO collections (name, is_public) VALUES ($1, true) RETURNING id`,
      [name.trim()]
    );

    // If a search (query + results) is provided, save it and link to collection
    if (query?.trim() && Array.isArray(results) && results.length > 0) {
      const { nanoid } = await import("nanoid");
      const slug = nanoid(8);
      const { rows: [search] } = await pool.query(
        `INSERT INTO searches (user_id, query, category, slug) VALUES (NULL, $1, NULL, $2) RETURNING id`,
        [query.trim(), slug]
      );
      for (const r of results) {
        await pool.query(
          `INSERT INTO search_results (search_id, rank, name, description) VALUES ($1, $2, $3, $4)`,
          [search.id, r.rank, r.name, r.description]
        );
      }
      await pool.query(
        `INSERT INTO collection_items (collection_id, search_id) VALUES ($1, $2)`,
        [collection.id, search.id]
      );
    }

    return NextResponse.json({ id: collection.id });
  } catch (err) {
    console.error("collections POST error:", err);
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
