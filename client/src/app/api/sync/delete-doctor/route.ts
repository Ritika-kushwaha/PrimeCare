import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const { email, id, name } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanId = (id || '').trim();

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
    }

    if (!cleanEmail && !cleanId) {
      return NextResponse.json({ success: false, error: 'Email or ID required' }, { status: 400 });
    }

    // 1. Delete from pc_doctors
    await pool.query(
      `DELETE FROM pc_doctors WHERE LOWER(email) = $1 OR id = $2`,
      [cleanEmail, cleanId]
    );

    // 2. Delete from pc_users (prevents doctor login)
    if (cleanEmail) {
      await pool.query(
        `DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`,
        [cleanEmail]
      );
    }

    // 3. Delete from pc_doctor_applications
    if (cleanEmail) {
      await pool.query(
        `DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`,
        [cleanEmail]
      );
    }

    // 4. Delete from pc_leaves
    await pool.query(
      `DELETE FROM pc_leaves WHERE doctor_id = $1 OR LOWER(doctor_name) LIKE $2`,
      [cleanId, `%${cleanEmail}%`]
    );

    // 5. Cancel pending appointments
    await pool.query(
      `UPDATE pc_appointments 
       SET status = 'CANCELLED', leave_reason = 'Doctor account removed by Administrator' 
       WHERE (LOWER(doctor_email) = $1 OR doctor_id = $2) AND status NOT IN ('COMPLETED', 'CANCELLED')`,
      [cleanEmail, cleanId]
    );

    return NextResponse.json({ success: true, message: 'Doctor permanently deleted' });
  } catch (err: any) {
    console.error("Delete route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
