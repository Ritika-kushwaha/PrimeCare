import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();
    const cleanSymptoms = (symptoms || '').trim();

    if (!cleanSymptoms) {
      return NextResponse.json({
        urgency: 'LOW',
        chiefComplaint: 'General consultation inquiry',
        suggestedQuestions: [
          'What is the primary reason for your visit today?',
          'How long have you felt this way?',
          'Are you currently on any medications?'
        ]
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';

    if (apiKey) {
      try {
        const prompt = `You are a clinical triage AI. Analyze these symptoms: "${cleanSymptoms}".
Respond ONLY with valid JSON in this exact structure:
{
  "urgency": "LOW" | "MEDIUM" | "HIGH",
  "chiefComplaint": "string",
  "suggestedQuestions": ["string", "string", "string"]
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
              urgency: ['LOW', 'MEDIUM', 'HIGH'].includes(parsed.urgency) ? parsed.urgency : 'MEDIUM',
              chiefComplaint: parsed.chiefComplaint || cleanSymptoms.slice(0, 80),
              suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions.slice(0, 3) : [
                'When did these symptoms first manifest?',
                'Does anything aggravate or relieve your discomfort?',
                'Have you noticed any related symptoms like fever?'
              ],
            });
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, using fallback:', err);
      }
    }

    // Fallback algorithmic triage
    const isUrgent = /chest pain|shortness of breath|severe|bleeding|fainting|unconscious/i.test(cleanSymptoms);
    return NextResponse.json({
      urgency: isUrgent ? 'HIGH' : 'MEDIUM',
      chiefComplaint: cleanSymptoms.slice(0, 80),
      suggestedQuestions: [
        'When did these symptoms first manifest?',
        'Does anything aggravate or relieve your discomfort?',
        'Have you taken any over-the-counter remedies?'
      ],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI Triage error' }, { status: 500 });
  }
}
