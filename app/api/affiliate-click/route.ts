import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { searchId, resultName, affiliateType } = await req.json();
    await pool.query(
      `INSERT INTO affiliate_clicks (search_id, result_name, affiliate_type) VALUES ($1, $2, $3)`,
      [searchId ?? null, resultName ?? "", affiliateType ?? "unknown"]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
