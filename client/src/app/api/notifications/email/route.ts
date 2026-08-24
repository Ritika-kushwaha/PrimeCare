import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'ritikakushwaha62@gmail.com';

async function sendMailHelper(to: string, subject: string, html: string) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const resendKey = process.env.RESEND_API_KEY;

  // 1. SMTP / Gmail App Password Transport
  if (emailUser && emailPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: emailUser,
          pass: emailPass.replace(/\s+/g, ''), // Clean any accidental spaces in app password
        },
      });

      const info = await transporter.sendMail({
        from: `"PrimeCare Medical Administration" <${emailUser}>`,
        to,
        subject,
        html,
      });

      return { success: true, provider: 'GMAIL_SMTP', messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error("[SMTP ERROR]:", smtpErr);
      return { success: false, provider: 'GMAIL_SMTP', error: smtpErr.message };
    }
  }

  // 2. Resend API Transport
  if (resendKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendKey}`
        },
        body: JSON.stringify({
          from: 'PrimeCare Administration <onboarding@resend.dev>',
          to: [to],
          subject,
          html
        })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, provider: 'RESEND', error: data?.message || 'Resend failed' };
      }
      return { success: true, provider: 'RESEND', messageId: data.id };
    } catch (resendErr: any) {
      return { success: false, provider: 'RESEND', error: resendErr.message };
    }
  }

  return { 
    success: false, 
    provider: 'NONE_CONFIGURED', 
    error: 'No EMAIL_USER/EMAIL_PASS or RESEND_API_KEY configured in Vercel Environment Variables.' 
  };
}

export async function POST(req: Request) {
  try {
    const { type, recipientEmail, doctorName, specialisation, regNumber, leaveDate, reason } = await req.json();
    const cleanRecipient = (recipientEmail || '').trim().toLowerCase();

    // 1. DOCTOR APPLIES -> DISPATCH APPROVAL REQUEST EMAIL TO ADMIN
    if (type === 'NEW_DOCTOR_APPLICATION_ADMIN_ALERT') {
      const subject = `⚠️ New Doctor Approval Request: ${doctorName} (${specialisation || 'General Medicine'})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Administration Alert</h2>
          <p style="font-size: 15px; color: #e2e8f0;">A new physician has registered and requires your approval before they can log in.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Doctor Name:</strong> <span style="color: #f8fafc; font-weight: bold;">${doctorName}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Email:</strong> <span style="color: #38bdf8;">${cleanRecipient}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Specialisation:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>NMC / MCI ID:</strong> <span style="color: #fbbf24; font-family: monospace; font-weight: bold;">${regNumber || 'PENDING'}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Review and approve or reject this doctor's application in the Admin Portal.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Admin Approval Portal</a>
        </div>
      `;

      const result = await sendMailHelper(ADMIN_EMAIL, subject, html);
      return NextResponse.json({ success: result.success, details: result, targetAdmin: ADMIN_EMAIL });
    }

    // 2. ADMIN APPROVES DOCTOR -> DISPATCH ACCEPTANCE EMAIL TO DOCTOR
    if (type === 'DOCTOR_APPROVED') {
      const subject = "🎉 Congratulations! Your PrimeCare Doctor Account is Approved";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">
            Your medical registration (${regNumber || 'Verified NMC ID'}) and credentials have been verified and <strong>APPROVED</strong> by the Hospital Administration.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Assigned Department:</strong> <span style="color: #38bdf8;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Status:</strong> <span style="color: #34d399; font-weight: bold;">UNLOCKED & ACTIVE</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Registered Email:</strong> <span style="color: #f8fafc;">${cleanRecipient}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">You can now log in to the PrimeCare Doctor Workspace with your registered credentials to manage patient appointments and prescriptions.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #10b981; color: #022c22; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Sign In to Doctor Workspace</a>
        </div>
      `;

      const result = await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: result.success, details: result, targetDoctor: cleanRecipient });
    }

    // 3. LEAVE APPROVAL NOTICE TO DOCTOR
    if (type === 'LEAVE_APPROVED') {
      const subject = `📅 PrimeCare Duty Notice: Leave Confirmed on ${leaveDate}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">PrimeCare Duty & Leave Operations</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">Your scheduled duty leave on <strong>${leaveDate}</strong> has been authorized and recorded.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Leave Date:</strong> <span style="color: #fbbf24; font-weight: bold;">${leaveDate}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Reason:</strong> <span style="color: #e2e8f0;">${reason || 'Medical / Duty Leave'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Queue Notice:</strong> <span style="color: #38bdf8;">All matching patient bookings have been shifted to the "Due to Dr. on Leave" tab for rescheduling.</span></p>
          </div>
        </div>
      `;

      const result = await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: result.success, details: result, targetDoctor: cleanRecipient });
    }

    return NextResponse.json({ success: false, error: 'Unknown email notification type' }, { status: 400 });
  } catch (err: any) {
    console.error("Email notification execution error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
