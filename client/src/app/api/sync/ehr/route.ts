import { NextResponse } from "next/navigation";
import { getDbEHR, saveDbEHR, EHRRecord } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ success: true, ehrRegistry: getDbEHR() });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (Array.isArray(data.ehrRegistry)) {
      saveDbEHR(data.ehrRegistry);
    } else if (data.ehrEntry) {
      const current = getDbEHR();
      const idx = current.findIndex((e: EHRRecord) => e.patientKey === data.ehrEntry.patientKey);
      let updated: EHRRecord[];
      if (idx > -1) {
        updated = [...current];
        updated[idx] = data.ehrEntry;
      } else {
        updated = [data.ehrEntry, ...current];
      }
      saveDbEHR(updated);
    }
    return NextResponse.json({ success: true, ehrRegistry: getDbEHR() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
