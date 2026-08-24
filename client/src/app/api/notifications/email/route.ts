import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getDbPool, initDb } from "@/lib/db";

export const dynamic = 'force-dynamic';

async function getAdminEmails(): Promise<string[]> {
  await initDb();
  const pool = getDbPool();
  if (pool) {
    try {
      const res = await pool.query(`SELECT email FROM pc_users WHERE role = 'ADMIN'`);
      const emails = res.rows.map((r: any) => (r.email || '').trim().toLowerCase()).filter(Boolean);
      if (emails.length > 0) return emails;
    } catch (e) {
      console.error("Failed to query admin emails from DB:", e);
    }
  }
  return [process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@primecare.in'];
}

async function sendMailHelper(to: string | string[], subject: string, html: string) {
  const emailUser = process.env.EMAIL_USER?.trim();
  const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '');
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const recipients = (Array.isArray(to) ? to : [to]).map(e => (e || '').trim()).filter(Boolean);

  if (recipients.length === 0) {
    return { success: false, error: 'No recipient provided' };
  }

  // 1. Gmail SMTP Transport (Port 587 TLS)
  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: emailUser,
          pass: emailPass,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000
      });

      const info = await transporter.sendMail({
        from: `"PrimeCare Hospital Desk" <${emailUser}>`,
        to: recipients.join(', '),
        subject,
        html,
      });

      console.log(`[SMTP SUCCESS] Sent to: ${recipients.join(', ')} | Message ID: ${info.messageId}`);
      return { success: true, provider: 'GMAIL_SMTP', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error("[SMTP ERROR]:", smtpErr.message);
    }
  }

  // 2. Resend API Fallback
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'PrimeCare Medical Administration <onboarding@resend.dev>',
          to: recipients,
          subject,
          html
        })
      });

      const data = await res.json();
      if (res.ok) {
        return { success: true, provider: 'RESEND', messageId: data.id };
      }
    } catch (resendErr: any) {
      console.error("[RESEND ERROR]:", resendErr);
    }
  }

  return { success: false, error: 'No configured mail transport' };
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
      regNumber, 
      tokenNumber, 
      date, 
      timeSlot, 
      fee, 
      leaveDate, 
      reason,
      adminEmail 
    } = data;

    const cleanRecipient = (recipientEmail || patientEmail || doctorEmail || '').trim().toLowerCase();

    // 1. APPOINTMENT REMINDER (To Patient & Doctor)
    if (type === 'APPOINTMENT_REMINDER') {
      const targets = [patientEmail, doctorEmail].filter(Boolean).map(e => e.trim().toLowerCase());
      const subject = `⏰ Reminder: Upcoming Appointment with ${doctorName || 'Dr.'} on ${date}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #38bdf8; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #38bdf8; margin-bottom: 8px;">PrimeCare Outpatient Visit Reminder</h2>
          <p style="font-size: 15px; color: #e2e8f0;">This is a friendly reminder for your upcoming medical consultation.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Patient:</strong> <span style="color: #f8fafc; font-weight: bold;">${patientName || 'Member'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Doctor:</strong> <span style="color: #38bdf8; font-weight: bold;">${doctorName || 'Specialist'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Specialty:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Scheduled Date & Slot:</strong> <span style="color: #fbbf24; font-weight: bold;">${date} at ${timeSlot}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Token Number:</strong> <span style="color: #38bdf8; font-family: monospace; font-size: 16px; font-weight: bold;">#${tokenNumber || '101'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Consultation Fee:</strong> <span style="color: #cbd5e1;">${fee || '₹1,000'}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please arrive 10-15 minutes prior to your allocated slot.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #38bdf8; color: #082f49; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">View Consultation Details</a>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result, recipients: targets });
    }

    // 2. APPOINTMENT CONFIRMATION
    if (type === 'APPOINTMENT_CONFIRMATION') {
      const targets = [patientEmail, doctorEmail].filter(Boolean).map(e => e.trim().toLowerCase());
      const subject = `🏥 PrimeCare Appointment Confirmed - Token #${tokenNumber || '101'}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Outpatient Booking Confirmation</h2>
          <p style="font-size: 15px; color: #e2e8f0;">Your clinical appointment has been scheduled and confirmed.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Patient Name:</strong> <span style="color: #f8fafc; font-weight: bold;">${patientName || 'Member'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Attending Doctor:</strong> <span style="color: #38bdf8; font-weight: bold;">${doctorName || 'Clinical Specialist'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Department:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Date & Time Slot:</strong> <span style="color: #fbbf24; font-weight: bold;">${date} at ${timeSlot}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Token Number:</strong> <span style="color: #10b981; font-family: monospace; font-size: 16px; font-weight: bold;">#${tokenNumber || '101'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Consultation Fee:</strong> <span style="color: #cbd5e1;">${fee || '₹1,000'}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please arrive 10 minutes prior to your allocated slot.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #10b981; color: #022c22; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Consultation Desk</a>
        </div>
      `;

      const result = await sendMailHelper(targets, subject, html);
      return NextResponse.json({ success: result.success, details: result, recipients: targets });
    }

    // 3. DOCTOR SIGNUP REQUEST
    if (type === 'NEW_DOCTOR_APPLICATION_ADMIN_ALERT') {
      const adminEmails = adminEmail ? [adminEmail.trim().toLowerCase()] : await getAdminEmails();
      const subject = `⚠️ New Doctor Approval Request: ${doctorName} (${specialisation || 'General Medicine'})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Administration Alert</h2>
          <p style="font-size: 15px; color: #e2e8f0;">A new physician has registered and is awaiting your verification.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Doctor Name:</strong> <span style="color: #f8fafc; font-weight: bold;">${doctorName}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Email:</strong> <span style="color: #38bdf8;">${cleanRecipient}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Specialisation:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>NMC ID:</strong> <span style="color: #fbbf24; font-family: monospace;">${regNumber || 'PENDING'}</span></p>
          </div>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #ef4444; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Admin Approval Portal</a>
        </div>
      `;

      const result = await sendMailHelper(adminEmails, subject, html);
      return NextResponse.json({ success: result.success, details: result, targetAdmins: adminEmails });
    }

    // 4. DOCTOR APPROVAL
    if (type === 'DOCTOR_APPROVED') {
      const subject = "🎉 Welcome to PrimeCare - Your Doctor Account is Approved!";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">
            Your credentials have been verified and <strong>APPROVED</strong> by the Hospital Administrator.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Department:</strong> <span style="color: #38bdf8;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Status:</strong> <span style="color: #34d399; font-weight: bold;">UNLOCKED & ACTIVE</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Login Email:</strong> <span style="color: #f8fafc;">${cleanRecipient}</span></p>
          </div>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #10b981; color: #022c22; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Sign In to Doctor Workspace</a>
        </div>
      `;

      const result = await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    // 5. DOCTOR REJECTION
    if (type === 'DOCTOR_REJECTED') {
      const subject = "PrimeCare Application Status: Verification Unsuccessful";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Applicant'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">Your medical faculty registration could not be verified by Administration at this time.</p>
        </div>
      `;

      const result = await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    // 6. DUTY LEAVE NOTIFICATION
    if (type === 'LEAVE_APPROVED') {
      const subject = `📅 PrimeCare Duty Notice: Leave Confirmed on ${leaveDate}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">PrimeCare Duty & Leave Operations</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">Your scheduled duty leave on <strong>${leaveDate}</strong> has been authorized.</p>
        </div>
      `;

      const result = await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: result.success, details: result });
    }

    return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    console.error("Email route error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
