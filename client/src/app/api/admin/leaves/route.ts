import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { doctorName, leaveDate, reason, affectedPatients } = await req.json();

    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    const dispatchedEmails: string[] = [];
    const errors: string[] = [];

    if (smtpUser && smtpPass && Array.isArray(affectedPatients) && affectedPatients.length > 0) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      for (const patient of affectedPatients) {
        try {
          await transporter.sendMail({
            from: `"PrimeCare OPD Administration" <${smtpUser}>`,
            to: patient.patientEmail,
            subject: `⚠️ Important: Reschedule Notice for Consultation with ${doctorName} on ${leaveDate}`,
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 520px; margin: 0 auto; border: 1px solid #1e293b;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                  <span style="background-color: #dc2626; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">Unforeseen Leave Notice</span>
                </div>
                <h2 style="color: #f87171; margin-top: 0; font-size: 20px;">We Regret the Inconvenience</h2>
                <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                  Dear <strong>${patient.patientName}</strong>,
                </p>
                <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  We regret to inform you that <strong>${doctorName}</strong> is unexpectedly unavailable on <strong>${leaveDate}</strong> due to: <em>${reason}</em>.
                </p>
                <div style="background-color: #0f172a; border: 1px solid #334155; padding: 18px; border-radius: 12px; margin: 20px 0; font-size: 12px;">
                  <p style="margin: 4px 0; color: #94a3b8;">Original Slot: <strong style="color: #f8fafc;">${patient.timeSlot} on ${leaveDate}</strong></p>
                  <p style="margin: 4px 0; color: #94a3b8;">Original Token: <strong style="color: #38bdf8;">${patient.tokenNumber || 'Confirmed Slot'}</strong></p>
                  <p style="margin: 4px 0; color: #94a3b8;">Action Required: <strong style="color: #fbbf24;">Shift / Reschedule Appointment</strong></p>
                </div>
                <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                  Please visit the patient portal to choose an alternative date or shift your appointment to another specialist in the same department.
                </p>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="http://localhost:3000/patient/book" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 13px; display: inline-block;">
                    Reschedule Appointment Now →
                  </a>
                </div>
                <p style="font-size: 11px; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; pt: 12px;">
                  PrimeCare OPD Patient Helpdesk • Autonomous Hospital System
                </p>
              </div>
            `,
          });
          dispatchedEmails.push(patient.patientEmail);
        } catch (err: any) {
          errors.push(`${patient.patientEmail}: ${err.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      notifiedPatientsCount: dispatchedEmails.length,
      dispatchedEmails,
      errors,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
