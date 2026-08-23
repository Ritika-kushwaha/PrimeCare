import { NextResponse } from "next/navigation";

export async function POST(req: Request) {
  try {
    const { clinicalNotes, medication, frequencyHours, durationDays } = await req.json();

    return NextResponse.json({
      patientSummary: `Diagnosis: ${clinicalNotes}. The recommended treatment protocol focuses on active recovery and targeted symptom alleviation.`,
      medicationSchedule: `Take ${medication} every ${frequencyHours} hours for a total course of ${durationDays} days with water.`,
      followUpSteps: "Ensure adequate rest and hydration. Schedule a follow-up consultation if symptoms persist past the treatment duration.",
    });
  } catch {
    return NextResponse.json({
      patientSummary: "Follow clinical treatment instructions as prescribed.",
      medicationSchedule: "Take medication as directed by attending physician.",
      followUpSteps: "Return for follow-up if symptoms do not improve.",
    });
  }
}
