import { NextResponse } from "next/navigation";
import { getDb, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  await initDb();
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, name, email, reg_number AS "regNumber", specialisation, 
               qualification, experience, status 
        FROM pc_doctor_applications 
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ success: true, applications: rows });
    } catch (err: any) {
      console.error("GET applications error:", err);
    }
  }
  return NextResponse.json({ success: true, applications: [] });
}

export async function POST(req: Request) {
  await initDb();
  const sql = getDb();
  try {
    const data = await req.json();
    const { id, email, status } = data;

    if (sql && (id || email)) {
      if (id) {
        await sql`UPDATE pc_doctor_applications SET status = ${status} WHERE id = ${id}`;
      } else if (email) {
        await sql`UPDATE pc_doctor_applications SET status = ${status} WHERE email = ${email}`;
      }
      if (status === 'APPROVED' && email) {
        await sql`UPDATE pc_users SET is_approved = TRUE WHERE email = ${email}`;
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
