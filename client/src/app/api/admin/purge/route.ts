import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const { email, id } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    if (!cleanEmail && !id) {
      return NextResponse.json({ success: false, error: 'Doctor email or ID required' }, { status: 400 });
    }

    // Direct SQL deletions across all 5 tables
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [cleanEmail]);
      await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1`, [cleanEmail]);
      await pool.query(`DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`, [cleanEmail]);
      await pool.query(`DELETE FROM pc_leaves WHERE LOWER(doctor_name) LIKE $1 OR doctor_id = $2`, [`%${cleanEmail}%`, id || '']);
      await pool.query(`
        UPDATE pc_appointments 
        SET status = 'CANCELLED', leave_reason = 'Doctor account purged by Administrator' 
        WHERE LOWER(doctor_email) = $1 AND status NOT IN ('COMPLETED', 'CANCELLED')
      `, [cleanEmail]);
    } else if (id) {
      await pool.query(`DELETE FROM pc_doctors WHERE id = $1`, [id]);
      await pool.query(`DELETE FROM pc_users WHERE id = $1`, [id]);
      await pool.query(`DELETE FROM pc_doctor_applications WHERE id = $1`, [id]);
      await pool.query(`DELETE FROM pc_leaves WHERE doctor_id = $1`, [id]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Doctor ${cleanEmail || id} permanently deleted from all database tables.` 
    });
  } catch (err: any) {
    console.error("Purge error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
