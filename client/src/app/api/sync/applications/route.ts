import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      const res = await pool.query(`
        SELECT id, name, email, reg_number AS "regNumber", 
               specialisation, qualification, experience, status 
        FROM pc_doctor_applications 
        ORDER BY created_at DESC
      `);
      return NextResponse.json({ success: true, applications: res.rows || [] }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    } catch (err: any) {
      console.error("GET applications error:", err);
    }
  }
  return NextResponse.json({ success: true, applications: [] });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const { id, email, status } = data;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (pool && (id || cleanEmail)) {
      // 1. Update application status
      if (id) {
        await pool.query(`UPDATE pc_doctor_applications SET status = $1 WHERE id = $2`, [status, id]);
      } else if (cleanEmail) {
        await pool.query(`UPDATE pc_doctor_applications SET status = $1 WHERE email = $2`, [status, cleanEmail]);
      }

      // 2. If approved, activate user login in pc_users table
      if (status === 'APPROVED' && cleanEmail) {
        await pool.query(`UPDATE pc_users SET is_approved = TRUE WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
      } else if (status === 'REJECTED' && cleanEmail) {
        await pool.query(`UPDATE pc_users SET is_approved = FALSE WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST applications error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
