import { NextResponse } from "next/server";
import { getDbPool, initDb } from "@/lib/db";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/medication-reminders
 * Background cron: dispatches medication reminder emails based on EHR prescriptions.
 * Intended to be called by a Vercel Cron Job or external scheduler every hour.
 */
export async function GET(req: Request) {
  await initDb();
  const pool = getDbPool();

  if (!pool) {
    return NextResponse.json({ success: false, error: "Database offline" }, { status: 500 });
  }

  const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
  const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");

  try {
    // Fetch all EHR records that have prescriptions
    const ehrResult = await pool.query(`
      SELECT patient_email AS "patientEmail", patient_name AS "patientName", visits
      FROM pc_ehr
      WHERE visits IS NOT NULL AND jsonb_array_length(visits) > 0
    `);

    const now = new Date();
    let remindersQueued = 0;
    const errors: string[] = [];

    for (const row of ehrResult.rows) {
      const visits: any[] = row.visits || [];

      for (const visit of visits) {
        const prescription = visit?.prescription;
        if (!prescription) continue;

        const {
          medication,
          frequencyHours,
          durationDays,
          startDateTime,
        } = prescription;

        if (!medication || !frequencyHours || !durationDays || !startDateTime) continue;

        const startDate = new Date(startDateTime);
        const elapsedMs = now.getTime() - startDate.getTime();
        const elapsedHours = elapsedMs / (1000 * 60 * 60);
        const maxDurationHours = Number(durationDays) * 24;

        // Skip if prescription course is over
        if (elapsedHours > maxDurationHours) continue;

        // Check if current hour is a reminder interval
        const freq = Number(frequencyHours);
        const hoursSinceStart = Math.floor(elapsedHours);
        if (hoursSinceStart > 0 && hoursSinceStart % freq === 0) {
          // Dispatch reminder email
          if (smtpUser && smtpPass && row.patientEmail && row.patientEmail.includes("@")) {
            try {
              const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: { user: smtpUser, pass: smtpPass },
                tls: { rejectUnauthorized: false },
                connectionTimeout: 10000,
              });

              await transporter.sendMail({
                from: `"PrimeCare Hospital" <${smtpUser}>`,
                to: row.patientEmail,
                subject: `💊 Medication Reminder: ${medication} — PrimeCare`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 14px; background: #f8fafc; color: #1e293b;">
                    <h2 style="color: #047857; margin: 0 0 12px 0;">PrimeCare Medication Reminder</h2>
                    <p style="font-size: 14px; color: #374151;">Dear <strong>${row.patientName || "Patient"}</strong>,</p>
                    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
                      This is a scheduled reminder to take your prescribed dose of:
                    </p>
                    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 14px; border-radius: 8px; margin: 16px 0;">
                      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #047857;">℞ ${medication}</p>
                      <p style="margin: 6px 0 0 0; font-size: 12px; color: #065f46;">
                        Frequency: Every ${frequencyHours} hours &bull; Duration: ${durationDays} days total
                      </p>
                    </div>
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 12px;">
                      PrimeCare Multispecialty Hospital &bull; Automated Medication Reminder System
                    </p>
                  </div>
                `,
              });
              remindersQueued++;
            } catch (mailErr: any) {
              errors.push(`${row.patientEmail}: ${mailErr.message}`);
            }
          } else {
            // Log reminder as pending in DB for retry without SMTP
            try {
              await pool.query(`
                INSERT INTO pc_notifications (id, recipient_email, subject, body, type, status, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT DO NOTHING
              `, [
                `medrem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                row.patientEmail,
                `Medication Reminder: ${medication}`,
                `Hello ${row.patientName}, take your dose of ${medication} now.`,
                'MED_REMINDER',
                'PENDING'
              ]);
              remindersQueued++;
            } catch {
              // pc_notifications table may not exist; skip gracefully
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned: ehrResult.rows.length,
      remindersDispatched: remindersQueued,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: now.toISOString(),
    });
  } catch (err: any) {
    console.error("[Medication Reminders Error]:", err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
