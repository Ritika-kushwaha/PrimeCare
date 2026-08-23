import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { 
      patientName, 
      patientEmail, 
      doctorName, 
      department, 
      clinicalNotes, 
      prescription, 
      aiSummary, 
      fee 
    } = await req.json();

    const cleanEmail = (patientEmail || '').trim().toLowerCase();
    if (!cleanEmail) {
      return NextResponse.json({ error: 'Patient email required' }, { status: 400 });
    }

    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: smtpUser, pass: smtpPass },
        });

        await transporter.sendMail({
          from: `"PrimeCare OPD Desk" <${smtpUser}>`,
          to: cleanEmail,
          subject: `📋 Your Post-Visit Summary & Care Plan: ${doctorName}`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 540px; margin: 0 auto; border: 1px solid #1e293b;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 16px; margin-bottom: 20px;">
                <div>
                  <h2 style="color: #34d399; margin: 0; font-size: 20px;">PrimeCare Health Services</h2>
                  <p style="font-size: 12px; color: #94a3b8; margin: 4px 0 0 0;">Consultation Summary & AI Care Plan</p>
                </div>
                <span style="background-color: #064e3b; color: #34d399; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: bold;">Completed</span>
              </div>

              <p style="font-size: 14px; color: #e2e8f0; margin-bottom: 16px;">
                Dear <strong>${patientName}</strong>,
              </p>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
                Thank you for visiting <strong>${doctorName}</strong> (${department}). Below is your plain-language diagnostic summary, medication schedule, and follow-up guidance.
              </p>

              <!-- AI SUMMARY CARD -->
              <div style="background-color: #0f172a; border: 1px solid #3b82f6; border-radius: 12px; padding: 18px; margin: 20px 0;">
                <h3 style="color: #60a5fa; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ✨ AI Patient-Friendly Care Plan
                </h3>
                
                <div style="margin-bottom: 14px;">
                  <strong style="color: #94a3b8; font-size: 11px; text-transform: uppercase; display: block;">Diagnosis Overview:</strong>
                  <p style="color: #f1f5f9; font-size: 13px; margin: 4px 0 0 0; line-height: 1.5;">${aiSummary?.patientSummary || clinicalNotes}</p>
                </div>

                <div style="margin-bottom: 14px; background-color: #020617; padding: 12px; border-radius: 8px; border: 1px solid #1e293b;">
                  <strong style="color: #34d399; font-size: 11px; text-transform: uppercase; display: block;">💊 Prescribed Medication & Schedule:</strong>
                  <p style="color: #e2e8f0; font-size: 13px; margin: 4px 0 0 0; font-weight: bold;">℞ ${prescription?.medication}</p>
                  <p style="color: #94a3b8; font-size: 12px; margin: 2px 0 0 0;">${aiSummary?.medicationSchedule || `Take every ${prescription?.frequencyHours} hours for ${prescription?.durationDays} days.`}</p>
                </div>

                <div>
                  <strong style="color: #f59e0b; font-size: 11px; text-transform: uppercase; display: block;">Actionable Next Steps:</strong>
                  <p style="color: #cbd5e1; font-size: 12px; margin: 4px 0 0 0; line-height: 1.5;">${aiSummary?.followUpSteps || 'Rest and stay hydrated.'}</p>
                </div>
              </div>

              <!-- CLINICAL & INVOICE DETAILS -->
              <div style="background-color: #090d16; border: 1px solid #1e293b; padding: 14px; border-radius: 10px; font-size: 12px; color: #94a3b8;">
                <p style="margin: 2px 0;"><strong>Attending Physician:</strong> ${doctorName} (${department})</p>
                <p style="margin: 2px 0;"><strong>Consultation Fee:</strong> ${fee || '₹1,200'}</p>
                <p style="margin: 2px 0;"><strong>Clinical Notes on File:</strong> <em>"${clinicalNotes}"</em></p>
              </div>

              <div style="text-align: center; margin-top: 24px;">
                <a href="http://localhost:3000/patient/history" style="background-color: #10b981; color: #020617; padding: 12px 24px; border-radius: 10px; font-weight: bold; text-decoration: none; font-size: 13px; display: inline-block;">
                  View Medical History in Portal →
                </a>
              </div>

              <p style="font-size: 11px; color: #64748b; margin-top: 24px; text-align: center; border-top: 1px solid #1e293b; padding-top: 12px;">
                PrimeCare Autonomous Clinical Services • Electronic Health Records
              </p>
            </div>
          `,
        });
      } catch (err: any) {
        console.warn('Post-visit email warning:', err.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Summary dispatched to patient' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
