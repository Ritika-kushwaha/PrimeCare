import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

/**
 * POST /api/calendar/add-event
 * Generates a Google Calendar deep-link URL for a given appointment.
 * No OAuth required — uses the public `calendar.google.com/calendar/render` endpoint.
 */
export async function POST(req: Request) {
  try {
    const {
      patientName,
      doctorName,
      specialisation,
      date,
      timeSlot,
      tokenNumber,
      fee,
      hospital,
    } = await req.json();

    if (!date || !timeSlot) {
      return NextResponse.json(
        { success: false, error: "date and timeSlot are required." },
        { status: 400 }
      );
    }

    // Parse the date and time to build ISO 8601 datetimes
    const [year, month, day] = date.split("-").map(Number);

    // Parse timeSlot like "10:00 AM" or "02:30 PM"
    const timeMatch = timeSlot.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    let startHour = 10, startMin = 0;
    if (timeMatch) {
      startHour = parseInt(timeMatch[1]);
      startMin = parseInt(timeMatch[2]);
      const period = timeMatch[3].toUpperCase();
      if (period === "PM" && startHour !== 12) startHour += 12;
      if (period === "AM" && startHour === 12) startHour = 0;
    }

    const padZ = (n: number) => String(n).padStart(2, "0");

    const startDt = `${year}${padZ(month)}${padZ(day)}T${padZ(startHour)}${padZ(startMin)}00`;
    // Appointment duration: 30 minutes
    const endDate = new Date(year, month - 1, day, startHour, startMin + 30);
    const endDt = `${endDate.getFullYear()}${padZ(endDate.getMonth() + 1)}${padZ(endDate.getDate())}T${padZ(endDate.getHours())}${padZ(endDate.getMinutes())}00`;

    const title = encodeURIComponent(
      `PrimeCare: ${specialisation || "Consultation"} with ${doctorName || "Doctor"}`
    );
    const details = encodeURIComponent(
      `Patient: ${patientName || "Patient"}\nDoctor: ${doctorName || "Specialist"}\nDepartment: ${specialisation || "General Medicine"}\nToken: ${tokenNumber || "N/A"}\nFee: ${fee || "₹1,200"}\nHospital: ${hospital || "PrimeCare Multispecialty Hospital"}`
    );
    const location = encodeURIComponent(`PrimeCare ${hospital || "Multispecialty Hospital"}, India`);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDt}/${endDt}&details=${details}&location=${location}&sf=true&output=xml`;

    return NextResponse.json({ success: true, calendarUrl });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
