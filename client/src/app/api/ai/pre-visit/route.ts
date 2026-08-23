import { NextResponse } from "next/navigation";

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    const symp = (symptoms || "").toLowerCase();

    let urgency: "LOW" | "MEDIUM" | "HIGH" = "LOW";
    if (symp.includes("chest") || symp.includes("breath") || symp.includes("faint") || symp.includes("severe")) {
      urgency = "HIGH";
    } else if (symp.includes("fever") || symp.includes("cough") || symp.includes("pain")) {
      urgency = "MEDIUM";
    }

    return NextResponse.json({
      urgency,
      chiefComplaint: symptoms || "Routine Clinical Evaluation",
      suggestedQuestions: [
        "What is the exact onset and duration of the primary symptoms?",
        "Have there been any associated cardiovascular or respiratory episodes?",
        "Are there known medication allergies or current chronic prescriptions?",
      ],
    });
  } catch {
    return NextResponse.json({
      urgency: "MEDIUM",
      chiefComplaint: "General Clinical Checkup",
      suggestedQuestions: ["Duration of symptoms?", "Any prior medical treatments?"],
    });
  }
}
