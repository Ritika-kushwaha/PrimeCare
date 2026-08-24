import { Router } from 'express';
import { getGoogleAuthUrl, googleAuthCallback } from '../controllers/oauthController';

const router = Router();

// GET /api/oauth/google  → returns authorization URL for Google Calendar OAuth
router.get('/google', getGoogleAuthUrl);

// GET /api/oauth/callback  → handles OAuth callback, stores refresh token
router.get('/callback', googleAuthCallback);

export default router;
