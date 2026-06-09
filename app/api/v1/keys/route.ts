import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { label } = await req.json();
    if (!label?.trim()) {
      return NextResponse.json({ error: "Label is required" }, { status: 400 });
    }
    const key = `sk_3c_${nanoid(32)}`;
    const { rows } = await pool.query(
      `INSERT INTO api_keys (key, label) VALUES ($1, $2) RETURNING id, key, label, rate_limit, created_at`,
      [key, label.trim()]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    console.error("key gen error:", err);
    return NextResponse.json({ error: "Failed to generate key" }, { status: 500 });
  }
}
