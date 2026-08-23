import { Queue, Worker } from 'bullmq';
import redis from '../config/redis';
import prisma from '../config/prisma';

const reminderQueue = new Queue('medication-reminders', {
  connection: redis as any,
});

// Background worker processing reminder triggers
const reminderWorker = new Worker(
  'medication-reminders',
  async (job) => {
    const { reminderId, patientEmail, medicationName, dosage } = job.data;

    console.log(`[MEDICATION REMINDER] Sending reminder to ${patientEmail}: Take ${medicationName} (${dosage})`);

    // Mark reminder as SENT in database
    await prisma.medicationReminder.update({
      where: { id: reminderId },
      data: { status: 'SENT', sentAt: new Date() },
    });
  },
  {
    connection: redis as any,
  }
);

export { reminderQueue, reminderWorker };