import { NextResponse } from "next/navigation";
import { queryNeon, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  await initDb();
  try {
    const rows = await queryNeon(`
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
    return NextResponse.json({ success: true, appointments: rows || [] });
  } catch (err: any) {
    console.error("GET appointments error:", err);
    return NextResponse.json({ success: true, appointments: [] });
  }
}

export async function POST(req: Request) {
  await initDb();
  try {
    const data = await req.json();
    const appts = data.appointments || (data.appointment ? [data.appointment] : []);

    for (const a of appts) {
      const docName = a.doctorName || a.doctor_name || 'Dr. Specialist';
      const pName = a.patientName || a.patient_name || 'Patient Member';
      const pEmail = (a.patientEmail || a.patient_email || 'patient@primecare.in').toLowerCase().trim();
      const tSlot = a.timeSlot || a.time_slot || '10:00 AM';
      const tNum = a.tokenNumber || a.token_number || `TK-${Math.floor(100 + Math.random() * 900)}`;
      const docId = a.doctorId || a.doctor_id || 'doc-01';
      const docEmail = (a.doctorEmail || a.doctor_email || '').toLowerCase().trim();
      const dept = a.department || 'General Medicine';
      const fee = a.fee || '₹1,200';
      const hosp = a.hospital || 'PrimeCare Hospital';
      const date = a.date || '2026-08-28';
      const symp = a.symptoms || 'General Consultation';
      const age = a.age ? String(a.age) : '21';
      const gen = a.gender || 'Member';
      const status = a.status || 'CONFIRMED';
      const finAt = a.finalizedAt || a.finalized_at || null;
      const lReason = a.leaveReason || a.leave_reason || null;

      await queryNeon(`
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
      `, [a.id, tNum, docId, docName, docEmail, dept, fee, hosp, date, tSlot, symp, pName, pEmail, age, gen, status, finAt, lReason]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("POST appointments error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
