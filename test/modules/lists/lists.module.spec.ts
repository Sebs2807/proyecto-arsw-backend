import { Test, TestingModule } from '@nestjs/testing';
import { ListsModule } from '../../../src/app/modules/lists/lists.module';

import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';

import { ListService } from '../../../src/app/modules/lists/lists.service';
import { ListController } from '../../../src/app/modules/lists/lists.controller';
import { RealtimeGateway } from '../../../src/gateways/realtime.gateway';
import { RealtimeModule } from '../../../src/gateways/realtime.module';
import { AiModule } from '../../../src/app/modules/ai/ai.module'; // Import to override

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../src/database/database.module';

@Module({})
class FakeDatabaseModule {}

// Fake module to replace the potentially problematic RealtimeModule
@Module({
  providers: [
    {
      // Provide the mocked RealtimeGateway inside the fake module
      provide: RealtimeGateway,
      useValue: {
        emitGlobalUpdate: jest.fn(),
      },
    },
  ],
  exports: [RealtimeGateway], // Export the mocked gateway
})
class FakeRealtimeModule {}

// Fake module to replace AiModule
@Module({})
class FakeAiModule {}

// Fake module to replace ElevenLabsModule
@Module({})
class FakeElevenLabsModule {}

describe('ListsModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ListsModule],
    })
      // Override complex external dependencies with fake modules
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)

      .overrideModule(RealtimeModule)
      .useModule(FakeRealtimeModule)

      // **NEW FIX**: Override AiModule to prevent deep dependency resolution
      .overrideModule(AiModule)
      .useModule(FakeAiModule)

      // Override the TypeORM repository for ListEntity
      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      })

      .compile();
  });

  it('debería estar definido el módulo', () => {
    expect(moduleRef).toBeDefined();
  });

  it('debería inyectar el ListService correctamente', () => {
    const service = moduleRef.get(ListService);
    expect(service).toBeInstanceOf(ListService);
  });

  it('debería tener el ListController disponible', () => {
    const controller = moduleRef.get(ListController);
    expect(controller).toBeInstanceOf(ListController);
  });
});
