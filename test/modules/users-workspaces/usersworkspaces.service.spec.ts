import { Test, TestingModule } from '@nestjs/testing';
import { UsersWorkspacesService } from 'src/app/modules/users-workspaces/usersworkspaces.service';
import { UsersWorkspacesDBService } from 'src/database/dbservices/usersworkspaces.dbservice';
import { Role } from 'src/database/entities/userworkspace.entity';
import { Logger } from '@nestjs/common';

describe('UsersWorkspacesService', () => {
  let service: UsersWorkspacesService;
  let dbService: jest.Mocked<UsersWorkspacesDBService>;

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockDBService = {
      repository: mockRepository,
    } as unknown as jest.Mocked<UsersWorkspacesDBService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersWorkspacesService,
        { provide: UsersWorkspacesDBService, useValue: mockDBService },
      ],
    }).compile();

    service = module.get<UsersWorkspacesService>(UsersWorkspacesService);
    dbService = module.get(UsersWorkspacesDBService);

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  // ✅ addUserToWorkspace OK
  it('debería agregar un usuario a un workspace correctamente', async () => {
    const userId = 'user123';
    const workspaceId = 'ws123';
    const role = Role.ADMIN;

    const createdEntity = { id: 'newRel', user: { id: userId }, workspace: { id: workspaceId }, role };
    const savedEntity = { ...createdEntity, saved: true };

    dbService.repository.create.mockReturnValue(createdEntity);
    dbService.repository.save.mockResolvedValue(savedEntity);

    const result = await service.addUserToWorkspace(userId, workspaceId, role);

    expect(dbService.repository.create).toHaveBeenCalledWith({
      user: { id: userId },
      workspace: { id: workspaceId },
      role,
    });
    expect(dbService.repository.save).toHaveBeenCalledWith(createdEntity);
    expect(result).toEqual(savedEntity);
  });

  // 🚨 addUserToWorkspace Error
  it('debería lanzar un error si ocurre un fallo en el repositorio', async () => {
    dbService.repository.create.mockImplementation(() => {
      throw new Error('DB error');
    });

    await expect(
      service.addUserToWorkspace('user123', 'ws123', Role.MEMBER),
    ).rejects.toThrow('DB error');

    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  // ✅ updateUserWorkspace OK
  it('debería actualizar el rol de un usuario en un workspace', async () => {
    const userId = 'user123';
    const workspaceId = 'ws123';
    const role = Role.ADMIN;

    const entity = { id: 'rel1', user: { id: userId }, workspace: { id: workspaceId }, role: Role.MEMBER };
    const updatedEntity = { ...entity, role };

    dbService.repository.findOne.mockResolvedValue(entity);
    dbService.repository.save.mockResolvedValue(updatedEntity);

    const result = await service.updateUserWorkspace(userId, workspaceId, role);

    expect(dbService.repository.findOne).toHaveBeenCalledWith({
      where: { user: { id: userId }, workspace: { id: workspaceId } },
    });
    expect(dbService.repository.save).toHaveBeenCalledWith({ ...entity, role });
    expect(result).toEqual(updatedEntity);
  });

  // 🚨 updateUserWorkspace Not Found
  it('debería lanzar un error si el UserWorkspace no existe al actualizar', async () => {
    dbService.repository.findOne.mockResolvedValue(null);

    await expect(
      service.updateUserWorkspace('user123', 'ws123', Role.ADMIN),
    ).rejects.toThrow('UserWorkspace not found');

    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  // ✅ removeUserFromWorkspace OK
  it('debería eliminar un usuario de un workspace correctamente', async () => {
    const userId = 'user123';
    const workspaceId = 'ws123';
    const entity = { id: 'rel1', user: { id: userId }, workspace: { id: workspaceId } };
    const removedEntity = { ...entity, removed: true };

    dbService.repository.findOne.mockResolvedValue(entity);
    dbService.repository.remove.mockResolvedValue(removedEntity);

    const result = await service.removeUserFromWorkspace(userId, workspaceId);

    expect(dbService.repository.findOne).toHaveBeenCalledWith({
      where: { user: { id: userId }, workspace: { id: workspaceId } },
    });
    expect(dbService.repository.remove).toHaveBeenCalledWith(entity);
    expect(result).toEqual(removedEntity);
  });

  // 🚨 removeUserFromWorkspace Not Found
  it('debería lanzar un error si el UserWorkspace no existe al eliminar', async () => {
    dbService.repository.findOne.mockResolvedValue(null);

    await expect(
      service.removeUserFromWorkspace('user123', 'ws123'),
    ).rejects.toThrow('UserWorkspace not found');

    expect(Logger.prototype.warn).toHaveBeenCalled();
  });
});
