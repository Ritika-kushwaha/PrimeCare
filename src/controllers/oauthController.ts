import { Request, Response } from 'express';
import { GoogleCalendarService } from '../services/googleCalendarService';
import prisma from '../config/prisma';

export const getGoogleAuthUrl = (req: Request, res: Response): void => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const url = GoogleCalendarService.getAuthUrl(userId);
  res.json({ url });
};

export const googleAuthCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      res.status(400).send('Invalid OAuth state or authorization code.');
      return;
    }

    const tokens = await GoogleCalendarService.getTokensFromCode(String(code));

    if (tokens.refresh_token) {
      await prisma.user.update({
        where: { id: String(userId) },
        data: { googleRefreshToken: tokens.refresh_token },
      });
    }

    res.send('<h2>Google Calendar connected successfully! You may close this tab.</h2>');
  } catch (error) {
    res.status(500).send('Failed to authenticate with Google Calendar.');
  }
};