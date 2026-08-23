import { NextResponse } from "next/navigation";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      tokenNumber,
      doctorName,
      department,
      hospital,
      date,
      timeSlot,
      patientName,
      patientEmail,
      fee,
    } = data;

    if (!patientEmail) {
      return NextResponse.json({ success: true, message: "No email provided for invite" });
    }

    // Format Start and End Timestamps for iCalendar (ICS)
    const [year, month, day] = (date || "2026-08-28").split("-").map(Number);
    const [timeStr, meridian] = (timeSlot || "10:00 AM").split(" ");
    let [hours, minutes] = timeStr.split(":").map(Number);

    if (meridian === "PM" && hours < 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const pad = (n: number) => n.toString().padStart(2, "0");
    const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
    
    let endHours = hours;
    let endMinutes = minutes + 45;
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    const endStr = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(endMinutes)}00`;
    const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const eventUid = `primecare-${tokenNumber}-${Date.now()}@primecare.health`;

    // Standard RFC 5545 iCalendar payload with METHOD:REQUEST
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//PrimeCare Healthcare//Clinical Scheduler//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:REQUEST",
      "BEGIN:VEVENT",
      `UID:${eventUid}`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:🩺 Doctor Appointment: ${doctorName} (${department})`,
      `DESCRIPTION:Patient: ${patientName}\\nQueue Token: ${tokenNumber}\\nDepartment: ${department}\\nHospital: ${hospital}\\nFee: ${fee}`,
      `LOCATION:${hospital || "PrimeCare Multispecialty Hospital"}`,
      "STATUS:CONFIRMED",
      "SEQUENCE:0",
      `ORGANIZER;CN=PrimeCare Clinic:mailto:no-reply@primecare.health`,
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${patientName}:mailto:${patientEmail}`,
      "BEGIN:VALARM",
      "TRIGGER:-PT30M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder: PrimeCare Medical Consultation in 30 minutes",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const smtpUser = process.env.SMTP_USER || "ritikakushwaha62@gmail.com";
    const smtpPass = process.env.SMTP_PASS;

    if (smtpPass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"PrimeCare Hospital" <${smtpUser}>`,
        to: patientEmail,
        subject: `📅 Appointment Confirmed: ${doctorName} (Token ${tokenNumber})`,
        text: `Hello ${patientName},\n\nYour clinical consultation with ${doctorName} (${department}) is confirmed for ${date} at ${timeSlot}.\n\nQueue Token: ${tokenNumber}\nHospital: ${hospital}\nConsultation Fee: ${fee}\n\nThis calendar invite has been automatically linked to your schedule.`,
        icalEvent: {
          filename: "primecare-appointment.ics",
          method: "REQUEST",
          content: icsContent,
        },
      });
    }

    return NextResponse.json({ success: true, icsContent });
  } catch (error: any) {
    console.error("Auto Calendar Invite Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
