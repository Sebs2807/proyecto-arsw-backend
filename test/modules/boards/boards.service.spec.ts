import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BoardEntity } from 'src/database/entities/board.entity';
import { Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';

describe('BoardsService', () => {
  let service: BoardsService;
  let repo: Repository<BoardEntity>;

  const mockBoardRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: getRepositoryToken(BoardEntity), useValue: mockBoardRepository },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
    repo = module.get<Repository<BoardEntity>>(getRepositoryToken(BoardEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw if creator is not ADMIN', async () => {
    const creator = { roles: 'USER' } as any;
    await expect(
      service.createBoard('Title', 'Desc', creator, []),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should create and save a board if creator is ADMIN', async () => {
    const creator = { roles: 'ADMIN' } as any;
    const mockBoard = { id: 1, title: 'Title' } as BoardEntity;

    mockBoardRepository.create.mockReturnValue(mockBoard);
    mockBoardRepository.save.mockResolvedValue(mockBoard);

    const result = await service.createBoard('Title', 'Desc', creator, []);
    expect(result).toEqual(mockBoard);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('should return all boards', async () => {
    const mockBoards = [{ id: 1 }, { id: 2 }] as BoardEntity[];
    mockBoardRepository.find.mockResolvedValue(mockBoards);

    const result = await service.findAll();
    expect(result).toEqual(mockBoards);
  });

  it('should return one board by id', async () => {
    const mockBoard = { id: 1 } as BoardEntity;
    mockBoardRepository.findOne.mockResolvedValue(mockBoard);

    const result = await service.findOne(1);
    expect(result).toEqual(mockBoard);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it('should update a board', async () => {
    const updated = { id: 1, title: 'Updated' } as BoardEntity;
    mockBoardRepository.update.mockResolvedValue(null);
    jest.spyOn(service, 'findOne').mockResolvedValue(updated);

    const result = await service.updateBoard(1, { title: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('should delete a board', async () => {
    mockBoardRepository.delete.mockResolvedValue(null);

    const result = await service.deleteBoard(1);
    expect(result).toEqual({ deleted: true });
    expect(repo.delete).toHaveBeenCalledWith(1);
  });
});
