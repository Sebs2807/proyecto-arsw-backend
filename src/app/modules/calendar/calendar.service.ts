import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private readonly usersDb: UsersDBService) {}

  // -------------------------------
  // Métodos privados reutilizables
  // -------------------------------
  private async getAuthClient(userId: string) {
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

    return { user, oAuth2Client };
  }

  private handleGoogleError(err: any, action: string) {
    const message = err?.message ?? String(err);
    this.logger.error(`Error ${action} Google Calendar`, err);

    if (message.includes('Invalid Credentials') || message.includes('invalid_grant') || message.includes('invalid_token')) {
      throw new UnauthorizedException('Google credential inválida o revocada. Reautenticar.');
    }

    if (message.includes('has not been used in project') || message.includes('is disabled')) {
      throw new InternalServerErrorException(
        'Google Calendar API no está habilitada para el proyecto del CLIENT_ID. Habilitá la API Calendar en Google Cloud Console y volvé a intentar.',
      );
    }

    throw new InternalServerErrorException(`No se pudo ${action} en Google Calendar`);
  }

  // -------------------------------
  // Métodos públicos
  // -------------------------------
  async getEventsForUser(userId: string, startIso: string, endIso: string) {
    try {
      const { oAuth2Client } = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startIso,
        timeMax: endIso,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = (res.data.items || []).map(ev => ({
        id: ev.id,
        summary: ev.summary,
        start: ev.start,
        end: ev.end,
      }));

      this.logger.log(`Found ${events.length} events for user ${userId}`);
      return events.length ? { events } : { events, message: 'No events' };
    } catch (err) {
      this.handleGoogleError(err, 'obtener eventos');
    }
  }

  async createEventForUser(
    userId: string,
    opts: {
      summary: string;
      description?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
      attendees?: string[];
    },
  ) {
    try {
      const { oAuth2Client } = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const resource: calendar_v3.Schema$Event = {
        summary: opts.summary,
        description: opts.description,
        start: opts.start,
        end: opts.end,
        attendees: opts.attendees?.map(email => ({ email })),
      };

      const res = await calendar.events.insert({ calendarId: 'primary', requestBody: resource, sendUpdates: 'all' });
      const created = res.data;

      this.logger.log(`Created event ${created?.id} for user ${userId}`);
      return created;
    } catch (err) {
      this.handleGoogleError(err, 'crear evento');
    }
  }

  async deleteEventForUser(userId: string, eventId: string) {
    try {
      const { oAuth2Client } = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      await calendar.events.delete({ calendarId: 'primary', eventId, sendUpdates: 'all' });
      this.logger.log(`Deleted event ${eventId} for user ${userId}`);
      return { ok: true };
    } catch (err) {
      this.handleGoogleError(err, 'eliminar evento');
    }
  }

  async updateEventForUser(
    userId: string,
    eventId: string,
    opts: { start?: { dateTime?: string; date?: string }; end?: { dateTime?: string; date?: string } },
  ) {
    try {
      const { oAuth2Client } = await this.getAuthClient(userId);
      const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

      const requestBody: any = {};
      if (opts.start) requestBody.start = opts.start;
      if (opts.end) requestBody.end = opts.end;

      const res = await calendar.events.patch({ calendarId: 'primary', eventId, requestBody, sendUpdates: 'all' });
      const updated = res.data;

      this.logger.log(`Updated event ${eventId} for user ${userId}`);
      return updated;
    } catch (err) {
      this.handleGoogleError(err, 'actualizar evento');
    }
  }
}
