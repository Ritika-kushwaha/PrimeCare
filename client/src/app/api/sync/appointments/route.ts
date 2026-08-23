import { NextResponse } from "next/navigation";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const sql = getDb();
  if (sql) {
    try {
      const rows = await sql`
        SELECT id, token_number AS "tokenNumber", doctor_id AS "doctorId", 
               doctor_name AS "doctorName", doctor_email AS "doctorEmail", 
               department, fee, hospital, date, time_slot AS "timeSlot", 
               symptoms, patient_name AS "patientName", patient_email AS "patientEmail", 
               age, gender, status, finalized_at AS "finalizedAt", leave_reason AS "leaveReason" 
        FROM pc_appointments 
        ORDER BY created_at DESC
      `;
      return NextResponse.json({ success: true, appointments: rows });
    } catch (err: any) {
      console.error("GET appointments error:", err);
    }
  }
  return NextResponse.json({ success: true, appointments: [] });
}

export async function POST(req: Request) {
  await initDb();
  const sql = getDb();
  try {
    const data = await req.json();
    const appts = data.appointments || (data.appointment ? [data.appointment] : []);

    if (sql && appts.length > 0) {
      for (const a of appts) {
        await sql`
          INSERT INTO pc_appointments (
            id, token_number, doctor_id, doctor_name, doctor_email, department, 
            fee, hospital, date, time_slot, symptoms, patient_name, patient_email, 
            age, gender, status, finalized_at, leave_reason
          ) VALUES (
            ${a.id}, ${a.tokenNumber || null}, ${a.doctorId || null}, ${a.doctorName || null},
            ${a.doctorEmail || null}, ${a.department || null}, ${a.fee || null},
            ${a.hospital || null}, ${a.date || null}, ${a.timeSlot || null},
            ${a.symptoms || null}, ${a.patientName || null}, ${a.patientEmail || null},
            ${a.age ? String(a.age) : null}, ${a.gender || null}, ${a.status || 'CONFIRMED'},
            ${a.finalizedAt || null}, ${a.leaveReason || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            date = EXCLUDED.date,
            time_slot = EXCLUDED.time_slot,
            doctor_name = EXCLUDED.doctor_name,
            department = EXCLUDED.department,
            fee = EXCLUDED.fee,
            finalized_at = EXCLUDED.finalized_at,
            leave_reason = EXCLUDED.leave_reason
        `;
      }
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
