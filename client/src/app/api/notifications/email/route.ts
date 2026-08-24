import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

async function sendMailHelper(to: string | string[], subject: string, html: string) {
  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');
  
  const recipients = (Array.isArray(to) ? to : [to])
    .filter(Boolean)
    .map(e => String(e).trim().toLowerCase())
    .filter((val, idx, arr) => arr.indexOf(val) === idx && val.includes('@'));

  if (recipients.length === 0) {
    return { success: false, error: 'No valid recipient email address provided.' };
  }

  if (!emailUser || !emailPass) {
    return { success: false, error: 'EMAIL_USER or EMAIL_PASS missing on server.' };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // TLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 12000,
    });

    const info = await transporter.sendMail({
      from: `"PrimeCare Hospital Desk" <${emailUser}>`,
      to: recipients.join(', '),
      subject,
      html,
    });

    console.log(`[SMTP SUCCESS] Sent to: ${recipients.join(', ')} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, recipients };
  } catch (smtpErr: any) {
    console.error("[SMTP ERROR]:", smtpErr.message);
    return { success: false, error: smtpErr.message };
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      type, 
      recipientEmail, 
      patientEmail, 
      doctorEmail, 
      patientName, 
      doctorName, 
      specialisation, 
      tokenNumber, 
      date, 
      timeSlot, 
      fee,
      leaveDate,
      reason,
      regNumber
    } = data;

    // Collect all valid target emails
    const targets = [recipientEmail, patientEmail, doctorEmail]
      .filter(Boolean)
      .map(e => String(e).trim().toLowerCase())
      .filter((val, idx, arr) => arr.indexOf(val) === idx && val.includes('@'));

    // 1. APPOINTMENT REMINDER
    if (type === 'APPOINTMENT_REMINDER') {
      const subject = `⏰ Appointment Reminder: ${patientName || 'Patient'} • Dr. ${doctorName || 'Specialist'} on ${date || 'Upcoming'}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #0284c7; border-radius: 14px; background: #0b132b; color: #f8fafc;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">PrimeCare Outpatient Visit Reminder</h2>
          </div>
          <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 16px;">This is an automated reminder regarding your upcoming scheduled clinical appointment.</p>
          
          <div style="background: #1c2541; padding: 18px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #3a506b;">
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Patient:</strong> <span style="color: #ffffff; font-weight: bold;">${patientName || 'Member'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Attending Physician:</strong> <span style="color: #38bdf8; font-weight: bold;">${doctorName || 'Doctor'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Department:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Scheduled Date & Slot:</strong> <span style="color: #fbbf24; font-weight: bold;">${date} at ${timeSlot}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Queue Token:</strong> <span style="color: #38bdf8; font-family: monospace; font-size: 15px; font-weight: bold;">#${tokenNumber || '101'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Consultation Fee:</strong> <span style="color: #f1f5f9;">${fee || '₹1,000'}</span></p>
          </div>

          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">Please reach the clinical consultation desk 10-15 minutes before your time slot.</p>
          <a href="https://primecare-app-jet.vercel.app/appointments" style="display: inline-block; background: #0284c7; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">View My Appointments</a>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result, recipients: targets });
    }

    // 2. APPOINTMENT CONFIRMATION
    if (type === 'APPOINTMENT_CONFIRMATION') {
      const subject = `🏥 PrimeCare Booking Confirmed: Token #${tokenNumber || '101'} (${date})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 14px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin: 0 0 12px 0; font-size: 20px;">PrimeCare Outpatient Confirmation</h2>
          <p style="font-size: 14px; color: #e2e8f0;">Your clinical appointment has been scheduled and confirmed.</p>
          <div style="background: #1e293b; padding: 18px; border-radius: 10px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Patient:</strong> <span style="color: #ffffff; font-weight: bold;">${patientName || 'Member'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Doctor:</strong> <span style="color: #38bdf8; font-weight: bold;">${doctorName || 'Clinical Specialist'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Department:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Date & Time Slot:</strong> <span style="color: #fbbf24; font-weight: bold;">${date} at ${timeSlot}</span></p>
            <p style="margin: 6px 0; color: #94a3b8; font-size: 13px;"><strong>Token Number:</strong> <span style="color: #10b981; font-family: monospace; font-size: 15px; font-weight: bold;">#${tokenNumber || '101'}</span></p>
          </div>
          <a href="https://primecare-app-jet.vercel.app/appointments" style="display: inline-block; background: #10b981; color: #022c22; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">Open Consultation Desk</a>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result, recipients: targets });
    }

    // 3. DOCTOR APPROVAL
    if (type === 'DOCTOR_APPROVED') {
      const subject = "🎉 Welcome to PrimeCare - Your Doctor Account is Approved!";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 14px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 15px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">
            Your credentials have been verified and <strong>APPROVED</strong> by the Hospital Administrator.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;"><strong>Department:</strong> <span style="color: #38bdf8;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8; font-size: 13px;"><strong>Status:</strong> <span style="color: #34d399; font-weight: bold;">ACTIVE</span></p>
          </div>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #10b981; color: #022c22; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: bold;">Sign In to Doctor Workspace</a>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    // 4. DOCTOR REJECTION
    if (type === 'DOCTOR_REJECTED') {
      const subject = "PrimeCare Application Status: Verification Unsuccessful";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 14px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 15px; color: #e2e8f0;">Dear <strong>${doctorName || 'Applicant'}</strong>,</p>
          <p style="color: #cbd5e1; font-size: 13px; line-height: 1.6;">Your medical faculty registration could not be verified by Administration at this time.</p>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    // 5. DUTY LEAVE NOTIFICATION
    if (type === 'LEAVE_APPROVED') {
      const subject = `📅 PrimeCare Duty Notice: Leave Confirmed on ${leaveDate}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 14px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">PrimeCare Duty Operations</h2>
          <p style="font-size: 15px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>, your scheduled duty leave on <strong>${leaveDate}</strong> has been authorized.</p>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    return NextResponse.json({ success: false, error: 'Unknown notification type' }, { status: 400 });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
