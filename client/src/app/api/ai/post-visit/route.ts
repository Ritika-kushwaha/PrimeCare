import { NextResponse } from "next/navigation";
import nodemailer from "nodemailer";

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

    const patientSummary = `Diagnosis: ${clinicalNotes}. Targeted outpatient clinical therapy initiated.`;
    const medicationSchedule = `Take ${medication} every ${frequencyHours} hours for ${durationDays} days.`;
    const followUpSteps = "Maintain hydration, complete the entire prescribed antimicrobial or therapeutic course, and return for clinical follow-up if symptoms persist.";

    // Send AI Care Plan & Prescription to Patient via Email
    if (patientEmail) {
      const smtpUser = process.env.SMTP_USER || "ritikakushwaha62@gmail.com";
      const smtpPass = process.env.SMTP_PASS;

      if (smtpPass) {
        try {
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: smtpUser,
              pass: smtpPass,
            },
          });

          const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
              <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 20px;">
                <h1 style="color: #047857; margin: 0; font-size: 22px;">PrimeCare Multispecialty Hospital</h1>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #64748b;">Clinical Care Plan & Official Medical Prescription</p>
              </div>

              <div style="background-color: #f8fafc; padding: 14px; border-radius: 10px; margin-bottom: 20px; font-size: 13px;">
                <p style="margin: 2px 0;"><strong>Patient:</strong> ${patientName || "Patient Member"}</p>
                <p style="margin: 2px 0;"><strong>Attending Physician:</strong> ${doctorName || "PrimeCare Specialist"} (${department || "General Medicine"})</p>
                <p style="margin: 2px 0;"><strong>Invoice / Receipt:</strong> ${invoiceNumber || "INV-84920"} • Paid: ${fee || "₹1,200"}</p>
                <p style="margin: 2px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">1. Clinical Assessment & Diagnosis</h3>
                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 6px; font-size: 13px; color: #065f46;">
                  ${patientSummary}
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">2. Prescription (℞) & Medication Timeline</h3>
                <div style="background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px;">
                  <p style="margin: 0 0 6px 0;"><strong>Medication:</strong> ${medication}</p>
                  <p style="margin: 0 0 6px 0;"><strong>Frequency:</strong> Every ${frequencyHours} hours</p>
                  <p style="margin: 0;"><strong>Duration:</strong> ${durationDays} days course</p>
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #0f172a; font-size: 14px; text-transform: uppercase; margin-bottom: 6px;">3. Actionable Recovery Steps</h3>
                <div style="background-color: #faf5ff; border-left: 4px solid #a855f7; padding: 12px; border-radius: 6px; font-size: 13px; color: #581c87;">
                  ${followUpSteps}
                </div>
              </div>

              <div style="border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center;">
                For emergencies, please visit the PrimeCare 24/7 Casualty Desk or call your healthcare provider.
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"PrimeCare Hospital" <${smtpUser}>`,
            to: patientEmail,
            subject: `📋 Clinical Summary & Prescription for ${patientName} - ${doctorName}`,
            html: htmlContent,
          });
        } catch (mailErr) {
          console.error("Failed to send post-visit email:", mailErr);
        }
      }
    }

    return NextResponse.json({
      patientSummary,
      medicationSchedule,
      followUpSteps,
    });
  } catch (error: any) {
    return NextResponse.json({
      patientSummary: "Follow clinical treatment instructions as prescribed.",
      medicationSchedule: "Take medication as directed by attending physician.",
      followUpSteps: "Return for clinical follow-up if symptoms do not improve.",
    });
  }
}
