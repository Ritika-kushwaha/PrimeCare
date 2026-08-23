import prisma from '../config/prisma';
import { generatePreVisitSummary } from './aiService';
import { sendOtpEmail } from './emailService';

// 1. ATOMIC SLOT BOOKING WITH DOUBLE-BOOKING PREVENTION
export async function bookAppointmentSafe(params: {
  patientId: string;
  doctorId: string;
  date: string;       // "YYYY-MM-DD"
  timeSlot: string;   // "10:00 AM"
  symptoms: string;
  patientEmail: string;
}) {
  const targetDate = new Date(params.date);

  // Check if doctor is on approved leave
  const onLeave = await prisma.doctorLeave.findFirst({
    where: { doctorId: params.doctorId, leaveDate: targetDate }
  });
  if (onLeave) {
    throw new Error('Doctor is on authorized leave on this date.');
  }

  // Pre-visit AI triage analysis
  const aiAnalysis = await generatePreVisitSummary(params.symptoms);

  // Execute in an isolated transaction to prevent race conditions
  return await prisma.$transaction(async (tx) => {
    // Check if slot was taken by a concurrent request
    const existing = await tx.appointment.findFirst({
      where: {
        doctorId: params.doctorId,
        appointmentDate: targetDate,
        timeSlot: params.timeSlot,
        status: { in: ['CONFIRMED', 'HELD'] },
      },
    });

    if (existing) {
      throw new Error(`Slot ${params.timeSlot} on ${params.date} is already reserved.`);
    }

    return await tx.appointment.create({
      data: {
        patientId: params.patientId,
        doctorId: params.doctorId,
        appointmentDate: targetDate,
        timeSlot: params.timeSlot,
        status: 'CONFIRMED',
        symptomsRaw: params.symptoms,
        aiUrgency: aiAnalysis.urgency,
        aiChiefComplaint: aiAnalysis.chiefComplaint,
        aiQuestions: aiAnalysis.suggestedQuestions,
      },
      include: {
        doctor: { include: { user: true } },
        patient: true,
      },
    });
  });
}

// 2. DOCTOR LEAVE APPROVAL WITH AUTOMATIC PATIENT CONFLICT CANCELLATION & NOTIFICATION
export async function approveDoctorLeaveAndNotify(doctorId: string, leaveDateStr: string, reason: string) {
  const targetDate = new Date(leaveDateStr);

  return await prisma.$transaction(async (tx) => {
    // 1. Record leave
    const leave = await tx.doctorLeave.create({
      data: { doctorId, leaveDate: targetDate, reason }
    });

    // 2. Find all affected confirmed appointments
    const affectedAppointments = await tx.appointment.findMany({
      where: {
        doctorId,
        appointmentDate: targetDate,
        status: 'CONFIRMED',
      },
      include: { patient: true, doctor: { include: { user: true } } }
    });

    // 3. Mark affected appointments as cancelled
    await tx.appointment.updateMany({
      where: {
        doctorId,
        appointmentDate: targetDate,
        status: 'CONFIRMED',
      },
      data: { status: 'CANCELLED_BY_DOCTOR_LEAVE' }
    });

    // 4. Log notifications for background delivery
    for (const appt of affectedAppointments) {
      await tx.notificationLog.create({
        data: {
          recipientEmail: appt.patient.email,
          subject: `Urgent: Reschedule Required for Consultation on ${leaveDateStr}`,
          body: `Dear ${appt.patient.firstName}, Dr. ${appt.doctor.user.lastName} is on unexpected clinical leave on ${leaveDateStr} (${reason}). Your appointment has been cancelled. Please rebook a priority slot on the portal.`,
          type: 'DOCTOR_LEAVE_CANCEL',
          status: 'PENDING',
        }
      });
    }

    return { leave, cancelledCount: affectedAppointments.length };
  });
}
