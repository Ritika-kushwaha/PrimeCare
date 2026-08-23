import nodeCron from 'node-cron';
import prisma from '../config/prisma';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: (process.env.SMTP_PASS || '').replace(/\s+/g, ''),
  },
});

export function startBackgroundWorkers() {
  console.log('⏱️ [Background Workers] Active: Medication Reminders & Notification Retries');

  // Run every 10 minutes: Notification Queue Worker
  nodeCron.schedule('*/10 * * * *', async () => {
    try {
      const pendingLogs = await prisma.notificationLog.findMany({
        where: { status: 'PENDING', retryCount: { lt: 3 } },
        take: 20,
      });

      for (const log of pendingLogs) {
        try {
          if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail({
              from: `"PrimeCare Healthcare" <${process.env.SMTP_USER}>`,
              to: log.recipientEmail,
              subject: log.subject,
              text: log.body,
            });
          }
          await prisma.notificationLog.update({
            where: { id: log.id },
            data: { status: 'SENT' },
          });
        } catch (err: any) {
          await prisma.notificationLog.update({
            where: { id: log.id },
            data: {
              retryCount: { increment: 1 },
              lastError: err.message,
              status: log.retryCount >= 2 ? 'FAILED' : 'PENDING',
            },
          });
        }
      }
    } catch (e) {
      console.error('[Worker Error - Notification Queue]:', e);
    }
  });

  // Run every hour: Medication Reminder Dispatcher
  nodeCron.schedule('0 * * * *', async () => {
    try {
      const activeRx = await prisma.prescription.findMany({
        where: {
          appointment: { status: 'COMPLETED' },
        },
        include: { appointment: { include: { patient: true } } },
      });

      const now = new Date();
      for (const rx of activeRx) {
        const elapsedHours = (now.getTime() - new Date(rx.startDateTime).getTime()) / (1000 * 60 * 60);
        const maxDurationHours = rx.durationDays * 24;

        if (elapsedHours <= maxDurationHours && Math.floor(elapsedHours) % rx.frequencyHours === 0) {
          await prisma.notificationLog.create({
            data: {
              recipientEmail: rx.appointment.patient.email,
              subject: `💊 Medication Reminder: ${rx.medicationName}`,
              body: `Hello ${rx.appointment.patient.firstName}, this is a scheduled reminder to take your prescribed dose of ${rx.medicationName}.`,
              type: 'MED_REMINDER',
              status: 'PENDING',
            }
          });
        }
      }
    } catch (e) {
      console.error('[Worker Error - Med Reminders]:', e);
    }
  });
}
