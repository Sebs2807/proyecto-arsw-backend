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

      await oAuth2Client.getAccessToken();
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startIso,
        timeMax: endIso,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const items = res.data.items || [];

      const events = items.map((ev) => ({
        id: ev.id,
        summary: ev.summary,
        start: ev.start,
        end: ev.end,
      }));

      this.logger.log(`Found ${events.length} Google Calendar events for user ${userId}`);
      if (events.length === 0) {
        return { events, message: 'No events' };
      }

      return { events };
    } catch (err) {
      this.logger.error('Error fetching Google Calendar events', err as Error);

      const message = (err as Error)?.message ?? String(err);
      
      if (
        message.includes('Invalid Credentials') ||
        message.includes('invalid_grant') ||
        message.includes('invalid_token')
      ) {
        throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
      }

      if (message.includes('has not been used in project') || message.includes('is disabled')) {
        throw new InternalServerErrorException(
          'Google Calendar API no está habilitada para el proyecto del CLIENT_ID. Habilitá la API Calendar en Google Cloud Console y volvé a intentar.',
        );
      }
      throw new InternalServerErrorException(
        'No se pudieron obtener los eventos de Google Calendar',
      );
    }
  }

  async createEventForUser(
    userId: string,
    opts: {
      summary: string;
      description?: string;
      start: { dateTime: string } | { date: string };
      end: { dateTime: string } | { date: string };
      attendees?: string[];
    },
  ) {
    try {
      const user = await this.usersDb.findById(userId);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const refreshToken = user.googleRefreshToken;
      if (!refreshToken) throw new UnauthorizedException('Usuario no tiene Google conectado');

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oAuth2Client.setCredentials({ refresh_token: refreshToken });

      await oAuth2Client.getAccessToken();

      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const resource: any = {
        summary: opts.summary,
        description: opts.description,
        start: opts.start,
        end: opts.end,
      };

      if (opts.attendees?.length) {
        resource.attendees = opts.attendees.map((email) => ({ email }));
      }

      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: resource,
        sendUpdates: 'all',
      });

      const created = (res as any).data;

      this.logger.log(`Created Google Calendar event ${created?.id} for user ${userId}`);

      return created;
    } catch (err) {
      this.logger.error('Error creating Google Calendar event', err as Error);
      const message = (err as Error)?.message ?? String(err);

      if (
        message.includes('Invalid Credentials') ||
        message.includes('invalid_grant') ||
        message.includes('invalid_token')
      ) {
        throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
      }

      throw new InternalServerErrorException('No se pudo crear el evento en Google Calendar');
    }
  }

  async deleteEventForUser(userId: string, eventId: string) {
    try {
      const user = await this.usersDb.findById(userId);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const refreshToken = user.googleRefreshToken;
      if (!refreshToken) throw new UnauthorizedException('Usuario no tiene Google conectado');

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oAuth2Client.setCredentials({ refresh_token: refreshToken });

      await oAuth2Client.getAccessToken();
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      await calendar.events.delete({ calendarId: 'primary', eventId, sendUpdates: 'all' });

      this.logger.log(`Deleted Google Calendar event ${eventId} for user ${userId}`);
      return { ok: true };
    } catch (err) {
      this.logger.error('Error deleting Google Calendar event', err as Error);
      const message = (err as Error)?.message ?? String(err);

      if (
        message.includes('Invalid Credentials') ||
        message.includes('invalid_grant') ||
        message.includes('invalid_token')
      ) {
        throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
      }

      throw new InternalServerErrorException('No se pudo eliminar el evento en Google Calendar');
    }
  }

  async updateEventForUser(
    userId: string,
    eventId: string,
    opts: { start: { dateTime?: string } | { date?: string }; end: { dateTime?: string } | { date?: string } },
  ) {
    try {
      const user = await this.usersDb.findById(userId);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const refreshToken = user.googleRefreshToken;
      if (!refreshToken) throw new UnauthorizedException('Usuario no tiene Google conectado');

      const oAuth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
      );
      oAuth2Client.setCredentials({ refresh_token: refreshToken });

      await oAuth2Client.getAccessToken();

      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const requestBody: any = {};
      if (opts.start) requestBody.start = opts.start;
      if (opts.end) requestBody.end = opts.end;

      const res = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody,
        sendUpdates: 'all',
      });

      const updated = (res as any).data;
      this.logger.log(`Updated Google Calendar event ${eventId} for user ${userId}`);
      return updated;
    } catch (err) {
      this.logger.error('Error updating Google Calendar event', err as Error);
      const message = (err as Error)?.message ?? String(err);

      if (
        message.includes('Invalid Credentials') ||
        message.includes('invalid_grant') ||
        message.includes('invalid_token')
      ) {
        throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
      }

      throw new InternalServerErrorException('No se pudo actualizar el evento en Google Calendar');
    }
  }
}
