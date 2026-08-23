import { NextResponse } from "next/navigation";
import { getDbDoctors, saveDbDoctors, DoctorRecord } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ success: true, doctors: getDbDoctors() });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (Array.isArray(data.doctors)) {
      saveDbDoctors(data.doctors);
    } else if (data.doctor) {
      const current = getDbDoctors();
      const idx = current.findIndex((d: DoctorRecord) => d.id === data.doctor.id || d.email === data.doctor.email);
      let updated: DoctorRecord[];
      if (idx > -1) {
        updated = [...current];
        updated[idx] = data.doctor;
      } else {
        updated = [data.doctor, ...current];
      }
      saveDbDoctors(updated);
    }
    return NextResponse.json({ success: true, doctors: getDbDoctors() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
