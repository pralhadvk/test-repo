import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

const VALID = ["todo", "in_progress", "completed", "blocked"];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json();
    if (!VALID.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const completedAt = status === "completed" ? new Date() : null;
    const { rows } = await pool.query(
      `UPDATE tasks SET status=$1, updated_at=NOW(), completed_at=$2 WHERE id=$3 RETURNING *`,
      [status, completedAt, params.id]
    );
    return NextResponse.json({ task: rows[0] });
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
