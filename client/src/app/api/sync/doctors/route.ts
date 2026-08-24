import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({ success: true, doctors: [] });
  }

  try {
    const res = await pool.query(`
      SELECT DISTINCT ON (LOWER(email)) 
        id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio 
      FROM pc_doctors 
      ORDER BY LOWER(email), created_at DESC
    `);
    return NextResponse.json(
      { success: true, doctors: res.rows || [] },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (err: any) {
    console.error("GET doctors error:", err);
    return NextResponse.json({ success: false, doctors: [], error: err.message });
  }
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({ success: false, error: 'Database not connected' }, { status: 500 });
  }

  try {
    const data = await req.json();

    // Direct DELETE branch
    if (data.action === 'DELETE') {
      const email = (data.email || '').trim().toLowerCase();
      const id = (data.id || '').trim();

      if (email) {
        await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [email]);
        await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [email]);
        await pool.query(`DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`, [email]);
        await pool.query(`DELETE FROM pc_leaves WHERE LOWER(doctor_name) LIKE $1 OR doctor_id = $2`, [`%${email}%`, id]);
        await pool.query(`
          UPDATE pc_appointments 
          SET status = 'CANCELLED', leave_reason = 'Doctor removed by Admin' 
          WHERE LOWER(doctor_email) = $1 AND status NOT IN ('COMPLETED', 'CANCELLED')
        `, [email]);
      } else if (id) {
        await pool.query(`DELETE FROM pc_doctors WHERE id = $1`, [id]);
        await pool.query(`DELETE FROM pc_leaves WHERE doctor_id = $1`, [id]);
      }

      return NextResponse.json({ success: true, message: 'Deleted from database' });
    }

    // Upsert branch
    const doc = data.doctor;
    if (!doc || !doc.email) {
      return NextResponse.json({ success: false, error: 'Doctor email required' }, { status: 400 });
    }

    const cleanEmail = doc.email.trim().toLowerCase();
    const docId = doc.id || ('doc-' + Date.now());

    await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [cleanEmail]);

    await pool.query(`
      INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      docId,
      cleanEmail,
      doc.name,
      doc.specialisation || 'General Medicine',
      doc.qualification || 'MBBS, MD',
      doc.experience || 'Practice Specialist',
      doc.hospital || 'PrimeCare Multispecialty Hospital',
      doc.fee || '₹1,000',
      doc.rating || '5.0 ★',
      doc.bio || `Specialist in ${doc.specialisation || 'General Medicine'}.`
    ]);

    await pool.query(`
      UPDATE pc_users 
      SET specialisation = $1, first_name = $2
      WHERE LOWER(email) = $3 AND role = 'DOCTOR'
    `, [doc.specialisation || 'General Medicine', doc.name.replace(/^Dr\.\s*/i, '').split(' ')[0], cleanEmail]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST doctors error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
