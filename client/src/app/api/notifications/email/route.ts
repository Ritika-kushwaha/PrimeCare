import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@primecare.in';

export async function POST(req: Request) {
  try {
    const { type, recipientEmail, doctorName, specialisation, regNumber, leaveDate, reason } = await req.json();

    const cleanRecipient = (recipientEmail || '').trim().toLowerCase();

    // 1. DOCTOR SIGNED UP -> SEND APPROVAL REQUEST TO ADMIN
    if (type === 'NEW_DOCTOR_APPLICATION_ADMIN_ALERT') {
      const subject = `⚠️ New Doctor Application: ${doctorName} (${specialisation})`;
      console.log(`[EMAIL DISPATCH to ADMIN ${ADMIN_EMAIL}]: ${subject}`);

      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'PrimeCare Medical Desk <no-reply@primecare.in>',
              to: [ADMIN_EMAIL],
              subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #ef4444; border-radius: 12px; background: #0f172a; color: #f8fafc;">
                  <h2 style="color: #ef4444; margin-bottom: 8px;">PrimeCare Administration Alert</h2>
                  <p style="font-size: 15px; color: #e2e8f0;">A new physician has registered and is awaiting your verification before gaining workspace access.</p>
                  <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Doctor Name:</strong> <span style="color: #f8fafc;">${doctorName}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Email:</strong> <span style="color: #38bdf8;">${cleanRecipient}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Specialisation:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>NMC / MCI ID:</strong> <span style="color: #fbbf24; font-family: monospace;">${regNumber || 'N/A'}</span></p>
                  </div>
                  <p style="color: #94a3b8; font-size: 13px;">Please log in to the Admin Portal to review credentials and approve or reject this application.</p>
                  <a href="https://primecare-app-jet.vercel.app/login" style="display: inline-block; background: #ef4444; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 12px;">Open Admin Portal</a>
                </div>
              `
            })
          });
        } catch (e) {
          console.warn("Email alert error:", e);
        }
      }
      return NextResponse.json({ success: true, message: `Admin approval request dispatched for ${doctorName}` });
    }

    // 2. ADMIN APPROVED DOCTOR -> SEND ACCEPTANCE EMAIL TO DOCTOR
    if (type === 'DOCTOR_APPROVED') {
      const subject = "🎉 Welcome to PrimeCare - Your Doctor Account is Approved!";
      console.log(`[EMAIL DISPATCH to DOCTOR ${cleanRecipient}]: ${subject}`);

      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'PrimeCare Medical Administration <no-reply@primecare.in>',
              to: [cleanRecipient],
              subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #0f172a; color: #f8fafc;">
                  <h2 style="color: #10b981; margin-bottom: 8px;">PrimeCare Medical Administration</h2>
                  <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
                  <p style="color: #cbd5e1; line-height: 1.6;">
                    Congratulations! Your medical registration (${regNumber || 'Verified NMC ID'}) and credentials have been verified and <strong>APPROVED</strong> by the Hospital Administrator.
                  </p>
                  <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Department:</strong> <span style="color: #38bdf8;">${specialisation || 'General Medicine'}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Access Status:</strong> <span style="color: #34d399; font-weight: bold;">UNLOCKED & ACTIVE</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Login Link:</strong> <a href="https://primecare-app-jet.vercel.app/login" style="color: #38bdf8;">PrimeCare Doctor Portal</a></p>
                  </div>
                  <p style="color: #94a3b8; font-size: 13px;">You can now sign in using your registered email (<strong>${cleanRecipient}</strong>) and password to manage patient queues and digital prescriptions.</p>
                </div>
              `
            })
          });
        } catch (e) {
          console.warn("Approval email error:", e);
        }
      }
      return NextResponse.json({ success: true, message: `Acceptance email sent to ${cleanRecipient}` });
    }

    // 3. LEAVE NOTIFICATION TO DOCTOR
    if (type === 'LEAVE_APPROVED') {
      const subject = `📅 PrimeCare Duty Notice: Leave Confirmed on ${leaveDate}`;
      console.log(`[EMAIL DISPATCH to DOCTOR ${cleanRecipient}]: ${subject}`);

      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: 'PrimeCare Duty Desk <no-reply@primecare.in>',
              to: [cleanRecipient],
              subject,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #f59e0b; border-radius: 12px; background: #0f172a; color: #f8fafc;">
                  <h2 style="color: #f59e0b; margin-bottom: 8px;">PrimeCare Duty & Leave Desk</h2>
                  <p style="font-size: 16px; color: #e2e8f0;">Dear <strong>${doctorName || 'Doctor'}</strong>,</p>
                  <p style="color: #cbd5e1; line-height: 1.6;">Your scheduled leave request on <strong>${leaveDate}</strong> has been logged in the system.</p>
                  <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Leave Date:</strong> <span style="color: #fbbf24; font-weight: bold;">${leaveDate}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Reason:</strong> <span style="color: #e2e8f0;">${reason || 'Medical Leave'}</span></p>
                    <p style="margin: 4px 0; color: #94a3b8;"><strong>Patient Queue:</strong> <span style="color: #38bdf8;">All affected bookings on this date have been moved to your "Due to Dr. on Leave" tab for rescheduling.</span></p>
                  </div>
                </div>
              `
            })
          });
        } catch (e) {
          console.warn("Leave email error:", e);
        }
      }
      return NextResponse.json({ success: true, message: `Leave email sent to ${cleanRecipient}` });
    }

    return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    console.error("Email API exception:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
