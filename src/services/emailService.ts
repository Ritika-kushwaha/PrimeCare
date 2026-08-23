import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const smtpUser = (process.env.SMTP_USER || '').trim();
const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

export const sendOtpEmail = async (toEmail: string, otp: string): Promise<{ success: boolean; previewUrl?: string; error?: string }> => {
  console.log('\n==================================================');
  console.log(`🔑 [PRIMECARE SECURITY OTP DISPATCH]`);
  console.log(`📧 Target Email : ${toEmail}`);
  console.log(`🔢 6-Digit OTP  : >>> ${otp} <<<`);
  console.log('==================================================\n');

  // 1. Try real Gmail if valid App Password is provided
  if (smtpUser && smtpPass && smtpPass !== 'YOUR_16_CHAR_APP_PASSWORD' && smtpPass !== 'PASTE_YOUR_16_LETTER_CODE_HERE') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: smtpUser, pass: smtpPass },
      });

      const info = await transporter.sendMail({
        from: `"PrimeCare Security" <${smtpUser}>`,
        to: toEmail,
        subject: `PrimeCare Security Code: ${otp}`,
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
            <h2 style="color: #10b981; margin-bottom: 6px;">PrimeCare Healthcare</h2>
            <p style="font-size: 13px; color: #94a3b8; margin-top: 0;">Password Reset Authorization</p>
            <div style="background-color: #0f172a; border: 1px solid #334155; padding: 22px; border-radius: 12px; margin: 24px 0; text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: bold; display: block; margin-bottom: 10px;">Your 6-Digit One-Time Password</span>
              <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #34d399; font-family: monospace;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
              This code was requested for password recovery on <strong>${toEmail}</strong>. Valid for 10 minutes.
            </p>
          </div>
        `,
      });

      console.log(`✅ [GMAIL DELIVERED] Accepted by Google. ID: ${info.messageId}`);
      return { success: true };
    } catch (err: any) {
      console.warn(`[GMAIL FAILED, ACTIVATING LIVE INBOX DISPATCHER]: ${err.message}`);
    }
  }

  // 2. Instant Live Test Account Dispatcher (generates real web inbox)
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: `"PrimeCare Security" <security@primecare.in>`,
      to: toEmail,
      subject: `PrimeCare Security Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
          <h2 style="color: #10b981; margin-bottom: 6px;">PrimeCare Healthcare</h2>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 0;">Password Reset Authorization</p>
          <div style="background-color: #0f172a; border: 1px solid #334155; padding: 22px; border-radius: 12px; margin: 24px 0; text-align: center;">
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: bold; display: block; margin-bottom: 10px;">Your 6-Digit One-Time Password</span>
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #34d399; font-family: monospace;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; line-height: 1.6;">
            This security code was sent to <strong>${toEmail}</strong>. Valid for 10 minutes.
          </p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`📬 [LIVE EMAIL INBOX URL]: ${previewUrl}`);
    return { success: true, previewUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
