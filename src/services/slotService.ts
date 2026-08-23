import prisma from '../config/prisma';
import redis from '../config/redis';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'HELD';
}

const HOLD_TTL_SECONDS = 300; // 5 minutes

export class SlotService {
  static async getDoctorSlots(doctorId: string, dateStr: string): Promise<TimeSlot[]> {
    const doctor = await prisma.doctorProfile.findUnique({
      where: { id: doctorId },
      include: { leaves: true },
    });

    if (!doctor || !doctor.isActive) {
      throw new Error('Doctor profile not found or inactive.');
    }

    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setUTCHours(23, 59, 59, 999));

    // Check if doctor is on leave
    const isOnLeave = doctor.leaves.some((l) => {
      const leaveDate = new Date(l.leaveDate);
      return leaveDate.toISOString().split('T')[0] === dateStr;
    });

    if (isOnLeave) return [];

    // Blocks any slot that is CONFIRMED or COMPLETED (not CANCELLED)
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: { not: 'CANCELLED' },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      select: { startTime: true, endTime: true },
    });

    const [startHour, startMin] = (doctor.workingHoursStart || '09:00').split(':').map(Number);
    const [endHour, endMin] = (doctor.workingHoursEnd || '17:00').split(':').map(Number);
    const durationMinutes = doctor.slotDurationMinutes || 30;

    const slots: TimeSlot[] = [];
    const currentSlotStart = new Date(dateStr);
    currentSlotStart.setUTCHours(startHour, startMin, 0, 0);

    const shiftEnd = new Date(dateStr);
    shiftEnd.setUTCHours(endHour, endMin, 0, 0);

    while (currentSlotStart.getTime() + durationMinutes * 60000 <= shiftEnd.getTime()) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMinutes * 60000);
      const slotIsoStart = currentSlotStart.toISOString();
      const slotIsoEnd = currentSlotEnd.toISOString();

      const isBooked = existingAppointments.some((appt) => {
        const apptStart = new Date(appt.startTime).getTime();
        const apptEnd = new Date(appt.endTime).getTime();
        return apptStart < currentSlotEnd.getTime() && apptEnd > currentSlotStart.getTime();
      });

      const lockKey = `lock:slot:${doctorId}:${currentSlotStart.getTime()}`;
      const isHeld = await redis.get(lockKey);

      let status: TimeSlot['status'] = 'AVAILABLE';
      let isAvailable = true;

      if (isBooked) {
        status = 'BOOKED';
        isAvailable = false;
      } else if (isHeld) {
        status = 'HELD';
        isAvailable = false;
      }

      slots.push({
        startTime: slotIsoStart,
        endTime: slotIsoEnd,
        isAvailable,
        status,
      });

      currentSlotStart.setMinutes(currentSlotStart.getMinutes() + durationMinutes);
    }

    return slots;
  }

  static async holdSlot(doctorId: string, startTime: string, patientId: string) {
    const slotTimestamp = new Date(startTime).getTime();
    const lockKey = `lock:slot:${doctorId}:${slotTimestamp}`;

    const slotStart = new Date(startTime);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

    const existingBooking = await prisma.appointment.findFirst({
      where: {
        doctorId,
        status: { not: 'CANCELLED' },
        startTime: { lt: slotEnd },
        endTime: { gt: slotStart },
      },
    });

    if (existingBooking) {
      return { success: false, message: 'This slot is already booked.' };
    }

    const acquired = await redis.set(lockKey, patientId, 'EX', HOLD_TTL_SECONDS, 'NX');

    if (!acquired) {
      const currentHolder = await redis.get(lockKey);
      if (currentHolder === patientId) {
        const ttl = await redis.ttl(lockKey);
        return {
          success: true,
          message: 'Slot hold renewed.',
          expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
        };
      }
      return { success: false, message: 'This slot is currently being booked by another patient.' };
    }

    return {
      success: true,
      message: 'Slot held for 5 minutes.',
      expiresAt: new Date(Date.now() + HOLD_TTL_SECONDS * 1000).toISOString(),
    };
  }

  static async verifyHold(doctorId: string, startTime: string, patientId: string): Promise<boolean> {
    const slotTimestamp = new Date(startTime).getTime();
    const lockKey = `lock:slot:${doctorId}:${slotTimestamp}`;
    const holder = await redis.get(lockKey);
    return holder === patientId;
  }

  static async releaseHold(doctorId: string, startTime: string, patientId: string): Promise<void> {
    const slotTimestamp = new Date(startTime).getTime();
    const lockKey = `lock:slot:${doctorId}:${slotTimestamp}`;
    const holder = await redis.get(lockKey);
    if (holder === patientId) {
      await redis.del(lockKey);
    }
  }
}
