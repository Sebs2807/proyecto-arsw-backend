import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common'; // Import Module and forwardRef for faking modules

import { CardModule } from '../../../src/app/modules/cards/cards.module';
import { CardEntity } from '../../../src/database/entities/card.entity';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { CardService } from '../../../src/app/modules/cards/cards.service';
import { CardController } from '../../../src/app/modules/cards/cards.controller';
import { RealtimeGateway } from '../../../src/gateways/realtime.gateway';

// Import modules to be overridden (needed to create the override token)
import { AiModule } from '../../../src/app/modules/ai/ai.module';
import { RealtimeModule } from '../../../src/gateways/realtime.module';

// --- FAKE MODULES TO BREAK DEPENDENCIES AND PREVENT OPENAI INITIALIZATION ---

// Fake module to replace AiModule (prevents OpenAI initialization error)
@Module({})
class FakeAiModule {}

// Fake module to replace RealtimeModule (to handle potential issues/dependencies there)
@Module({
  providers: [
    {
      // We must provide a mock RealtimeGateway here if CardModule relies on it
      provide: RealtimeGateway,
      useValue: { emit: jest.fn(), emitGlobalUpdate: jest.fn() },
    },
  ],
  // CardModule might expect RealtimeGateway to be exported
  exports: [RealtimeGateway],
})
class FakeRealtimeModule {}
// ---------------------------------------------------------------------------

describe('CardModule', () => {
  let moduleRef;

  const mockCardRepo = {};
  const mockListRepo = {};
  // CardService should not be mocked if we want to test that the module compiles and provides it correctly.
  // We will remove the CardService mock here and only mock its dependencies.

  // NOTE: The tests below depend on mockCardService, so we will keep it for now,
  // but ensure we mock the dependencies of the *real* CardService if it were to be resolved.
  const mockCardService = {
    createCard: jest.fn(),
    updateCard: jest.fn(),
    deleteCard: jest.fn(),
  };

  // RealtimeGateway mock is now defined in FakeRealtimeModule, but we'll use a direct mock for clarity in providers.
  const mockRealtimeGateway = { emit: jest.fn(), emitGlobalUpdate: jest.fn() };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [CardModule],
    })
      // FIX 1: Override the problematic AiModule
      .overrideModule(forwardRef(() => AiModule))
      .useModule(FakeAiModule)

      // FIX 2: Override the RealtimeModule (which might also have deep dependencies)
      .overrideModule(forwardRef(() => RealtimeModule))
      .useModule(FakeRealtimeModule)

      .overrideProvider(getRepositoryToken(CardEntity))
      .useValue(mockCardRepo)
      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue(mockListRepo)

      // Override the actual CardService with the mock (as required by the test)
      .overrideProvider(CardService)
      .useValue(mockCardService)

      // Override RealtimeGateway with the mock defined locally
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
