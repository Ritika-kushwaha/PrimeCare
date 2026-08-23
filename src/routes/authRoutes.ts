import { Router } from 'express';
import { login, requestPasswordOtp, resetPasswordWithOtp } from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/forgot-password/request-otp', requestPasswordOtp);
router.post('/forgot-password/reset', resetPasswordWithOtp);

export default router;
