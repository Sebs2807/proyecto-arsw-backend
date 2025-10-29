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
    firstName: 'Test',
    lastName: 'User',
    email: 'test@mail.com',
    picture: '',
    workspaces: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserEntity;

  // const mockBoard: BoardEntity = {
  //   id: '1',
  //   title: 'Test Board',
  //   description: 'Test Description',
  //   createdBy: mockUser,
  //   members: [],
  //   createdAt: new Date(),
  //   updatedAt: new Date(),
  // };

  // it('should create a board', async () => {
  //   jest.spyOn(boardsService, 'createBoard').mockResolvedValue(mockBoard);

  //   const mockRequest = { user: mockUser } as Request & { user: UserEntity };

  //   const result = await controller.create(
  //     { title: 'Test Board', description: 'Test Description', members: [] },
  //     mockRequest,
  //   );

  //   expect(boardsService.createBoard).toHaveBeenCalledWith(
  //     'Test Board',
  //     'Test Description',
  //     mockUser.id,
  //     [],
  //   );
  //   expect(result).toEqual(mockBoard);
  // });

  // it('should return all boards', async () => {
  //   jest.spyOn(boardsService, 'findAll').mockResolvedValue([mockBoard]);
  //   const result = await controller.findAll();
  //   expect(result).toEqual([mockBoard]);
  // });

  // it('should return one board by id', async () => {
  //   jest.spyOn(boardsService, 'findOne').mockResolvedValue(mockBoard);
  //   const result = await controller.findOne('1');
  //   expect(result).toEqual(mockBoard);
  // });

  // it('should update a board', async () => {
  //   const updated = { ...mockBoard, title: 'Updated' };
  //   jest.spyOn(boardsService, 'updateBoard').mockResolvedValue(updated);

  //   const result = await controller.update('1', { title: 'Updated' });
  //   expect(result).toEqual(updated);
  // });

  it('should delete a board', async () => {
    jest.spyOn(boardsService, 'deleteBoard').mockResolvedValue({ deleted: true });
    const result = await controller.remove('1');
    expect(result).toEqual({ deleted: true });
  });
});
