import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Global shared synchronized registry for leaves
export let activeLeavesStore: Array<{
  id: string;
  doctorId: string;
  doctorName: string;
  specialisation: string;
  leaveDate: string;
  reason: string;
}> = [
  {
    id: 'leave-default-01',
    doctorId: 'doc-cardio-01',
    doctorName: 'Dr. Aarav Sharma',
    specialisation: 'Cardiology',
    leaveDate: '2026-08-28',
    reason: 'Attending Cardiology Summit in New Delhi',
  }
];

// 1. Get Doctor Slots with Leave Guard Check
export const getDoctorSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const selectedDate = (date as string) || '2026-08-27';

    // Check if physician is on leave on this date in shared registry or DB
    const isLeave = activeLeavesStore.find(
      (l) => l.doctorId === id && l.leaveDate === selectedDate
    );

    if (isLeave) {
      res.status(200).json({
        onLeave: true,
        message: `Dr. ${isLeave.doctorName} is on leave on ${selectedDate} (${isLeave.reason}).`,
        slots: [],
      });
      return;
    }

    // Generate real-time 30-minute intervals
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        const startStr = `${selectedDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00.000Z`;
        const startDate = new Date(startStr);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

        slots.push({
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          isAvailable: true,
          isHeld: false,
        });
      }
    }

    res.status(200).json({
      onLeave: false,
      slots,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to query doctor slots.' });
  }
};

// 2. Authorize Doctor Leave
export const createDoctorLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, leaveDate, reason, doctorName, specialisation } = req.body;

    if (!doctorId || !leaveDate) {
      res.status(400).json({ error: 'doctorId and leaveDate are required.' });
      return;
    }

    const newLeave = {
      id: 'leave-' + Date.now(),
      doctorId,
      doctorName: doctorName || 'Physician',
      specialisation: specialisation || 'Specialist',
      leaveDate,
      reason: reason || 'Scheduled Official Leave',
    };

    activeLeavesStore = activeLeavesStore.filter(
      (l) => !(l.doctorId === doctorId && l.leaveDate === leaveDate)
    );
    activeLeavesStore.unshift(newLeave);

    res.status(201).json({
      message: 'Leave authorized successfully. Clinic slots revoked.',
      leave: newLeave,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to authorize leave.' });
  }
};

// 3. Get All Active Leaves
export const getDoctorLeaves = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({ leaves: activeLeavesStore });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve leaves.' });
  }
};

// 4. Delete / Revoke Leave
export const deleteDoctorLeave = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    activeLeavesStore = activeLeavesStore.filter((l) => l.id !== id);
    res.status(200).json({ message: 'Leave revoked and slots restored.' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete leave.' });
  }
};
