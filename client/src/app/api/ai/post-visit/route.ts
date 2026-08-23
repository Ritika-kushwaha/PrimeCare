import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { clinicalNotes, medication, frequencyHours, durationDays } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || '';

    if (apiKey) {
      try {
        const prompt = `Convert these clinical notes into a patient-friendly summary with medication schedule and follow-up steps.
Clinical Notes: "${clinicalNotes || 'Standard checkup'}"
Medication: "${medication}" (Take every ${frequencyHours} hours for ${durationDays} days)

Respond ONLY with valid JSON in this exact structure:
{
  "patientSummary": "string",
  "medicationSchedule": "string",
  "followUpSteps": "string"
}`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' }
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return NextResponse.json({
              patientSummary: parsed.patientSummary || `Diagnosis: ${clinicalNotes}`,
              medicationSchedule: parsed.medicationSchedule || `Take ${medication} every ${frequencyHours} hours for ${durationDays} days.`,
              followUpSteps: parsed.followUpSteps || 'Rest and stay hydrated.',
            });
          }
        }
      } catch (err) {
        console.warn('Gemini Post-visit call failed, using fallback:', err);
      }
    }

    // Default fallback
    return NextResponse.json({
      patientSummary: `Your doctor assessed your symptoms: ${clinicalNotes}. The prescribed regimen aims to address your condition effectively.`,
      medicationSchedule: `Take ${medication} every ${frequencyHours} hours regularly for ${durationDays} days.`,
      followUpSteps: 'Rest well, complete the full course of medication, and contact the clinic if you experience any adverse effects.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Summary error' }, { status: 500 });
  }
}
