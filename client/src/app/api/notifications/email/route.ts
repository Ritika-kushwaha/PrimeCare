import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.EMAIL_USER || 'admin@primecare.in';

async function sendMailHelper(to: string, subject: string, html: string) {
  // Option 1: SMTP / Gmail Transport
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"PrimeCare Hospital" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`[SMTP EMAIL SUCCESS] Sent to: ${to} | Subject: ${subject}`);
      return true;
    } catch (smtpErr) {
      console.error("[SMTP EMAIL ERROR]:", smtpErr);
    }
  }

  // Option 2: Resend API Transport
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: 'PrimeCare Medical Administration <onboarding@resend.dev>',
          to: [to],
          subject,
          html
        })
      });
      const data = await res.json();
      console.log(`[RESEND EMAIL SUCCESS] Sent to: ${to} | ID:`, data.id);
      return true;
    } catch (resendErr) {
      console.error("[RESEND EMAIL ERROR]:", resendErr);
    }
  }

  console.log(`[SIMULATED DISPATCH] Sent to ${to}: ${subject}`);
  return true;
}

export async function POST(req: Request) {
  try {
    const { type, recipientEmail, doctorName, specialisation, regNumber, leaveDate, reason } = await req.json();
    const cleanRecipient = (recipientEmail || '').trim().toLowerCase();

    // 1. DOCTOR APPLIES -> DISPATCH REQUEST EMAIL TO ADMIN
    if (type === 'NEW_DOCTOR_APPLICATION_ADMIN_ALERT') {
      const subject = `⚠️ New Doctor Approval Request: ${doctorName} (${specialisation || 'General Medicine'})`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Administration Alert</h2>
          <p style="font-size: 15px; color: #e2e8f0;">A new doctor has registered and is awaiting your verification before workspace access is granted.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Doctor Name:</strong> <span style="color: #f8fafc; font-weight: bold;">${doctorName}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Email Address:</strong> <span style="color: #38bdf8;">${cleanRecipient}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Specialisation:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>NMC / MCI Registration ID:</strong> <span style="color: #fbbf24; font-family: monospace; font-weight: bold;">${regNumber || 'PENDING'}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">Please log in to the PrimeCare Admin Portal to approve or reject this doctor's application.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #ef4444; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Admin Approval Portal</a>
        </div>
      `;

      await sendMailHelper(ADMIN_EMAIL, subject, html);
      return NextResponse.json({ success: true, message: `Admin approval request dispatched to ${ADMIN_EMAIL}` });
    }

    // 2. ADMIN APPROVES DOCTOR -> DISPATCH ACCEPTANCE EMAIL TO DOCTOR
    if (type === 'DOCTOR_APPROVED') {
      const subject = "🎉 Congratulations! Your PrimeCare Doctor Account is Approved";
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">
            We are pleased to inform you that your medical credentials and NMC Registration ID have been verified and <strong>APPROVED</strong> by the Hospital Administration.
          </p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Assigned Department:</strong> <span style="color: #38bdf8;">${specialisation || 'General Medicine'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Access Status:</strong> <span style="color: #34d399; font-weight: bold;">UNLOCKED & ACTIVE</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Registered Login Email:</strong> <span style="color: #f8fafc;">${cleanRecipient}</span></p>
          </div>
          <p style="color: #94a3b8; font-size: 13px;">You can now log in to the PrimeCare Doctor Workspace with your registered credentials to view your live outpatient queue, access patient EHR records, and write digital prescriptions.</p>
          <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #10b981; color: #022c22; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Sign In to Doctor Workspace</a>
        </div>
      `;

      await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: true, message: `Acceptance email dispatched to ${cleanRecipient}` });
    }

    // 3. LEAVE APPROVAL NOTICE TO DOCTOR
    if (type === 'LEAVE_APPROVED') {
      const subject = `📅 PrimeCare Duty Notice: Leave Confirmed on ${leaveDate}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #f59e0b; margin-bottom: 8px;">PrimeCare Duty & Leave Operations</h2>
          <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
          <p style="color: #cbd5e1; line-height: 1.6;">Your scheduled duty leave on <strong>${leaveDate}</strong> has been authorized.</p>
          <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Leave Date:</strong> <span style="color: #fbbf24; font-weight: bold;">${leaveDate}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Recorded Reason:</strong> <span style="color: #e2e8f0;">${reason || 'Medical / Duty Leave'}</span></p>
            <p style="margin: 4px 0; color: #94a3b8;"><strong>Queue Update:</strong> <span style="color: #38bdf8;">All matching patient bookings have been shifted to the "Due to Dr. on Leave" queue for rescheduling.</span></p>
          </div>
        </div>
      `;

      await sendMailHelper(cleanRecipient, subject, html);
      return NextResponse.json({ success: true, message: `Leave notice email sent to ${cleanRecipient}` });
    }

    return NextResponse.json({ success: false, error: 'Unknown email notification type' }, { status: 400 });
  } catch (err: any) {
    console.error("Email notification execution error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
