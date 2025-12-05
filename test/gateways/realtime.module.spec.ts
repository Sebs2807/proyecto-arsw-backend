import { Test, TestingModule } from '@nestjs/testing';
import { RealtimeModule } from '../../src/gateways/realtime.module';
import { RealtimeGateway } from '../../src/gateways/realtime.gateway';
import { Module } from '@nestjs/common';

// Mock Services first
jest.mock('../../src/app/modules/cards/cards.service', () => ({ CardService: class {} }));
jest.mock('../../src/app/modules/ai/services/openAi-live.service', () => ({
  OpenAILiveService: class {},
}));

// Mock Modules with metadata
jest.mock('../../src/app/modules/cards/cards.module', () => {
  const { Module } = jest.requireActual('@nestjs/common');
  const { CardService } = require('../../src/app/modules/cards/cards.service');
  @Module({
    providers: [CardService],
    exports: [CardService],
  })
  class MockCardModule {}
  return { CardModule: MockCardModule };
});

jest.mock('../../src/app/modules/ai/ai.module', () => {
  const { Module } = jest.requireActual('@nestjs/common');
  const { OpenAILiveService } = require('../../src/app/modules/ai/services/openAi-live.service');
  @Module({
    providers: [OpenAILiveService],
    exports: [OpenAILiveService],
  })
  class MockAiModule {}
  return { AiModule: MockAiModule };
});

describe('RealtimeModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [RealtimeModule],
    }).compile();
  });

  it('debería compilar correctamente el módulo', async () => {
    const module = moduleRef.get<RealtimeModule>(RealtimeModule);
    expect(module).toBeDefined();
  });

  it('debería proveer el RealtimeGateway', async () => {
    const gateway = moduleRef.get<RealtimeGateway>(RealtimeGateway);
    expect(gateway).toBeInstanceOf(RealtimeGateway);
  });

  it('debería exportar el RealtimeGateway', async () => {
    const testModule = await Test.createTestingModule({
      imports: [RealtimeModule],
    }).compile();

    const exportedGateway = testModule.get(RealtimeGateway);
    expect(exportedGateway).toBeDefined();
    expect(exportedGateway).toBeInstanceOf(RealtimeGateway);
  });
});
