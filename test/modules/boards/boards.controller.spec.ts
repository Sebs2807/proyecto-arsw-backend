import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from 'src/app/modules/boards/boards.controller';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { JwtAuthGuard } from 'src/app/modules/auth/jwt-auth.guard';
import { BoardEntity } from 'src/database/entities/board.entity';
import { UserEntity } from 'src/database/entities/user.entity';
import { Request } from 'express';
import { QueryBoardDto } from 'src/app/modules/boards/dtos/queryBoard.dto';
import { CreateBoardDto } from 'src/app/modules/boards/dtos/createBoard.dto';
import { RealtimeGateway } from 'src/gateways/realtime.gateway';

describe('BoardsController', () => {
  let controller: BoardsController;
  let boardsService: jest.Mocked<BoardsService>;

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
      {
        provide: RealtimeGateway,
        useValue: {
          emitToBoard: jest.fn(), 
        },
      },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

  controller = module.get<BoardsController>(BoardsController);
  boardsService = module.get(BoardsService);
});


  const mockUser = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@mail.com',
    picture: '',
    workspaces: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as UserEntity;

  const mockBoard = {
    id: '1',
    title: 'Test Board',
    description: 'Test Description',
    createdBy: mockUser,
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    workspaceId: 'ws123',
    color: '#FF0000',
  } as unknown as BoardEntity;

  it('debería crear un board correctamente', async () => {
    (boardsService.createBoard as jest.Mock).mockResolvedValue(mockBoard);

    const mockRequest = { user: mockUser } as Request & { user: UserEntity };

    const dto: CreateBoardDto = {
      title: 'Test Board',
      description: 'Test Description',
      memberIds: [],
      workspaceId: 'ws123',
      color: '#FF0000',
    } as any;

    const result = await controller.create(dto, mockRequest);

    expect(boardsService.createBoard).toHaveBeenCalledWith(
      dto.title,
      dto.description,
      mockUser.id,
      dto.memberIds,
      dto.workspaceId,
      dto.color,
    );
    expect(result).toEqual(mockBoard);
  });

  it('debería retornar los boards paginados (findPaginated)', async () => {
    const query: QueryBoardDto = { page: 1, limit: 10 } as any;

    const paginatedResponse = {
      items: [mockBoard],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    (boardsService.findAll as jest.Mock).mockResolvedValue(paginatedResponse);

    const mockRequest = { user: mockUser } as Request & { user: UserEntity };

    const result = await controller.findPaginated(query, mockRequest);

    expect(boardsService.findAll).toHaveBeenCalledWith(query, mockUser.id);
    expect(result).toEqual(paginatedResponse);
  });

  it('debería retornar un board por id', async () => {
    (boardsService.findOne as jest.Mock).mockResolvedValue(mockBoard);

    const result = await controller.findOne('1');

    expect(boardsService.findOne).toHaveBeenCalledWith('1');
    expect(result).toEqual(mockBoard);
  });

  it('debería actualizar un board', async () => {
    const updated = { ...mockBoard, title: 'Updated' };
    (boardsService.updateBoard as jest.Mock).mockResolvedValue(updated);

    const result = await controller.update('1', { title: 'Updated' });

    expect(boardsService.updateBoard).toHaveBeenCalledWith('1', { title: 'Updated' });
    expect(result).toEqual(updated);
  });

  it('debería eliminar un board', async () => {
    (boardsService.deleteBoard as jest.Mock).mockResolvedValue({ deleted: true });

    const result = await controller.remove('1');

    expect(boardsService.deleteBoard).toHaveBeenCalledWith('1');
    expect(result).toEqual({ deleted: true });
  });
});
