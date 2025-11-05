// calendar.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { google } from 'googleapis';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly usersDb: UsersDBService) {}

  async getEventsForUser(userId: string, startIso: string, endIso: string) {
    try {
      const user = await this.usersDb.findById(userId);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const refreshToken = user.googleRefreshToken;
      if (!refreshToken) return { events: [] };

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );

      oAuth2Client.setCredentials({ refresh_token: refreshToken });

      // Force refresh to get a fresh access_token
      await oAuth2Client.getAccessToken(); // may throw if token invalid/revoked
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startIso,
        timeMax: endIso,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const items = res.data.items || [];

      // Optionally normalize fields the frontend expects
      const events = items.map((ev) => ({
        id: ev.id,
        summary: ev.summary,
        start: ev.start,
        end: ev.end,
        // other fields you want to return
      }));

      this.logger.log(`Found ${events.length} Google Calendar events for user ${userId}`);
      if (events.length === 0) {
        return { events, message: 'No events' };
      }

      return { events };
    } catch (err) {
      this.logger.error('Error fetching Google Calendar events', err as Error);

      // Detect common google oauth errors
      const e = err as any;
      const msg = e?.message ?? String(e);
      if (
        msg.includes('Invalid Credentials') ||
        msg.includes('invalid_grant') ||
        msg.includes('invalid_token')
      ) {
        // Token invalid or revoked
        throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
      }

      if (msg.includes('has not been used in project') || msg.includes('is disabled')) {
        // Provide a clear actionable message for misconfigured Google project
        throw new InternalServerErrorException(
          'Google Calendar API no está habilitada para el proyecto del CLIENT_ID. Habilitá la API Calendar en Google Cloud Console y volvé a intentar.',
        );
      }

      // For other errors, return a 500 with a helpful message
      throw new InternalServerErrorException(
        'No se pudieron obtener los eventos de Google Calendar',
      );
    }
  }
}
