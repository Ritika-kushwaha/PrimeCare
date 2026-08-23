import { NextResponse } from "next/navigation";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      const res = await pool.query(`SELECT id, doctor_id AS "doctorId", doctor_name AS "doctorName", specialisation, leave_date AS "leaveDate", reason FROM pc_leaves ORDER BY created_at DESC`);
      return NextResponse.json({ success: true, leaves: res.rows || [] });
    } catch (err: any) {
      console.error("GET leaves error:", err);
    }
  }
  return NextResponse.json({ success: true, leaves: [] });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const leaves = data.leaves || (data.leave ? [data.leave] : []);

    if (pool && leaves.length > 0) {
      for (const l of leaves) {
        await pool.query(
          `INSERT INTO pc_leaves (id, doctor_id, doctor_name, specialisation, leave_date, reason)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (id) DO UPDATE SET
             leave_date = EXCLUDED.leave_date,
             reason = EXCLUDED.reason`,
          [l.id, l.doctorId, l.doctorName, l.specialisation, l.leaveDate, l.reason]
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
