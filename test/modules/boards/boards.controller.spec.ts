import { Test, TestingModule } from '@nestjs/testing';
import { BoardsController } from 'src/app/modules/boards/boards.controller';
import { BoardsService } from 'src/app/modules/boards/boards.service';
import { JwtAuthGuard } from 'src/app/modules/auth/jwt-auth.guar';
import { BoardEntity } from 'src/database/entities/board.entity';
import { UserEntity } from 'src/database/entities/user.entity';

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
  id: 1,
  email: 'test@mail.com',
  password: 'hashed',
  name: 'Tester',
  authProvider: 'LOCAL',
  createdAt: new Date(),
  updatedAt: new Date(),
  boards: [],
} as unknown as UserEntity;


  const mockBoard: BoardEntity = {
    id: 1,
    title: 'Tablero de prueba',
    description: 'Descripción de prueba',
    createdBy: mockUser,
    members: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // --- CREATE ---
  it('debería crear un board', async () => {
    jest.spyOn(boardsService, 'createBoard').mockResolvedValue(mockBoard);

    const result = await controller.create(
      { title: 'Tablero de prueba', description: 'Descripción de prueba', members: [] },
      { user: mockUser },
    );

    expect(boardsService.createBoard).toHaveBeenCalledWith(
      'Tablero de prueba',
      'Descripción de prueba',
      mockUser,
      [],
    );
    expect(result).toEqual(mockBoard);
  });

  it('debería listar todos los boards', async () => {
    jest.spyOn(boardsService, 'findAll').mockResolvedValue([mockBoard]);

    const result = await controller.findAll();
    expect(result).toEqual([mockBoard]);
  });

  it('debería retornar un board por id', async () => {
    jest.spyOn(boardsService, 'findOne').mockResolvedValue(mockBoard);

    const result = await controller.findOne(1);
    expect(result).toEqual(mockBoard);
  });

  it('debería actualizar un board', async () => {
    const updatedBoard: BoardEntity = {
      ...mockBoard,
      title: 'Tablero actualizado',
      updatedAt: new Date(),
    };

    jest.spyOn(boardsService, 'updateBoard').mockResolvedValue(updatedBoard);

    const result = await controller.update(1, { title: 'Tablero actualizado' });
    expect(result).toEqual(updatedBoard);
  });

  // --- DELETE ---
  it('debería eliminar un board', async () => {
    jest.spyOn(boardsService, 'deleteBoard').mockResolvedValue({ deleted: true });

    const result = await controller.remove(1);
    expect(result).toEqual({ deleted: true });
  });
});
