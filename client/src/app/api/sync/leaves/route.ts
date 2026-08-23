import { NextResponse } from "next/navigation";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, doctor_id AS "doctorId", doctor_name AS "doctorName", 
               specialisation, leave_date AS "leaveDate", reason 
        FROM pc_leaves 
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ success: true, leaves: rows });
    } catch (err: any) {
      console.error("GET leaves error:", err);
    }
  }
  return NextResponse.json({ success: true, leaves: [] });
}

export async function POST(req: Request) {
  await initDb();
  const sql = getDb();
  try {
    const data = await req.json();
    const leaves = data.leaves || (data.leave ? [data.leave] : []);

    if (sql && leaves.length > 0) {
      for (const l of leaves) {
        await sql`
          INSERT INTO pc_leaves (id, doctor_id, doctor_name, specialisation, leave_date, reason)
          VALUES (${l.id}, ${l.doctorId}, ${l.doctorName}, ${l.specialisation}, ${l.leaveDate}, ${l.reason})
          ON CONFLICT (id) DO UPDATE SET
            leave_date = EXCLUDED.leave_date,
            reason = EXCLUDED.reason
        `;
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
