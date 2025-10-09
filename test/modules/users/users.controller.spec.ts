import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/app/modules/users/users.controller';
import { UsersService } from 'src/app/modules/users/users.service';
import { UserEntity } from 'src/database/entities/user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findAll: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('debería retornar todos los usuarios', async () => {
    const mockUsers: UserEntity[] = [
      {
        id: 1,
        email: 'a@mail.com',
        password: 'hashed1',
        name: 'Usuario A',
        authProvider: 'LOCAL',
        createdAt: new Date(),
        updatedAt: new Date(),
        boards: [],
      },
      {
        id: 2,
        email: 'b@mail.com',
        password: 'hashed2',
        name: 'Usuario B',
        authProvider: 'LOCAL',
        createdAt: new Date(),
        updatedAt: new Date(),
        boards: [],
      },
    ] as unknown as UserEntity[];

    jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

    const result = await controller.findAll();

    expect(result).toEqual(mockUsers);
    expect(usersService.findAll).toHaveBeenCalled();
  });

  it('debería retornar un usuario por email', async () => {
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

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

    const result = await controller.findByEmail('test@mail.com');

    expect(result).toEqual(mockUser);
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@mail.com');
  });
});
