import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const { email, id, name } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').replace(/^Dr\.\s*/i, '').trim();

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database offline' }, { status: 500 });
    }

    // 1. Delete from pc_doctors
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [cleanEmail]);
    }
    if (id) {
      await pool.query(`DELETE FROM pc_doctors WHERE id = $1`, [id]);
    }
    if (cleanName) {
      await pool.query(`DELETE FROM pc_doctors WHERE LOWER(name) LIKE $1`, [`%${cleanName.toLowerCase()}%`]);
    }

    // 2. Delete login credentials from pc_users
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
    }

    // 3. Delete from applications
    if (cleanEmail) {
      await pool.query(`DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`, [cleanEmail]);
    }

    // 4. Delete leaves
    if (cleanEmail || cleanName) {
      await pool.query(`
        DELETE FROM pc_leaves 
        WHERE LOWER(doctor_name) LIKE $1 OR LOWER(doctor_name) LIKE $2 OR doctor_id = $3
      `, [`%${cleanEmail}%`, `%${cleanName.toLowerCase()}%`, id || '']);
    }

    // 5. Cancel remaining active appointments
    if (cleanEmail) {
      await pool.query(`
        UPDATE pc_appointments 
        SET status = 'CANCELLED', leave_reason = 'Doctor account removed by Admin' 
        WHERE LOWER(doctor_email) = $1 AND status NOT IN ('COMPLETED', 'CANCELLED')
      `, [cleanEmail]);
    }

    return NextResponse.json({ success: true, message: 'Doctor deleted from all tables' });
  } catch (err: any) {
    console.error("Delete Doctor API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
