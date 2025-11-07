import { Test, TestingModule } from '@nestjs/testing';
import { CalendarModule } from '../../../src/app/modules/calendar/calendar.module';
import { CalendarController } from '../../../src/app/modules/calendar/calendar.controller';
import { CalendarService } from '../../../src/app/modules/calendar/calendar.service';

jest.mock('../../../src/app/modules/calendar/calendar.service');

describe('CalendarModule (aislado)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const mockDatabaseModule = {
      module: class MockDatabaseModule {},
      providers: [
        { provide: 'DataSource', useValue: {} },
        { provide: 'UsersDBService', useValue: {} },
        { provide: 'CalendarDBService', useValue: {} },
        { provide: 'CardEntityRepository', useValue: {} },
      ],
      exports: [
        'DataSource',
        'UsersDBService',
        'CalendarDBService',
        'CardEntityRepository',
      ],
    };

    moduleRef = await Test.createTestingModule({
      imports: [CalendarModule],
    })
      .overrideModule(require('../../../src/database/database.module').DatabaseModule)
      .useModule(mockDatabaseModule)
      .overrideProvider(CalendarService)
      .useValue({
        getEventsForUser: jest.fn().mockResolvedValue({ events: [] }),
        createEventForUser: jest.fn().mockResolvedValue({ id: 'mock-event' }),
      })
      .compile();
  });

  it('debe compilar el módulo correctamente', () => {
    expect(moduleRef).toBeDefined();
  });

  it('debe tener el CalendarController definido', () => {
    const controller = moduleRef.get<CalendarController>(CalendarController);
    expect(controller).toBeDefined();
  });

  it('debe tener el CalendarService definido y mockeado', () => {
    const service = moduleRef.get<CalendarService>(CalendarService);
    expect(service).toBeDefined();
    expect(typeof service.getEventsForUser).toBe('function');
  });

  it('debe tener las dependencias internas mockeadas sin errores', () => {
    const dataSource = moduleRef.get('DataSource');
    expect(dataSource).toBeDefined();
  });
});
