import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      doctorName, 
      specialisation, 
      leaveDate, 
      reason, 
      affectedAppointments 
    } = data;

    const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "ritikakushwaha62@gmail.com").trim();
    const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "hwwgoqrbaiwpldzv").replace(/\s+/g, "");

    if (!affectedAppointments || affectedAppointments.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Leave saved. No scheduled patients were affected on this date.",
        notifiedCount: 0 
      });
    }

    let notifiedCount = 0;

    if (smtpPass) {
      let transporter: nodemailer.Transporter;
      try {
        transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 12000,
        });
      } catch {
        transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 12000,
        });
      }

      for (const apt of affectedAppointments) {
        if (!apt.patientEmail || apt.patientEmail.includes("example.com")) continue;

        const rescheduleLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://primecare-app-jet.vercel.app"}/patient/book`;

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fecaca; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="border-bottom: 2px solid #ef4444; padding-bottom: 12px; margin-bottom: 20px;">
              <h1 style="color: #dc2626; margin: 0; font-size: 20px;">⚠️ PrimeCare Schedule Notice: Doctor On Leave</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Important reschedule notification for your consultation</p>
            </div>

            <p style="font-size: 14px;">Dear <strong>${apt.patientName || "Patient"}</strong>,</p>
            <p style="font-size: 13px; line-height: 1.5; color: #334155;">
              We regret to inform you that <strong>${doctorName}</strong> (${specialisation}) has an emergency duty leave on <strong>${leaveDate}</strong> (${reason || "Clinical Leave"}).
            </p>

            <div style="background-color: #fef2f2; border: 1px solid #fee2e2; padding: 14px; border-radius: 12px; margin: 20px 0; font-size: 13px;">
              <p style="margin: 2px 0;"><strong>Original Token:</strong> ${apt.tokenNumber || "TK-Auto"}</p>
              <p style="margin: 2px 0;"><strong>Original Date & Slot:</strong> ${leaveDate} at ${apt.timeSlot}</p>
              <p style="margin: 2px 0;"><strong>Status:</strong> <span style="color: #dc2626; font-weight: bold;">RESCHEDULE REQUIRED</span></p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="${rescheduleLink}" style="background-color: #10b981; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; display: inline-block;">
                Reschedule Your Appointment Online →
              </a>
            </div>

            <p style="font-size: 12px; color: #64748b; line-height: 1.4;">
              You can choose another convenient slot with ${doctorName} on an alternate date or select another available specialist in the ${specialisation} department.
            </p>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">
              PrimeCare Multispecialty Hospital • 24/7 Outpatient Desk
            </div>
          </div>
        `;

        // Cancellation ICS header to remove/flag event in calendar
        const icsCancel = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//PrimeCare//Schedule Notice//EN",
          "METHOD:CANCEL",
          "BEGIN:VEVENT",
          `UID:apt-${apt.id}@primecare.health`,
          `SUMMARY:❌ CANCELLED: Consultation with ${doctorName}`,
          `STATUS:CANCELLED`,
          `DESCRIPTION:Doctor on approved leave (${reason}). Please reschedule your slot.`,
          "END:VEVENT",
          "END:VCALENDAR"
        ].join("\r\n");

        try {
          await transporter.sendMail({
            from: `"PrimeCare Hospital" <${smtpUser}>`,
            to: apt.patientEmail,
            subject: `⚠️ Reschedule Required: Consultation with ${doctorName} on ${leaveDate}`,
            html: htmlContent,
            icalEvent: {
              filename: "cancellation.ics",
              method: "CANCEL",
              content: icsCancel,
            }
          });
          notifiedCount++;
        } catch (mailErr) {
          console.error("Failed sending leave notice to:", apt.patientEmail, mailErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Leave recorded. Reschedule notices dispatched to ${notifiedCount} affected patient(s).`,
      notifiedCount
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
