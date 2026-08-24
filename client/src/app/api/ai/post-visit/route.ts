import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import nodemailer from "nodemailer";

export const dynamic = 'force-dynamic';

const GEMINI_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY || '';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      clinicalNotes,
      medication,
      frequencyHours,
      durationDays,
      patientName,
      patientEmail,
      doctorName,
      department,
      invoiceNumber,
      fee
    } = data;

    const notesText = clinicalNotes || "General clinical consultation completed.";
    const medText = `${medication || "Prescribed medication"} every ${frequencyHours || 8} hours for ${durationDays || 5} days.`;

    // ── Default fallback summary ──────────────────────────────────────────
    let patientSummary = `Diagnosis: ${notesText}. Targeted outpatient clinical therapy initiated.`;
    let medicationSchedule = `Take ${medication || "the prescribed medication"} every ${frequencyHours || 8} hours for ${durationDays || 5} days.`;
    let followUpSteps = "Maintain hydration, complete the entire prescribed therapeutic course, and return for clinical follow-up if symptoms persist.";
    let aiSource = 'fallback';

    // ── Attempt real Gemini LLM call ──────────────────────────────────────
    if (GEMINI_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_KEY });

        const prompt = `
Convert these doctor's clinical notes and prescription into an empathetic, patient-friendly visit summary.
Explain the diagnosis in plain English, outline the medication regimen, and list essential follow-up action steps.

Clinical Notes: "${notesText}"
Medications: "${medText}"

Return valid JSON with:
{
  "patientSummary": "...",
  "followUpSteps": "...",
  "medicationSchedule": "..."
}
`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const raw = response.text || '{}';
        const parsed = JSON.parse(raw);

        if (parsed.patientSummary) {
          patientSummary = parsed.patientSummary;
          followUpSteps = parsed.followUpSteps || followUpSteps;
          medicationSchedule = parsed.medicationSchedule || medicationSchedule;
          aiSource = 'gemini';
        }
      } catch (llmErr: any) {
        console.warn('[AI Post-Visit] Gemini call failed, using fallback:', llmErr?.message);
      }
    }

    // ── Send post-visit email to patient ─────────────────────────────────
    const targetEmail = (patientEmail || "").trim().toLowerCase();
    const smtpUser = (process.env.EMAIL_USER || process.env.SMTP_USER || "").trim();
    const smtpPass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").replace(/\s+/g, "");

    let emailSent = false;
    let emailMessage = "";

    if (!smtpUser || !smtpPass) {
      emailMessage = "SMTP credentials missing. Set EMAIL_USER and EMAIL_PASS environment variables.";
    } else if (!targetEmail || !targetEmail.includes("@")) {
      emailMessage = `Invalid patient email address: ${targetEmail}`;
    } else {
      try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
          tls: { rejectUnauthorized: false },
          connectionTimeout: 12000,
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
              <h1 style="color: #047857; margin: 0; font-size: 22px;">PrimeCare Multispecialty Hospital</h1>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Clinical Care Plan &amp; Official Medical Prescription</p>
            </div>

            <div style="background-color: #f8fafc; padding: 14px; border-radius: 10px; margin-bottom: 20px; font-size: 13px;">
              <p style="margin: 2px 0;"><strong>Patient:</strong> ${patientName || "Patient Member"}</p>
              <p style="margin: 2px 0;"><strong>Attending Physician:</strong> ${doctorName || "PrimeCare Specialist"} (${department || "General Medicine"})</p>
              <p style="margin: 2px 0;"><strong>Invoice / Receipt:</strong> ${invoiceNumber || "INV-" + Date.now()} &bull; Paid: ${fee || "₹1,200"}</p>
              <p style="margin: 2px 0;"><strong>Consultation Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">1. Clinical Assessment &amp; Diagnosis</h3>
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 6px; font-size: 13px; color: #065f46;">
                ${patientSummary}
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">2. Prescription (℞) &amp; Medication Timeline</h3>
              <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px;">
                <p style="margin: 0 0 6px 0;"><strong>Medication:</strong> ${medication || "As prescribed"}</p>
                <p style="margin: 0 0 6px 0;"><strong>Frequency:</strong> Every ${frequencyHours || 8} hours</p>
                <p style="margin: 0;"><strong>Duration:</strong> ${durationDays || 5} days course</p>
              </div>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">3. Actionable Recovery Steps</h3>
              <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; font-size: 13px; color: #581c87;">
                ${followUpSteps}
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
              This is an automated clinical notification from PrimeCare Hospital. For emergencies, please call emergency medical services.
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"PrimeCare Hospital" <${smtpUser}>`,
          to: targetEmail,
          subject: `📋 Clinical Summary & Prescription — ${patientName || "Patient"} | ${doctorName || "PrimeCare"}`,
          html: htmlContent,
        });

        emailSent = true;
        emailMessage = `Post-visit care plan email delivered to ${targetEmail}`;
      } catch (mailErr: any) {
        console.error("[Post-Visit Email Error]:", mailErr.message);
        emailMessage = `Email delivery failed: ${mailErr.message}`;
      }
    }

    return NextResponse.json({
      success: true,
      aiSource,
      emailSent,
      emailMessage,
      patientSummary,
      medicationSchedule,
      followUpSteps,
    });
  } catch (error: any) {
    console.error("[Post-Visit Route Error]:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        patientSummary: "Follow clinical treatment instructions as prescribed.",
        medicationSchedule: "Take medication as directed by attending physician.",
        followUpSteps: "Return for clinical follow-up if symptoms do not improve.",
      },
      { status: 200 }  // 200 so the frontend doesn't break even on error
    );
  }
}
