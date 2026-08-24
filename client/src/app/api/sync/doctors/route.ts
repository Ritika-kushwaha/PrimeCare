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
        SELECT id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio 
        FROM pc_doctors 
        ORDER BY created_at ASC
      `);

      return NextResponse.json(
        { success: true, doctors: res.rows || [] },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
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
    const doc = data.doctor;

    if (!doc || !doc.name || !doc.email) {
      return NextResponse.json({ success: false, error: 'Doctor details required' }, { status: 400 });
    }

    if (pool) {
      const cleanEmail = doc.email.trim().toLowerCase();
      const docId = doc.id || ('doc-' + Date.now());

      // 1. Update pc_doctors table
      await pool.query(`
        INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          specialisation = EXCLUDED.specialisation,
          qualification = EXCLUDED.qualification,
          experience = EXCLUDED.experience,
          hospital = EXCLUDED.hospital,
          fee = EXCLUDED.fee,
          rating = EXCLUDED.rating,
          bio = EXCLUDED.bio
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

      // 2. Also update pc_users table so login session & auth tokens reflect the new department
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
