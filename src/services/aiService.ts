import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({});

export interface PreVisitAnalysis {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  chiefComplaint: string;
  suggestedQuestions: string[];
}

export interface PostVisitSummary {
  patientSummary: string;
  followUpSteps: string;
  medicationSchedule: string;
}

// 1. Pre-Visit Analysis with Urgency Triage & Suggested Doctor Inquiries
export async function generatePreVisitSummary(symptoms: string): Promise<PreVisitAnalysis> {
  const prompt = `
You are an expert clinical AI assistant. Analyze these patient-reported symptoms and return strict JSON with:
1. "urgency": Urgency level ("LOW", "MEDIUM", or "HIGH")
2. "chiefComplaint": A clear, concise clinical statement of the primary complaint
3. "suggestedQuestions": An array of exactly 3 relevant diagnostic questions the doctor should ask during the visit.

Patient Symptoms: "${symptoms}"

Respond ONLY with valid JSON:
{
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "...",
  "suggestedQuestions": ["...", "...", "..."]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      urgency: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.urgency) ? parsed.urgency : 'MEDIUM',
      chiefComplaint: parsed.chiefComplaint || symptoms.slice(0, 80),
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.slice(0, 3) : [
        'When did you first notice these symptoms?',
        'Are symptoms worsening at specific times?',
        'Have you taken any over-the-counter medications?'
      ],
    };
  } catch (error) {
    console.warn('[AI Service] Pre-visit summary fallback triggered:', error);
    return {
      urgency: 'MEDIUM',
      chiefComplaint: symptoms.slice(0, 80),
      suggestedQuestions: [
        'How long have you experienced these symptoms?',
        'Does anything aggravate or relieve the condition?',
        'Do you have any existing chronic conditions?'
      ],
    };
  }
}

// 2. Post-Visit Patient-Friendly Conversion
export async function generatePostVisitSummary(notes: string, medication: string): Promise<PostVisitSummary> {
  const prompt = `
Convert these doctor's clinical notes and prescription into an empathetic, patient-friendly visit summary.
Explain the diagnosis in plain English, outline the medication regimen, and list essential follow-up action steps.

Clinical Notes: "${notes}"
Medications: "${medication}"

Return valid JSON with:
{
  "patientSummary": "...",
  "followUpSteps": "...",
  "medicationSchedule": "..."
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      patientSummary: parsed.patientSummary || notes,
      followUpSteps: parsed.followUpSteps || 'Rest and hydrate. Return if symptoms persist.',
      medicationSchedule: parsed.medicationSchedule || medication,
    };
  } catch (error) {
    console.warn('[AI Service] Post-visit summary fallback triggered:', error);
    return {
      patientSummary: `Summary of diagnosis: ${notes}`,
      followUpSteps: 'Follow the prescribed dosage and monitor your recovery.',
      medicationSchedule: medication,
    };
  }
}
