import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const { email, id, name } = data;
    
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanId = (id || '').trim();
    const cleanName = (name || '').replace(/^Dr\.\s*/i, '').trim().toLowerCase();

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
    }

    // 1. Force delete from pc_doctors by email, id, OR name match
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [cleanEmail]);
    }
    if (cleanId) {
      await pool.query(`DELETE FROM pc_doctors WHERE id = $1`, [cleanId]);
    }
    if (cleanName) {
      await pool.query(`DELETE FROM pc_doctors WHERE LOWER(name) LIKE $1`, [`%${cleanName}%`]);
    }

    // 2. Delete login credentials from pc_users
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
    }

    // 3. Delete from pc_doctor_applications
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`, [cleanEmail]);
    }

    // 4. Delete associated duty leaves
    if (cleanEmail || cleanId || cleanName) {
      await pool.query(`
        DELETE FROM pc_leaves 
        WHERE doctor_id = $1 OR LOWER(doctor_name) LIKE $2 OR LOWER(doctor_name) LIKE $3
      `, [cleanId, `%${cleanEmail}%`, `%${cleanName}%`]);
    }

    // 5. Cancel any pending outpatient appointments
    if (cleanEmail || cleanId) {
      await pool.query(`
        UPDATE pc_appointments 
        SET status = 'CANCELLED', leave_reason = 'Doctor profile deleted by Administrator' 
        WHERE (LOWER(doctor_email) = $1 OR doctor_id = $2) AND status NOT IN ('COMPLETED', 'CANCELLED')
      `, [cleanEmail, cleanId]);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Doctor successfully purged from all database tables.` 
    });
  } catch (err: any) {
    console.error("Purge Doctor API error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
