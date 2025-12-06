import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { AgentsService } from 'src/app/modules/agents/agents.service';
import { AgentsDBService } from 'src/database/dbservices/agents.dbservice';
import { BoardsDBService } from 'src/database/dbservices/boards.dbservice';
import { ListsDBService } from 'src/database/dbservices/lists.dbservice';
import { WorkspacesDBService } from 'src/database/dbservices/workspaces.dbservice';

import { In } from 'typeorm';
import { AgentEntity } from '../../../database/entities/agent.entity';

describe('AgentsService', () => {
  let service: AgentsService;

  // ─────────────────────────────────────────────
  // MOCKS
  // ─────────────────────────────────────────────
  const mockAgentsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockAgentsDBService = {
    repository: mockAgentsRepository,
  };

  const mockBoardsRepository = {
    findBy: jest.fn(),
  };

  const mockBoardsDBService = {
    repository: mockBoardsRepository,
  };

  const mockListsRepository = {
    findBy: jest.fn(),
  };

  const mockListsDBService = {
    repository: mockListsRepository,
  };

  const mockWorkspacesRepository = {
    findOne: jest.fn(),
  };

  const mockWorkspacesDBService = {
    repository: mockWorkspacesRepository,
  };

  // QueryBuilder mock
  const mockQueryBuilder: any = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    mockAgentsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentsService,
        { provide: AgentsDBService, useValue: mockAgentsDBService },
        { provide: BoardsDBService, useValue: mockBoardsDBService },
        { provide: ListsDBService, useValue: mockListsDBService },
        { provide: WorkspacesDBService, useValue: mockWorkspacesDBService },
      ],
    }).compile();

    service = module.get<AgentsService>(AgentsService);
  });

  // ─────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────
  describe('createAgent', () => {
    it('should create and save an agent', async () => {
      const dto = {
        name: 'Test Agent',
        temperature: 0.7,
        maxTokens: 1000,
        flowConfig: {},
        boardIds: ['b1'],
        listIds: ['l1'],
        workspaceId: 'w1',
      };

      mockWorkspacesRepository.findOne.mockResolvedValue({ id: 'w1' });
      mockBoardsRepository.findBy.mockResolvedValue([{ id: 'b1' }]);
      mockListsRepository.findBy.mockResolvedValue([{ id: 'l1' }]);

      mockAgentsRepository.create.mockReturnValue({ id: '123', ...dto });
      mockAgentsRepository.save.mockResolvedValue({ id: '123', ...dto });

      const result = await service.createAgent(dto);

      expect(result.id).toBe('123');
      expect(mockAgentsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if workspace does not exist', async () => {
      mockWorkspacesRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAgent({
          name: 'Agent',
          temperature: 0.5,
          maxTokens: 500,
          flowConfig: {},
          boardIds: [],
          listIds: [],
          workspaceId: 'invalid',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ALL
  // ─────────────────────────────────────────────
  describe('findAll', () => {
    it('should return paginated agents', async () => {
      const query = {
        search: '',
        boardId: null,
        workspaceId: 'w1',
        limit: 10,
        page: 1,
      };

      mockQueryBuilder.getManyAndCount.mockResolvedValue([[{ id: '1' }], 1]);

      const result = await service.findAll(query);

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
    });

    it('should throw InternalServerErrorException if workspaceId is missing', async () => {
    await expect(
        service.findAll({
        search: '',
        boardId: undefined,
        page: 1,
        limit: 10,
        workspaceId: undefined, 
        }),
    ).rejects.toThrow(InternalServerErrorException);
    });


    it('should throw InternalServerErrorException on error', async () => {
      mockQueryBuilder.getManyAndCount.mockRejectedValue(new Error('DB error'));

      await expect(
        service.findAll({
          search: '',
          workspaceId: 'w1',
          boardId: null,
          limit: 10,
          page: 1,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // ─────────────────────────────────────────────
  // FIND ONE
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return agent', async () => {
      mockAgentsRepository.findOne.mockResolvedValue({ id: '123' });

      const result = await service.findOne('123');

      expect(result.id).toBe('123');
    });

    it('should throw NotFoundException', async () => {
      mockAgentsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────
  describe('updateAgent', () => {
    it('should update fields and save', async () => {
      const existing = {
        id: 'a1',
        name: 'Old',
        temperature: 0.2,
        maxTokens: 200,
        boards: [],
        lists: [],
        workspace: { id: 'w1' },
      };

      mockAgentsRepository.findOne.mockResolvedValue(existing);
      mockWorkspacesRepository.findOne.mockResolvedValue({ id: 'w2' });
      mockBoardsRepository.findBy.mockResolvedValue([{ id: 'b1' }]);
      mockListsRepository.findBy.mockResolvedValue([{ id: 'l1' }]);
      mockAgentsRepository.save.mockResolvedValue({ id: 'a1', name: 'New' });

      const dto = {
        name: 'New',
        boardIds: ['b1'],
        listIds: ['l1'],
        workspaceId: 'w2',
      };

      const result = await service.updateAgent('a1', dto);

      expect(result.name).toBe('New');
      expect(mockAgentsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if agent not found', async () => {
      mockAgentsRepository.findOne.mockResolvedValue(null);

      await expect(service.updateAgent('invalid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // DELETE
  // ─────────────────────────────────────────────
  describe('deleteAgent', () => {
    it('should delete agent', async () => {
      mockAgentsRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.deleteAgent('123');

      expect(result).toEqual({ deleted: true });
    });

    it('should throw NotFoundException if nothing deleted', async () => {
      mockAgentsRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteAgent('x')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
