import { Test, TestingModule } from '@nestjs/testing';
import { ListsModule } from '../../../src/app/modules/lists/lists.module';

import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';

import { ListService } from '../../../src/app/modules/lists/lists.service';
import { ListController } from '../../../src/app/modules/lists/lists.controller';
import { RealtimeGateway } from '../../../src/gateways/realtime.gateway';

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../src/database/database.module';


@Module({})
class FakeDatabaseModule {}

describe('ListsModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ListsModule],
    })
      .overrideModule(DatabaseModule)
      .useModule(FakeDatabaseModule)

      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue({
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
      })

      .overrideProvider(RealtimeGateway)
      .useValue({
        emitGlobalUpdate: jest.fn(),
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
