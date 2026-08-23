import { Queue, Worker } from 'bullmq';
import nodemailer from 'nodemailer';
import redis from '../config/redis';
import prisma from '../config/prisma';
import { GoogleCalendarService } from '../services/googleCalendarService';

const notificationQueue = new Queue('notifications', {
  connection: redis as any,
});

// Configure Nodemailer transporter (Mailtrap for dev or SendGrid/Gmail for prod)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER || 'sample_user',
    pass: process.env.SMTP_PASS || 'sample_pass',
  },
});

const notificationWorker = new Worker(
  'notifications',
  async (job) => {
    switch (job.name) {
      case 'APPOINTMENT_BOOKED': {
        const { appointmentId } = job.data;

        const appt = await prisma.appointment.findUnique({
          where: { id: appointmentId },
          include: {
            patient: true,
            doctor: { include: { user: true } },
          },
        });

        if (!appt) return;

        // 1. Send Email Confirmations
        await transporter.sendMail({
          from: '"ClinicCare" <no-reply@cliniccare.com>',
          to: appt.patient.email,
          subject: 'Appointment Confirmed - ClinicCare',
          html: `
            <h3>Your appointment has been confirmed!</h3>
            <p><strong>Doctor:</strong> Dr. ${appt.doctor.user.firstName} ${appt.doctor.user.lastName}</p>
            <p><strong>Date & Time:</strong> ${new Date(appt.startTime).toLocaleString()}</p>
            <p><strong>Specialisation:</strong> ${appt.doctor.specialisation}</p>
          `,
        });

        // 2. Sync with Google Calendar if doctor has connected Google
        if (appt.doctor.user.googleRefreshToken) {
          try {
            const calendarEvent = await GoogleCalendarService.createEvent(
              appt.doctor.user.googleRefreshToken,
              {
                summary: `Clinic Visit: ${appt.patient.firstName} ${appt.patient.lastName}`,
                description: `Symptoms: ${appt.symptomsRaw}\nUrgency: ${appt.aiUrgency}`,
                startTime: new Date(appt.startTime),
                endTime: new Date(appt.endTime),
                attendeeEmails: [appt.patient.email, appt.doctor.user.email],
              }
            );

            if (calendarEvent.id) {
              await prisma.appointment.update({
                where: { id: appt.id },
                data: { googleEventIdDoctor: calendarEvent.id },
              });
            }
          } catch (calErr) {
            console.warn('Google Calendar sync failed for doctor:', calErr);
          }
        }
        break;
      }

      case 'DOCTOR_LEAVE_CANCELLATION': {
        const { patientEmail, doctorName, date, googleEventId, doctorRefreshToken } = job.data;

        // 1. Send Urgent Cancellation Notice
        await transporter.sendMail({
          from: '"ClinicCare Urgent Alerts" <alerts@cliniccare.com>',
          to: patientEmail,
          subject: 'URGENT: Appointment Cancelled - Doctor on Leave',
          html: `
            <h3>Appointment Cancellation Notice</h3>
            <p>Dr. ${doctorName} has been scheduled on leave for <strong>${date}</strong>.</p>
            <p>Your appointment has been cancelled. Please log in to your patient portal to choose another slot.</p>
          `,
        });

        // 2. Clean up Google Calendar event if it exists
        if (doctorRefreshToken && googleEventId) {
          try {
            await GoogleCalendarService.deleteEvent(doctorRefreshToken, googleEventId);
          } catch (delErr) {
            console.warn('Could not delete calendar event:', delErr);
          }
        }
        break;
      }
    }
  },
  {
    connection: redis as any,
    concurrency: 5,
  }
);

module.exports = { notificationQueue, notificationWorker };