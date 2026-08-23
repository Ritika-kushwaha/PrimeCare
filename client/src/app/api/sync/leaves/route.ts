import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  await initDb();
  const pool = getDbPool();
  const { searchParams } = new URL(req.url);
  const includePast = searchParams.get('includePast') === 'true';

  if (pool) {
    try {
      // Auto-cleanup or filter: If includePast is false, only return today or future leaves
      const query = includePast
        ? `SELECT id, doctor_id AS "doctorId", doctor_name AS "doctorName", specialisation, leave_date AS "leaveDate", reason, created_at AS "createdAt" FROM pc_leaves ORDER BY leave_date DESC`
        : `SELECT id, doctor_id AS "doctorId", doctor_name AS "doctorName", specialisation, leave_date AS "leaveDate", reason, created_at AS "createdAt" FROM pc_leaves WHERE leave_date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD') ORDER BY leave_date ASC`;

      const res = await pool.query(query);
      return NextResponse.json(
        { success: true, leaves: res.rows || [] },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
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

    if (data.action === 'DELETE' && data.id && pool) {
      await pool.query(`DELETE FROM pc_leaves WHERE id = $1`, [data.id]);
      return NextResponse.json({ success: true });
    }

    const leaves = data.leaves || (data.leave ? [data.leave] : []);

    if (pool && leaves.length > 0) {
      for (const l of leaves) {
        const leaveId = l.id || ('leave-' + Date.now());
        const docId = l.doctorId || 'doc-01';
        const docName = l.doctorName || 'Dr. Practitioner';
        const spec = l.specialisation || 'General Medicine';
        const lDate = l.leaveDate;
        const reason = l.reason || 'Medical / Duty Leave';

        // 1. Insert leave permanently
        await pool.query(`
          INSERT INTO pc_leaves (id, doctor_id, doctor_name, specialisation, leave_date, reason)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            leave_date = EXCLUDED.leave_date,
            reason = EXCLUDED.reason,
            doctor_name = EXCLUDED.doctor_name,
            specialisation = EXCLUDED.specialisation
        `, [leaveId, docId, docName, spec, lDate, reason]);

        // 2. Automatically shift all matching patient appointments on that date to LEAVE_CANCELLED
        const cleanDoc = docName.toLowerCase().replace('dr. ', '').trim();
        await pool.query(`
          UPDATE pc_appointments 
          SET status = 'LEAVE_CANCELLED', leave_reason = $1 
          WHERE (doctor_id = $2 OR LOWER(doctor_name) LIKE $3)
            AND date = $4
            AND status NOT IN ('COMPLETED', 'CANCELLED')
        `, [reason, docId, `%${cleanDoc}%`, lDate]);
      }
    }
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (err: any) {
    console.error("POST leaves error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
