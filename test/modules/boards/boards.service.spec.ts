import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { UsersDBService } from 'src/database/dbservices/users.dbservice';
import { BoardEntity } from 'src/database/entities/board.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { ForbiddenException, InternalServerErrorException } from '@nestjs/common';

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('BoardsService', () => {
  let service: BoardsService;
  let boardsDbService: BoardsDBService;
  let usersDbService: UsersDBService;

  const mockUser: UserEntity = { id: '1', email: 'test@example.com' } as UserEntity;
  const mockWorkspace = {
    id: 'ws1',
    name: 'Mock Workspace',
    users: [],
    boards: [],
    agent: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBoard: BoardEntity = {
    id: '1',
    title: 'Test Board',
    description: 'Descripcion del board',
    createdBy: mockUser,
    members: [mockUser],
    workspace: mockWorkspace,
    color: '#FFFFFF',
    createdAt: new Date(),
    updatedAt: new Date(),
    lists: [],
    agents: [],
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockBoard),
    save: jest.fn().mockResolvedValue(mockBoard),
    findOne: jest.fn().mockResolvedValue(mockBoard),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockBoardsDbService = {
    repository: mockRepository,
  };

  const mockUsersDbService = {
    findById: jest.fn().mockResolvedValue(mockUser),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: BoardsDBService, useValue: mockBoardsDbService },
        { provide: UsersDBService, useValue: mockUsersDbService },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    boardsDbService = module.get<BoardsDBService>(BoardsDBService);
    usersDbService = module.get<UsersDBService>(UsersDBService);

    jest.clearAllMocks();
  });

  describe('createBoard', () => {
    it('debe crear un board correctamente', async () => {
      const result = await service.createBoard(
        'Test Board',
        'Test Description',
        '1',
        ['1'],
        'ws1',
        '#123456',
      );

      expect(usersDbService.findById).toHaveBeenCalledWith('1');
      expect(boardsDbService.repository.create).toHaveBeenCalledWith({
        title: 'Test Board',
        description: 'Test Description',
        createdBy: { id: '1' },
        members: [mockUser],
        workspace: { id: 'ws1' },
        color: '#123456',
      });
      expect(boardsDbService.repository.save).toHaveBeenCalled();
      expect(result).toEqual(mockBoard);
    });

    it('debe ignorar miembros nulos', async () => {
      mockUsersDbService.findById.mockResolvedValueOnce(mockUser).mockResolvedValueOnce(null);

      await service.createBoard('Board', '', '1', ['1', '2'], 'ws1');
      expect(usersDbService.findById).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    const mockQuery = {
      leftJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockBoard], 1]),
    };

    beforeEach(() => {
      mockRepository.createQueryBuilder.mockReturnValue(mockQuery);
    });

    it('debe retornar lista de boards con paginación', async () => {
      const queryBoard = { search: '', workspaceId: 'ws1', page: 1, limit: 10 };
      const result = await service.findAll(queryBoard as any, '1');

      expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQuery.where).toHaveBeenCalledWith('workspace.id = :workspaceId', {
        workspaceId: 'ws1',
      });
      expect(result).toHaveProperty('items');
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('debe lanzar ForbiddenException si falla la consulta', async () => {
      mockQuery.getManyAndCount.mockRejectedValueOnce(new Error('DB Error'));

      await expect(
        service.findAll({ workspaceId: 'ws1', page: 1, limit: 10 } as any, '1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findOne', () => {
    it('debe retornar un board', async () => {
      const result = await service.findOne('1');
      expect(boardsDbService.repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockBoard);
    });
  });

  describe('updateBoard', () => {
    it('debe actualizar un board y retornarlo', async () => {
      mockRepository.update.mockResolvedValue({});

      const result = await service.updateBoard('1', { title: 'Updated' });

      expect(mockRepository.update).toHaveBeenCalledWith('1', { title: 'Updated' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toEqual(mockBoard);
    });
  });

  describe('BoardsService - manejo de errores en updateBoard', () => {
    it('debe lanzar InternalServerErrorException si update lanza error inesperado', async () => {
      mockRepository.update.mockImplementationOnce(() => {
        throw new Error('unexpected fail');
      });

      await expect(service.updateBoard('1', { title: 'Crash test' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar InternalServerErrorException si no se encuentra el board al actualizar con memberIds', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.updateBoard('1', { memberIds: ['1'] })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe lanzar InternalServerErrorException si el update del repositorio falla', async () => {
      mockRepository.update.mockRejectedValueOnce(new Error('DB fail'));

      await expect(service.updateBoard('1', { title: 'fallo de base de datos' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('debe manejar correctamente el caso de memberIds vacíos sin lanzar error', async () => {
      const board = { id: '1', members: [] };
      mockRepository.findOne.mockResolvedValue(board);
      mockRepository.save = jest.fn().mockResolvedValue(board);

      const result = await service.updateBoard('1', { memberIds: [] });
      expect(result).toEqual(board);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteBoard', () => {
    it('debe eliminar un board correctamente', async () => {
      const result = await service.deleteBoard('1');
      expect(mockRepository.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ deleted: true });
    });
  });
});
