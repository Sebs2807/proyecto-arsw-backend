import { Test } from '@nestjs/testing';
import { WorkspacesModule } from '../../../src/app/modules/workspaces/workspaces.module';
import { WorkspacesService } from '../../../src/app/modules/workspaces/workspaces.service';
import { WorkspacesController } from '../../../src/app/modules/workspaces/workspaces.controller';
import { WorkspaceDBService } from '../../../src/database/dbservices/workspace.dbservice';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WorkspaceEntity } from '../../../src/database/entities/workspace.entity';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { CardEntity } from '../../../src/database/entities/card.entity';
import { UserEntity } from '../../../src/database/entities/user.entity';
import { UserWorkspaceEntity } from '../../../src/database/entities/userworkspace.entity';

describe('WorkspacesModule', () => {
  it('debería compilar el módulo correctamente', async () => {
    const mockWorkspaceRepo = {};
    const mockListRepo = {};
    const mockCardRepo = {};
    const mockUserRepo = {};
    const mockUserWorkspaceRepo = {};

    // 🔹 Mock del servicio de base de datos
    const mockDBService = {
      repository: mockWorkspaceRepo,
      getWorkspacesByUserId: jest.fn(),
      createWorkspace: jest.fn(),
    };

    // 🔹 Creamos el módulo de prueba
    const moduleRef = await Test.createTestingModule({
      imports: [WorkspacesModule],
    })
      .overrideProvider(getRepositoryToken(WorkspaceEntity))
      .useValue(mockWorkspaceRepo)
      .overrideProvider(getRepositoryToken(ListEntity))
      .useValue(mockListRepo)
      .overrideProvider(getRepositoryToken(CardEntity))
      .useValue(mockCardRepo)
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepo)
      .overrideProvider(getRepositoryToken(UserWorkspaceEntity))
      .useValue(mockUserWorkspaceRepo)
      .overrideProvider(WorkspaceDBService)
      .useValue(mockDBService)
      .compile();

    const controller = moduleRef.get(WorkspacesController);
    const service = moduleRef.get(WorkspacesService);

    expect(moduleRef).toBeDefined();
    expect(controller).toBeInstanceOf(WorkspacesController);
    expect(service).toBeInstanceOf(WorkspacesService);
  });
});
