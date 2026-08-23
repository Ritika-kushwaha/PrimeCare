import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startTime: Date;
  endTime: Date;
  attendeeEmails: string[];
}

export class GoogleCalendarService {
  static getAuthUrl(userId: string): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: userId,
    });
  }

  static async getTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  static async createEvent(refreshToken: string, payload: CalendarEventPayload) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });

    const event = {
      summary: payload.summary,
      description: payload.description,
      start: { dateTime: payload.startTime.toISOString() },
      end: { dateTime: payload.endTime.toISOString() },
      attendees: payload.attendeeEmails.map((email) => ({ email })),
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  static async deleteEvent(refreshToken: string, eventId: string) {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({ refresh_token: refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: client });

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });
  }
}