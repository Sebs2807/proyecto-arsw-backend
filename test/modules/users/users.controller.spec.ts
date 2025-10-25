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
            create: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
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

  it('debería retornar usuarios paginados', async () => {
  const mockUsers = [
    { id: 1, email: 'user1@mail.com' },
    { id: 2, email: 'user2@mail.com' },
  ] as unknown as UserEntity[];

  jest.spyOn(usersService, 'findAll').mockResolvedValue(mockUsers);

  const result = await controller.findPaginated(1, 2);

  expect(result).toEqual(mockUsers);
  expect(usersService.findAll).toHaveBeenCalledWith(1, 2);
});

it('debería crear un usuario', async () => {
  const newUser = { email: 'nuevo@mail.com', name: 'Nuevo' } as any;
  const createdUser = { id: 10, ...newUser } as UserEntity;

  // Simular que el servicio devuelve el usuario creado
  jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

  const result = await controller.create(newUser);

  expect(result).toEqual(createdUser);
  expect(usersService.create).toHaveBeenCalledWith(newUser);
});

it('debería actualizar un usuario por id', async () => {
  const id = '1';
  const updateData = { name: 'Actualizado' } as Partial<UserEntity>;
  const updatedUser = { id: 1, email: 'test@mail.com', ...updateData } as UserEntity;

  jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);

  const result = await controller.updateUser(id, updateData);

  expect(result).toEqual(updatedUser);
  expect(usersService.updateUser).toHaveBeenCalledWith(id, updateData);
});

it('debería eliminar un usuario por id', async () => {
  const id = '1';
  const deleteResponse = { deleted: true };

  jest.spyOn(usersService, 'deleteUser').mockResolvedValue(deleteResponse as any);

  const result = await controller.deleteUser(id);

  expect(result).toEqual(deleteResponse);
  expect(usersService.deleteUser).toHaveBeenCalledWith(id);
});

});
