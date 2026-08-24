import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || 'ritikakushwaha62@gmail.com').trim();
    const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || 'hwwgoqrbaiwpldzv').replace(/\s+/g, '');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 32px; border-radius: 16px; max-width: 480px; margin: 0 auto; border: 1px solid #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">PrimeCare Healthcare</h2>
        <p style="font-size: 13px; color: #94a3b8;">Password Reset Authorization</p>
        <div style="background-color: #0f172a; border: 1px solid #334155; padding: 24px; border-radius: 12px; margin: 24px 0; text-align: center;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: bold; display: block; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
          <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #34d399; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
          This security code was requested for password recovery on <strong>${cleanEmail}</strong>. Valid for 10 minutes.
        </p>
      </div>
    `;

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 12000,
      });

      await transporter.sendMail({
        from: `"PrimeCare Security" <${smtpUser}>`,
        to: cleanEmail,
        subject: `PrimeCare Verification OTP: ${otp}`,
        html: emailHtml,
      });
    } catch (err465: any) {
      console.warn(`[OTP Send 465 Warning]: ${err465.message}. Retrying on port 587...`);
      const transporter587 = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false },
        connectionTimeout: 12000,
      });

      await transporter587.sendMail({
        from: `"PrimeCare Security" <${smtpUser}>`,
        to: cleanEmail,
        subject: `PrimeCare Verification OTP: ${otp}`,
        html: emailHtml,
      });
    }

    console.log(`✅ [GMAIL DELIVERED] Successfully sent OTP to ${cleanEmail}`);

    return NextResponse.json({
      success: true,
      message: `A 6-digit verification OTP has been sent directly to ${cleanEmail}. Please check your inbox and spam folder.`,
      otp, // Used by the verify handler
    });
  } catch (error: any) {
    console.error('❌ [SMTP ERROR]:', error.message);
    return NextResponse.json({ error: `Gmail Delivery Failed: ${error.message}` }, { status: 500 });
  }
}
