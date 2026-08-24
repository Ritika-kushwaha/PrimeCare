import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  await initDb();
  const pool = getDbPool();
  if (!pool) {
    return NextResponse.json({ success: false, error: 'Database offline' }, { status: 500 });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Find all active confirmed appointments for today & tomorrow
    const res = await pool.query(`
      SELECT id, token_number AS "tokenNumber", doctor_name AS "doctorName", 
             doctor_email AS "doctorEmail", department, date, time_slot AS "timeSlot", 
             fee, patient_name AS "patientName", patient_email AS "patientEmail"
      FROM pc_appointments 
      WHERE (date = $1 OR date = $2) AND status = 'CONFIRMED'
    `, [today, tomorrow]);

    const appointments = res.rows || [];
    let sentCount = 0;

    for (const apt of appointments) {
      if (apt.patientEmail) {
        try {
          await fetch(`${new URL(req.url).origin}/api/notifications/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'APPOINTMENT_REMINDER',
              patientEmail: apt.patientEmail,
              doctorEmail: apt.doctorEmail,
              patientName: apt.patientName,
              doctorName: apt.doctorName,
              specialisation: apt.department,
              date: apt.date,
              timeSlot: apt.timeSlot,
              tokenNumber: apt.tokenNumber,
              fee: apt.fee
            })
          });
          sentCount++;
        } catch (err) {
          console.warn('Reminder dispatch failed for:', apt.patientEmail, err);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      scanned: appointments.length, 
      remindersDispatched: sentCount 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
