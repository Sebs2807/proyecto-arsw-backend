import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from '../../../src/app/modules/lists/lists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { Repository } from 'typeorm';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';
import { ListsDBService } from '../../../src/database/dbservices/lists.dbservice';
import { BoardsDBService } from '../../../src/database/dbservices/boards.dbservice';
import { UpdateResult, DeleteResult } from 'typeorm';

describe('ListService', () => {
  let service: ListService;
  let repository: any;
  let realtimeGateway: any;
  const mockListsDbService = { repository: null } as any;
  const mockBoardsDbService = { repository: null } as any;

  const mockList: ListEntity = {
    id: '1',
    title: 'To Do',
    description: undefined,
    order: 1,
    board: { id: '1' } as any,
    cards: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ListEntity;

  beforeEach(async () => {
    // Provide ListsDBService and BoardsDBService with a repository mock so the
    // service constructor resolves in the testing module.
    repository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
    };

    mockListsDbService.repository = repository;
    mockBoardsDbService.repository = { findOne: jest.fn().mockResolvedValue({ id: '1' }) };

    realtimeGateway = { emitGlobalUpdate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        { provide: 'ListsDBService', useValue: mockListsDbService },
        { provide: 'BoardsDBService', useValue: mockBoardsDbService },
        { provide: ListsDBService, useValue: mockListsDbService },
        { provide: BoardsDBService, useValue: mockBoardsDbService },
        { provide: RealtimeGateway, useValue: realtimeGateway },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('debería devolver una lista por id', async () => {
      repository.findOne.mockResolvedValue(mockList);
      const result = await service.findOne('1');
      expect(result).toEqual(mockList);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['board', 'cards'],
      });
    });
  });

  describe('create', () => {
    it('debería crear y guardar una lista', async () => {
      repository.create.mockReturnValue(mockList);
      repository.save.mockResolvedValue(mockList);
      const result = await service.create({ title: 'To Do', boardId: '1' } as any);

      expect(repository.create).toHaveBeenCalledWith({
        title: 'To Do',
        description: undefined,
        order: undefined,
        board: { id: '1' },
      });
      expect(repository.save).toHaveBeenCalledWith(mockList);
      expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith(
        'list:created',
        expect.any(Object),
      );
      expect(result).toEqual(mockList);
    });
  });

  describe('update', () => {
    it('debería actualizar y devolver la lista actualizada', async () => {
      repository.findOne.mockResolvedValue(mockList);
      repository.save.mockResolvedValue(mockList);

      const result = await service.update('1', { title: 'Done' } as any);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Done' }));
      expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith(
        'list:updated',
        expect.any(Object),
      );
      expect(result).toEqual(mockList);
    });
  });

  describe('delete', () => {
    it('debería eliminar una lista y emitir evento', async () => {
      const mockDeleteResult: DeleteResult = { affected: 1, raw: [] };
      repository.findOne.mockResolvedValue(mockList);
      repository.delete.mockResolvedValue(mockDeleteResult);

      await service.delete('1');

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: '1' }, relations: ['board'] });
      expect(repository.delete).toHaveBeenCalledWith('1');
      expect(realtimeGateway.emitGlobalUpdate).toHaveBeenCalledWith('list:deleted', { id: '1' });
    });
  });

  describe('findAllByBoard', () => {
    it('debería devolver todas las listas con sus cards', async () => {
      const mockLists = [mockList];
      repository.find.mockResolvedValue(mockLists);

      const result = await service.findAllByBoard('1');

      expect(repository.find).toHaveBeenCalledWith({
        where: { board: { id: '1' } },
        relations: ['cards'],
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(mockLists);
    });
  });
});
