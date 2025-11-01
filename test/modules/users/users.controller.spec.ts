import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from 'src/app/modules/users/users.controller';
import { UsersService } from 'src/app/modules/users/users.service';
import { UserEntity } from 'src/database/entities/user.entity';
import { QueryUserDto } from 'src/app/modules/users/dtos/queryUser.dto';
import { RequestWithUser } from 'src/app/modules/auth/auth.controller';
import { AuthUserDto } from 'src/app/modules/users/dtos/authUser.dto';

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
            findAllByWorkspace: jest.fn(),
            findManyByEmail: jest.fn(),
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

  it('debería retornar usuarios paginados por workspace', async () => {
    const query: QueryUserDto = { page: 1, limit: 10 } as QueryUserDto;
    const mockRequest = { user: { id: 1 } } as unknown as RequestWithUser;
    const mockResponse = {
      items: [{ id: 1, email: 'user@mail.com' } as unknown as AuthUserDto],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    jest.spyOn(usersService, 'findAllByWorkspace').mockResolvedValue(mockResponse);

    const result = await controller.findPaginated(query, mockRequest);

    expect(result).toEqual(mockResponse);
    expect(usersService.findAllByWorkspace).toHaveBeenCalledWith(query);
  });

  it('debería retornar resultados de autocomplete por email', async () => {
    const query: QueryUserDto = { search: 'mail.com' } as any;
    const mockResponse = [
      { id: 1, email: 'mail.com' } as unknown as AuthUserDto,
    ];

    jest.spyOn(usersService, 'findManyByEmail').mockResolvedValue(mockResponse);

    const result = await controller.autocomplete(query);

    expect(result).toEqual(mockResponse);
    expect(usersService.findManyByEmail).toHaveBeenCalledWith(query);
  });

  it('debería retornar un usuario por email', async () => {
    const mockUser = {
      id: 1,
      email: 'test@mail.com',
      name: 'Tester',
      role: 'USER',
      workspace: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    } as unknown as AuthUserDto;

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);

    const result = await controller.findByEmail('test@mail.com');

    expect(result).toEqual(mockUser);
    expect(usersService.findByEmail).toHaveBeenCalledWith('test@mail.com');
  });

  it('debería crear un usuario', async () => {
    const newUser = { email: 'nuevo@mail.com', name: 'Nuevo' } as any;
    const createdUser = {
      id: 10,
      ...newUser,
      role: 'USER',
    } as unknown as AuthUserDto;

    jest.spyOn(usersService, 'create').mockResolvedValue(createdUser);

    const result = await controller.create(newUser);

    expect(result).toEqual(createdUser);
    expect(usersService.create).toHaveBeenCalledWith(newUser);
  });

  it('debería actualizar un usuario por id', async () => {
    const id = '1';
    const updateData = { name: 'Actualizado' } as Partial<UserEntity>;
    const updatedUser = {
      id: 1,
      email: 'test@mail.com',
      name: 'Actualizado',
      role: 'USER',
    } as unknown as AuthUserDto;

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
