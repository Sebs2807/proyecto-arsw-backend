// test/modules/lists/lists.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ListsModule } from '../../../src/app/modules/lists/lists.module';
import { ListService } from '../../../src/app/modules/lists/lists.service';
import { ListController } from '../../../src/app/modules/lists/lists.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { RealtimeGateway } from '../../../src/gateways/realtime.gateway';

describe('ListsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [ListController],
      providers: [
        ListService,
        { provide: getRepositoryToken(ListEntity), useValue: {} },
        { provide: RealtimeGateway, useValue: { emitGlobalUpdate: jest.fn() } },
      ],
    }).compile();
  });

  it('debería estar definido el módulo', () => {
    expect(module).toBeDefined();
  });

  it('debería inyectar el ListService correctamente', () => {
    const service = module.get<ListService>(ListService);
    expect(service).toBeInstanceOf(ListService);
  });

  it('debería tener el ListController disponible', () => {
    const controller = module.get<ListController>(ListController);
    expect(controller).toBeInstanceOf(ListController);
  });
});
