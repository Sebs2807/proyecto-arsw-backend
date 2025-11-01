import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesController } from '../../../src/app/modules/workspaces/workspaces.controller';
import { WorkspacesService } from '../../../src/app/modules/workspaces/workspaces.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('WorkspacesController', () => {
  let controller: WorkspacesController;
  let service: WorkspacesService;

  const mockWorkspacesService = {
    findAllByIdUser: jest.fn(),
  };

  const mockRequest = {
    user: { id: 'user123' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspacesController],
      providers: [
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
      ],
    }).compile();

    controller = module.get<WorkspacesController>(WorkspacesController);
    service = module.get<WorkspacesService>(WorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllWorkspaces', () => {
    it('debería retornar los workspaces del usuario', async () => {
      const expectedWorkspaces = [
        { id: 'w1', name: 'Workspace 1' },
        { id: 'w2', name: 'Workspace 2' },
      ];

      mockWorkspacesService.findAllByIdUser.mockResolvedValue(expectedWorkspaces);

      const result = await controller.getAllWorkspaces(mockRequest as any);

      expect(result).toEqual(expectedWorkspaces);
      expect(service.findAllByIdUser).toHaveBeenCalledWith('user123');
      expect(service.findAllByIdUser).toHaveBeenCalledTimes(1);
    });

    it('debería lanzar InternalServerErrorException si ocurre un error', async () => {
      mockWorkspacesService.findAllByIdUser.mockRejectedValue(new Error('DB error'));

      await expect(controller.getAllWorkspaces(mockRequest as any)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(service.findAllByIdUser).toHaveBeenCalledWith('user123');
    });
  });
});
