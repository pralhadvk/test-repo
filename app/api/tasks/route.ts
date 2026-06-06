import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT t.*
      FROM tasks t
      JOIN plan_versions pv ON t.version_id = pv.id
      WHERE pv.version = 'version_1'
      ORDER BY t.id
    `);
    return NextResponse.json({ tasks: rows });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
