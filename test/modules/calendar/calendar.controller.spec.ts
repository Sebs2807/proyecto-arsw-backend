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
  });
});
