import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const appointment = await req.json();

    const cleanPatientEmail = (appointment.patientEmail || '').trim().toLowerCase();
    const cleanDoctorEmail = (appointment.doctorEmail || 'ritikakushwaha62@gmail.com').trim().toLowerCase();

    if (!cleanPatientEmail) {
      return NextResponse.json({ error: 'Patient email is required.' }, { status: 400 });
    }

    // 1. Calculate ISO Calendar timestamps
    const [year, month, day] = (appointment.date || '2026-08-28').split('-');
    const [time, meridian] = (appointment.timeSlot || '10:00 AM').split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (meridian === 'PM' && hours < 12) hours += 12;
    if (meridian === 'AM' && hours === 12) hours = 0;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const startStamp = `${year}${month}${day}T${pad(hours)}${pad(minutes)}00`;

    let endHours = hours;
    let endMinutes = minutes + 45;
    if (endMinutes >= 60) {
      endHours += 1;
      endMinutes -= 60;
    }
    const endStamp = `${year}${month}${day}T${pad(endHours)}${pad(endMinutes)}00`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PrimeCare Healthcare//Hospital Booking System//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:REQUEST',
      'BEGIN:VEVENT',
      `UID:primecare-${appointment.tokenNumber || Date.now()}@primecare.in`,
      `DTSTAMP:${startStamp}`,
      `DTSTART:${startStamp}`,
      `DTEND:${endStamp}`,
      `SUMMARY:🩺 Doctor Consultation: ${appointment.doctorName || 'Doctor'} (${appointment.department || 'Specialist'})`,
      `DESCRIPTION:Patient: ${appointment.patientName}\\nToken: ${appointment.tokenNumber}\\nHospital: ${appointment.hospital || 'PrimeCare Hospital'}\\nChief Complaint: ${appointment.symptoms || 'General'}`,
      `LOCATION:${appointment.hospital || 'PrimeCare Hospital OPD Counter 4'}`,
      'STATUS:CONFIRMED',
      `ORGANIZER;CN=PrimeCare OPD:mailto:appointments@primecare.in`,
      `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${appointment.patientName || 'Patient'}:mailto:${cleanPatientEmail}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const smtpUser = process.env.SMTP_USER || '';
    const smtpPass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: smtpUser, pass: smtpPass },
      });

      // 1. Send Patient Confirmation with Google Calendar .ics
      try {
        await transporter.sendMail({
          from: `"PrimeCare OPD Desk" <${smtpUser}>`,
          to: cleanPatientEmail,
          subject: `Confirmed: Consultation with ${appointment.doctorName} (${appointment.date})`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 28px; border-radius: 14px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
              <h2 style="color: #10b981; margin-top: 0;">Appointment Confirmed</h2>
              <p style="font-size: 13px; color: #94a3b8;">This booking has been added to your calendar invite.</p>
              <div style="background-color: #0f172a; padding: 16px; border-radius: 10px; border: 1px solid #334155; margin: 16px 0; font-size: 13px;">
                <p style="margin: 4px 0;"><strong>Patient:</strong> ${appointment.patientName}</p>
                <p style="margin: 4px 0;"><strong>Physician:</strong> ${appointment.doctorName} (${appointment.department})</p>
                <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${appointment.date} at ${appointment.timeSlot}</p>
                <p style="margin: 4px 0;"><strong>Queue Token:</strong> <span style="color: #34d399; font-weight: bold;">${appointment.tokenNumber}</span></p>
              </div>
            </div>
          `,
          icalEvent: {
            filename: 'invite.ics',
            method: 'REQUEST',
            content: icsContent,
          },
        });
      } catch (err: any) {
        console.warn('Patient email error:', err.message);
      }

      // 2. Send Doctor Booking Reminder Notice
      try {
        await transporter.sendMail({
          from: `"PrimeCare OPD Schedule" <${smtpUser}>`,
          to: cleanDoctorEmail,
          subject: `🗓️ New Booking Alert: ${appointment.patientName} (${appointment.date} @ ${appointment.timeSlot})`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 28px; border-radius: 14px; max-width: 500px; margin: 0 auto; border: 1px solid #1e293b;">
              <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1e293b; padding-bottom: 12px; margin-bottom: 16px;">
                <span style="background-color: #1e3a8a; color: #60a5fa; font-size: 11px; padding: 4px 8px; border-radius: 6px; font-weight: bold; text-transform: uppercase;">Doctor Schedule Notice</span>
              </div>
              <h2 style="color: #60a5fa; margin-top: 0; font-size: 18px;">New Patient In Queue</h2>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                A new appointment has been scheduled for your clinic roster:
              </p>
              <div style="background-color: #0f172a; border: 1px solid #334155; padding: 16px; border-radius: 10px; margin: 16px 0; font-size: 13px;">
                <p style="margin: 4px 0;"><strong>Patient:</strong> ${appointment.patientName} (${appointment.age || '21'}Y, ${appointment.gender || 'Female'})</p>
                <p style="margin: 4px 0;"><strong>Slot:</strong> <span style="color: #38bdf8; font-weight: bold;">${appointment.date} at ${appointment.timeSlot}</span></p>
                <p style="margin: 4px 0;"><strong>Queue Token:</strong> <span style="color: #34d399; font-weight: bold;">${appointment.tokenNumber}</span></p>
                <p style="margin: 4px 0;"><strong>Patient Email:</strong> ${cleanPatientEmail}</p>
                <p style="margin: 4px 0;"><strong>Chief Complaint:</strong> <em style="color: #e2e8f0;">"${appointment.symptoms}"</em></p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="http://localhost:3000/doctor/dashboard" style="background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; text-decoration: none; font-size: 12px; display: inline-block;">
                  Open Doctor Desk & View AI Triage →
                </a>
              </div>
            </div>
          `,
        });
      } catch (err: any) {
        console.warn('Doctor reminder email error:', err.message);
      }
    }

    return NextResponse.json({ success: true, message: 'Patient confirmation and doctor reminder dispatched.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Booking failed' }, { status: 500 });
  }
}
