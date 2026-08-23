import { Router } from 'express';
import { getDoctors } from '../controllers/doctorController';
import { getDoctorSlots } from '../controllers/adminController';

const router = Router();

router.get('/', getDoctors);
router.get('/:id/slots', getDoctorSlots);

export default router;
