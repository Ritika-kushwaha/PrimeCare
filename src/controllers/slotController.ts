import { Request, Response } from 'express';
import prisma from '../config/prisma';
import redis from '../config/redis';

export const getDoctorSlotsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!doctorId || !date) {
      res.status(400).json({ error: 'doctorId and date query parameter (YYYY-MM-DD) are required.' });
      return;
    }

    const dateStr = String(date).split('T')[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    // 1. Check if doctor is on leave
    const onLeave = await prisma.doctorLeave.findFirst({
      where: {
        doctorId,
        leaveDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (onLeave) {
      res.status(200).json({
        date: dateStr,
        slots: [],
        onLeave: true,
        message: `Dr. is on leave on this date (${onLeave.reason || 'Scheduled Leave'}).`,
      });
      return;
    }

    // 2. Fetch active appointments
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { not: 'CANCELLED' },
      },
      select: { startTime: true, endTime: true },
    });

    // 3. Generate 30-min slots from 09:00 to 17:00
    const slots = [];
    const clinicStartHour = 9;
    const clinicEndHour = 17;

    for (let hour = clinicStartHour; hour < clinicEndHour; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`);
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);

        const isBooked = appointments.some(
          (appt) => appt.startTime.getTime() === slotStart.getTime()
        );

        const holdKey = `hold:${doctorId}:${slotStart.toISOString()}`;
        const isHeld = redis ? Boolean(await redis.get(holdKey)) : false;

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !isBooked && !isHeld,
          isHeld,
        });
      }
    }

    res.status(200).json({ date: dateStr, slots, onLeave: false });
  } catch (error: any) {
    console.error('[SLOT CONTROLLER ERROR]:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve slots.' });
  }
};
