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
      if (status === 'APPROVED') {
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'APPROVED' WHERE id = $1`, [id]);
        if (cleanEmail) await pool.query(`UPDATE pc_users SET is_approved = TRUE WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
      } else if (status === 'REJECTED') {
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'REJECTED' WHERE id = $1`, [id]);
        // COMPLETELY DELETE CREDENTIALS SO UNAPPROVED/REJECTED DOCTOR CANNOT LOGIN
        if (cleanEmail) {
          await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
          await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [cleanEmail]);
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST applications error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
