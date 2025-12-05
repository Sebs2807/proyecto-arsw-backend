import { Test, TestingModule } from '@nestjs/testing';
import { UsersWorkspacesController } from '../../../src/app/modules/users-workspaces/usersworkspaces.controller';
import { UsersWorkspacesService } from '../../../src/app/modules/users-workspaces/usersworkspaces.service';
import { JwtAuthGuard } from '../../../src/app/modules/auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('UsersWorkspacesController', () => {
  let controller: UsersWorkspacesController;
  let service: UsersWorkspacesService;

  const mockService = {
    addUserToWorkspace: jest.fn(),
    updateUserWorkspace: jest.fn(),
    removeUserFromWorkspace: jest.fn(),
  };

  const mockJwtGuard = { canActivate: jest.fn(() => true) };

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [UsersWorkspacesController],
      providers: [
        {
          provide: UsersWorkspacesService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtGuard)
      .compile();

    controller = moduleRef.get<UsersWorkspacesController>(UsersWorkspacesController);
    service = moduleRef.get<UsersWorkspacesService>(UsersWorkspacesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call addUserToWorkspace with correct params', async () => {
    const dto = {
      userId: 'u123',
      workspaceId: 'w456',
      role: 'admin',
    };

    mockService.addUserToWorkspace.mockResolvedValue({ success: true });

    const result = await controller.addUserToWorkspace(dto);

    expect(service.addUserToWorkspace).toHaveBeenCalledWith(
      dto.userId,
      dto.workspaceId,
      dto.role,
    );
    expect(result).toEqual({ success: true });
  });

  it('should call updateUserWorkspace with correct params', async () => {
    const dto = {
      userId: 'u123',
      workspaceId: 'w456',
      role: 'viewer',
    };

    mockService.updateUserWorkspace.mockResolvedValue({ updated: true });

    const result = await controller.updateUserWorkspace(dto);

    expect(service.updateUserWorkspace).toHaveBeenCalledWith(
      dto.userId,
      dto.workspaceId,
      dto.role,
    );
    expect(result).toEqual({ updated: true });
  });

  it('should call removeUserFromWorkspace with correct params', async () => {
    const body = {
      userId: 'u123',
      workspaceId: 'w456',
    };

    mockService.removeUserFromWorkspace.mockResolvedValue({ removed: true });

    const result = await controller.removeUserFromWorkspace(body);

    expect(service.removeUserFromWorkspace).toHaveBeenCalledWith(
      body.userId,
      body.workspaceId,
    );
    expect(result).toEqual({ removed: true });
  });
});
