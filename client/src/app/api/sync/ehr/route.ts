import { NextResponse } from "next/navigation";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT patient_key AS "patientKey", patient_email AS "patientEmail", 
               patient_name AS "patientName", age, gender, visits 
        FROM pc_ehr
      `;
      return NextResponse.json({ success: true, ehrRegistry: rows });
    } catch (err: any) {
      console.error("GET ehr error:", err);
    }
  }
  return NextResponse.json({ success: true, ehrRegistry: [] });
}

export async function POST(req: Request) {
  await initDb();
  const sql = getDb();
  try {
    const data = await req.json();
    const ehrs = data.ehrRegistry || (data.ehrEntry ? [data.ehrEntry] : []);

    if (sql && ehrs.length > 0) {
      for (const e of ehrs) {
        await sql`
          INSERT INTO pc_ehr (patient_key, patient_email, patient_name, age, gender, visits)
          VALUES (${e.patientKey}, ${e.patientEmail}, ${e.patientName}, ${String(e.age || '21')}, ${e.gender || 'Member'}, ${JSON.stringify(e.visits || [])})
          ON CONFLICT (patient_key) DO UPDATE SET
            visits = EXCLUDED.visits,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
