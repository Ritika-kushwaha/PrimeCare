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
        SELECT 
          id, 
          token_number AS "tokenNumber", 
          doctor_id AS "doctorId", 
          doctor_name AS "doctorName", 
          doctor_email AS "doctorEmail", 
          department, 
          fee, 
          hospital, 
          date, 
          time_slot AS "timeSlot", 
          symptoms, 
          patient_name AS "patientName", 
           patient_email AS "patientEmail", 
          age, 
          gender, 
          status, 
          finalized_at AS "finalizedAt", 
          leave_reason AS "leaveReason" 
        FROM pc_appointments 
        ORDER BY created_at DESC
      `);
      return NextResponse.json(
        { success: true, appointments: res.rows || [] },
        { headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    } catch (err: any) {
      console.error("GET appointments error:", err);
    }
  }
  return NextResponse.json({ success: true, appointments: [] });
}

export async function POST(req: Request) {
  await initDb();
  const pool = getDbPool();
  try {
    const data = await req.json();
    const appts = data.appointments || (data.appointment ? [data.appointment] : []);

    if (pool && appts.length > 0) {
      for (const a of appts) {
        await pool.query(`
          INSERT INTO pc_appointments (
            id, token_number, doctor_id, doctor_name, doctor_email, department, 
            fee, hospital, date, time_slot, symptoms, patient_name, patient_email, 
            age, gender, status, finalized_at, leave_reason
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            date = EXCLUDED.date,
            time_slot = EXCLUDED.time_slot,
            doctor_name = EXCLUDED.doctor_name,
            doctor_email = EXCLUDED.doctor_email,
            department = EXCLUDED.department,
            fee = EXCLUDED.fee,
            finalized_at = EXCLUDED.finalized_at,
            leave_reason = EXCLUDED.leave_reason
        `, [
          a.id || ('apt-' + Date.now()),
          a.tokenNumber || a.token_number || `TK-${Math.floor(100 + Math.random() * 900)}`,
          a.doctorId || a.doctor_id || 'doc-01',
          a.doctorName || a.doctor_name || 'Dr. Specialist',
          (a.doctorEmail || a.doctor_email || '').toLowerCase().trim(),
          a.department || 'General Medicine',
          a.fee || '₹1,200',
          a.hospital || 'PrimeCare Hospital',
          a.date || '2026-08-28',
          a.timeSlot || a.time_slot || '10:00 AM',
          a.symptoms || 'General Consultation',
          a.patientName || a.patient_name || 'Patient Member',
          (a.patientEmail || a.patient_email || 'patient@primecare.in').toLowerCase().trim(),
          a.age ? String(a.age) : '21',
          a.gender || 'Member',
          a.status || 'CONFIRMED',
          a.finalizedAt || a.finalized_at || null,
          a.leaveReason || a.leave_reason || null
        ]);
      }
    }
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
  } catch (err: any) {
    console.error("POST appointments error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
