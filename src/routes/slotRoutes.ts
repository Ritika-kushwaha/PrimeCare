import { Router } from 'express';
import { getDoctorSlotsHandler } from '../controllers/slotController';

const router = Router();

// GET /api/slots/:doctorId?date=YYYY-MM-DD
router.get('/:doctorId', getDoctorSlotsHandler);

export default router;
