import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CardModule } from '../../../src/app/modules/cards/cards.module';
import { CardEntity } from '../../../src/database/entities/card.entity';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { CardService } from '../../../src/app/modules/cards/cards.service';
import { CardController } from '../../../src/app/modules/cards/cards.controller';
import { RealtimeGateway } from '../../../src/gateways/realtime.gateway';

describe('CardModule', () => {
  let moduleRef;

  const mockCardRepo = {};
  const mockListRepo = {};
  const mockCardService = {
    createCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
  };
  const mockRealtimeGateway = { emit: jest.fn() };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CardModule],
    })
      .overrideProvider(getRepositoryToken(CardEntity))
      .useValue(mockCardRepo)
      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue(mockListRepo)
      .overrideProvider(CardService)
      .useValue(mockCardService)
      .overrideProvider(RealtimeGateway)
      .useValue(mockRealtimeGateway)
      .compile();
  });

  it('debería compilar el módulo correctamente', async () => {
    expect(moduleRef).toBeDefined();

    const controller = moduleRef.get(CardController);
    const service = moduleRef.get(CardService);
    const gateway = moduleRef.get(RealtimeGateway);

    expect(controller).toBeInstanceOf(CardController);
    expect(service).toBe(mockCardService);
    expect(gateway).toBe(mockRealtimeGateway);
  });

  it('debería permitir usar el servicio mockeado', async () => {
    const service = moduleRef.get(CardService);
    await service.createCard({ title: 'Tarea 1' });
    expect(service.createCard).toHaveBeenCalledWith({ title: 'Tarea 1' });
  });

  it('debería permitir usar el gateway mockeado', async () => {
    const gateway = moduleRef.get(RealtimeGateway);
    gateway.emit('test_event', { ok: true });
    expect(gateway.emit).toHaveBeenCalledWith('test_event', { ok: true });
  });
});
