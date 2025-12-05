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
        events: { list: _list, insert: _insert },
      })),
      __mocks: { list: _list, insert: _insert, getAccessToken: _getAccessToken },
    },
  };
});

describe('CalendarService', () => {
  let service: CalendarService;
  let usersDb: { findById: jest.Mock };
  const userId = 'user-123';
  const startIso = '2025-11-06T00:00:00Z';
  const endIso = '2025-11-07T00:00:00Z';
  const { __mocks: mocks } = google as any;
  const { list, insert, getAccessToken } = mocks as {
    list: jest.Mock;
    insert: jest.Mock;
    getAccessToken: jest.Mock;
  };

  // Helper para configurar usuario con refreshToken
  const mockUserWithToken = (token = 'refresh-1') =>
    usersDb.findById.mockResolvedValue({ googleRefreshToken: token });
  const mockNoUser = () => usersDb.findById.mockResolvedValue(null);

  beforeEach(() => {
    usersDb = { findById: jest.fn() };
    [list, insert, getAccessToken].forEach((fn) => fn.mockReset());
    getAccessToken.mockResolvedValue('access_token');
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    service = new CalendarService(usersDb as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createEventForUser', () => {
    const opts = {
      summary: 'Reunión',
      description: 'Prueba',
      start: { dateTime: startIso },
      end: { dateTime: endIso },
      attendees: ['a@b.com', 'c@d.com'],
    };

    it('crea evento correctamente', async () => {
      mockUserWithToken();
      insert.mockResolvedValue({ data: { id: 'event-1', summary: 'Reunión' } });

      const created = await service.createEventForUser(userId, opts);

      expect(created).toEqual({ id: 'event-1', summary: 'Reunión' });
    });

    it.each([
      [null, InternalServerErrorException],
      ['Invalid Credentials', UnauthorizedException],
      ['invalid_token', UnauthorizedException],
      ['Unexpected Gaxios Error', InternalServerErrorException],
    ])('maneja errores al crear evento: %s', async (errMessage, expectedException) => {
      if (errMessage) insert.mockRejectedValue(new Error(errMessage));
      else mockNoUser();

      mockUserWithToken('refresh-x');

      await expect(service.createEventForUser(userId, opts)).rejects.toThrow(expectedException);
    });

    it('incluye asistentes correctamente', async () => {
      mockUserWithToken();
      insert.mockResolvedValue({ data: { id: 'event-2' } });

      await service.createEventForUser(userId, opts);

      const call = insert.mock.calls[0][0];
      expect(call.requestBody.attendees).toEqual([{ email: 'a@b.com' }, { email: 'c@d.com' }]);
    });

    it('registra en logger al crear evento', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      mockUserWithToken();
      insert.mockResolvedValue({ data: { id: 'log-1' } });

      await service.createEventForUser(userId, opts);

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('log-1'));
    });
  });
});
