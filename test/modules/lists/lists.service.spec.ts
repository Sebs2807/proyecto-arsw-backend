import { Test, TestingModule } from '@nestjs/testing';
import { ListService } from '../../../src/app/modules/lists/lists.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListEntity } from '../../../src/database/entities/list.entity';
import { Repository } from 'typeorm';

describe('ListService', () => {
  let service: ListService;
  let repository: jest.Mocked<Repository<ListEntity>>;

  const mockList: ListEntity = {
      id: '1',
      name: 'To Do',
      position: 1,
      cards: [],
  } as unknown as ListEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListService,
        {
          provide: getRepositoryToken(ListEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ListService>(ListService);
    repository = module.get(getRepositoryToken(ListEntity));
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
        relations: ['cards'],
      });
    });
  });

  describe('create', () => {
    it('debería crear y guardar una lista', async () => {
      repository.create.mockReturnValue(mockList);
      repository.save.mockResolvedValue(mockList);

      const result = await service.create({ name: 'To Do' });

      expect(repository.create).toHaveBeenCalledWith({ name: 'To Do' });
      expect(repository.save).toHaveBeenCalledWith(mockList);
      expect(result).toEqual(mockList);
    });
  });

  describe('update', () => {
    it('debería actualizar y devolver la lista actualizada', async () => {
      repository.update.mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockList);

      const result = await service.update('1', { name: 'Done' });

      expect(repository.update).toHaveBeenCalledWith('1', { name: 'Done' });
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockList);
    });
  });

  describe('delete', () => {
    it('debería eliminar una lista', async () => {
      repository.delete.mockResolvedValue(undefined);
      await service.delete('1');
      expect(repository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('findAll', () => {
    it('debería devolver todas las listas con sus cards', async () => {
      const mockLists = [mockList];
      repository.find.mockResolvedValue(mockLists);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({ relations: ['cards'] });
      expect(result).toEqual(mockLists);
    });
  });
});
