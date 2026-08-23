export interface PostVisitSummaryOutput {
  patient_friendly_summary: string;
  medication_schedule: Array<{
    name: string;
    dosage: string;
    timing: string;
    instructions: string;
  }>;
  follow_up_steps: string[];
}

export async function generatePostVisitSummary(clinicalNotes: string, prescriptions: any): Promise<PostVisitSummaryOutput> {
  const systemPrompt = `You are an empathetic medical communicator. Convert doctor's clinical notes and prescriptions into a clear, patient-friendly summary without technical jargon. Return valid JSON only matching this schema:
{
  "patient_friendly_summary": "Clear, reassuring explanation of diagnosis and treatment",
  "medication_schedule": [
    {
      "name": "Medication Name",
      "dosage": "Dosage",
      "timing": "e.g., Morning after meal, Night before sleep",
      "instructions": "e.g., Drink plenty of water"
    }
  ],
  "follow_up_steps": ["step 1", "step 2"]
}`;

  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY missing');
    }

    const response = await Promise.race([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Convert these clinical notes and prescriptions into a patient-friendly summary with medication schedule and follow-up steps. Notes: ${clinicalNotes}\nPrescriptions: ${JSON.stringify(prescriptions)}` },
        ],
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('LLM_TIMEOUT')), 7000)
      ),
    ]);

    const content = response.choices[0].message.content;
    return JSON.parse(content || '{}') as PostVisitSummaryOutput;
  } catch (error) {
    console.warn('Post-visit LLM generation failed or timed out. Falling back to default format.');
    return {
      patient_friendly_summary: `Your consultation notes: ${clinicalNotes}`,
      medication_schedule: Array.isArray(prescriptions)
        ? prescriptions.map((p: any) => ({
            name: p.name || 'Prescription',
            dosage: p.dosage || 'As directed',
            timing: `Every ${p.frequency_hours || 12} hours`,
            instructions: 'Take with water after food.',
          }))
        : [],
      follow_up_steps: ['Rest adequately', 'Reach out if symptoms persist.'],
    };
  }
}