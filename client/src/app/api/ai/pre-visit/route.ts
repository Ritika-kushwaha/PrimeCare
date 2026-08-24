import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '';

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    const symptomsText = (symptoms || "General clinical consultation").trim();

    // ── Attempt real Gemini LLM call ──────────────────────────────────────
    if (GEMINI_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

        const prompt = `
You are an expert clinical AI assistant. Analyze these patient-reported symptoms and return strict JSON with:
1. "urgency": Urgency level ("LOW", "MEDIUM", or "HIGH")
2. "chiefComplaint": A clear, concise clinical statement of the primary complaint
3. "suggestedQuestions": An array of exactly 3 relevant diagnostic questions the doctor should ask during the visit.

Patient Symptoms: "${symptomsText}"

Respond ONLY with valid JSON:
{
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "...",
  "suggestedQuestions": ["...", "...", "..."]
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);

        if (parsed.chiefComplaint && parsed.urgency) {
          return NextResponse.json({
            urgency: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.urgency) ? parsed.urgency : 'MEDIUM',
            chiefComplaint: parsed.chiefComplaint,
            suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
              ? parsed.suggestedQuestions.slice(0, 3)
              : fallbackQuestions(),
            source: 'gemini',
          });
        }
      } catch (llmErr: any) {
        console.warn('[AI Pre-Visit] Gemini call failed, using fallback:', llmErr?.message);
      }
    }

    // ── Graceful fallback: rule-based triage ──────────────────────────────
    return NextResponse.json(ruleBasedTriage(symptomsText));
  } catch (err: any) {
    return NextResponse.json(ruleBasedTriage("Routine consultation"), { status: 200 });
  }
}

function fallbackQuestions(): string[] {
  return [
    "What is the precise onset time and progression of symptoms?",
    "Are there any known drug allergies or active medications?",
    "Have you noticed aggravating triggers or related discomfort?",
  ];
}

function ruleBasedTriage(symptoms: string) {
  const symp = symptoms.toLowerCase();
  let urgency: "LOW" | "MEDIUM" | "HIGH" = "LOW";
  if (
    symp.includes("chest") || symp.includes("breath") ||
    symp.includes("faint") || symp.includes("severe") ||
    symp.includes("heart") || symp.includes("emergency")
  ) {
    urgency = "HIGH";
  } else if (
    symp.includes("fever") || symp.includes("cough") ||
    symp.includes("pain") || symp.includes("vomit") ||
    symp.includes("nausea") || symp.includes("dizz")
  ) {
    urgency = "MEDIUM";
  }

  return {
    urgency,
    chiefComplaint: symptoms.length > 80 ? symptoms.slice(0, 80) + "…" : symptoms,
    suggestedQuestions: fallbackQuestions(),
    source: 'fallback',
  };
}
