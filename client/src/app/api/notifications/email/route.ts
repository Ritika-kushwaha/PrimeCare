import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

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
      fee 
    } = data;

    const emailUser = (process.env.EMAIL_USER || '').trim();
    const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

    const targetEmails = [recipientEmail, patientEmail, doctorEmail]
      .filter(Boolean)
      .map(e => (e as string).trim().toLowerCase())
      .filter((v, i, a) => a.indexOf(v) === i);

    if (targetEmails.length === 0) {
      return NextResponse.json({ success: false, error: 'No recipient email address provided.' }, { status: 400 });
    }

    if (!emailUser || !emailPass) {
      return NextResponse.json({ 
        success: false, 
        error: 'EMAIL_USER or EMAIL_PASS environment variables are missing on the server.' 
      }, { status: 500 });
    }

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
      connectionTimeout: 12000,
    });

    const subject = `⏰ Appointment Reminder: ${patientName || 'Patient'} with ${doctorName || 'Dr.'} on ${date}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #38bdf8; border-radius: 12px; background: #0f172a; color: #f8fafc;">
        <h2 style="color: #38bdf8; margin-bottom: 8px;">PrimeCare Appointment Reminder</h2>
        <p style="font-size: 15px; color: #e2e8f0;">Reminder for the upcoming medical consultation.</p>
        <div style="background: #1e293b; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #334155;">
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Patient Name:</strong> <span style="color: #f8fafc; font-weight: bold;">${patientName || 'Member'}</span></p>
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Attending Doctor:</strong> <span style="color: #38bdf8; font-weight: bold;">${doctorName || 'Specialist'}</span></p>
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Department:</strong> <span style="color: #34d399;">${specialisation || 'General Medicine'}</span></p>
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Date & Time Slot:</strong> <span style="color: #fbbf24; font-weight: bold;">${date} at ${timeSlot}</span></p>
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Token Number:</strong> <span style="color: #38bdf8; font-family: monospace; font-size: 16px; font-weight: bold;">#${tokenNumber || '101'}</span></p>
          <p style="margin: 4px 0; color: #94a3b8;"><strong>Fee:</strong> <span style="color: #cbd5e1;">${fee || '₹1,000'}</span></p>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Please arrive 10-15 minutes prior to your allocated slot.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"PrimeCare Hospital" <${emailUser}>`,
      to: targetEmails.join(', '),
      subject,
      html,
    });

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId, 
      recipients: targetEmails 
    });

  } catch (err: any) {
    console.error("Mail send error:", err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || 'Failed to send email' 
    }, { status: 500 });
  }
}
