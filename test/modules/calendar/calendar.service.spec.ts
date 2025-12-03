import { InternalServerErrorException, UnauthorizedException, Logger } from '@nestjs/common';
import { CalendarService } from '../../../src/app/modules/calendar/calendar.service';
import { google } from 'googleapis';

jest.mock('googleapis', () => {
  const _list = jest.fn();
  const _insert = jest.fn();
  const _getAccessToken = jest.fn().mockResolvedValue('access_token');

  return {
    google: {
      auth: {
        OAuth2: jest.fn().mockImplementation(() => ({
          setCredentials: jest.fn(),
          getAccessToken: _getAccessToken,
        })),
      },
      calendar: jest.fn(() => ({
        events: {
          list: _list,
          insert: _insert,
        },
      })),
      __mocks: {
        list: _list,
        insert: _insert,
        getAccessToken: _getAccessToken,
      },
    },
  };
});

describe('CalendarService', () => {
  let service: CalendarService;
  let usersDb: { findById: jest.Mock };

  const userId = 'user-123';
  const startIso = '2025-11-06T00:00:00Z';
  const endIso = '2025-11-07T00:00:00Z';

  const g = google as any;
  const list = g.__mocks.list as jest.Mock;
  const insert = g.__mocks.insert as jest.Mock;
  const getAccessToken = g.__mocks.getAccessToken as jest.Mock;

  beforeEach(() => {
    usersDb = { findById: jest.fn() };

    list.mockReset();
    insert.mockReset();
    getAccessToken.mockReset().mockResolvedValue('access_token');

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    service = new CalendarService(usersDb as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventsForUser', () => {
    it('✅ devuelve eventos correctamente', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-1' });
      list.mockResolvedValue({
        data: {
          items: [
            {
              id: 'evt-1',
              summary: 'Evento test',
              start: { dateTime: startIso },
              end: { dateTime: endIso },
            },
          ],
        },
      });

      const result = await service.getEventsForUser(userId, startIso, endIso);
      expect(result).toEqual({
        events: [
          {
            id: 'evt-1',
            summary: 'Evento test',
            start: { dateTime: startIso },
            end: { dateTime: endIso },
          },
        ],
      });
    });

    it('✅ devuelve { events: [] } si el usuario no tiene refreshToken', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: null });

      const result = await service.getEventsForUser(userId, startIso, endIso);
      expect(result).toEqual({ events: [] });
      expect(list).not.toHaveBeenCalled();
    });

    it('lanza InternalServerErrorException si el usuario no existe (según tu catch)', async () => {
      usersDb.findById.mockResolvedValue(null);

      await expect(service.getEventsForUser(userId, startIso, endIso)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('lanza UnauthorizedException cuando Google devuelve credenciales inválidas', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      list.mockRejectedValue(new Error('Invalid Credentials'));

      await expect(service.getEventsForUser(userId, startIso, endIso)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException cuando Google dice invalid_token/invalid_grant', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      list.mockRejectedValue(new Error('invalid_token'));

      await expect(service.getEventsForUser(userId, startIso, endIso)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza InternalServerErrorException cuando la API no está habilitada', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      list.mockRejectedValue(new Error('has not been used in project'));

      await expect(service.getEventsForUser(userId, startIso, endIso)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('lanza InternalServerErrorException en error genérico', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      list.mockRejectedValue(new Error('Unexpected Gaxios Error'));

      await expect(service.getEventsForUser(userId, startIso, endIso)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('getAccessToken es llamado cuando hay refreshToken', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-1' });
      list.mockResolvedValue({ data: { items: [] } });

      await service.getEventsForUser(userId, startIso, endIso);
      expect(getAccessToken).toHaveBeenCalled();
    });
  });

  describe('createEventForUser', () => {
    const opts = {
      summary: 'Reunión',
      description: 'Prueba',
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      attendees: ['a@b.com', 'c@d.com'],
    };

    it('crea evento correctamente', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-1' });
      insert.mockResolvedValue({ data: { id: 'event-1', summary: 'Reunión' } });

      const created = await service.createEventForUser(userId, opts);
      expect(created).toEqual({ id: 'event-1', summary: 'Reunión' });
    });

    it('lanza InternalServerErrorException si el usuario no existe (según tu catch)', async () => {
      usersDb.findById.mockResolvedValue(null);

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('lanza InternalServerErrorException si no hay refresh token (según tu catch)', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: null });

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('lanza UnauthorizedException si credenciales inválidas al crear evento', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      insert.mockRejectedValue(new Error('Invalid Credentials'));

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException si insert falla con invalid_token/invalid_grant', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      insert.mockRejectedValue(new Error('invalid_token'));

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza InternalServerErrorException en error genérico al crear', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-x' });
      insert.mockRejectedValue(new Error('Unexpected Gaxios Error'));

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('incluye asistentes cuando vienen en opts', async () => {
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-1' });
      insert.mockResolvedValue({ data: { id: 'event-2' } });

      await service.createEventForUser(userId, opts);

      const call = insert.mock.calls[0][0];
      expect(call.requestBody.attendees).toEqual([{ email: 'a@b.com' }, { email: 'c@d.com' }]);
    });

    it('registra en logger al crear evento', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      usersDb.findById.mockResolvedValue({ googleRefreshToken: 'refresh-1' });
      insert.mockResolvedValue({ data: { id: 'log-1' } });

      await service.createEventForUser(userId, opts);
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('log-1'));
    });
  });
});
