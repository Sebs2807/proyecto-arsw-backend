import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from 'src/app/modules/workspaces/workspaces.controller';
import { WorkspacesService } from 'src/app/modules/workspaces/workspaces.service';
import { WorkspaceEntity } from 'src/database/entities/workspace.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('WorkspacesModule', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    const mockWorkspaceRepo = {};
    const mockService = {
      findAll: jest.fn(),
      create: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: mockService,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: mockWorkspaceRepo,
        },
      ],
    }).compile();
  });

  it('debería compilar el módulo correctamente', async () => {
    const controller = moduleRef.get(WorkspacesController);
    const service = moduleRef.get(WorkspacesService);

    expect(controller).toBeInstanceOf(WorkspacesController);
    expect(service).toBeDefined();
  });
});
