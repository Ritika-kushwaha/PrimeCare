import { NextResponse } from "next/navigation";
import { getDbPool, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      const result = await pool.query(`SELECT patient_key AS "patientKey", patient_email AS "patientEmail", patient_name AS "patientName", age, gender, visits FROM pc_ehr`);
      return NextResponse.json({ success: true, ehrRegistry: result.rows });
    } catch (err: any) {
      console.error("Neon GET ehr error:", err);
    }
  }
  return NextResponse.json({ success: true, ehrRegistry: [] });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const ehrs = data.ehrRegistry || (data.ehrEntry ? [data.ehrEntry] : []);

    if (pool && ehrs.length > 0) {
      for (const e of ehrs) {
        await pool.query(
          `INSERT INTO pc_ehr (patient_key, patient_email, patient_name, age, gender, visits)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (patient_key) DO UPDATE SET
             visits = EXCLUDED.visits,
             updated_at = CURRENT_TIMESTAMP`,
          [e.patientKey, e.patientEmail, e.patientName, String(e.age || '21'), e.gender || 'Member', JSON.stringify(e.visits || [])]
        );
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
