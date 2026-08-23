import { Router } from 'express';
import { createDoctorLeave, getDoctorLeaves, deleteDoctorLeave } from '../controllers/adminController';
import { getDoctorApplications, approveDoctorApplication, rejectDoctorApplication } from '../controllers/authController';

const router = Router();

router.post('/leaves', createDoctorLeave);
router.get('/leaves', getDoctorLeaves);
router.delete('/leaves/:id', deleteDoctorLeave);

router.get('/doctor-applications', getDoctorApplications);
router.post('/doctor-applications/:id/approve', approveDoctorApplication);
router.delete('/doctor-applications/:id/reject', rejectDoctorApplication);

export default router;
