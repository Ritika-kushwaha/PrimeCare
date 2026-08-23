import { NextResponse } from "next/navigation";
import { getDbAppointments, saveDbAppointments, AppointmentRecord } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ success: true, appointments: getDbAppointments() });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (Array.isArray(data.appointments)) {
      saveDbAppointments(data.appointments);
    } else if (data.appointment) {
      const current = getDbAppointments();
      const updated = [data.appointment, ...current.filter((a: AppointmentRecord) => a.id !== data.appointment.id)];
      saveDbAppointments(updated);
    }
    return NextResponse.json({ success: true, appointments: getDbAppointments() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
