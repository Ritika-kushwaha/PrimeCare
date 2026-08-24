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
      return NextResponse.json(
        { success: true, applications: res.rows || [] },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
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
    const { id, email, status, name, specialisation, qualification, experience, regNumber } = data;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (!pool) {
      return NextResponse.json({ success: false, error: 'Database offline' }, { status: 500 });
    }

    if (id || cleanEmail) {
      if (status === 'APPROVED') {
        // 1. Update application status
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'APPROVED' WHERE id = $1`, [id]);
        if (cleanEmail) await pool.query(`UPDATE pc_doctor_applications SET status = 'APPROVED' WHERE LOWER(email) = $1`, [cleanEmail]);

        // 2. Unlock login credentials in pc_users
        if (cleanEmail) {
          await pool.query(`UPDATE pc_users SET is_approved = TRUE WHERE LOWER(email) = $1 AND role = 'DOCTOR'`, [cleanEmail]);
        }

        // 3. Fetch doctor application details if not provided in payload
        let docName = name;
        let docSpec = specialisation;
        let docQual = qualification;
        let docExp = experience;
        let docReg = regNumber;

        if (!docName && cleanEmail) {
          const appRes = await pool.query(`SELECT name, specialisation, qualification, experience, reg_number FROM pc_doctor_applications WHERE LOWER(email) = $1 LIMIT 1`, [cleanEmail]);
          if (appRes.rows.length > 0) {
            const row = appRes.rows[0];
            docName = row.name;
            docSpec = row.specialisation;
            docQual = row.qualification;
            docExp = row.experience;
            docReg = row.reg_number;
          }
        }

        const fullName = (docName || 'Specialist').startsWith('Dr.') ? docName : `Dr. ${docName || 'Specialist'}`;
        const spec = docSpec || 'General Medicine';
        const docId = id || ('doc-' + Date.now());

        // 4. Upsert directly into pc_doctors so new doctors appear on /patient/book and admin portal
        await pool.query(`DELETE FROM pc_doctors WHERE LOWER(email) = $1 OR id = $2`, [cleanEmail, docId]);

        await pool.query(`
          INSERT INTO pc_doctors (id, email, name, specialisation, qualification, experience, hospital, fee, rating, bio)
          VALUES ($1, $2, $3, $4, $5, $6, 'PrimeCare Multispecialty Hospital', '₹1,000', '5.0 ★', $7)
        `, [
          docId,
          cleanEmail,
          fullName,
          spec,
          docQual || 'MBBS, MD',
          docExp || 'Practice Specialist',
          `Verified Specialist in ${spec}. NMC Registration: ${docReg || 'Verified'}`
        ]);
      } else if (status === 'REJECTED') {
        if (id) await pool.query(`UPDATE pc_doctor_applications SET status = 'REJECTED' WHERE id = $1`, [id]);
        if (cleanEmail) {
          await pool.query(`UPDATE pc_doctor_applications SET status = 'REJECTED' WHERE LOWER(email) = $1`, [cleanEmail]);
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
