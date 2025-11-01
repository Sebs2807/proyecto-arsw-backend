// test/modules/lists/lists.module.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ListsModule } from '../../../src/app/modules/lists/lists.module';
import { ListService } from '../../../src/app/modules/lists/lists.service';
import { ListController } from '../../../src/app/modules/lists/lists.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';

describe('ListsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ListsModule],
    })
      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue({}) 
      .compile();
  });

  it('debería estar definido el módulo', () => {
    const listsModule = module.get<ListsModule>(ListsModule);
    expect(listsModule).toBeDefined();
  });

  it('debería proporcionar el ListService', () => {
    const listService = module.get<ListService>(ListService);
    expect(listService).toBeDefined();
  });

  it('debería tener el ListController registrado', () => {
    const listController = module.get<ListController>(ListController);
    expect(listController).toBeDefined();
  });
});
