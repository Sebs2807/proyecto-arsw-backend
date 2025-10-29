// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersWorkspacesService } from 'src/app/modules/users-workspaces/usersworkspaces.service';
// import { UsersWorkspacesDBService } from 'src/database/dbservices/usersworkspaces.dbservice';
// import { Role } from 'src/database/entities/userworkspace.entity';
// import { Logger } from '@nestjs/common';

// describe('UsersWorkspacesService', () => {
//   let service: UsersWorkspacesService;
//   let dbService: jest.Mocked<UsersWorkspacesDBService>;

//   beforeEach(async () => {
//     // 🧠 Mock del repositorio y del servicio DB
//     const mockRepository = {
//       create: jest.fn(),
//       save: jest.fn(),
//     };

//     const mockDBService = {
//       repository: mockRepository,
//     } as unknown as jest.Mocked<UsersWorkspacesDBService>;

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersWorkspacesService,
//         { provide: UsersWorkspacesDBService, useValue: mockDBService },
//       ],
//     }).compile();

//     service = module.get<UsersWorkspacesService>(UsersWorkspacesService);
//     dbService = module.get(UsersWorkspacesDBService);

//     // 🔇 Evita que el logger ensucie la consola durante las pruebas
//     jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
//     jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('debería estar definido', () => {
//     expect(service).toBeDefined();
//   });

//   it('debería agregar un usuario a un workspace correctamente', async () => {
//     const userId = 'user123';
//     const workspaceId = 'ws123';
//     const role = Role.ADMIN;

//     const createdEntity = { id: 'newRel', user: { id: userId }, workspace: { id: workspaceId }, role };
//     const savedEntity = { ...createdEntity, saved: true };

//     dbService.repository.create.mockReturnValue(createdEntity);
//     dbService.repository.save.mockResolvedValue(savedEntity);

//     const result = await service.addUserToWorkspace(userId, workspaceId, role);

//     expect(dbService.repository.create).toHaveBeenCalledWith({
//       user: { id: userId },
//       workspace: { id: workspaceId },
//       role,
//     });
//     expect(dbService.repository.save).toHaveBeenCalledWith(createdEntity);
//     expect(result).toEqual(savedEntity);
//   });

//     it('debería lanzar un error si ocurre un fallo en el repositorio', async () => {
//     dbService.repository.create.mockImplementation(() => {
//         throw new Error('DB error');
//     });

//     await expect(async () => {
//         await service.addUserToWorkspace('user123', 'ws123', Role.MEMBER);
//     }).rejects.toThrow('DB error');

//     expect(Logger.prototype.error).toHaveBeenCalled();
//     });

// });
