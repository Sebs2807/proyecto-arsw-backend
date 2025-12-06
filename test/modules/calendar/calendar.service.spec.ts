import {
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CalendarService } from '../../../src/app/modules/calendar/calendar.service';
import { google } from 'googleapis';

jest.mock('googleapis', () => {
  const _list = jest.fn();
  const _insert = jest.fn();
  const _delete = jest.fn();
  const _patch = jest.fn();
  const _getAccessToken = jest.fn().mockResolvedValue('token');

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
          delete: _delete,
          patch: _patch,
        },
      })),
      __mocks: { list: _list, insert: _insert, delete: _delete, patch: _patch, getAccessToken: _getAccessToken },
    },
  };
});

describe('CalendarService', () => {
  let service: CalendarService;
  let usersDb: { findById: jest.Mock };

  const userId = 'uid-1';
  const { __mocks: mocks } = google as any;
  const { list, insert, delete: del, patch, getAccessToken } = mocks;

  beforeEach(() => {
    usersDb = { findById: jest.fn() };
    [list, insert, del, patch, getAccessToken].forEach((fn) => fn.mockReset());
    service = new CalendarService(usersDb as any);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  const mockUser = (token = 't1') =>
    usersDb.findById.mockResolvedValue({ googleRefreshToken: token });

  const noUser = () => usersDb.findById.mockResolvedValue(null);
  const userNoToken = () => usersDb.findById.mockResolvedValue({ googleRefreshToken: null });

  // ---------------------------------------------------------------
  // TEST getAuthClient()
  // ---------------------------------------------------------------
  it('getAuthClient lanza Unauthorized si usuario no existe', async () => {
    noUser();
    await expect(
      service['getAuthClient']('x')
    ).rejects.toThrow(UnauthorizedException);
  });

  it('getAuthClient lanza Unauthorized si usuario no tiene refreshToken', async () => {
    userNoToken();
    await expect(
      service['getAuthClient']('y')
    ).rejects.toThrow(UnauthorizedException);
  });

  // ---------------------------------------------------------------
  // TEST handleGoogleError()
  // ---------------------------------------------------------------
  it('handleGoogleError → Unauthorized: invalid_grant', () => {
    expect(() =>
      service['handleGoogleError'](new Error('invalid_grant'), 'x')
    ).toThrow(UnauthorizedException);
  });

  it('handleGoogleError → Unauthorized: invalid_token', () => {
    expect(() =>
      service['handleGoogleError'](new Error('invalid_token'), 'x')
    ).toThrow(UnauthorizedException);
  });

  it('handleGoogleError → Unauthorized: Invalid Credentials', () => {
    expect(() =>
      service['handleGoogleError'](new Error('Invalid Credentials'), 'x')
    ).toThrow(UnauthorizedException);
  });

  it('handleGoogleError → InternalError: API disabled', () => {
    expect(() =>
      service['handleGoogleError'](new Error('is disabled'), 'x')
    ).toThrow(InternalServerErrorException);
  });

  it('handleGoogleError → InternalError: project not used', () => {
    expect(() =>
      service['handleGoogleError'](new Error('has not been used in project'), 'x')
    ).toThrow(InternalServerErrorException);
  });

  it('handleGoogleError → InternalError general', () => {
    expect(() =>
      service['handleGoogleError'](new Error('cualquier'), 'x')
    ).toThrow(InternalServerErrorException);
  });

  // ---------------------------------------------------------------
  // getEventsForUser()
  // ---------------------------------------------------------------
  it('getEventsForUser → retorna eventos', async () => {
    mockUser();
    list.mockResolvedValue({
      data: { items: [{ id: '1', start: {}, end: {}, summary: 'Test' }] },
    });

    const res = await service.getEventsForUser(userId, 'a', 'b');
    expect(res.events.length).toBe(1);
  });

  it('getEventsForUser → retorna mensaje No events', async () => {
    mockUser();
    list.mockResolvedValue({ data: { items: [] } });

    const res = await service.getEventsForUser(userId, 'a', 'b');
    expect(res).toEqual({ events: [], message: 'No events' });
  });

  it('getEventsForUser → maneja error', async () => {
    mockUser();
    list.mockRejectedValue(new Error('Invalid Credentials'));

    await expect(service.getEventsForUser(userId, 'a', 'b')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  // ---------------------------------------------------------------
  // createEventForUser()
  // ---------------------------------------------------------------
  const createOpts = {
    summary: 'Test',
    start: { dateTime: '2025-05-01' },
    end: { dateTime: '2025-05-01' },
    attendees: ['a@b.com'],
  };

  it('createEventForUser → OK', async () => {
    mockUser();
    insert.mockResolvedValue({ data: { id: 'ev1' } });

    const res = await service.createEventForUser(userId, createOpts);
    expect(res.id).toBe('ev1');
  });

  it('createEventForUser → error manejado', async () => {
    mockUser();
    insert.mockRejectedValue(new Error('Invalid Credentials'));

    await expect(
      service.createEventForUser(userId, createOpts),
    ).rejects.toThrow(UnauthorizedException);
  });

  // ---------------------------------------------------------------
  // deleteEventForUser()
  // ---------------------------------------------------------------
  it('deleteEventForUser → OK', async () => {
    mockUser();
    del.mockResolvedValue({});

    const res = await service.deleteEventForUser(userId, 'e1');
    expect(res).toEqual({ ok: true });
  });

  it('deleteEventForUser → error', async () => {
    mockUser();
    del.mockRejectedValue(new Error('invalid_token'));

    await expect(
      service.deleteEventForUser(userId, 'x'),
    ).rejects.toThrow(UnauthorizedException);
  });

  // ---------------------------------------------------------------
  // updateEventForUser()
  // ---------------------------------------------------------------
  it('updateEventForUser actualiza start', async () => {
    mockUser();
    patch.mockResolvedValue({ data: { id: 'up1' } });

    const res = await service.updateEventForUser(userId, 'x', {
      start: { dateTime: '2025-06-01' },
    });

    expect(res.id).toBe('up1');
  });

  it('updateEventForUser actualiza end', async () => {
    mockUser();
    patch.mockResolvedValue({ data: { id: 'up2' } });

    const res = await service.updateEventForUser(userId, 'x', {
      end: { date: '2025-07-01' },
    });

    expect(res.id).toBe('up2');
  });

  it('updateEventForUser → error', async () => {
    mockUser();
    patch.mockRejectedValue(new Error('invalid_grant'));

    await expect(
      service.updateEventForUser(userId, 'x', {}),
    ).rejects.toThrow(UnauthorizedException);
  });
});
