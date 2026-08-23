import { NextResponse } from "next/navigation";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      const res = await pool.query(`SELECT id, name, email, reg_number AS "regNumber", specialisation, qualification, experience, status FROM pc_doctor_applications ORDER BY created_at DESC`);
      return NextResponse.json({ success: true, applications: res.rows || [] });
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

    if (pool && (id || email)) {
      if (id) {
        await pool.query(`UPDATE pc_doctor_applications SET status = $1 WHERE id = $2`, [status, id]);
      } else if (email) {
        await pool.query(`UPDATE pc_doctor_applications SET status = $1 WHERE email = $2`, [status, email]);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
