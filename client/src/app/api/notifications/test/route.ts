import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetEmail = searchParams.get('to') || process.env.EMAIL_USER;

  const emailUser = (process.env.EMAIL_USER || '').trim();
  const emailPass = (process.env.EMAIL_PASS || '').replace(/\s+/g, '');

  const diagnostics = {
    hasEmailUser: Boolean(emailUser),
    emailUserLength: emailUser.length,
    emailUserMasked: emailUser ? `${emailUser.slice(0, 3)}***@${emailUser.split('@')[1] || ''}` : null,
    hasEmailPass: Boolean(emailPass),
    emailPassLength: emailPass.length,
    targetRecipient: targetEmail,
  };

  if (!emailUser || !emailPass) {
    return NextResponse.json({
      success: false,
      error: "EMAIL_USER or EMAIL_PASS is missing in environment variables.",
      diagnostics
    }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // TLS
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 15000,
    });

    // 1. Verify SMTP connection & authentication
    await transporter.verify();

    // 2. Dispatch a live test reminder
    const info = await transporter.sendMail({
      from: `"PrimeCare Diagnostics" <${emailUser}>`,
      to: targetEmail,
      subject: "🧪 PrimeCare Live SMTP Diagnostic & Reminder Test",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 20px; border: 1px solid #38bdf8; border-radius: 12px; background: #0f172a; color: #f8fafc;">
          <h2 style="color: #38bdf8;">SMTP Mail Delivery Active!</h2>
          <p>Your Gmail App Password and Nodemailer configuration are working properly.</p>
          <p style="color: #94a3b8; font-size: 13px;">Time: ${new Date().toISOString()}</p>
        </div>
      `
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${targetEmail}`,
      messageId: info.messageId,
      diagnostics
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      errorName: err.name,
      errorMessage: err.message,
      errorCode: err.code,
      response: err.response,
      diagnostics
    }, { status: 500 });
  }
}
