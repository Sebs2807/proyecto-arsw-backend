import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from 'src/app/modules/boards/boards.controller';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { JwtAuthGuard } from 'src/app/modules/auth/jwt-auth.guard';
import { BoardEntity } from 'src/database/entities/board.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { Request } from 'express';

describe('BoardsController', () => {
  let controller: BoardsController;
  let boardsService: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardsController],
      providers: [
        {
          provide: BoardsService,
          useValue: {
            createBoard: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            updateBoard: jest.fn(),
            deleteBoard: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BoardsController>(BoardsController);
    boardsService = module.get<BoardsService>(BoardsService);
  });

  const mockUser: UserEntity = {
    id: '1',
    email: 'test@mail.com',
    password: 'hashed',
    name: 'Tester',
    authProvider: 'LOCAL',
    createdAt: new Date(),
    updatedAt: new Date(),
    boards: [],
  } as unknown as UserEntity;

  const mockBoard: BoardEntity = {
    id: '1',
    title: 'Test Board',
    description: 'Test Description',
    createdBy: mockUser,
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // --- CREATE ---
  it('should create a board', async () => {
    jest.spyOn(boardsService, 'createBoard').mockResolvedValue(mockBoard);

    const mockRequest = {
      user: mockUser,
    } as unknown as Request & { user: UserEntity };

    const result = await controller.create(
      { title: 'Test Board', description: 'Test Description', members: [] },
      mockRequest,
    );

    expect(boardsService.createBoard).toHaveBeenCalledWith(
      'Test Board',
      'Test Description',
      mockUser,
      [],
    );
    expect(result).toEqual(mockBoard);
  });

  // --- FIND ALL ---
  it('should return all boards', async () => {
    jest.spyOn(boardsService, 'findAll').mockResolvedValue([mockBoard]);

    const result = await controller.findAll();
    expect(result).toEqual([mockBoard]);
  });

  // --- FIND ONE ---
  it('should return a board by id', async () => {
    jest.spyOn(boardsService, 'findOne').mockResolvedValue(mockBoard);

    const result = await controller.findOne('1');
    expect(result).toEqual(mockBoard);
  });

  // --- UPDATE ---
  it('should update a board', async () => {
    const updatedBoard: BoardEntity = {
      ...mockBoard,
      title: 'Updated Board',
      updatedAt: new Date(),
    };

    jest.spyOn(boardsService, 'updateBoard').mockResolvedValue(updatedBoard);

    const result = await controller.update('1', { title: 'Updated Board' });
    expect(result).toEqual(updatedBoard);
  });

  // --- DELETE ---
  it('should delete a board', async () => {
    jest.spyOn(boardsService, 'deleteBoard').mockResolvedValue({ deleted: true });

    const result = await controller.remove('1');
    expect(result).toEqual({ deleted: true });
  });
});
