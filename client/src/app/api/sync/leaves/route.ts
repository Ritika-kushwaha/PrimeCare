import { NextResponse } from "next/navigation";
import { getDbLeaves, saveDbLeaves } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ success: true, leaves: getDbLeaves() });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (Array.isArray(data.leaves)) {
      saveDbLeaves(data.leaves);
    }
    return NextResponse.json({ success: true, leaves: getDbLeaves() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
