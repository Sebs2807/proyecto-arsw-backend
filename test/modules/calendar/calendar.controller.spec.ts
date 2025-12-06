import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from '../../../src/app/modules/calendar/calendar.controller';
import { CalendarService } from '../../../src/app/modules/calendar/calendar.service';
import { JwtAuthGuard } from '../../../src/app/modules/auth/jwt-auth.guard';
import { BadRequestException } from '@nestjs/common';

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;

  const mockCalendarService = {
    getEventsForUser: jest.fn(),
    createEventForUser: jest.fn(),
  };

  const mockRequest = {
    user: { id: '123', email: 'test@example.com' },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
    jest.clearAllMocks();
  });

  describe('getGoogleEvents', () => {
    it('debe retornar eventos del servicio', async () => {
      const events = [{ id: '1', summary: 'Evento de prueba' }];
      mockCalendarService.getEventsForUser.mockResolvedValueOnce({ events });

      const result = await controller.getGoogleEvents(mockRequest, '2025-11-01', '2025-11-02');

      expect(service.getEventsForUser).toHaveBeenCalledWith('123', '2025-11-01', '2025-11-02');
      expect(result).toEqual({ events });
    });
  });

  describe('createGoogleEvent', () => {
    it('debe crear evento con startDateTime y endDateTime', async () => {
      const body = {
        summary: 'Reunión',
        description: 'Descripción del evento',
        startDateTime: '2025-11-01T10:00:00Z',
        endDateTime: '2025-11-01T11:00:00Z',
        attendees: ['user1@example.com', { email: 'user2@example.com' }],
      };

      const createdEvent = { id: 'abc123', summary: body.summary };
      mockCalendarService.createEventForUser.mockResolvedValueOnce(createdEvent);

      const result = await controller.createGoogleEvent(mockRequest, body);

      expect(service.createEventForUser).toHaveBeenCalledWith('123', {
        summary: body.summary,
        description: body.description,
        start: { dateTime: body.startDateTime },
        end: { dateTime: body.endDateTime },
        attendees: ['user1@example.com', 'user2@example.com'],
      });
      expect(result).toEqual({ created: createdEvent });
    });

    it('debe lanzar BadRequestException si faltan start y end', async () => {
      const body = {
        summary: 'Evento inválido',
        description: 'Sin fechas',
      };

      await expect(controller.createGoogleEvent(mockRequest, body)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe aceptar fechas tipo date', async () => {
      const body = {
        summary: 'Evento día completo',
        description: 'Evento sin hora',
        startDate: '2025-11-01',
        endDate: '2025-11-02',
        attendees: [],
      };

      const createdEvent = { id: 'day1', summary: body.summary };
      mockCalendarService.createEventForUser.mockResolvedValueOnce(createdEvent);

      const result = await controller.createGoogleEvent(mockRequest, body);

      expect(service.createEventForUser).toHaveBeenCalledWith('123', {
        summary: body.summary,
        description: body.description,
        start: { date: body.startDate },
        end: { date: body.endDate },
        attendees: [],
      });
      expect(result).toEqual({ created: createdEvent });
    });

      it('debe lanzar error si el servicio falla en getGoogleEvents', async () => {
      mockCalendarService.getEventsForUser.mockRejectedValueOnce(
        new Error('Service error'),
      );

      await expect(
        controller.getGoogleEvents(mockRequest, '2025-11-01', '2025-11-02'),
      ).rejects.toThrow('Service error');
    });

      it('debe manejar attendees undefined convirtiéndolo en arreglo vacío', async () => {
      const body = {
        summary: 'Evento sin attendees',
        description: 'desc',
        startDateTime: '2025-11-01T12:00:00Z',
        endDateTime: '2025-11-01T13:00:00Z',
      };

      const createdEvent = { id: 'noattendees' };
      mockCalendarService.createEventForUser.mockResolvedValueOnce(createdEvent);

      const result = await controller.createGoogleEvent(mockRequest, body);

      expect(service.createEventForUser).toHaveBeenCalledWith('123', {
        summary: body.summary,
        description: body.description,
        start: { dateTime: body.startDateTime },
        end: { dateTime: body.endDateTime },
        attendees: [],
      });
      expect(result).toEqual({ created: createdEvent });
    });

      it('debe lanzar BadRequestException si falta start pero sí hay end', async () => {
      const body = {
        summary: 'Evento inválido',
        description: 'solo end',
        endDateTime: '2025-11-01T10:00:00Z',
      };

      await expect(
        controller.createGoogleEvent(mockRequest, body),
      ).rejects.toThrow(BadRequestException);
    });

      it('debe propagar el error cuando createEventForUser falla', async () => {
      const body = {
        summary: 'Evento',
        description: 'desc',
        startDateTime: '2025-11-01T10:00:00Z',
        endDateTime: '2025-11-01T11:00:00Z',
        attendees: [],
      };

      mockCalendarService.createEventForUser.mockRejectedValueOnce(
        new Error('Service failed'),
      );

      await expect(
        controller.createGoogleEvent(mockRequest, body),
      ).rejects.toThrow('Service failed');
    });

      it('debe propagar el error cuando createEventForUser falla', async () => {
      const body = {
        summary: 'Evento',
        description: 'desc',
        startDateTime: '2025-11-01T10:00:00Z',
        endDateTime: '2025-11-01T11:00:00Z',
        attendees: [],
      };

      mockCalendarService.createEventForUser.mockRejectedValueOnce(
        new Error('Service failed'),
      );

      await expect(
        controller.createGoogleEvent(mockRequest, body),
      ).rejects.toThrow('Service failed');
    });
  });

    describe('deleteGoogleEvent', () => {
    it('debe llamar al servicio y retornar ok:true', async () => {
      mockCalendarService.deleteEventForUser = jest.fn().mockResolvedValueOnce(true);

      const result = await controller.deleteGoogleEvent(mockRequest, 'evt123');

      expect(mockCalendarService.deleteEventForUser).toHaveBeenCalledWith('123', 'evt123');
      expect(result).toEqual({ ok: true });
    });

    it('debe propagar el error del servicio', async () => {
      mockCalendarService.deleteEventForUser = jest
        .fn()
        .mockRejectedValueOnce(new Error('Delete failed'));

      await expect(controller.deleteGoogleEvent(mockRequest, 'evt123')).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('rescheduleGoogleEvent', () => {
    it('debe reagendar usando startDateTime y endDateTime', async () => {
      mockCalendarService.updateEventForUser = jest
        .fn()
        .mockResolvedValueOnce({ updated: true });

      const body = {
        startDateTime: '2025-11-01T15:00:00Z',
        endDateTime: '2025-11-01T16:00:00Z',
      };

      const result = await controller.rescheduleGoogleEvent(mockRequest, 'evt123', body);

      expect(mockCalendarService.updateEventForUser).toHaveBeenCalledWith('123', 'evt123', {
        start: { dateTime: body.startDateTime },
        end: { dateTime: body.endDateTime },
      });

      expect(result).toEqual({ updated: { updated: true } });
    });

    it('debe aceptar fechas tipo date', async () => {
      mockCalendarService.updateEventForUser = jest
        .fn()
        .mockResolvedValueOnce({ ok: true });

      const body = {
        startDate: '2025-11-01',
        endDate: '2025-11-03',
      };

      const resp = await controller.rescheduleGoogleEvent(mockRequest, 'evt123', body);

      expect(mockCalendarService.updateEventForUser).toHaveBeenCalledWith('123', 'evt123', {
        start: { date: '2025-11-01' },
        end: { date: '2025-11-03' },
      });

      expect(resp).toEqual({ updated: { ok: true } });
    });

    it('debe lanzar BadRequestException si falta start', async () => {
      const body = {
        endDateTime: '2025-11-01T10:00:00Z',
      };

      await expect(
        controller.rescheduleGoogleEvent(mockRequest, 'evt123', body),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar BadRequestException si falta end', async () => {
      const body = {
        startDateTime: '2025-11-01T10:00:00Z',
      };

      await expect(
        controller.rescheduleGoogleEvent(mockRequest, 'evt123', body),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe propagar error del servicio', async () => {
      mockCalendarService.updateEventForUser = jest
        .fn()
        .mockRejectedValueOnce(new Error('Update failed'));

      const body = {
        startDateTime: '2025-11-01T10:00:00Z',
        endDateTime: '2025-11-01T12:00:00Z',
      };

      await expect(
        controller.rescheduleGoogleEvent(mockRequest, 'evt123', body),
      ).rejects.toThrow('Update failed');
    });
  });
});
