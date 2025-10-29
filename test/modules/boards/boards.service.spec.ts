import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardEntity } from 'src/database/entities/board.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/database/entities/user.entity';

describe('BoardsService', () => {
  let service: BoardsService;
  let repository: Repository<BoardEntity>;

  // const mockBoard: BoardEntity = {
  //   id: '1',
  //   title: 'Test Board',
  //   description: 'Test Description',
  //   createdBy: { id: '1' } as UserEntity,
  //   members: [],
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };

  // const mockRepo = {
  //   create: jest.fn().mockReturnValue(mockBoard),
  //   save: jest.fn().mockResolvedValue(mockBoard),
  //   find: jest.fn().mockResolvedValue([mockBoard]),
  //   findOne: jest.fn().mockResolvedValue(mockBoard),
  //   update: jest.fn(),
  //   delete: jest.fn(),
  // };

  // beforeEach(async () => {
  //   const module: TestingModule = await Test.createTestingModule({
  //     providers: [BoardsService, { provide: getRepositoryToken(BoardEntity), useValue: mockRepo }],
  //   }).compile();

  //   service = module.get<BoardsService>(BoardsService);
  //   repository = module.get(getRepositoryToken(BoardEntity));
  // });

  // it('should create a board', async () => {
  //   const result = await service.createBoard('Test Board', 'Test Description', '1', []);
  //   expect(repository.create).toHaveBeenCalledWith({
  //     title: 'Test Board',
  //     description: 'Test Description',
  //     createdBy: { id: '1' },
  //     members: [],
  //   });
  //   expect(result).toEqual(mockBoard);
  // });

  // it('should find all boards', async () => {
  //   const result = await service.findAll();
  //   expect(result).toEqual([mockBoard]);
  // });

  // it('should find one board', async () => {
  //   const result = await service.findOne('1');
  //   expect(result).toEqual(mockBoard);
  // });

  // it('should update a board', async () => {
  //   const result = await service.updateBoard('1', { title: 'Updated' });
  //   expect(repository.update).toHaveBeenCalledWith('1', { title: 'Updated' });
  //   expect(result).toEqual(mockBoard);
  // });

  // it('should delete a board', async () => {
  //   const result = await service.deleteBoard('1');
  //   expect(repository.delete).toHaveBeenCalledWith('1');
  //   expect(result).toEqual({ deleted: true });
  // });
});
