import { Router } from 'express';
import { 
  createAppointment, 
  getDoctorQueue, 
  completeAppointment 
} from '../controllers/appointmentController';

const router = Router();

router.post('/', createAppointment);
router.get('/doctor/queue', getDoctorQueue);
router.post('/:id/complete', completeAppointment);

export default router;
