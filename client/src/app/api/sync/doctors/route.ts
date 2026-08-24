import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS pc_doctors (
          id VARCHAR(255) PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          name VARCHAR(255) NOT NULL,
          specialisation VARCHAR(255) NOT NULL,
          qualification VARCHAR(255),
          experience VARCHAR(255),
          hospital VARCHAR(255),
          fee VARCHAR(50),
          rating VARCHAR(50) DEFAULT '5.0 ★',
          bio TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const res = await pool.query(`
        SELECT DISTINCT ON (LOWER(email)) 
          id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio 
        FROM pc_doctors 
        ORDER BY LOWER(email), created_at DESC
      `);

      return NextResponse.json(
        { success: true, doctors: res.rows || [] },
        { headers: { 'Cache-Control': 'no-store, max-age=0, must-revalidate' } }
      );
    } catch (err: any) {
      console.error("GET doctors error:", err);
    }
  }
  return NextResponse.json({ success: true, doctors: [] });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();

    // 1. DELETE ACTION VIA POST
    if (data.action === 'DELETE') {
      const docEmail = (data.email || '').trim().toLowerCase();
      const docId = (data.id || '').trim();

      if (pool) {
        if (docEmail) {
          await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1`, [docEmail]);
          await pool.query(`DELETE FROM pc_users WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [docEmail]);
          await pool.query(`DELETE FROM pc_doctor_applications WHERE LOWER(email) = $1`, [docEmail]);
          await pool.query(`DELETE FROM pc_leaves WHERE LOWER(doctor_name) LIKE $1`, [`%${docEmail}%`]);
          await pool.query(`
            UPDATE pc_appointments 
            SET status = 'CANCELLED', leave_reason = 'Doctor account deleted' 
            WHERE LOWER(doctor_email) = $1 AND status NOT IN ('COMPLETED', 'CANCELLED')
          `, [docEmail]);
        }
        if (docId) {
          await pool.query(`DELETE FROM pc_doctors WHERE id = $1`, [docId]);
          await pool.query(`DELETE FROM pc_leaves WHERE doctor_id = $1`, [docId]);
        }
      }
      return NextResponse.json({ success: true });
    }

    // 2. UPSERT DOCTOR
    const doc = data.doctor;
    if (!doc || !doc.name || !doc.email) {
      return NextResponse.json({ success: false, error: 'Doctor details required' }, { status: 400 });
    }

    if (pool) {
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
    }

    return NextResponse.json({ success: true, doctor: doc });
  } catch (err: any) {
    console.error("POST doctors error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
