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
    const { id, email, status, name, specialisation, qualification, regNumber } = data;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (pool && (id || cleanEmail)) {
      if (status === 'APPROVED') {
        // 1. Mark application approved
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'APPROVED' WHERE id = $1`, [id]);
        if (cleanEmail) await pool.query(`UPDATE pc_users SET is_approved = TRUE WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);

        // 2. Add directly to pc_doctors table so patients can immediately book appointments
        const docId = id || ('doc-' + Date.now());
        const docName = (name || 'Dr. Specialist').startsWith('Dr.') ? name : 'Dr. ' + (name || 'Specialist');
        const spec = specialisation || 'General Medicine';

        await pool.query(`
          INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
          VALUES ($1, $2, $3, $4, $5, 'Practice Specialist', 'PrimeCare Multispecialty Hospital', '₹1,000', '5.0 ★', $6)
          ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            specialisation = EXCLUDED.specialisation,
            qualification = EXCLUDED.qualification
        `, [
          docId,
          cleanEmail,
          docName,
          spec,
          qualification || 'MBBS, MD',
          `Verified Clinical Specialist in ${spec}. NMC Registration: ${regNumber || 'Verified'}`
        ]);
      } else if (status === 'REJECTED') {
        // 1. Mark application rejected
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'REJECTED' WHERE id = $1`, [id]);
        
        // 2. Delete credentials from pc_users and pc_doctors so rejected doctor CANNOT log in
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
