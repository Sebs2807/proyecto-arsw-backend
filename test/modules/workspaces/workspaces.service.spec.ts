import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from '../../../src/app/modules/workspaces/workspaces.service';
import { WorkspacesDBService } from '../../../src/database/dbservices/workspaces.dbservice';
import { WorkspaceEntity } from '../../../src/database/entities/workspace.entity';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let dbService: WorkspacesDBService;

  const mockWorkspaceRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockWorkspaceDBService = {
    repository: mockWorkspaceRepo,
    getWorkspacesByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        {
          provide: WorkspacesDBService,
          useValue: mockWorkspaceDBService,
        },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('createWorkspace', () => {
    it('debería crear un workspace correctamente', async () => {
      const mockWorkspace: Partial<WorkspaceEntity> = { id: 'w1', name: 'Workspace 1' };

      mockWorkspaceRepo.create.mockReturnValue(mockWorkspace);
      mockWorkspaceRepo.save.mockResolvedValue(mockWorkspace);

      const result = await service.createWorkspace('Workspace 1');

      expect(mockWorkspaceRepo.create).toHaveBeenCalledWith({ name: 'Workspace 1' });
      expect(mockWorkspaceRepo.save).toHaveBeenCalledWith(mockWorkspace);
      expect(result).toEqual(mockWorkspace);
    });

    it('debería lanzar error si ocurre un fallo al crear el workspace', async () => {
      mockWorkspaceRepo.create.mockImplementation(() => {
        throw new Error('DB Error');
      });

      await expect(service.createWorkspace('ErrorWorkspace')).rejects.toThrow('DB Error');
    });
  });

  describe('findAllByIdUser', () => {
    it('debería retornar los workspaces de un usuario', async () => {
      const mockWorkspaces: WorkspaceEntity[] = [
        { id: '1', name: 'Workspace 1' } as WorkspaceEntity,
        { id: '2', name: 'Workspace 2' } as WorkspaceEntity,
      ];

      mockWorkspaceDBService.getWorkspacesByUserId.mockResolvedValue(mockWorkspaces);

      const result = await service.findAllByIdUser('user123');

      expect(result).toEqual(mockWorkspaces);
      expect(mockWorkspaceDBService.getWorkspacesByUserId).toHaveBeenCalledWith('user123');
      expect(mockWorkspaceDBService.getWorkspacesByUserId).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar error si ocurre un fallo al obtener los workspaces', async () => {
      mockWorkspaceDBService.getWorkspacesByUserId.mockRejectedValue(new Error('DB Error'));

      await expect(service.findAllByIdUser('user123')).rejects.toThrow('DB Error');
      expect(mockWorkspaceDBService.getWorkspacesByUserId).toHaveBeenCalledWith('user123');
    });
  });
});
